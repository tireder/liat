# Security Testing (CI/PR Required)

## Test layers
### SAST (static analysis)
- Lint for insecure patterns (eval, dangerouslySetInnerHTML, weak crypto).
- Semgrep rulesets for your stack.
- TypeScript strict + ESLint security plugins.

### Dependency scanning
- `npm audit` / `pnpm audit` plus a dedicated scanner (Snyk/GitHub Dependabot).
- Block critical vulns or require explicit waiver.

### Secrets scanning
- Pre-commit + CI scanning (gitleaks/trufflehog).
- Fail builds on new findings.

### DAST (dynamic)
- Run OWASP ZAP baseline scan against staging.
- Scan auth boundaries and critical endpoints.

### API security tests
- Contract tests for auth requirements.
- Rate limit tests.
- IDOR tests (user A cannot read user B).

## Minimal CI pipeline template (conceptual)
1. unit tests
2. typecheck
3. lint
4. SAST scan
5. secrets scan
6. dependency scan
7. integration tests (auth+RBAC+RLS)
8. DAST on preview env (nightly or gated)

## What to test for explicitly
- Authentication required where expected
- Authorization (role checks, ownership)
- Input validation (schema + size limits)
- Rate limiting / brute force protections
- CSRF protections (if cookie sessions)
- XSS / injection surfaces
- File upload: type/size/content scan
- Webhooks: signature verification + replay protection
- Caching: no private data cached publicly

## Release checklist (security)
- key rotation plan exists
- headers/CSP validated
- source maps policy validated
- admin routes protected and monitored
- logging redaction verified


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
- https://zap.owasp.org/
- https://github.com/zaproxy/zaproxy
- https://portswigger.net/burp
- https://github.com/returntocorp/semgrep
- https://github.com/aquasecurity/trivy
- https://docs.github.com/en/code-security
