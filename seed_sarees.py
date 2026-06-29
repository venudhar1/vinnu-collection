import json
from sqlmodel import Session, select
from app.database import engine, init_db
from app.models import Set, Item

def seed_database():
    # Initialize the tables if not created
    init_db()
    
    with Session(engine) as session:
        # Clear existing entries
        print("Clearing existing items and sets...")
        session.exec(select(Item)).all()
        for item in session.exec(select(Item)).all():
            session.delete(item)
        for set_obj in session.exec(select(Set)).all():
            session.delete(set_obj)
        session.commit()
        
        # 1. Royal Banarasi Silk Saree Set
        banarasi_set = Set(
            id="banarasi-silk-set",
            name="Beautiful Royal Banarasi Silk Saree",
            description="Woven in the ancient city of Varanasi, Banarasi sarees are synonymous with grandeur. Embellished with pure gold zari borders and floral brocade motifs, they represent the peak of Indian bridal luxury.",
            total_items=2,
            total_available=2,
            total_sold=0
        )
        
        # Variants for Banarasi
        red_banarasi = Item(
            id="banarasi-red-item",
            set_id=banarasi_set.id,
            color="Bridal Red",
            sku="BAN-RED-001",
            quantity=3,
            price=2349.0,
            status="available",
            item_metadata=json.dumps({
                "material": "Pure Banarasi Silk",
                "notes": "Handloomed with rich gold zari borders. Includes 80cm matching unstitched blouse piece.",
                "images": ["/images/banarasi_red_1.png", "/images/banarasi_red_2.png"],
                "original_price": 3349.0
            })
        )
        
        wine_banarasi = Item(
            id="banarasi-wine-item",
            set_id=banarasi_set.id,
            color="Royal Wine",
            sku="BAN-WINE-002",
            quantity=2,
            price=2649.0,
            status="available",
            item_metadata=json.dumps({
                "material": "Pure Banarasi Silk",
                "notes": "Royal wine purple hue woven with fine silver thread brocades. Silk Mark certified.",
                "images": ["/images/banarasi_wine_1.png", "/images/banarasi_wine_2.png"],
                "original_price": 3749.0
            })
        )
        
        # 2. Classic Sunset Silk Saree Set
        sunset_set = Set(
            id="classic-silk-set",
            name="Reception Party Wear Silk & Zari Saree",
            description="Crafted with dynamic silk yarns and elegant borders, this collection is designed for modern celebrations and festive occasions. Light on the drape, heavy on the charm.",
            total_items=2,
            total_available=2,
            total_sold=0
        )
        
        orange_silk = Item(
            id="silk-orange-item",
            set_id=sunset_set.id,
            color="Sunset Orange",
            sku="SILK-ORANGE-001",
            quantity=4,
            price=2449.0,
            status="available",
            item_metadata=json.dumps({
                "material": "Pure Kanchipuram Silk",
                "notes": "Bright sunset orange saree featuring gold temple borders. Dry clean only.",
                "images": ["/images/silk_orange_1.png", "/images/silk_orange_2.png"],
                "original_price": 3449.0
            })
        )
        
        yellow_silk = Item(
            id="silk-yellow-item",
            set_id=sunset_set.id,
            color="Mustard Yellow",
            sku="SILK-YEL-002",
            quantity=5,
            price=2249.0,
            status="available",
            item_metadata=json.dumps({
                "material": "Pure Kanchipuram Silk",
                "notes": "Vibrant mustard shade, perfect for Haldi ceremonies. Features a contrasting pink border.",
                "images": ["/images/silk_yellow_1.png", "/images/silk_yellow_2.png"],
                "original_price": 3149.0
            })
        )
        
        # 3. Festive Organza Saree Set
        organza_set = Set(
            id="festive-organza-set",
            name="Mehendi Ceremony Special Soft Organza Fabric Saree",
            description="Delicate and ethereal, organza sarees offer lightweight elegance. Adorned with beautiful floral prints and subtle zari embroidery, they are perfect for daytime celebrations and summer weddings.",
            total_items=2,
            total_available=2,
            total_sold=0
        )
        
        green_organza = Item(
            id="organza-green-item",
            set_id=organza_set.id,
            color="Mint Green",
            sku="ORG-GRN-001",
            quantity=6,
            price=3149.0,
            status="available",
            item_metadata=json.dumps({
                "material": "Premium Organza Silk",
                "notes": "Sheer mint green body with hand-painted floral prints and silver scalloped borders.",
                "images": ["/images/organza_green_1.png", "/images/organza_green_2.png"],
                "original_price": 4149.0
            })
        )
        
        pink_organza = Item(
            id="organza-pink-item",
            set_id=organza_set.id,
            color="Peach Pink",
            sku="ORG-PNK-002",
            quantity=0, # Let's make this one sold out to verify sold-out UI states
            price=2949.0,
            status="sold",
            item_metadata=json.dumps({
                "material": "Premium Organza Silk",
                "notes": "Blossom pink sheer drape with golden zari lace work. Extremely soft texture.",
                "images": ["/images/organza_pink_1.png", "/images/organza_pink_2.png"],
                "original_price": 3949.0
            })
        )
        
        # Save to DB
        session.add(banarasi_set)
        session.add(red_banarasi)
        session.add(wine_banarasi)
        
        session.add(sunset_set)
        session.add(orange_silk)
        session.add(yellow_silk)
        
        session.add(organza_set)
        session.add(green_organza)
        session.add(pink_organza)
        
        session.commit()
        print("Successfully seeded database with premium Indian sarees.")

if __name__ == "__main__":
    seed_database()
