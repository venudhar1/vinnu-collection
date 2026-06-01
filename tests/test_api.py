from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_api_key(client: TestClient):
    """Test creating an API key"""
    response = client.post("/auth/keys", json={
        "name": "Test Key",
        "scopes": "read,write"
    })
    assert response.status_code == 201
    data = response.json()
    assert "key" in data
    assert data["name"] == "Test Key"
    assert data["scopes"] == "read,write"


def test_create_set(client: TestClient, api_key: str):
    """Test creating a saree set"""
    response = client.post(
        "/sets/",
        headers={"x-api-key": api_key},
        json={
            "name": "Banarasi Collection",
            "description": "Traditional Banarasi sarees with gold zari"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Banarasi Collection"
    assert data["total_items"] == 0
    return data["id"]


def test_list_sets(client: TestClient, api_key: str):
    """Test listing all sets"""
    # Create a set first
    client.post(
        "/sets/",
        headers={"x-api-key": api_key},
        json={"name": "Test Set", "description": "Test"}
    )
    
    response = client.get("/sets/", headers={"x-api-key": api_key})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0


def test_add_item_to_set(client: TestClient, api_key: str):
    """Test adding a color variant to a set"""
    # Create a set first
    set_response = client.post(
        "/sets/",
        headers={"x-api-key": api_key},
        json={"name": "Test Set", "description": "Test"}
    )
    set_id = set_response.json()["id"]
    
    # Add item
    response = client.post(
        f"/sets/{set_id}/items",
        headers={"x-api-key": api_key},
        json={
            "color": "Deep Red",
            "sku": "TEST-RED-001",
            "quantity": 2,
            "price": 1200.00,
            "metadata": {"material": "Silk"}
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["color"] == "Deep Red"
    assert data["quantity"] == 2
    assert data["status"] == "available"


def test_mark_item_sold(client: TestClient, api_key: str):
    """Test marking an item as sold"""
    # Create set and item
    set_response = client.post(
        "/sets/",
        headers={"x-api-key": api_key},
        json={"name": "Test Set", "description": "Test"}
    )
    set_id = set_response.json()["id"]
    
    item_response = client.post(
        f"/sets/{set_id}/items",
        headers={"x-api-key": api_key},
        json={
            "color": "Red",
            "sku": "TEST-RED-002",
            "quantity": 1,
            "price": 1200.00
        }
    )
    item_id = item_response.json()["id"]
    
    # Mark as sold
    response = client.put(
        f"/sets/{set_id}/items/{item_id}",
        headers={"x-api-key": api_key},
        json={"status": "sold"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "sold"


def test_invalid_api_key(client: TestClient):
    """Test with invalid API key"""
    response = client.get("/sets/", headers={"x-api-key": "invalid_key"})
    assert response.status_code == 401
    assert "Invalid API key" in response.json()["detail"]


def test_bulk_mark_sold(client: TestClient, api_key: str):
    """Test bulk marking items as sold"""
    # Create set with multiple items
    set_response = client.post(
        "/sets/",
        headers={"x-api-key": api_key},
        json={"name": "Test Set", "description": "Test"}
    )
    set_id = set_response.json()["id"]
    
    item_ids = []
    for i in range(3):
        item_response = client.post(
            f"/sets/{set_id}/items",
            headers={"x-api-key": api_key},
            json={
                "color": f"Color {i}",
                "sku": f"TEST-COL-{i:03d}",
                "quantity": 1,
                "price": 1000.00
            }
        )
        item_ids.append(item_response.json()["id"])
    
    # Bulk mark as sold
    response = client.post(
        "/bulk/mark-sold",
        headers={"x-api-key": api_key},
        json={
            "items": [
                {"set_id": set_id, "item_id": iid} for iid in item_ids[:2]
            ]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["updated"] == 2


def test_inventory_summary(client: TestClient, api_key: str):
    """Test getting inventory summary"""
    # Create sets and items
    for i in range(2):
        set_response = client.post(
            "/sets/",
            headers={"x-api-key": api_key},
            json={"name": f"Set {i}", "description": "Test"}
        )
        set_id = set_response.json()["id"]
        
        for j in range(2):
            client.post(
                f"/sets/{set_id}/items",
                headers={"x-api-key": api_key},
                json={
                    "color": f"Color {j}",
                    "sku": f"TEST-{i:02d}-{j:02d}",
                    "quantity": 1,
                    "price": 1000.00
                }
            )
    
    response = client.get(
        "/bulk/inventory/summary",
        headers={"x-api-key": api_key}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_sets"] >= 2
    assert data["total_colors"] >= 4


def test_set_not_found(client: TestClient, api_key: str):
    """Test accessing non-existent set"""
    response = client.get(
        "/sets/nonexistent-id",
        headers={"x-api-key": api_key}
    )
    assert response.status_code == 404
    assert "Set not found" in response.json()["detail"]


def test_duplicate_sku(client: TestClient, api_key: str):
    """Test creating item with duplicate SKU"""
    set_response = client.post(
        "/sets/",
        headers={"x-api-key": api_key},
        json={"name": "Test Set", "description": "Test"}
    )
    set_id = set_response.json()["id"]
    
    # Create first item
    client.post(
        f"/sets/{set_id}/items",
        headers={"x-api-key": api_key},
        json={
            "color": "Red",
            "sku": "UNIQUE-SKU",
            "quantity": 1,
            "price": 1000.00
        }
    )
    
    # Try to create duplicate SKU
    response = client.post(
        f"/sets/{set_id}/items",
        headers={"x-api-key": api_key},
        json={
            "color": "Blue",
            "sku": "UNIQUE-SKU",
            "quantity": 1,
            "price": 1000.00
        }
    )
    assert response.status_code == 400
    assert "SKU already exists" in response.json()["detail"]
