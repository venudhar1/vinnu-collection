import os
from sqlmodel import Session, select, create_engine
from app.models import APIKey
from app.utils.hash_util import hash_api_key

db_url = os.getenv("DATABASE_URL", "sqlite:///./inventory.db")
engine = create_engine(db_url, echo=False)

def main():
    plain_key = "sk_live_CY_DORU4sDjHAaFmoixLBnVcWYrEYS8e"
    hashed = hash_api_key(plain_key)
    
    with Session(engine) as sess:
        keys = sess.exec(select(APIKey)).all()
        print(f"Total keys in DB: {len(keys)}")
        match = False
        for k in keys:
            if k.key == hashed:
                match = True
                print(f"✅ Found matching key! ID: {k.id}, Revoked: {k.revoked}")
        if not match:
            print(f"❌ Key {plain_key} (hash: {hashed}) not found in DB!")

if __name__ == "__main__":
    main()
