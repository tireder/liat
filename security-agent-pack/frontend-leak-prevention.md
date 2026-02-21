# Frontend Leak Prevention (Console / Network / Bundles / Source Maps)

## Where secrets commonly leak
### 1) Network tab
- Request headers (Authorization, x-api-key)
- Query params (`?token=...`)
- Request bodies (passwords, OTPs, secrets)
- Redirect chains and referrers

Mitigations:
- Never send secrets from client.
- Avoid tokens in URLs. Use headers or HttpOnly cookies.
- Use POST bodies for sensitive data; avoid GET for auth flows.
- Set `Referrer-Policy` to restrict referrer leakage.

### 2) Console logs
- Logging env vars, config objects, error objects
- Logging entire HTTP responses that contain PII/tokens

Mitigations:
- Remove debug logs in production (lint rules / build strips).
- Centralize logging util with redaction.

### 3) Bundled code + source maps
- Secrets in code or env can be extracted from JS bundles.
- Source maps can reveal original sources and comments.

Mitigations:
- Never embed secrets at build time for client bundles.
- Disable public source maps in production or gate them (private upload to error tracker).
- Audit `process.env` usage in client code.

### 4) Storage (localStorage/sessionStorage)
- XSS can steal anything stored there.

Mitigations:
- Prefer HttpOnly, Secure, SameSite cookies for session tokens.
- Minimize stored sensitive data.
- Implement CSP and input sanitization.

### 5) HTML meta / inline scripts
- Inline configs might include keys.

Mitigations:
- Keep configs server-side; hydrate only non-sensitive.

## “Can I hide it by…?”
- Minify? No.
- Obfuscate? No.
- Put it in a hidden route? No.
- Encrypt in JS then decrypt? No (key is still in client).

## Practical “agent audit” checks
- Search repo for:
  - `apikey`, `secret`, `token`, `service_role`, `privateKey`
  - `NEXT_PUBLIC`, `VITE_`, `REACT_APP_`
- Inspect production build output for suspicious strings.
- Verify source maps policy.


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
- https://developer.chrome.com/docs/devtools/
- https://web.dev/csp/
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
- https://owasp.org/www-community/HttpOnly
- https://owasp.org/www-community/SameSite
