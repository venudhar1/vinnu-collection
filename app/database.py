from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.pool import StaticPool
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./inventory.db")

# Connection args for SQLite
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

# Create engine with appropriate settings
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=os.getenv("DEBUG", "True").lower() == "true",
    poolclass=StaticPool if "sqlite" in DATABASE_URL else None,
)


def init_db():
    """Initialize database tables"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Get database session for dependency injection"""
    with Session(engine) as session:
        yield session
