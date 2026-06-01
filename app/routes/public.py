from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select  # type: ignore
from app.database import get_session
from app.models import Set, SetResponse, Item, ItemResponse

router = APIRouter(prefix="/public", tags=["Public Catalog"])


@router.get("/sets", response_model=list[SetResponse])
async def list_sets_public(session: Session = Depends(get_session)):
    """Public catalog: List all saree sets (no auth required)"""
    return session.exec(select(Set)).all()


@router.get("/sets/{set_id}", response_model=SetResponse)
async def get_set_public(set_id: str, session: Session = Depends(get_session)):
    """Public catalog: Get details of a single saree set (no auth required)"""
    set_obj = session.get(Set, set_id)
    if not set_obj:
        raise HTTPException(status_code=404, detail="Set not found")
    return set_obj


@router.get("/sets/{set_id}/items", response_model=list[ItemResponse])
async def list_items_public(set_id: str, session: Session = Depends(get_session)):
    """Public catalog: List all color variants in a set (no auth required)"""
    set_obj = session.get(Set, set_id)
    if not set_obj:
        raise HTTPException(status_code=404, detail="Set not found")
    
    items = session.exec(select(Item).where(Item.set_id == set_id)).all()
    return items
