"""
Nearza Idempotent Catalog Seeder & Supabase Storage Uploader
Seeds 55 realistic products across all 11 categories using ONLY the existing merchant and shops.
"""

import os
import sys
import io
import time
import urllib.request
import django
from PIL import Image

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from django.conf import settings
from django.utils.text import slugify
from supabase import create_client
from apps.accounts.models import User
from apps.shops.models import Shop
from apps.products.models import Category, Product, ShopProduct
from catalog_data import CATALOG

def run_seeder():
    print("=" * 60)
    print("NEARZA CATALOG SEEDER STARTING")
    print("=" * 60)

    # 1. Verify Existing Merchant & Shops
    merchants = User.objects.filter(role=User.Role.MERCHANT)
    print(f"Total merchants in DB: {merchants.count()}")
    for m in merchants:
        print(f"  Existing Merchant: {m.full_name} ({m.email}) - ID: {m.id}")

    merchant = merchants.first()
    if not merchant:
        raise RuntimeError("No existing merchant found! Will NOT create a new merchant.")

    shops = Shop.objects.filter(merchant=merchant)
    print(f"\nExisting Shops for merchant {merchant.email}: {shops.count()}")
    shop_map = {}
    for s in shops:
        print(f"  Shop: {s.name} (slug: {s.slug}, ID: {s.id})")
        shop_map[s.slug] = s

    initial_merchant_count = User.objects.filter(role=User.Role.MERCHANT).count()
    initial_shop_count = Shop.objects.count()

    # 2. Setup Supabase Client
    supabase_url = settings.SUPABASE_URL
    service_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    bucket_name = getattr(settings, "SUPABASE_BUCKET_NAME", "nearza-media")
    supabase = create_client(supabase_url, service_key)

    # Ensure bucket is public
    try:
        supabase.storage.update_bucket(bucket_name, {"public": True})
    except Exception as e:
        print(f"Bucket public status check: {e}")

    # Local fallback directory in frontend/public
    local_img_dir = os.path.abspath(os.path.join(settings.BASE_DIR, "..", "frontend", "public", "images", "products"))
    os.makedirs(local_img_dir, exist_ok=True)

    # 3. Process Products & Images
    categories_populated = set()
    products_created = 0
    products_updated = 0
    images_processed = 0
    storage_errors = 0
    broken_images = 0

    print("\nProcessing 55 products across 11 categories...")

    for idx, item in enumerate(CATALOG, 1):
        cat_slug = item["category"]
        try:
            category = Category.objects.get(slug=cat_slug)
            categories_populated.add(category.name)
        except Category.DoesNotExist:
            print(f"Category '{cat_slug}' does not exist! Skipping {item['name']}")
            continue

        prod_name = item["name"]
        unit = item["unit"]
        unit_val = item["unit_value"]
        # Consistent slug calculation matching Product model
        computed_slug = slugify(f"{prod_name}-{unit_val}-{unit}")

        print(f"[{idx}/{len(CATALOG)}] {prod_name} ({category.name})...", end=" ")

        # Storage path
        storage_path = f"products/{cat_slug}/{computed_slug}/image-1.webp"
        public_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{storage_path}"

        # Local path
        cat_local_dir = os.path.join(local_img_dir, cat_slug)
        os.makedirs(cat_local_dir, exist_ok=True)
        local_filepath = os.path.join(cat_local_dir, f"{computed_slug}.webp")

        # Download and optimize image if not already cached
        webp_bytes = None
        if os.path.exists(local_filepath) and os.path.getsize(local_filepath) > 1000:
            with open(local_filepath, "rb") as f:
                webp_bytes = f.read()
        else:
            try:
                req = urllib.request.Request(
                    item["image_source"],
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    raw_data = resp.read()

                # Process with PIL
                img = Image.open(io.BytesIO(raw_data)).convert("RGB")
                # Resize keeping aspect ratio to 600x600 max
                img.thumbnail((600, 600), Image.Resampling.LANCZOS)
                
                # Make clean square canvas with subtle pure white background
                canvas = Image.new("RGB", (600, 600), (255, 255, 255))
                offset_x = (600 - img.width) // 2
                offset_y = (600 - img.height) // 2
                canvas.paste(img, (offset_x, offset_y))

                out_buf = io.BytesIO()
                canvas.save(out_buf, format="WEBP", quality=85)
                webp_bytes = out_buf.getvalue()

                # Save local
                with open(local_filepath, "wb") as f:
                    f.write(webp_bytes)

            except Exception as e:
                print(f"[Img Fetch Err: {e}]", end=" ")
                broken_images += 1

        # Upload to Supabase Storage
        if webp_bytes:
            try:
                supabase.storage.from_(bucket_name).upload(
                    storage_path,
                    webp_bytes,
                    {"content-type": "image/webp", "upsert": "true"}
                )
                images_processed += 1
            except Exception as e:
                # If error is duplicate or transient, record error
                storage_errors += 1
                print(f"[Supabase Upload Err: {e}]", end=" ")

        # Idempotent Product Record creation / update
        product, created = Product.objects.get_or_create(
            slug=computed_slug,
            defaults={
                "name": prod_name,
                "brand": item.get("brand", ""),
                "description": item.get("description", ""),
                "category": category,
                "unit": unit,
                "unit_value": unit_val,
                "image_url": public_url,
                "is_active": True,
            }
        )

        if created:
            products_created += 1
        else:
            products_updated += 1
            # Update fields to ensure fresh image and description
            product.name = prod_name
            product.brand = item.get("brand", "")
            product.description = item.get("description", "")
            product.category = category
            product.unit = unit
            product.unit_value = unit_val
            product.image_url = public_url
            product.is_active = True
            product.save()

        # Connect to ShopProduct records
        for sp_data in item.get("shops", []):
            shop_slug = sp_data["shop_slug"]
            target_shop = shop_map.get(shop_slug)
            if not target_shop:
                continue

            ShopProduct.objects.update_or_create(
                shop=target_shop,
                product=product,
                defaults={
                    "price": sp_data["price"],
                    "quantity": sp_data["quantity"],
                    "stock_status": sp_data["stock_status"],
                    "sku": sp_data["sku"],
                    "is_active": True,
                }
            )

        print("OK")

    final_merchant_count = User.objects.filter(role=User.Role.MERCHANT).count()
    final_shop_count = Shop.objects.count()

    print("\n" + "=" * 60)
    print("SEEDING SUMMARY")
    print("=" * 60)
    print(f"Existing merchant used: YES (ID: {merchant.id})")
    print(f"Existing shop used: YES ({list(shop_map.keys())})")
    print(f"New merchant accounts created: {final_merchant_count - initial_merchant_count}")
    print(f"New shops created: {final_shop_count - initial_shop_count}")
    print(f"Categories populated: {len(categories_populated)} of 11")
    print(f"Products added (created): {products_created}")
    print(f"Products updated: {products_updated}")
    print(f"Total products in DB: {Product.objects.count()}")
    print(f"Total ShopProducts in DB: {ShopProduct.objects.count()}")
    print(f"Images processed and uploaded: {images_processed}")
    print(f"Broken images: {broken_images}")
    print(f"Supabase storage errors: {storage_errors}")
    print("Populated categories:")
    for cat in sorted(categories_populated):
        count = Product.objects.filter(category__name=cat).count()
        print(f"  - {cat}: {count} products")
    print("=" * 60)

if __name__ == "__main__":
    run_seeder()
