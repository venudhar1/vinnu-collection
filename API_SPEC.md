# API Specification

**Base URL (local):** `http://localhost:8000`  
**Auth Header:** `x-api-key: <YOUR_API_KEY>`

## Health Check
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | /health | Health check | No |

## API Key Management
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | /auth/keys | Create new API key | No (local only) |
| DELETE | /auth/keys/{key_id} | Revoke API key | No |

## Sets Management
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | /sets | List all saree sets | Yes |
| POST | /sets | Create new set | Yes |
| GET | /sets/{set_id} | Get set details | Yes |
| PUT | /sets/{set_id} | Update set info | Yes |
| DELETE | /sets/{set_id} | Delete set | Yes |

## Items (Color Variants) Management
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | /sets/{set_id}/items | List all colors in set | Yes |
| POST | /sets/{set_id}/items | Add new color variant | Yes |
| GET | /sets/{set_id}/items/{item_id} | Get color details | Yes |
| PUT | /sets/{set_id}/items/{item_id} | Update color (qty, price, status) | Yes |
| DELETE | /sets/{set_id}/items/{item_id} | Remove color variant | Yes |

## Bulk Operations
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | /bulk/mark-sold | Bulk mark multiple colors sold | Yes |
| POST | /bulk/adjust-inventory | Bulk adjust quantities | Yes |
| GET | /bulk/inventory/summary | Get total inventory summary | Yes |

## OpenAPI / Swagger
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | /openapi.json | OpenAPI specification (for agents) | No |
| GET | /docs | Interactive API documentation (Swagger UI) | No |
| GET | /redoc | ReDoc documentation | No |

---

## Example Responses

### Set Resource
```json
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
```

### Item (Color Variant) Resource
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "set_id": "550e8400-e29b-41d4-a716-446655440000",
  "color": "Deep Red",
  "sku": "BAN-RED-001",
  "quantity": 2,
  "price": 1200.00,
  "status": "available",
  "item_metadata": null,
  "created_at": "2026-06-01T10:00:00Z",
  "updated_at": "2026-06-01T10:00:00Z"
}
```

**Note:** JSON metadata is sent as `metadata` field in requests and stored in `item_metadata` column internally.

### Error Response
```json
{
  "detail": "Invalid API key"
}
```
HTTP Status: 401 Unauthorized

---

## Status Codes
- **200** — Success
- **201** — Created
- **204** — No Content (successful delete)
- **400** — Bad Request
- **401** — Unauthorized (invalid API key)
- **404** — Not Found
- **500** — Server Error
