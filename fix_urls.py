import os
import glob

# Files to update
replacements = [
    (
        "frontend/src/app/shop/product/[id]/page.tsx",
        [
            ("`http://localhost:8000/public/sets/${setId}`", "`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000\"}/public/sets/${setId}`"),
            ("`http://localhost:8000/public/sets/${setId}/items`", "`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000\"}/public/sets/${setId}/items`")
        ]
    ),
    (
        "frontend/src/app/shop/page.tsx",
        [
            ("}/public/sets`", "}/public/sets`") # public/sets doesn't need trailing slash
        ]
    ),
    (
        "frontend/src/app/shop/checkout/page.tsx",
        [
            ("}/orders/checkout`", "}/orders/checkout`") # checkout doesn't need trailing slash
        ]
    ),
    (
        "frontend/src/app/shop/catalog/page.tsx",
        [
            ("`http://localhost:8000/public/sets/${set.id}/items`", "`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000\"}/public/sets/${set.id}/items`")
        ]
    ),
    (
        "frontend/src/app/admin/orders/page.tsx",
        [
            ("}/orders/`", "}/orders/`"),
            ("`http://localhost:8000/orders/${data.orderId}/status?status=${data.status}`", "`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000\"}/orders/${data.orderId}/status?status=${data.status}`")
        ]
    ),
    (
        "frontend/src/app/admin/sets/page.tsx",
        [
            ("}/sets`, {", "}/sets/`, {"), # Fix trailing slash!
            ("`http://localhost:8000/sets/${data.id}`", "`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000\"}/sets/${data.id}`"),
            ("`http://localhost:8000/sets/${id}`", "`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000\"}/sets/${id}`")
        ]
    ),
    (
        "frontend/src/app/admin/sets/[id]/items/page.tsx",
        [
            ("`http://localhost:8000/sets/${setId}`", "`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000\"}/sets/${setId}`"),
            ("`http://localhost:8000/sets/${setId}/items`", "`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000\"}/sets/${setId}/items`"),
            ("`http://localhost:8000/sets/${setId}/items/${data.itemId}`", "`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000\"}/sets/${setId}/items/${data.itemId}`"),
            ("`http://localhost:8000/sets/${setId}/items/${itemId}`", "`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000\"}/sets/${setId}/items/${itemId}`")
        ]
    )
]

base_dir = "c:/projects/stock_inventory"

for rel_path, reps in replacements:
    filepath = os.path.join(base_dir, rel_path)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in reps:
            content = content.replace(old, new)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {rel_path}")
    else:
        print(f"Not found: {filepath}")
