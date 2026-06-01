from fastapi import Header, HTTPException, Depends
from sqlmodel import Session, select  # type: ignore
from app.database import get_session
from app.models import APIKey
from app.utils.hash_util import hash_api_key
from datetime import datetime


async def verify_api_key(
    x_api_key: str = Header(...),
    session: Session = Depends(get_session)
) -> APIKey:
    """Verify API key from header"""
    
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    hashed_key = hash_api_key(x_api_key)
    statement = select(APIKey).where(APIKey.key == hashed_key)
    api_key = session.exec(statement).first()
    
    if not api_key or api_key.revoked:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Update last used timestamp
    api_key.last_used_at = datetime.utcnow()
    session.add(api_key)
    session.commit()
    
    return api_key
