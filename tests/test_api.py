from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_api_key(client: TestClient):
    """Test creating an API key"""
    response = client.post(
        "/auth/keys",
        headers={"x-admin-bootstrap-secret": "test-bootstrap-secret"},
        json={
            "name": "Test Key",
            "scopes": "read,write"
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "key" in data
    assert data["name"] == "Test Key"
    assert data["scopes"] == "read,write"


def test_create_api_key_requires_admin_or_bootstrap(client: TestClient):
    """Test API key creation is not public"""
    response = client.post("/auth/keys", json={
        "name": "Public Attempt",
        "scopes": "read,write"
    })
    assert response.status_code == 403


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


def test_public_catalog(client: TestClient, api_key: str):
    """Test public routes that do not require an API key"""
    # Create a set and an item using admin API key
    set_res = client.post(
        "/sets/",
        headers={"x-api-key": api_key},
        json={"name": "Public Collection", "description": "Public test collection"}
    )
    set_id = set_res.json()["id"]
    
    item_res = client.post(
        f"/sets/{set_id}/items",
        headers={"x-api-key": api_key},
        json={
            "color": "Green",
            "sku": "PUB-GRN-001",
            "quantity": 3,
            "price": 999.00
        }
    )
    item_id = item_res.json()["id"]

    # Test list sets publicly (no auth header)
    res = client.get("/public/sets")
    assert res.status_code == 200
    assert len(res.json()) > 0
    assert any(s["id"] == set_id for s in res.json())

    # Test get set publicly
    res = client.get(f"/public/sets/{set_id}")
    assert res.status_code == 200
    assert res.json()["name"] == "Public Collection"

    # Test list items publicly
    res = client.get(f"/public/sets/{set_id}/items")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["id"] == item_id


def test_checkout_and_orders(client: TestClient, api_key: str):
    """Test order creation/checkout, stock adjustments, and order lookups"""
    # Create a set and items
    set_res = client.post(
        "/sets/",
        headers={"x-api-key": api_key},
        json={"name": "Order Collection", "description": "Collection for testing orders"}
    )
    set_id = set_res.json()["id"]

    item1_res = client.post(
        f"/sets/{set_id}/items",
        headers={"x-api-key": api_key},
        json={
            "color": "Gold",
            "sku": "ORD-GLD-001",
            "quantity": 5,
            "price": 2000.00
        }
    )
    item1_id = item1_res.json()["id"]

    item2_res = client.post(
        f"/sets/{set_id}/items",
        headers={"x-api-key": api_key},
        json={
            "color": "Silver",
            "sku": "ORD-SLV-001",
            "quantity": 1,
            "price": 1500.00
        }
    )
    item2_id = item2_res.json()["id"]

    # Run client checkout
    checkout_res = client.post(
        "/orders/checkout",
        json={
            "customer_name": "Test Customer",
            "customer_email": "customer@example.com",
            "customer_phone": "1234567890",
            "shipping_address": "123 Test Street",
            "items": [
                {"item_id": item1_id, "quantity": 2},
                {"item_id": item2_id, "quantity": 1}
            ]
        }
    )
    assert checkout_res.status_code == 201
    order_data = checkout_res.json()
    assert order_data["customer_name"] == "Test Customer"
    assert order_data["total_amount"] == (2000.00 * 2 + 1500.00 * 1)
    assert order_data["status"] == "pending"
    order_id = order_data["id"]

    # Mark the order as paid as admin
    mark_paid = client.put(f"/orders/{order_id}/status?status=paid", headers={"x-api-key": api_key})
    assert mark_paid.status_code == 200
    assert mark_paid.json()["status"] == "paid"

    # Verify inventory was decremented
    # Item 1: went from 5 to 3. Should still be "available"
    item1_get = client.get(f"/sets/{set_id}/items/{item1_id}", headers={"x-api-key": api_key})
    assert item1_get.json()["quantity"] == 3
    assert item1_get.json()["status"] == "available"

    # Item 2: went from 1 to 0. Should be "sold"
    item2_get = client.get(f"/sets/{set_id}/items/{item2_id}", headers={"x-api-key": api_key})
    assert item2_get.json()["quantity"] == 0
    assert item2_get.json()["status"] == "sold"

    # Verify parent set total calculations:
    # Initial: total_items = 2, total_available = 2, total_sold = 0
    # After Item 2 is marked sold: total_available = 1, total_sold = 1
    set_get = client.get(f"/sets/{set_id}", headers={"x-api-key": api_key})
    assert set_get.json()["total_available"] == 1
    assert set_get.json()["total_sold"] == 1

    # Look up order as customer
    lookup_res = client.get(f"/orders/customer/{order_id}")
    assert lookup_res.status_code == 200
    assert lookup_res.json()["customer_name"] == "Test Customer"
    assert len(lookup_res.json()["items"]) == 2

    # Look up all orders as admin
    admin_list = client.get("/orders/", headers={"x-api-key": api_key})
    assert admin_list.status_code == 200
    assert len(admin_list.json()) > 0
    assert any(o["id"] == order_id for o in admin_list.json())

    # Get single order detail as admin
    admin_detail = client.get(f"/orders/{order_id}", headers={"x-api-key": api_key})
    assert admin_detail.status_code == 200
    assert admin_detail.json()["customer_name"] == "Test Customer"

    # Update order status as admin
    status_update = client.put(f"/orders/{order_id}/status?status=shipped", headers={"x-api-key": api_key})
    assert status_update.status_code == 200
    assert status_update.json()["status"] == "shipped"

