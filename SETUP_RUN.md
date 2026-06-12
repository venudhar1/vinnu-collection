# Setup and Run Locally

## Prerequisites
- Python 3.11 or higher
- pip (Python package manager)
- Git (optional, for version control)

---

## Installation Steps

### 1. Create Virtual Environment
```bash
# On macOS / Linux
python -m venv .venv
source .venv/bin/activate

# On Windows
python -m venv .venv
.venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Create `.env` File
Already created in project root with defaults:
```
DATABASE_URL=sqlite:///./inventory.db
API_PORT=8000
API_HOST=0.0.0.0
DEBUG=True
ADMIN_BOOTSTRAP_SECRET=replace-with-a-long-random-secret
```

### 4. Initialize Database
Database initializes automatically on first run, but you can pre-initialize:
```bash
python -c "from app.database import init_db; init_db()"
```

---

## Running the Server

### Development Server (with auto-reload)
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Production Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
```

---

## Access the API

- **Interactive Docs:** http://localhost:8000/docs (Swagger UI)
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health
- **OpenAPI Spec:** http://localhost:8000/openapi.json

---

## Creating Your First Admin API Key
```bash
curl -X POST http://localhost:8000/auth/keys \
  -H "Content-Type: application/json" \
  -H "x-admin-bootstrap-secret: replace-with-a-long-random-secret" \
  -d '{
    "name": "Test Key",
    "scopes": "read,write,admin"
  }'
```

Save the returned `key` value. You'll use it for all requests.

In production, do not expose key generation in the frontend. Staff keys should be created by the owner using the bootstrap secret or an existing admin API key.

---

## Project Structure
```
stock_inventory/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app + routes
│   ├── database.py             # SQLite connection & init
│   ├── models.py               # SQLModel definitions
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py             # API key validation
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── sets.py             # Set CRUD
│   │   ├── items.py            # Item/color CRUD
│   │   ├── auth_routes.py       # API key management
│   │   └── bulk.py             # Bulk operations
│   └── utils/
│       ├── __init__.py
│       └── hash_util.py         # Key hashing utilities
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Test fixtures
│   └── test_api.py             # 11 test cases
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── requirements.txt            # Python dependencies
├── inventory.db               # SQLite database (auto-created)
└── [13 markdown files]        # Full documentation
```

---

## Running Tests

```bash
pytest tests/test_api.py -v
```

Expected: 11/11 tests passing ✅

---

## Stopping the Server
Press `Ctrl+C` in the terminal.

## Troubleshooting

### Port already in use
```bash
# Change port
uvicorn app.main:app --port 8001
```

### Database locked
Close any other connections to `inventory.db` and restart server

### Import errors
Ensure virtual environment is activated and requirements installed:
```bash
.venv\Scripts\activate
pip install -r requirements.txt
```

### Database needs reset
```bash
rm inventory.db
python -c "from app.database import init_db; init_db()"
```
