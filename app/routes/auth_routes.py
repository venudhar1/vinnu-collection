from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session
from app.models import APIKey, APIKeyCreateRequest, APIKeyResponse
from app.utils.hash_util import generate_api_key, hash_api_key
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/keys", response_model=APIKeyResponse, status_code=201)
async def create_key(
    req: APIKeyCreateRequest,
    session: Session = Depends(get_session)
):
    """Create new API key (local-only, no auth required)"""
    plain_key = generate_api_key()
    hashed_key = hash_api_key(plain_key)
    
    api_key = APIKey(key=hashed_key, name=req.name, scopes=req.scopes)
    session.add(api_key)
    session.commit()
    session.refresh(api_key)
    
    return APIKeyResponse(
        id=api_key.id,
        key=plain_key,
        name=api_key.name,
        scopes=api_key.scopes,
        created_at=api_key.created_at
    )


@router.delete("/keys/{key_id}")
async def revoke_key(
    key_id: str,
    session: Session = Depends(get_session)
):
    """Revoke an API key"""
    api_key = session.get(APIKey, key_id)
    if not api_key:
        return {"message": "Key not found"}
    
    api_key.revoked = True
    api_key.revoked_at = datetime.utcnow()
    session.add(api_key)
    session.commit()
    
    return {"message": "Key revoked"}
