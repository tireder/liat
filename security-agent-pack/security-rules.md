# Security Rules (Non‑Negotiables)

## Core principles
- **Assume breach.** Design as if attackers can see traffic, code, and error states.
- **Zero trust boundaries.** Frontend is *untrusted*. Never rely on it for security decisions.
- **Least privilege.** Minimal permissions, short-lived credentials, scoped tokens.
- **Secure-by-default.** Deny-by-default; explicit allowlists.

## Absolute rules
- **Never ship secrets to the client.** No API keys, service role keys, private tokens, DB credentials.
- **No “security through obscurity.”** Minification, hidden endpoints, and “private routes” do not protect data.
- **No PII in logs.** Never log passwords, OTPs, access tokens, cookies, payment data, national IDs.
- **No direct DB from client** unless using an auth-guarded gateway with row-level policies and scoped tokens.
- **All auth decisions happen server-side** (or in a trusted edge function) with verified identity.
- **All external input is hostile.** Validate on the server. Client validation is UX only.

## Review gates
- Any change that touches:
  - auth, sessions, cookies, headers
  - API routes, middleware, edge functions
  - storage buckets / access policies
  - payment, webhooks
  - logging / analytics
  must include:
  - threat notes (what could go wrong)
  - tests (unit/integration/security)
  - secret checks (scans + env review)

## Default security headers (baseline)
- `Content-Security-Policy` (CSP)
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- `X-Frame-Options` (or frame-ancestors via CSP)

## OWASP baseline
Follow OWASP Top 10 patterns: injection, auth, sensitive data exposure, security misconfig, XSS, etc.
