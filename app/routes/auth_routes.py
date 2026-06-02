import os
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import Session
from app.database import get_session
from app.models import APIKey, APIKeyCreateRequest, APIKeyResponse
from app.utils.hash_util import generate_api_key, hash_api_key

router = APIRouter(prefix="/auth", tags=["Auth"])


def require_admin_key_or_bootstrap_secret(
    session: Session,
    x_api_key: str | None,
    x_admin_bootstrap_secret: str | None,
) -> None:
    bootstrap_secret = os.getenv("ADMIN_BOOTSTRAP_SECRET")

    if bootstrap_secret and x_admin_bootstrap_secret == bootstrap_secret:
        return

    if x_api_key:
        hashed_key = hash_api_key(x_api_key)
        api_key = session.query(APIKey).filter(APIKey.key == hashed_key).first()
        if api_key and not api_key.revoked:
            scopes = {scope.strip() for scope in api_key.scopes.split(",")}
            if "admin" in scopes:
                api_key.last_used_at = datetime.utcnow()
                session.add(api_key)
                session.commit()
                return

    raise HTTPException(
        status_code=403,
        detail="Admin API key or bootstrap secret required",
    )


@router.post("/keys", response_model=APIKeyResponse, status_code=201)
async def create_key(
    req: APIKeyCreateRequest,
    session: Session = Depends(get_session),
    x_api_key: str | None = Header(default=None),
    x_admin_bootstrap_secret: str | None = Header(default=None),
):
    """Create a new API key using an admin key or bootstrap secret."""
    require_admin_key_or_bootstrap_secret(session, x_api_key, x_admin_bootstrap_secret)

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
    session: Session = Depends(get_session),
    x_api_key: str | None = Header(default=None),
    x_admin_bootstrap_secret: str | None = Header(default=None),
):
    """Revoke an API key"""
    require_admin_key_or_bootstrap_secret(session, x_api_key, x_admin_bootstrap_secret)

    api_key = session.get(APIKey, key_id)
    if not api_key:
        return {"message": "Key not found"}
    
    api_key.revoked = True
    api_key.revoked_at = datetime.utcnow()
    session.add(api_key)
    session.commit()
    
    return {"message": "Key revoked"}
