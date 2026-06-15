from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select  # type: ignore
from app.database import get_session
from app.models import Order, OrderItem, OrderCreate, OrderResponse, Item, Set, APIKey, OrderItemResponse
from app.middleware.auth import verify_api_key
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/checkout", response_model=OrderResponse, status_code=201)
async def checkout(
    order_data: OrderCreate,
    session: Session = Depends(get_session)
):
    """Public customer checkout: Create order and adjust stock atomically"""
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")
    
    total_amount = 0.0
    order_items_to_create = []
    items_to_update = []
    sets_to_update = {}

    # We process all items inside a single database session
    for req_item in order_data.items:
        item = session.get(Item, req_item.item_id)
        if not item:
            raise HTTPException(
                status_code=404, 
                detail=f"Item with ID {req_item.item_id} not found"
            )
        
        if item.status != "available" or item.quantity <= 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Item {item.sku} ({item.color}) is out of stock or unavailable"
            )
            
        if item.quantity < req_item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for item {item.sku}. Available: {item.quantity}, Requested: {req_item.quantity}"
            )
            
        # Record item update
        old_qty = item.quantity
        item.quantity -= req_item.quantity
        item.updated_at = datetime.utcnow()
        
        if item.quantity == 0:
            item.status = "sold"
            # Update parent set counts
            if item.set_id not in sets_to_update:
                sets_to_update[item.set_id] = {"available_change": 0, "sold_change": 0}
            sets_to_update[item.set_id]["available_change"] -= 1
            sets_to_update[item.set_id]["sold_change"] += 1
            
        items_to_update.append(item)
        
        # Calculate pricing
        item_total = item.price * req_item.quantity
        total_amount += item_total
        
        # Prepare OrderItem record (order_id will be filled after order is saved)
        order_item = OrderItem(
            item_id=item.id,
            quantity=req_item.quantity,
            price=item.price
        )
        order_items_to_create.append(order_item)

    # Create the Order
    new_order = Order(
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        customer_phone=order_data.customer_phone,
        shipping_address=order_data.shipping_address,
        total_amount=total_amount,
        status="pending" if order_data.payment_id else "paid",
        payment_id=order_data.payment_id
    )
    
    session.add(new_order)
    session.flush()  # Populates new_order.id
    
    # Save Order Items linked to the order
    for order_item in order_items_to_create:
        order_item.order_id = new_order.id
        session.add(order_item)
        
    # Save updated items
    for item in items_to_update:
        session.add(item)
        
    # Save updated sets
    for set_id, changes in sets_to_update.items():
        set_obj = session.get(Set, set_id)
        if set_obj:
            set_obj.total_available += changes["available_change"]
            set_obj.total_sold += changes["sold_change"]
            set_obj.updated_at = datetime.utcnow()
            session.add(set_obj)

    session.commit()
    session.refresh(new_order)
    
    return make_order_response(new_order, session)


def make_order_response(order: Order, session: Session) -> OrderResponse:
    """Helper to construct OrderResponse with detailed product attributes"""
    statement = select(OrderItem).where(OrderItem.order_id == order.id)
    db_items = session.exec(statement).all()
    
    response_items = []
    for db_item in db_items:
        # Fetch detailed item and set info
        item = session.get(Item, db_item.item_id)
        sku = None
        color = None
        set_name = None
        if item:
            sku = item.sku
            color = item.color
            parent_set = session.get(Set, item.set_id)
            if parent_set:
                set_name = parent_set.name
        
        response_items.append(
            OrderItemResponse(
                id=db_item.id,
                order_id=db_item.order_id,
                item_id=db_item.item_id,
                quantity=db_item.quantity,
                price=db_item.price,
                sku=sku,
                color=color,
                set_name=set_name
            )
        )
        
    return OrderResponse(
        id=order.id,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        shipping_address=order.shipping_address,
        total_amount=order.total_amount,
        status=order.status,
        payment_id=order.payment_id,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=response_items
    )


@router.get("/customer/{order_id}", response_model=OrderResponse)
async def get_customer_order(
    order_id: str,
    session: Session = Depends(get_session)
):
    """Public lookup: Customer checks status of their order"""
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return make_order_response(order, session)


@router.get("/", response_model=list[OrderResponse])
async def list_orders_admin(
    session: Session = Depends(get_session),
    _: APIKey = Depends(verify_api_key)
):
    """Admin dashboard: List all orders (requires API key)"""
    orders = session.exec(select(Order)).all()
    return [make_order_response(order, session) for order in orders]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_admin(
    order_id: str,
    session: Session = Depends(get_session),
    _: APIKey = Depends(verify_api_key)
):
    """Admin dashboard: Get order details (requires API key)"""
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return make_order_response(order, session)


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status_admin(
    order_id: str,
    status: str,
    session: Session = Depends(get_session),
    _: APIKey = Depends(verify_api_key)
):
    """Admin dashboard: Update order status (requires API key)"""
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status
    order.updated_at = datetime.utcnow()
    session.add(order)
    session.commit()
    session.refresh(order)
    
    return make_order_response(order, session)

