# API Specification

**Base URL (local):** `http://localhost:8000`  
**Auth header:** `x-api-key: <YOUR_API_KEY>`

## Endpoints
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | /health | Health check | No |
| POST | /auth/keys | Create API key | No (local only) |
| GET | /sets | List all sets | Yes |
| POST | /sets | Create a new set | Yes |
| GET | /sets/{set_id} | Get set details | Yes |
| PUT | /sets/{set_id} | Update set | Yes |
| DELETE | /sets/{set_id} | Delete set | Yes |
| GET | /sets/{set_id}/items | List items | Yes |
| POST | /sets/{set_id}/items | Add item | Yes |
| PUT | /sets/{set_id}/items/{item_id} | Update item | Yes |
| DELETE | /sets/{set_id}/items/{item_id} | Remove item | Yes |
| POST | /bulk/adjust | Bulk adjust inventory | Yes |
| GET | /openapi.json | OpenAPI spec | Yes |

## Example resource
```json
{
  "id": "uuid",
  "name": "Set A",
  "description": "Banarasi collection",
  "items_count": 6
}

---

## DATA_MODEL.md
```markdown
# Data Model

## sets
- id (UUID, PK)
- name
- description
- created_at
- updated_at

## items
- id (UUID, PK)
- set_id (FK)
- color
- sku
- quantity
- status (available/sold/reserved)
- price
- metadata (JSON)
- created_at
- updated_at

## api_keys
- id (UUID, PK)
- key (hashed)
- name
- scopes
- created_at
- revoked
