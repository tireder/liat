# Secrets & API Keys (How to Avoid Frontend Leaks)

## Golden rule
If the browser can access it, **attackers can access it**.
Anything in:
- bundle JS
- network requests
- console logs
- localStorage/sessionStorage
- cookies (especially if not HttpOnly)
- source maps
- build artifacts
is considered **public**.

## What counts as a secret
- DB credentials, connection strings
- “service role” keys (Supabase service role, Stripe secret key, etc.)
- OAuth client secrets
- private signing keys (JWT signing, webhook secrets)
- admin tokens
- internal API tokens

## Correct placement
### Server-only secrets
- Store in server env vars: `.env` on server/CI secrets store.
- Access only in:
  - server routes/controllers
  - server actions
  - edge functions (with server secret support)
  - background jobs

### Client-safe values
- public publishable keys (e.g. Stripe publishable) are ok, but still restrict usage by origin/allowed domains if supported.
- feature flags that do not reveal sensitive logic.

## Framework pitfalls (client env prefix)
Common patterns:
- Next.js: `NEXT_PUBLIC_*` is client-exposed.
- Vite: `VITE_*` is client-exposed.
- Create React App: `REACT_APP_*` is client-exposed.
Rule: **never put secrets in any client-exposed env var**.

## Proxy pattern (recommended)
Browser → **Your Backend** → Third-party
- Frontend calls your API without secrets.
- Backend injects secret headers and calls third-party.
- Backend enforces auth, RBAC, quotas, input validation.

## Key scoping + rotation
- Scope keys to the minimum permissions and origin/IP if possible.
- Use short-lived tokens (JWT with exp, rotating refresh).
- Rotate on schedule and on incident.
- Separate keys per environment (dev/staging/prod).

## Supabase-specific baseline (high-level)
- Use **anon key** in client, never service role in client.
- Enforce Row Level Security (RLS) for tables exposed to client.
- Use server-side functions for privileged operations.

## Prevent accidental commits
- Add `.env*` to `.gitignore`.
- Use secret scanning in CI.
- Add pre-commit hooks to block secrets.

## Redaction rules
- Never log: tokens, auth headers, cookies, password fields.
- Redact patterns: `Authorization: Bearer …`, `apikey=…`, `secret=…`.


## References
- https://owasp.org/www-project-top-ten/
- https://cheatsheetseries.owasp.org/
- https://owasp.org/www-project-application-security-verification-standard/
- https://owasp.org/www-project-api-security/
- https://owasp.org/www-project-web-security-testing-guide/
- https://cwe.mitre.org/
- https://attack.mitre.org/
- https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf
- https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63-3.pdf
- https://slsa.dev/
- https://openssf.org/
- https://github.com/ossf/scorecard
- https://12factor.net/config
- https://docs.github.com/en/actions/security-guides/encrypted-secrets
- https://docs.gitlab.com/ee/ci/secrets/
- https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Introduction
- https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- https://vercel.com/docs/projects/environment-variables
- https://supabase.com/docs/guides/platform/secrets
