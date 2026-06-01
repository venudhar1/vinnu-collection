from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Item, Set
from app.middleware.auth import verify_api_key
from pydantic import BaseModel
from typing import List
from datetime import datetime


router = APIRouter(prefix="/bulk", tags=["Bulk"])


class MarkSoldRequest(BaseModel):
    """Request to mark multiple items as sold"""
    items: List[dict]  # List of {set_id, item_id}


class AdjustInventoryRequest(BaseModel):
    """Request to adjust inventory quantities"""
    adjustments: List[dict]  # List of {item_id, quantity_change}


class BulkResponse(BaseModel):
    """Response for bulk operations"""
    updated: int
    message: str


@router.post("/mark-sold", response_model=BulkResponse)
async def mark_sold_bulk(
    req: MarkSoldRequest,
    session: Session = Depends(get_session),
    _: any = Depends(verify_api_key)
):
    """Bulk mark multiple colors as sold"""
    count = 0
    set_updates = {}  # Track set updates
    
    for item_ref in req.items:
        item_id = item_ref.get("item_id")
        set_id = item_ref.get("set_id")
        
        item = session.get(Item, item_id)
        if item and item.set_id == set_id and item.status != "sold":
            old_status = item.status
            item.status = "sold"
            item.updated_at = datetime.utcnow()
            session.add(item)
            count += 1
            
            # Track set updates
            if set_id not in set_updates:
                set_updates[set_id] = {"available_change": 0, "sold_change": 0}
            
            if old_status == "available":
                set_updates[set_id]["available_change"] -= 1
            set_updates[set_id]["sold_change"] += 1
    
    # Update set counts
    for set_id, changes in set_updates.items():
        set_obj = session.get(Set, set_id)
        if set_obj:
            set_obj.total_available += changes["available_change"]
            set_obj.total_sold += changes["sold_change"]
            set_obj.updated_at = datetime.utcnow()
            session.add(set_obj)
    
    session.commit()
    return BulkResponse(updated=count, message=f"{count} items marked as sold")


@router.post("/adjust-inventory", response_model=BulkResponse)
async def adjust_inventory_bulk(
    req: AdjustInventoryRequest,
    session: Session = Depends(get_session),
    _: any = Depends(verify_api_key)
):
    """Bulk adjust inventory quantities"""
    count = 0
    
    for adjustment in req.adjustments:
        item_id = adjustment.get("item_id")
        quantity_change = adjustment.get("quantity_change", 0)
        
        item = session.get(Item, item_id)
        if item:
            new_quantity = max(0, item.quantity + quantity_change)
            item.quantity = new_quantity
            item.updated_at = datetime.utcnow()
            session.add(item)
            count += 1
    
    session.commit()
    return BulkResponse(updated=count, message=f"{count} items adjusted")


@router.get("/inventory/summary")
async def get_inventory_summary(
    session: Session = Depends(get_session),
    _: any = Depends(verify_api_key)
):
    """Get total inventory summary"""
    sets = session.exec(select(Set)).all()
    
    total_available = 0
    total_sold = 0
    
    sets_summary = []
    for s in sets:
        total_available += s.total_available
        total_sold += s.total_sold
        sets_summary.append({
            "name": s.name,
            "total_items": s.total_items,
            "total_available": s.total_available,
            "total_sold": s.total_sold
        })
    
    return {
        "total_sets": len(sets),
        "total_colors": sum(s.total_items for s in sets),
        "total_available": total_available,
        "total_sold": total_sold,
        "sets": sets_summary
    }
