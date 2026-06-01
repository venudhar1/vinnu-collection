# Setup and Run

## Install
```bash
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn sqlmodel pydantic[dotenv] pytest httpx

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000


---

## EXAMPLES.md
```markdown
# Example Requests

## Create set
```bash
curl -X POST http://localhost:8000/sets \
  -H "x-api-key: <API_KEY>" \
  -d '{"name":"Set A","description":"Silk"}'
