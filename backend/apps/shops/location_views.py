"""
Nearza — Location & Geocoding Views
Robust, safe, cached geocoding and reverse-geocoding for Indian towns,
villages, districts, and cities with explicit support for Uttara Kannada & Karnataka.
"""

import json
import logging
import urllib.parse
import urllib.request
from typing import Dict, List, Optional
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

# Curated instant-match lookup for coastal Karnataka and major Indian hubs.
# Enables immediate 0ms response for local queries without external network dependency.
CURATED_LOCATIONS = [
    {
        "name": "Ankola",
        "locality": "Ankola",
        "city": "Ankola",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Ankola, Uttara Kannada, Karnataka, India",
        "latitude": 14.6653,
        "longitude": 74.3015,
        "pincode": "581314",
        "keywords": ["ankola", "ankola town", "ankola karnataka", "uttara kannada", "581314"],
    },
    {
        "name": "Karwar",
        "locality": "Karwar",
        "city": "Karwar",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Karwar, Uttara Kannada, Karnataka, India",
        "latitude": 14.8136,
        "longitude": 74.1298,
        "pincode": "581301",
        "keywords": ["karwar", "karwar karnataka", "karwar town", "581301"],
    },
    {
        "name": "Kumta",
        "locality": "Kumta",
        "city": "Kumta",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Kumta, Uttara Kannada, Karnataka, India",
        "latitude": 14.4262,
        "longitude": 74.4208,
        "pincode": "581343",
        "keywords": ["kumta", "kumta karnataka", "kumta town", "581343"],
    },
    {
        "name": "Sirsi",
        "locality": "Sirsi",
        "city": "Sirsi",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Sirsi, Uttara Kannada, Karnataka, India",
        "latitude": 14.6200,
        "longitude": 74.8400,
        "pincode": "581401",
        "keywords": ["sirsi", "sirsi karnataka", "sirsi town", "581401"],
    },
    {
        "name": "Gokarna",
        "locality": "Gokarna",
        "city": "Gokarna",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Gokarna, Uttara Kannada, Karnataka, India",
        "latitude": 14.5427,
        "longitude": 74.3188,
        "pincode": "581326",
        "keywords": ["gokarna", "gokarna karnataka", "581326"],
    },
    {
        "name": "Honnavar",
        "locality": "Honnavar",
        "city": "Honnavar",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Honnavar, Uttara Kannada, Karnataka, India",
        "latitude": 14.2800,
        "longitude": 74.4444,
        "pincode": "581334",
        "keywords": ["honnavar", "honnavar karnataka", "honnavara", "581334"],
    },
    {
        "name": "Bhatkal",
        "locality": "Bhatkal",
        "city": "Bhatkal",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Bhatkal, Uttara Kannada, Karnataka, India",
        "latitude": 13.9772,
        "longitude": 74.5574,
        "pincode": "581320",
        "keywords": ["bhatkal", "bhatkal karnataka", "581320"],
    },
    {
        "name": "Dandeli",
        "locality": "Dandeli",
        "city": "Dandeli",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Dandeli, Uttara Kannada, Karnataka, India",
        "latitude": 15.2361,
        "longitude": 74.6186,
        "pincode": "581325",
        "keywords": ["dandeli", "dandeli karnataka", "581325"],
    },
    {
        "name": "Yellapur",
        "locality": "Yellapur",
        "city": "Yellapur",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Yellapur, Uttara Kannada, Karnataka, India",
        "latitude": 14.9644,
        "longitude": 74.7122,
        "pincode": "581359",
        "keywords": ["yellapur", "yellapura", "581359"],
    },
    {
        "name": "Hubballi",
        "locality": "Hubballi",
        "city": "Hubballi",
        "district": "Dharwad",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Hubballi, Dharwad, Karnataka, India",
        "latitude": 15.3647,
        "longitude": 75.1240,
        "pincode": "580020",
        "keywords": ["hubballi", "hubli", "dharwad", "karnataka"],
    },
    {
        "name": "Belagavi",
        "locality": "Belagavi",
        "city": "Belagavi",
        "district": "Belagavi",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Belagavi, Belagavi, Karnataka, India",
        "latitude": 15.8497,
        "longitude": 74.4977,
        "pincode": "590001",
        "keywords": ["belagavi", "belgaum", "karnataka"],
    },
    {
        "name": "Mangaluru",
        "locality": "Mangaluru",
        "city": "Mangaluru",
        "district": "Dakshina Kannada",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Mangaluru, Dakshina Kannada, Karnataka, India",
        "latitude": 12.9141,
        "longitude": 74.8560,
        "pincode": "575001",
        "keywords": ["mangaluru", "mangalore", "dakshina kannada", "karnataka"],
    },
    {
        "name": "Udupi",
        "locality": "Udupi",
        "city": "Udupi",
        "district": "Udupi",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Udupi, Udupi, Karnataka, India",
        "latitude": 13.3409,
        "longitude": 74.7421,
        "pincode": "576101",
        "keywords": ["udupi", "manipal", "karnataka"],
    },
    {
        "name": "Bengaluru",
        "locality": "Bengaluru",
        "city": "Bengaluru",
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Bengaluru, Bengaluru Urban, Karnataka, India",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "pincode": "560001",
        "keywords": ["bengaluru", "bangalore", "karnataka"],
    },
    {
        "name": "Mysuru",
        "locality": "Mysuru",
        "city": "Mysuru",
        "district": "Mysuru",
        "state": "Karnataka",
        "country": "India",
        "display_name": "Mysuru, Mysuru, Karnataka, India",
        "latitude": 12.2958,
        "longitude": 76.6394,
        "pincode": "570001",
        "keywords": ["mysuru", "mysore", "karnataka"],
    },
]

