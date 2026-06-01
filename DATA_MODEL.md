# Data Model

## Database Schema

### sets
```
id (UUID, Primary Key)
name (String, not null, e.g., "Banarasi Collection")
description (String, nullable)
total_items (Integer, auto-calculated)
total_available (Integer, auto-calculated)
total_sold (Integer, auto-calculated)
created_at (DateTime)
updated_at (DateTime)
```

### items (Color Variants)
```
id (UUID, Primary Key)
set_id (UUID, Foreign Key → sets.id)
color (String, not null, e.g., "Deep Red")
sku (String, unique, e.g., "BAN-RED-001")
quantity (Integer, default 1)
price (Decimal, e.g., 1200.00)
status (Enum: "available" | "sold" | "reserved", default "available")
item_metadata (JSON, nullable, for extensibility)
  - material (String)
  - weight_kg (Float)
  - notes (String)
  - custom_fields...
created_at (DateTime)
updated_at (DateTime)
```

### api_keys
```
id (UUID, Primary Key)
key (String, hashed with SHA256, unique)
name (String, e.g., "Frontend App", "Cursor Agent")
scopes (String, comma-separated: "read,write,admin")
created_at (DateTime)
revoked (Boolean, default False)
revoked_at (DateTime, nullable)
last_used_at (DateTime, nullable)
```

---

## Relationships
- `items.set_id` → `sets.id` (One-to-Many: one set has many color variants)
- `api_keys.id` is standalone (tracks authentication)

## Design Notes
- **UUID for IDs:** Better for distributed systems and privacy
- **Metadata (JSON):** Allows flexibility for future attributes without schema migration
- **Status Enum:** Track inventory state (available/sold/reserved)
- **Timestamps:** Audit trail for changes
- **Hashed Keys:** API keys never stored in plaintext
- **item_metadata field:** Named `item_metadata` instead of `metadata` due to SQLAlchemy reserved word constraints. API requests accept `metadata` field which is aliased automatically.
