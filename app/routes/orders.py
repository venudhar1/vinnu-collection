from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select  # type: ignore
from app.database import get_session
from app.models import Order, OrderItem, OrderCreate, OrderResponse, Item, Set, APIKey
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
        status="paid"  # Simulating paid status immediately for MVP checkout flow
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
    
    # Retrieve order items list for response
    statement = select(OrderItem).where(OrderItem.order_id == new_order.id)
    items = session.exec(statement).all()
    
    response = OrderResponse(
        id=new_order.id,
        customer_name=new_order.customer_name,
        customer_email=new_order.customer_email,
        customer_phone=new_order.customer_phone,
        shipping_address=new_order.shipping_address,
        total_amount=new_order.total_amount,
        status=new_order.status,
        payment_id=new_order.payment_id,
        created_at=new_order.created_at,
        updated_at=new_order.updated_at,
        items=items
    )
    return response


@router.get("/customer/{order_id}", response_model=OrderResponse)
async def get_customer_order(
    order_id: str,
    session: Session = Depends(get_session)
):
    """Public lookup: Customer checks status of their order"""
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    statement = select(OrderItem).where(OrderItem.order_id == order_id)
    items = session.exec(statement).all()
    
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
        items=items
    )


@router.get("/", response_model=list[OrderResponse])
async def list_orders_admin(
    session: Session = Depends(get_session),
    _: APIKey = Depends(verify_api_key)
):
    """Admin dashboard: List all orders (requires API key)"""
    orders = session.exec(select(Order)).all()
    response_orders = []
    
    for order in orders:
        statement = select(OrderItem).where(OrderItem.order_id == order.id)
        items = session.exec(statement).all()
        response_orders.append(
            OrderResponse(
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
                items=items
            )
        )
    return response_orders


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
        
    statement = select(OrderItem).where(OrderItem.order_id == order_id)
    items = session.exec(statement).all()
    
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
        items=items
    )


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
    
    statement = select(OrderItem).where(OrderItem.order_id == order_id)
    items = session.exec(statement).all()
    
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
        items=items
    )