# Simple in-memory search cache to eliminate repetitive external requests
_SEARCH_CACHE: Dict[str, List[dict]] = {}
_REVERSE_CACHE: Dict[str, dict] = {}


def _query_nominatim_search(query: str) -> List[dict]:
    """Query OpenStreetMap Nominatim for geocoding suggestions in India."""
    encoded = urllib.parse.quote(query.strip())
    url = f"https://nominatim.openstreetmap.org/search?q={encoded}&format=json&addressdetails=1&countrycodes=in&limit=8"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Nearza-Hyperlocal-Commerce/1.0 (contact@nearza.local)",
            "Accept-Language": "en",
        },
    )

    results = []
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                raw_data = json.loads(resp.read().decode())
                for item in raw_data:
                    addr = item.get("address", {})
                    locality = (
                        addr.get("suburb")
                        or addr.get("neighbourhood")
                        or addr.get("village")
                        or addr.get("town")
                        or addr.get("city_district")
                        or addr.get("city")
                        or item.get("name", "")
                    )
                    city = (
                        addr.get("city")
                        or addr.get("town")
                        or addr.get("village")
                        or addr.get("municipality")
                        or addr.get("county")
                        or locality
                    )
                    district = addr.get("state_district") or addr.get("county") or ""
                    state = addr.get("state", "")
                    country = addr.get("country", "India")

                    display_parts = [locality]
                    if district and district != locality and district != city:
                        display_parts.append(district)
                    if state and state != locality:
                        display_parts.append(state)
                    clean_display = ", ".join(dict.fromkeys(display_parts))

                    results.append({
                        "name": locality,
                        "locality": locality,
                        "city": city,
                        "district": district,
                        "state": state,
                        "country": country,
                        "display_name": clean_display or item.get("display_name", ""),
                        "latitude": float(item["lat"]),
                        "longitude": float(item["lon"]),
                        "pincode": addr.get("postcode", ""),
                    })
    except Exception as e:
        logger.warning(f"Nominatim search error for '{query}': {e}")

    return results


def _query_nominatim_reverse(lat: float, lon: float) -> Optional[dict]:
    """Query OpenStreetMap Nominatim for reverse geocoding."""
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&addressdetails=1"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Nearza-Hyperlocal-Commerce/1.0 (contact@nearza.local)",
            "Accept-Language": "en",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                item = json.loads(resp.read().decode())
                addr = item.get("address", {})
                locality = (
                    addr.get("suburb")
                    or addr.get("neighbourhood")
                    or addr.get("village")
                    or addr.get("town")
                    or addr.get("city_district")
                    or addr.get("city")
                    or ""
                )
                city = (
                    addr.get("city")
                    or addr.get("town")
                    or addr.get("village")
                    or addr.get("state_district")
                    or addr.get("county")
                    or locality
                )
                district = addr.get("state_district") or addr.get("county") or ""
                state = addr.get("state", "")
                country = addr.get("country", "India")

                display_parts = [locality, district, state]
                clean_display = ", ".join([p for p in display_parts if p])

                return {
                    "locality": locality or city,
                    "city": city,
                    "district": district,
                    "state": state,
                    "country": country,
                    "display_name": clean_display or item.get("display_name", ""),
                    "latitude": lat,
                    "longitude": lon,
                    "pincode": addr.get("postcode", ""),
                }
    except Exception as e:
        logger.warning(f"Nominatim reverse error for ({lat}, {lon}): {e}")

    return None


