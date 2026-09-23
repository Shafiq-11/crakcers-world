# Security Controls Implementation Summary — Diwali Kadai

This document provides a comprehensive verification audit of all security controls implemented across the Diwali Kadai application.

---

## 1. Secrets & Configuration Hygiene

- [x] **Zero Hardcoded Secrets**: All sensitive keys (`DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `SMTP_PASS`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`) are loaded strictly from `process.env`.
- [x] **Git Isolation**: `.env`, `.env.local`, `.env.*.local` are explicitly ignored in [`.gitignore`](file:///c:/Users/ACER/OneDrive/Desktop/projects/diwali-kadai/.gitignore). Only [`.env.example`](file:///c:/Users/ACER/OneDrive/Desktop/projects/diwali-kadai/.env.example) with placeholder descriptions is tracked.
- [x] **Strict Razorpay Key Environment Guard**: In [`lib/razorpay.ts`](file:///c:/Users/ACER/OneDrive/Desktop/projects/diwali-kadai/lib/razorpay.ts), the app inspects `process.env.NODE_ENV`. If running in `production`, any key prefixed with `rzp_test_` throws an immediate fatal error:
  ```typescript
  if (process.env.NODE_ENV === 'production' && keyId.startsWith('rzp_test_')) {
    throw new Error('FATAL: Razorpay TEST key detected in production environment! Use live keys (rzp_live_*).')
  }
  ```
- [x] **Redaction from Logs**: Error handlers in routes and email delivery catch failures and log generic summaries. Secret credentials and full request payloads containing tokens are never written to standard output or error logs.

---

## 2. Input Handling & Injection Prevention

- [x] **Server-Side Zod Schemas**: Every state-changing route validates and sanitizes input via Zod in [`lib/validation.ts`](file:///c:/Users/ACER/OneDrive/Desktop/projects/diwali-kadai/lib/validation.ts):
  - `checkoutSchema`: Validates name (2-100 chars), phone (Indian regex `/^[6-9]\d{9}$/`), email (RFC 5322 format), address (10-500 chars), item quantity (1-100 per line, max 50 items).
  - `adminLoginSchema`: Validates username and password bounds.
  - `productSchema`: Validates name, description, category enum, price (integer paise), stock bounds (0-99999).
- [x] **Zero SQL Injections**: All database interactions use Prisma Client's parameterized queries under the hood. There is **zero raw SQL string concatenation** in the codebase.
- [x] **XSS Defense**: Next.js automatically escapes React JSX interpolated variables. User-submitted text fields (addresses, customer names) are rendered safely without `dangerouslySetInnerHTML`.

---

## 3. Payment Integrity & Financial Accuracy

- [x] **Server-Side Price Recalculation**: In [`app/api/orders/route.ts`](file:///c:/Users/ACER/OneDrive/Desktop/projects/diwali-kadai/app/api/orders/route.ts), order totals are recalculated directly from the database `Product.price`. Client-submitted totals are ignored completely.
- [x] **Prices Stored as Integers in Paise**: Avoids IEEE 754 floating-point arithmetic errors. ₹150.00 is stored and calculated as `15000` paise.
- [x] **Timing-Safe HMAC Verification**: Both the checkout callback endpoint (`/api/payments/verify`) and the webhook (`/api/webhooks/razorpay`) verify signatures using `crypto.createHmac('sha256', secret)` and `crypto.timingSafeEqual` to prevent side-channel timing attacks.
- [x] **Idempotent Order Fulfillment**: Handled in [`lib/order-fulfillment.ts`](file:///c:/Users/ACER/OneDrive/Desktop/projects/diwali-kadai/lib/order-fulfillment.ts). If a webhook or client verification is retried, the handler checks `if (order.paymentStatus === 'PAID')` and exits early without double-decrementing stock or double-sending emails.
- [x] **Atomic Stock Decrement via Prisma Transactions**: Decrements stock with a conditional query inside a database transaction:
  ```typescript
  const updated = await tx.product.updateMany({
    where: { id: item.productId, stockQuantity: { gte: item.quantity } },
    data: { stockQuantity: { decrement: item.quantity } }
  })
  if (updated.count === 0) throw new Error("Insufficient stock")
  ```
  Prevents race conditions / overselling when two users purchase the last inventory item concurrently.

---

## 4. API Abuse & Rate Limiting

- [x] **Targeted Route Rate Limiting**: Implemented via [`lib/rate-limit.ts`](file:///c:/Users/ACER/OneDrive/Desktop/projects/diwali-kadai/lib/rate-limit.ts) using in-memory sliding windows:
  - `POST /api/orders`: Max 10 requests / 60 seconds per IP
  - `POST /api/payments/verify`: Max 10 requests / 60 seconds per IP
  - `POST /api/admin/login`: Max 5 requests / 15 minutes per IP (Brute-force protection)
  - `POST /api/webhooks/razorpay`: Max 30 requests / 60 seconds per IP
- [x] **IP Resolution**: Supports `x-forwarded-for` header for accurate client identification behind Nginx reverse proxy.
- [x] **Sanitized Error Responses**: Production error messages return generic human-readable guidance. Detailed internal errors and stack traces are suppressed from client responses.

---

## 5. Admin Authentication & Route Protection

- [x] **Middleware / Proxy Route Guard**: In [`proxy.ts`](file:///c:/Users/ACER/OneDrive/Desktop/projects/diwali-kadai/proxy.ts), all `/admin/*` and `/api/admin/*` paths (except `/admin/login` and `/api/admin/login`) are protected at the server boundary before page components render.
- [x] **bcrypt Password Hashing**: Passwords verified using `bcrypt.compare` with constant-time hash comparisons. Plaintext passwords are never stored or logged.
- [x] **Secure JWT Cookie Sessions**: Uses `jose` with HS256 algorithm. Cookies configured with:
  - `httpOnly: true` (Inaccessible to client-side JavaScript / XSS)
  - `sameSite: 'lax'` (CSRF mitigation)
  - `secure: process.env.NODE_ENV === 'production'`
  - `maxAge: 8 * 60 * 60` (8-hour session lifetime)

---

## 6. HTTP Headers & Transport

- [x] **Comprehensive Security Headers**: In [`next.config.ts`](file:///c:/Users/ACER/OneDrive/Desktop/projects/diwali-kadai/next.config.ts):
  - `Content-Security-Policy`: Restricts scripts, styles, frames, and connections to `'self'` and Razorpay hosts (`checkout.razorpay.com`, `api.razorpay.com`, `lumberjack-cx.razorpay.com`).
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [x] **Nginx Proxy Isolation**: Max client body size capped at `10M` in Nginx config to block request payload flood attacks.
