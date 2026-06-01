# Testing Strategy

## Test Framework
- **pytest** — Test runner
- **fastapi.testclient.TestClient** — ASGI test client
- **sqlmodel.SQLAlchemy** — In-memory SQLite DB for tests
- **11 comprehensive test cases (all passing ✅)**

---

## Test File Structure
```
tests/
├── __init__.py
├── conftest.py              # Pytest fixtures
└── test_api.py              # All 11 test cases

Test Cases (All Passing ✅):
  1. test_health_check           — Health endpoint
  2. test_create_api_key         — Create API key
  3. test_create_set             — Create saree set
  4. test_list_sets              — List all sets
  5. test_add_item_to_set        — Add color variant
  6. test_mark_item_sold         — Mark item sold
  7. test_invalid_api_key        — Invalid key error
  8. test_bulk_mark_sold         — Bulk mark as sold
  9. test_inventory_summary      — Get summary stats
  10. test_set_not_found         — Handle missing set
  11. test_duplicate_sku         — Prevent SKU duplicates
```

---

## Running Tests

### Test Dependencies
Already included in `requirements.txt`:
```
pytest==7.4.3
httpx==0.25.2
```

### Run All Tests (11 total)
```bash
pytest tests/test_api.py -v
```

**Expected Output:** 11 passed ✅

### Run Specific Test
```bash
pytest tests/test_api.py::test_health_check -v
```

### Run with Coverage Report
```bash
pytest tests/test_api.py --cov=app --cov-report=term-missing
```

---

## Test Scenarios

### 1. Health Check
Verifies API is responding

### 2. Create API Key
Tests API key generation and storage

### 3. Create Set
Tests creating a new saree set with initial counts

### 4. List Sets
Tests retrieving all sets

### 5. Add Item to Set
Tests adding color variants with metadata

### 6. Mark Item Sold
Tests updating item status and set counts

### 7. Invalid API Key
Tests authentication rejection

### 8. Bulk Mark Sold
Tests batch operations

### 9. Inventory Summary
Tests aggregated statistics

### 10. Set Not Found
Tests 404 error handling

### 11. Duplicate SKU
Tests unique constraint validation

---

## Test Fixtures (from `tests/conftest.py`)

### session_fixture
Creates isolated in-memory SQLite database for each test

### client_fixture
Provides FastAPI TestClient with overridden database dependency

### api_key fixture
Auto-generates test API key for protected endpoints

---

## Key Testing Patterns

### Isolated Database
Each test runs against fresh in-memory SQLite database

### API Key Authentication
Tests verify both valid and invalid API keys

### CRUD Operations
Comprehensive coverage of Create, Read, Update, Delete

### Constraint Validation
Tests ensure unique SKU constraint and data integrity

### Error Handling
Tests verify appropriate status codes and error messages

---

## Running All Tests Locally

```bash
# Activate environment
.venv\Scripts\activate

# Run tests
pytest tests/test_api.py -v

# With coverage
pytest tests/test_api.py --cov=app
```

All tests should PASS ✅
