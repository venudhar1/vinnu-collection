from sqlmodel import SQLModel, Field
from typing import Optional
from uuid import uuid4
from datetime import datetime


class APIKey(SQLModel, table=True):
    """API Key model for authentication"""
    __tablename__ = "api_keys"
    
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    key: str = Field(unique=True, index=True)  # Hashed key
    name: str
    scopes: str = "read,write"  # Comma-separated: read,write,admin
    created_at: datetime = Field(default_factory=datetime.utcnow)
    revoked: bool = False
    revoked_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None


class Set(SQLModel, table=True):
    """Saree Set model"""
    __tablename__ = "sets"
    
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    name: str
    description: Optional[str] = None
    total_items: int = 0
    total_available: int = 0
    total_sold: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Item(SQLModel, table=True):
    """Item (Color Variant) model"""
    __tablename__ = "items"
    
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    set_id: str = Field(foreign_key="sets.id")
    color: str
    sku: str = Field(unique=True, index=True)
    quantity: int = 1
    price: float
    status: str = Field(default="available")  # available, sold, reserved
    item_metadata: Optional[str] = Field(None, alias="metadata")  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic schemas for API requests/responses
class SetCreate(SQLModel):
    """Schema for creating a set"""
    name: str
    description: Optional[str] = None


class SetResponse(Set):
    """Schema for set response"""
    pass


class ItemCreate(SQLModel):
    """Schema for creating an item"""
    color: str
    sku: str
    quantity: int = 1
    price: float
    metadata: Optional[dict] = None


class ItemUpdate(SQLModel):
    """Schema for updating an item"""
    color: Optional[str] = None
    quantity: Optional[int] = None
    price: Optional[float] = None
    status: Optional[str] = None
    metadata: Optional[dict] = None


class ItemResponse(Item):
    """Schema for item response"""
    pass


class APIKeyCreateRequest(SQLModel):
    """Schema for creating an API key"""
    name: str
    scopes: str = "read,write"


class APIKeyResponse(SQLModel):
    """Schema for API key response"""
    id: str
    key: str
    name: str
    scopes: str
    created_at: datetime


class BulkMarkSoldRequest(SQLModel):
    """Schema for bulk mark sold request"""
    items: list[dict]  # List of {set_id, item_id}
