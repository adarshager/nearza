"""
Nearza System-Level Catalog Verification Script
"""
import os
import sys
import json
import urllib.request
import django

sys.stdout.reconfigure(line_buffering=True)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.accounts.models import User
from apps.shops.models import Shop
from apps.products.models import Category, Product, ShopProduct

def verify():
    print("=" * 60)
    print("NEARZA SYSTEM-LEVEL CATALOG VERIFICATION")
    print("=" * 60)

    # 1. Merchant Check
    merchants = list(User.objects.filter(role=User.Role.MERCHANT))
    print(f"\n1. Total Merchants: {len(merchants)}")
    for m in merchants:
        print(f"   - {m.full_name} ({m.email}) [ID: {m.id}]")
    if len(merchants) != 1:
        print(f"ERROR: Expected 1 merchant, got {len(merchants)}")
        sys.exit(1)

    # 2. Shop Check
    shops = list(Shop.objects.all())
    print(f"\n2. Total Shops: {len(shops)}")
    for s in shops:
        print(f"   - {s.name} ({s.slug}) [Merchant: {s.merchant.email}]")
    if len(shops) != 3:
        print(f"ERROR: Expected 3 shops, got {len(shops)}")
        sys.exit(1)
    for s in shops:
        if s.merchant != merchants[0]:
            print(f"ERROR: Shop {s.name} not owned by existing merchant!")
            sys.exit(1)

    # 3. Category & Product Distribution
    categories = list(Category.objects.all().order_by("name"))
    print(f"\n3. Categories count: {len(categories)}")
    total_prods = Product.objects.count()
    print(f"4. Total Products in Catalog: {total_prods}")

    print("\nCategory Distribution:")
    for cat in categories:
        count = Product.objects.filter(category=cat).count()
        print(f"   - {cat.name} ({cat.slug}): {count} products")
        if count != 5:
            print(f"ERROR: Expected 5 products in {cat.name}, got {count}")
            sys.exit(1)

    # 5. Shop Product Attachments
    total_sp = ShopProduct.objects.count()
    print(f"\n5. Total ShopProduct Inventory Records: {total_sp}")
    if total_sp != 110:
        print(f"ERROR: Expected 110 ShopProduct links, got {total_sp}")
        sys.exit(1)

    # 6. Duplicates Check
    slugs = list(Product.objects.values_list("slug", flat=True))
    if len(slugs) != len(set(slugs)):
        print("ERROR: Duplicate product slugs detected!")
        sys.exit(1)
    print("6. Duplicate products check: PASSED (0 duplicates)")

    # 7. Check Image URLs HTTP 200 OK
    print("\n7. Verifying all 55 image URLs via HTTP HEAD:")
    broken = 0
    for p in Product.objects.all():
        try:
            req = urllib.request.Request(p.image_url, method="HEAD")
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status != 200:
                    print(f"   FAIL {p.name}: Status {resp.status}")
                    broken += 1
        except Exception as e:
            print(f"   FAIL {p.name}: {e}")
            broken += 1
    print(f"   Broken images: {broken}")
    if broken != 0:
        print(f"ERROR: {broken} broken images found!")
        sys.exit(1)

    # 8. Test API Endpoints
    print("\n8. Testing API endpoints:")
    # Products API with Category Filtering
    with urllib.request.urlopen("http://127.0.0.1:8000/api/products/?category=electronics") as resp:
        data = json.loads(resp.read().decode())
        count = data.get("count", len(data.get("results", [])))
        print(f"   - GET /api/products/?category=electronics -> {count} items")
        if count != 5:
            print(f"ERROR: Category filtering returned {count} items, expected 5")
            sys.exit(1)

    # Search API
    with urllib.request.urlopen("http://127.0.0.1:8000/api/products/?q=Atta") as resp:
        data = json.loads(resp.read().decode())
        count = data.get("count", len(data.get("results", [])))
        print(f"   - GET /api/products/?q=Atta -> {count} items")
        if count < 1:
            print("ERROR: Search for 'Atta' returned 0 items")
            sys.exit(1)

    # Product Details API & Price Comparison
    sample_prod = Product.objects.filter(slug__contains="atta").first() or Product.objects.first()
    with urllib.request.urlopen(f"http://127.0.0.1:8000/api/products/{sample_prod.id}/") as resp:
        resp_json = json.loads(resp.read().decode())
        prod_data = resp_json.get("data", resp_json)
        offerings = prod_data.get("shop_offerings", [])
        prices = [f"Rs.{o['price']} @ {o['shop']['name']}" for o in offerings]
        print(f"   - GET /api/products/{sample_prod.id}/ ('{prod_data.get('name')}'):")
        print(f"     Offerings ({len(offerings)}): {', '.join(prices)}")
        if len(offerings) != 2:
            print(f"ERROR: Expected 2 shop offerings, got {len(offerings)}")
            sys.exit(1)

    print("\n" + "=" * 60)
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY (0 ERRORS)")
    print("=" * 60)

if __name__ == "__main__":
    verify()
