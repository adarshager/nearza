# Nearza — REST API Specification

Base URL: `http://localhost:8000/api` (or configured via `VITE_API_BASE_URL`)

All responses adhere to standardized JSON envelopes:
- **Success**: `{ "status": "success", "data": ... }` or pagination `{ "count": ..., "results": [...] }`
- **Error**: `{ "status": "error", "message": "...", "errors": { ... } }`

---

## 1. Authentication (`/api/auth/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Register customer or merchant | No |
| `POST` | `/api/auth/login/` | Obtain access & refresh JWT tokens | No |
| `POST` | `/api/auth/token/refresh/` | Refresh expired access token | No |
| `GET` | `/api/auth/profile/` | Fetch current user profile | Yes |
| `PUT/PATCH` | `/api/auth/profile/` | Update profile information | Yes |
| `POST` | `/api/auth/change-password/` | Change password | Yes |
| `POST` | `/api/auth/password-reset/` | Request password reset token | No |
| `POST` | `/api/auth/password-reset-confirm/` | Confirm password reset | No |

---

## 2. Customer Discovery & Search

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories/` | List all departments | No |
| `GET` | `/api/categories/<id_or_slug>/` | Category details | No |
| `GET` | `/api/products/` | Discover products (search `q`, `category`, `lat`, `lon`) | No |
| `GET` | `/api/products/<id_or_slug>/` | Product details with all shop offerings | No |
| `GET` | `/api/products/<id_or_slug>/shops/` | Price comparison offerings for item | No |
| `GET` | `/api/shops/` | List verified shops | No |
| `GET` | `/api/shops/<id_or_slug>/` | Shop profile with operating hours | No |
| `GET` | `/api/shops/<id_or_slug>/products/` | In-store inventory catalog | No |
| `GET` | `/api/shops/nearby/` | Proximity search by `lat`, `lon`, `radius_km` | No |

---

## 3. Customer Interaction & Bookmarks

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/favorites/?type=product\|shop` | List saved products/shops | Yes |
| `POST` | `/api/favorites/toggle/` | Toggle saved status for product/shop | Yes |
| `GET` | `/api/favorites/check/?product_id=...` | Check if item is saved | Yes |
| `GET` | `/api/notifications/` | List alerts & unread count | Yes |
| `POST` | `/api/notifications/<id>/read/` | Mark single notification as read | Yes |
| `POST` | `/api/notifications/mark-all-read/` | Mark all notifications read | Yes |
| `POST` | `/api/reports/` | Submit report (incorrect price, fake shop, etc.) | Yes |
| `GET` | `/api/reports/my/` | List reports submitted by current user | Yes |
| `GET` | `/api/reviews/shop/<shop_id>/` | Approved reviews for a shop | No |
| `POST` | `/api/reviews/` | Submit review (1-5 stars) for a shop | Yes |
| `DELETE` | `/api/reviews/<id>/` | Delete own review (IDOR protected) | Yes |
| `POST` | `/api/analytics/track/` | Anonymous telemetry (Call, WA, Directions clicks) | No |

---

## 4. Merchant Dashboard Portal (`/api/merchant/`)

*Requires role: `merchant` or `admin`*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/merchant/dashboard/` | 8 KPIs, 14-day trends, confidence breakdown |
| `GET` | `/api/merchant/shop/` | Merchant's own shop profile |
| `PUT/PATCH` | `/api/merchant/shop/` | Update shop details (phone, WA, address, hours) |
| `GET` | `/api/merchant/products/` | Merchant's stocked products list |
| `POST` | `/api/merchant/products/` | Stock an item with price, qty, status |
| `PATCH` | `/api/merchant/products/<id>/` | Update price/stock (creates audit log) |
| `DELETE` | `/api/merchant/products/<id>/` | Remove item from store inventory |

---

## 5. Administration & Moderation (`/api/admin-panel/`)

*Requires role: `admin`*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin-panel/stats/` | Overview stats (users, shops, reports, reviews, activity) |
| `GET` | `/api/admin-panel/merchants/` | Verification queue (`status=pending\|approved\|suspended`) |
| `POST` | `/api/admin-panel/merchants/<id>/verify/` | Approve, reject, or suspend a shop (audited) |
| `GET` | `/api/admin-panel/products/` | Catalog moderation list |
| `PATCH` | `/api/admin-panel/products/<id>/toggle-status/` | Activate or deactivate product globally (audited) |
| `GET/POST` | `/api/admin-panel/categories/` | List or create categories (audited) |
| `PATCH/DELETE` | `/api/admin-panel/categories/<id>/` | Update or delete categories (audited) |
| `GET` | `/api/admin-panel/reports/` | Filter user complaints by reason and status |
| `POST` | `/api/admin-panel/reports/<id>/resolve/` | Mark report resolved/dismissed with notes (audited) |
| `GET` | `/api/admin-panel/reviews/` | Customer review moderation queue |
| `POST` | `/api/admin-panel/reviews/<id>/moderate/` | Approve or flag review (audited) |
| `DELETE` | `/api/admin-panel/reviews/<id>/moderate/` | Delete abusive review (audited) |
| `GET` | `/api/admin-panel/users/` | User directory with role filtering |
| `PATCH` | `/api/admin-panel/users/<id>/toggle-active/` | Suspend or reactivate user accounts (audited) |
| `GET` | `/api/admin-panel/audit-logs/` | Immutable administrative audit trail |
