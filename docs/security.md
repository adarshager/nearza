# Nearza — Security Hardening & Threat Mitigation

This document details the security posture, defense-in-depth measures, and vulnerability remediations implemented across Nearza.

---

## 1. Authentication & JWT Security

- **Algorithm**: HMAC-SHA256 (`HS256`) via `rest_framework_simplejwt`.
- **Token Lifespan**:
  - `Access Token`: 15 minutes (`ACCESS_TOKEN_LIFETIME_MINUTES`). Minimizes exposure window if intercepted.
  - `Refresh Token`: 7 days (`REFRESH_TOKEN_LIFETIME_DAYS`).
- **Rotation & Blacklisting**:
  - `ROTATE_REFRESH_TOKENS = True`: Every refresh request issues a new refresh token and immediately blacklists the old one.
  - `BLACKLIST_AFTER_ROTATION = True`: Mitigates token replay attacks.
- **Client Handling**:
  - Axios interceptor automatically detects `401 Unauthorized` responses and refreshes the token without user interruption.
  - If refresh fails, tokens are evicted and a global `nearza:session_expired` event logs the client out cleanly.

---

## 2. Server-Enforced Role-Based Access Control (RBAC)

**Core Principle**: Frontend permissions are purely UX conveniences. The server independently verifies role validity on every API invocation.

| Role | Permitted Access | Restricted Access |
| :--- | :--- | :--- |
| **Anonymous** | Public discovery, search, shop viewing, price comparison, login/register | Profile update, favorites, reviews submission, reports submission, merchant portal, admin panel |
| **Customer** | Full customer experience: favorites, reviews, reporting, profile editing | Merchant dashboard, inventory management, administrative verification/moderation |
| **Merchant** | Full merchant workspace: store profile, catalog management, inventory audits, analytics | Administrative verification, user suspension, global platform settings |
| **Admin** | Global governance: merchant verification, category CRUD, reports resolution, review moderation, user suspension, audit log review | Restricted only by server business logic (e.g. cannot suspend self) |

---

## 3. Insecure Direct Object References (IDOR) & Ownership Protection

- **Merchant Resource Protection**:
  - All merchant endpoints enforce `shop.merchant == request.user`.
  - In `ShopProductViewSet`, operations query `ShopProduct.objects.filter(shop__merchant=request.user)`. Attempting to modify another merchant's stock returns `404 Not Found`.
- **Customer Resource Protection**:
  - In `ReviewDetailView`, non-authors attempting to delete another customer's review receive `403 Forbidden`.
  - In `FavoriteDetailView`, favorites are scoped by `user=request.user`.
  - In `ReportDetailView`, submitted reports are scoped to the reporter.

---

## 4. Privilege Escalation Defenses

- **Registration Guard**:
  - `RegisterSerializer.validate_role()` strictly permits only `"customer"` and `"merchant"`. Attempts to supply `"admin"`, `"staff"`, or `"superuser"` are rejected with `HTTP 400 Bad Request`.
- **Profile Update Guard**:
  - `UserProfileSerializer` defines `role`, `id`, `email`, and `is_email_verified` as `read_only_fields`.
- **Self-Suspension Guard**:
  - `AdminUserToggleActiveView` checks `if target_user == request.user` and forbids admins from locking themselves out of the system.

---

## 5. Injection & Input Sanitization

- **SQL Injection**:
  - 100% of database interactions utilize Django ORM's parameterized query compiler.
  - No raw SQL queries or string format interpolations exist in the codebase.
- **Cross-Site Scripting (XSS)**:
  - React auto-escapes all rendered text nodes.
  - URLs in deep links are strictly encoded via `encodeURIComponent` and validated.
  - Reviews and reports sanitize freeform descriptions.

---

## 6. Denial of Service & File Upload Safeguards

- **Rate Limiting (DRF Throttling)**:
  - Anonymous clients: `100 requests / hour`
  - Authenticated users: `1000 requests / hour`
- **Memory & Payload Limits**:
  - `FILE_UPLOAD_MAX_MEMORY_SIZE = 5MB`
  - `DATA_UPLOAD_MAX_MEMORY_SIZE = 5MB`
- **Security Headers (Production Settings)**:
  - `X_FRAME_OPTIONS = "DENY"` (Clickjacking mitigation)
  - `SECURE_CONTENT_TYPE_NOSNIFF = True` (MIME sniffing defense)
  - `SECURE_BROWSER_XSS_FILTER = True`
  - `SECURE_HSTS_SECONDS = 31536000` (Strict-Transport-Security)
  - `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`
  - `SECURE_HSTS_PRELOAD = True`
  - `SESSION_COOKIE_SECURE = True`
  - `CSRF_COOKIE_SECURE = True`
