import pytest
from fastapi.testclient import TestClient
from app.main import app
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool
from app.database import get_session
from app.models import SQLModel


@pytest.fixture(name="session")
def session_fixture():
    """Create a test database session"""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a test client with overridden dependencies"""
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def api_key(client: TestClient):
    """Create a test API key"""
    response = client.post(
        "/auth/keys",
        headers={"x-admin-bootstrap-secret": "test-bootstrap-secret"},
        json={
            "name": "Test Key",
            "scopes": "read,write,admin"
        },
    )
    assert response.status_code == 201
    return response.json()["key"]
