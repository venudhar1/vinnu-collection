from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select  # type: ignore
from app.database import get_session
from app.models import Set, SetCreate, SetResponse, Item, APIKey
from app.middleware.auth import verify_api_key
from datetime import datetime

router = APIRouter(prefix="/sets", tags=["Sets"])


@router.get("/", response_model=list[SetResponse])
async def list_sets(
    session: Session = Depends(get_session),
    _: APIKey = Depends(verify_api_key)
):
    """List all saree sets"""
    return session.exec(select(Set)).all()


@router.post("/", response_model=SetResponse, status_code=201)
async def create_set(
    set_data: SetCreate,
    session: Session = Depends(get_session),
    _: APIKey = Depends(verify_api_key)
):
    """Create a new saree set"""
    new_set = Set(**set_data.dict())
    session.add(new_set)
    session.commit()
    session.refresh(new_set)
    return new_set


@router.get("/{set_id}", response_model=SetResponse)
async def get_set(
    set_id: str,
    session: Session = Depends(get_session),
    _: APIKey = Depends(verify_api_key)
):
    """Get set details"""
    set_obj = session.get(Set, set_id)
    if not set_obj:
        raise HTTPException(status_code=404, detail="Set not found")
    return set_obj


@router.put("/{set_id}", response_model=SetResponse)
async def update_set(
    set_id: str,
    set_data: SetCreate,
    session: Session = Depends(get_session),
    _: APIKey = Depends(verify_api_key)
):
    """Update set information"""
    set_obj = session.get(Set, set_id)
    if not set_obj:
        raise HTTPException(status_code=404, detail="Set not found")
    
    set_obj.name = set_data.name
    set_obj.description = set_data.description
    set_obj.updated_at = datetime.utcnow()
    session.add(set_obj)
    session.commit()
    session.refresh(set_obj)
    return set_obj


@router.delete("/{set_id}")
async def delete_set(
    set_id: str,
    session: Session = Depends(get_session),
    _: APIKey = Depends(verify_api_key)
):
    """Delete a set"""
    set_obj = session.get(Set, set_id)
    if not set_obj:
        raise HTTPException(status_code=404, detail="Set not found")
    
    session.delete(set_obj)
    session.commit()
    return {"message": "Set deleted"}
