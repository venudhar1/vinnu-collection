
# Example Requests

All examples use `curl`. Save your API key and set it as a variable:

```bash
API_KEY="sk_live_aBcDeFgHiJkLmNoPqRs"
```

---

## Health Check
```bash
curl -X GET http://localhost:8000/health
```

**Response (200):**
```json
{"status": "ok"}
```

---

## Create API Key

### Request
```bash
curl -X POST http://localhost:8000/auth/keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend App",
    "scopes": "read,write"
  }'
```

### Response (201)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "key": "sk_live_aBcDeFgHiJkLmNoPqRs",
  "name": "Frontend App",
  "scopes": "read,write",
  "created_at": "2026-06-01T10:00:00Z"
}
```

---

## Create a Saree Set

### Request
```bash
curl -X POST http://localhost:8000/sets \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Banarasi Collection",
    "description": "Traditional Banarasi sarees with gold zari"
  }'
```

### Response (201)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Banarasi Collection",
  "description": "Traditional Banarasi sarees with gold zari",
  "total_items": 0,
  "total_available": 0,
  "total_sold": 0,
  "created_at": "2026-06-01T10:00:00Z",
  "updated_at": "2026-06-01T10:00:00Z"
}
```

---

## List All Sets

### Request
```bash
curl -X GET http://localhost:8000/sets \
  -H "x-api-key: $API_KEY"
```

### Response (200)
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Banarasi Collection",
    "description": "Traditional Banarasi sarees with gold zari",
    "total_items": 6,
    "total_available": 5,
    "total_sold": 1,
    "created_at": "2026-06-01T10:00:00Z",
    "updated_at": "2026-06-01T10:00:00Z"
  }
]
```

---

## Add Color Variant to Set

### Request
```bash
curl -X POST http://localhost:8000/sets/550e8400-e29b-41d4-a716-446655440000/items \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "color": "Deep Red",
    "sku": "BAN-RED-001",
    "quantity": 2,
    "price": 1200.00,
    "metadata": {
      "material": "Silk with gold zari",
      "weight_kg": 0.8
    }
  }'
```

### Response (201)
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "set_id": "550e8400-e29b-41d4-a716-446655440000",
  "color": "Deep Red",
  "sku": "BAN-RED-001",
  "quantity": 2,
  "price": 1200.00,
  "status": "available",
  "item_metadata": "{\"material\": \"Silk with gold zari\", \"weight_kg\": 0.8}",
  "created_at": "2026-06-01T10:00:00Z",
  "updated_at": "2026-06-01T10:00:00Z"
}
```

---

## Mark Color as Sold (Update Item)

### Request
```bash
curl -X PUT http://localhost:8000/sets/550e8400-e29b-41d4-a716-446655440000/items/660e8400-e29b-41d4-a716-446655440001 \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 1,
    "status": "sold"
  }'
```

### Response (200)
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "set_id": "550e8400-e29b-41d4-a716-446655440000",
  "color": "Deep Red",
  "sku": "BAN-RED-001",
  "quantity": 1,
  "price": 1200.00,
  "status": "sold",
  "item_metadata": "{\"material\": \"Silk with gold zari\", \"weight_kg\": 0.8}",
  "created_at": "2026-06-01T10:00:00Z",
  "updated_at": "2026-06-01T10:00:00Z"
}
```

---

## Bulk Mark Multiple Colors Sold

### Request
```bash
curl -X POST http://localhost:8000/bulk/mark-sold \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "set_id": "550e8400-e29b-41d4-a716-446655440000",
        "item_id": "660e8400-e29b-41d4-a716-446655440001"
      },
      {
        "set_id": "550e8400-e29b-41d4-a716-446655440000",
        "item_id": "660e8400-e29b-41d4-a716-446655440002"
      }
    ]
  }'
```

### Response (200)
```json
{
  "updated": 2,
  "message": "2 items marked as sold"
}
```

---

## Get Inventory Summary

### Request
```bash
curl -X GET http://localhost:8000/bulk/inventory/summary \
  -H "x-api-key: $API_KEY"
```

### Response (200)
```json
{
  "total_sets": 2,
  "total_colors": 12,
  "total_available": 10,
  "total_sold": 2,
  "sets": [
    {
      "name": "Banarasi Collection",
      "total_items": 6,
      "total_available": 5,
      "total_sold": 1
    },
    {
      "name": "Silk Collection",
      "total_items": 6,
      "total_available": 5,
      "total_sold": 1
    }
  ]
}
```

---

## Error Example: Invalid API Key

### Request
```bash
curl -X GET http://localhost:8000/sets \
  -H "x-api-key: invalid_key"
```

### Response (401)
```json
{
  "detail": "Invalid API key"
}
```