class LocationSearchView(APIView):
    """
    Search Indian towns, cities, districts, localities, or pincodes.
    Safe, rate-limited, cached geocoding endpoint.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if len(query) < 2:
            return Response(
                {"status": "error", "message": "Search query must be at least 2 characters.", "results": []},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(query) > 100:
            query = query[:100]

        normalized_q = query.lower()

        # Check in-memory cache
        if normalized_q in _SEARCH_CACHE:
            return Response({"status": "success", "results": _SEARCH_CACHE[normalized_q]})

        results = []
        seen_names = set()

        # 1. Match curated locations first (instant priority for Karnataka & regional towns)
        for loc in CURATED_LOCATIONS:
            name_lower = loc["name"].lower()
            dist_lower = loc["district"].lower()
            state_lower = loc["state"].lower()

            if (
                normalized_q in name_lower
                or name_lower.startswith(normalized_q)
                or any(normalized_q in kw for kw in loc["keywords"])
                or (normalized_q in dist_lower and len(normalized_q) >= 3)
            ):
                item = {
                    "name": loc["name"],
                    "locality": loc["locality"],
                    "city": loc["city"],
                    "district": loc["district"],
                    "state": loc["state"],
                    "country": loc["country"],
                    "display_name": loc["display_name"],
                    "latitude": loc["latitude"],
                    "longitude": loc["longitude"],
                    "pincode": loc["pincode"],
                }
                seen_names.add((loc["name"].lower(), loc["state"].lower()))
                results.append(item)

        # 2. If fewer than 5 results or query is specific, query Nominatim
        if len(results) < 5:
            external_results = _query_nominatim_search(query)
            for ext in external_results:
                key = (ext["name"].lower(), ext["state"].lower())
                if key not in seen_names:
                    seen_names.add(key)
                    results.append(ext)
                if len(results) >= 8:
                    break

        # Save in cache (cap cache size to 500 entries)
        if len(_SEARCH_CACHE) > 500:
            _SEARCH_CACHE.clear()
        _SEARCH_CACHE[normalized_q] = results

        return Response({"status": "success", "results": results})


class LocationReverseView(APIView):
    """
    Reverse geocode coordinates into a human-readable display name, city, district, state.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        lat_str = request.query_params.get("lat") or request.query_params.get("latitude")
        lon_str = request.query_params.get("lon") or request.query_params.get("longitude") or request.query_params.get("lng")

        if not lat_str or not lon_str:
            return Response(
                {"status": "error", "message": "latitude and longitude are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            lat = float(lat_str)
            lon = float(lon_str)
            if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                raise ValueError("Out of range")
        except (ValueError, TypeError):
            return Response(
                {"status": "error", "message": "Invalid latitude (-90 to 90) or longitude (-180 to 180)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache_key = f"{round(lat, 4)},{round(lon, 4)}"
        if cache_key in _REVERSE_CACHE:
            return Response({"status": "success", "data": _REVERSE_CACHE[cache_key]})

        # Check proximity to curated locations (within ~5km)
        for loc in CURATED_LOCATIONS:
            d_lat = abs(loc["latitude"] - lat)
            d_lon = abs(loc["longitude"] - lon)
            if d_lat < 0.05 and d_lon < 0.05:
                data = {
                    "locality": loc["locality"],
                    "city": loc["city"],
                    "district": loc["district"],
                    "state": loc["state"],
                    "country": loc["country"],
                    "display_name": loc["display_name"],
                    "latitude": lat,
                    "longitude": lon,
                    "pincode": loc["pincode"],
                }
                _REVERSE_CACHE[cache_key] = data
                return Response({"status": "success", "data": data})

        # Query Nominatim
        rev_data = _query_nominatim_reverse(lat, lon)
        if not rev_data:
            # Fallback if external is unreachable
            rev_data = {
                "locality": f"Coordinates ({round(lat, 3)}, {round(lon, 3)})",
                "city": "Unknown Area",
                "district": "",
                "state": "",
                "country": "India",
                "display_name": f"{round(lat, 4)}° N, {round(lon, 4)}° E",
                "latitude": lat,
                "longitude": lon,
                "pincode": "",
            }

        _REVERSE_CACHE[cache_key] = rev_data
        return Response({"status": "success", "data": rev_data})
