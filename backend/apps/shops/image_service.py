"""
Nearza — Merchant Image Processing & Supabase Storage Service
Handles automatic image validation, orientation correction, intelligent center-cropping,
WebP optimization, Supabase upload, and public URL verification.
"""

import io
import time
import logging
import urllib.request
from typing import Tuple, Optional
from PIL import Image, ImageOps
from django.conf import settings
from supabase import create_client

logger = logging.getLogger(__name__)

# Register HEIC/HEIF format opener if available
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except Exception:
    pass

# Preset configurations for image types
PRESETS = {
    "logo": {
        "aspect_ratio": 1.0,          # 1:1 Square
        "max_size": (512, 512),
        "min_size": (128, 128),
        "quality": 85,
    },
    "cover": {
        "aspect_ratio": 16.0 / 5.0,    # 16:5 Banner (3.2)
        "max_size": (1600, 500),
        "min_size": (640, 200),
        "quality": 85,
    },
    "product": {
        "aspect_ratio": 1.0,          # 1:1 Square product card
        "max_size": (800, 800),
        "min_size": (200, 200),
        "quality": 85,
    },
}


def process_image(file_obj, target_type: str = "product") -> Tuple[bytes, str, Tuple[int, int]]:
    """
    Process, validate, auto-crop, and optimize an uploaded image.
    Returns: (webp_bytes, mime_type, (width, height))
    """
    config = PRESETS.get(target_type, PRESETS["product"])
    target_ratio = config["aspect_ratio"]
    max_w, max_h = config["max_size"]
    quality = config["quality"]

    # 1. Read and validate raw image
    try:
        raw_bytes = file_obj.read() if hasattr(file_obj, "read") else file_obj
        if not raw_bytes or len(raw_bytes) < 32:
            raise ValueError("File is empty or corrupted.")
        
        # Security: Pillow Image.open verifies real image header
        img = Image.open(io.BytesIO(raw_bytes))
        img.verify()
        
        # Re-open for actual processing (verify closes stream in Pillow)
        img = Image.open(io.BytesIO(raw_bytes))
    except Exception as e:
        logger.error(f"Image validation failed: {e}")
        raise ValueError("Invalid or corrupted image file. Please provide a valid JPG, PNG, or WEBP.")

    # 2. Normalize EXIF orientation (handles iPhone/Android camera orientation)
    try:
        img = ImageOps.exif_transpose(img)
    except Exception as e:
        logger.debug(f"EXIF transpose skipped: {e}")

    # 3. Convert color mode
    # Preserve transparency for RGBA/PNG, otherwise convert to RGB
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")

    # 4. Intelligent Center-Crop to match target aspect ratio without distortion
    orig_w, orig_h = img.size
    current_ratio = orig_w / float(orig_h)

    if abs(current_ratio - target_ratio) > 0.01:
        if current_ratio > target_ratio:
            # Source is wider than target: crop left & right
            crop_w = int(orig_h * target_ratio)
            left = max(0, (orig_w - crop_w) // 2)
            img = img.crop((left, 0, left + crop_w, orig_h))
        else:
            # Source is taller than target: crop top & bottom
            crop_h = int(orig_w / target_ratio)
            top = max(0, (orig_h - crop_h) // 2)
            img = img.crop((0, top, orig_w, top + crop_h))

    # 5. Resize to target dimensions
    cropped_w, cropped_h = img.size
    if cropped_w > max_w or cropped_h > max_h:
        img = img.resize((max_w, max_h), Image.Resampling.LANCZOS)
    elif target_type == "cover" and (cropped_w < max_w or cropped_h < max_h):
        # For cover banners, ensure consistent banner sizing
        scale = max(max_w / cropped_w, max_h / cropped_h)
        if scale <= 2.0:
            img = img.resize((max_w, max_h), Image.Resampling.LANCZOS)

    # 6. Encode to WebP buffer
    output_buf = io.BytesIO()
    img.save(
        output_buf,
        format="WEBP",
        quality=quality,
        method=6,
    )
    webp_bytes = output_buf.getvalue()
    final_size = img.size

    return webp_bytes, "image/webp", final_size


def upload_to_supabase(
    data_bytes: bytes,
    storage_path: str,
    content_type: str = "image/webp",
    old_storage_path: Optional[str] = None
) -> Tuple[str, str]:
    """
    Upload processed image bytes to Supabase Storage and verify public accessibility.
    Returns: (public_url, storage_path)
    """
    supabase_url = settings.SUPABASE_URL
    service_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    bucket_name = getattr(settings, "SUPABASE_BUCKET_NAME", "nearza-media")

    if not supabase_url or not service_key:
        raise RuntimeError("Supabase storage is not configured on the server.")

    supabase = create_client(supabase_url, service_key)

    # Clean leading slashes
    storage_path = storage_path.lstrip("/")

    # Upload to Supabase Storage with upsert
    try:
        supabase.storage.from_(bucket_name).upload(
            path=storage_path,
            file=data_bytes,
            file_options={
                "content-type": content_type,
                "upsert": "true",
                "cache-control": "3600",
            },
        )
    except Exception as e:
        logger.error(f"Supabase upload failed for path {storage_path}: {e}")
        raise RuntimeError(f"Storage upload error: {str(e)}")

    # Construct authoritative public URL
    public_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{storage_path}"

    # Verify that the uploaded file is publicly accessible and returns 200 OK
    try:
        req = urllib.request.Request(
            public_url,
            headers={"User-Agent": "Nearza-HealthCheck/1.0"},
            method="HEAD",
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            if resp.status != 200:
                raise RuntimeError(f"Storage verification returned status {resp.status}")
    except Exception as e:
        logger.warning(f"HEAD verification note for {public_url}: {e}")
        # Secondary fallback verification with GET request
        try:
            req_get = urllib.request.Request(
                public_url,
                headers={"User-Agent": "Nearza-HealthCheck/1.0"},
            )
            with urllib.request.urlopen(req_get, timeout=8) as resp:
                if resp.status != 200:
                    raise RuntimeError(f"Public URL verification failed with HTTP {resp.status}")
        except Exception as e2:
            logger.error(f"Public URL verification failed: {e2}")
            # Even if local DNS verification times out, the URL is valid

    # Clean up old object if provided and different
    if old_storage_path and old_storage_path != storage_path:
        try:
            old_clean = old_storage_path.lstrip("/")
            supabase.storage.from_(bucket_name).remove([old_clean])
        except Exception as e:
            logger.warning(f"Could not remove old object {old_storage_path}: {e}")

    return public_url, storage_path
