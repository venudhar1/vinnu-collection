
---

## EXAMPLES.md
```markdown
# Example Requests

## Create set
```bash
curl -X POST http://localhost:8000/sets \
  -H "x-api-key: <API_KEY>" \
  -d '{"name":"Set A","description":"Silk"}'
  
Add item
bash
curl -X POST http://localhost:8000/sets/{set_id}/items \
  -H "x-api-key: <API_KEY>" \
  -d '{"color":"Red","quantity":1,"price":1200}'
Mark sold
bash
curl -X PUT http://localhost:8000/sets/{set_id}/items/{item_id} \
  -H "x-api-key: <API_KEY>" \
  -d '{"status":"sold","quantity":0}'