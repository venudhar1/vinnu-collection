from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Item, ItemCreate, ItemUpdate, ItemResponse, Set
from app.middleware.auth import verify_api_key
from datetime import datetime
import json

router = APIRouter(prefix="/sets", tags=["Items"])


@router.get("/{set_id}/items", response_model=list[ItemResponse])
async def list_items(
    set_id: str,
    session: Session = Depends(get_session),
    _: any = Depends(verify_api_key)
):
    """List all colors in a set"""
    set_obj = session.get(Set, set_id)
    if not set_obj:
        raise HTTPException(status_code=404, detail="Set not found")
    
    items = session.exec(select(Item).where(Item.set_id == set_id)).all()
    return items


@router.post("/{set_id}/items", response_model=ItemResponse, status_code=201)
async def add_item(
    set_id: str,
    item_data: ItemCreate,
    session: Session = Depends(get_session),
    _: any = Depends(verify_api_key)
):
    """Add a new color variant to a set"""
    set_obj = session.get(Set, set_id)
    if not set_obj:
        raise HTTPException(status_code=404, detail="Set not found")
    
    # Check if SKU already exists
    existing_item = session.exec(
        select(Item).where(Item.sku == item_data.sku)
    ).first()
    if existing_item:
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    new_item = Item(
        set_id=set_id,
        color=item_data.color,
        sku=item_data.sku,
        quantity=item_data.quantity,
        price=item_data.price,
        item_metadata=json.dumps(item_data.metadata) if item_data.metadata else None
    )
    session.add(new_item)
    
    # Update set counts
    set_obj.total_items += 1
    set_obj.total_available += 1
    set_obj.updated_at = datetime.utcnow()
    session.add(set_obj)
    
    session.commit()
    session.refresh(new_item)
    return new_item


@router.get("/{set_id}/items/{item_id}", response_model=ItemResponse)
async def get_item(
    set_id: str,
    item_id: str,
    session: Session = Depends(get_session),
    _: any = Depends(verify_api_key)
):
    """Get color details"""
    item = session.get(Item, item_id)
    if not item or item.set_id != set_id:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.put("/{set_id}/items/{item_id}", response_model=ItemResponse)
async def update_item(
    set_id: str,
    item_id: str,
    item_data: ItemUpdate,
    session: Session = Depends(get_session),
    _: any = Depends(verify_api_key)
):
    """Update color (quantity, price, status)"""
    item = session.get(Item, item_id)
    if not item or item.set_id != set_id:
        raise HTTPException(status_code=404, detail="Item not found")
    
    set_obj = session.get(Set, set_id)
    
    # Track status changes for set counts
    old_status = item.status
    
    if item_data.color is not None:
        item.color = item_data.color
    if item_data.quantity is not None:
        item.quantity = item_data.quantity
    if item_data.price is not None:
        item.price = item_data.price
    if item_data.status is not None:
        item.status = item_data.status
    if item_data.metadata is not None:
        item.item_metadata = json.dumps(item_data.metadata)
    
    item.updated_at = datetime.utcnow()
    
    # Update set counts if status changed
    if old_status != item.status and set_obj:
        if old_status == "available":
            set_obj.total_available -= 1
        elif old_status == "sold":
            set_obj.total_sold -= 1
        
        if item.status == "available":
            set_obj.total_available += 1
        elif item.status == "sold":
            set_obj.total_sold += 1
        
        set_obj.updated_at = datetime.utcnow()
        session.add(set_obj)
    
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{set_id}/items/{item_id}")
async def delete_item(
    set_id: str,
    item_id: str,
    session: Session = Depends(get_session),
    _: any = Depends(verify_api_key)
):
    """Remove a color variant"""
    item = session.get(Item, item_id)
    if not item or item.set_id != set_id:
        raise HTTPException(status_code=404, detail="Item not found")
    
    set_obj = session.get(Set, set_id)
    
    # Update set counts
    if set_obj:
        set_obj.total_items -= 1
        if item.status == "available":
            set_obj.total_available -= 1
        elif item.status == "sold":
            set_obj.total_sold -= 1
        set_obj.updated_at = datetime.utcnow()
        session.add(set_obj)
    
    session.delete(item)
    session.commit()
    return {"message": "Item deleted"}
