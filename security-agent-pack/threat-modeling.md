# Threat Modeling (Lightweight but Effective)

## 1) Identify assets
- user accounts, sessions, tokens
- PII (emails, phone, addresses)
- payments, invoices
- internal admin surfaces
- API keys / secrets
- data exports, files, object storage

## 2) Identify trust boundaries
- browser ↔ backend
- backend ↔ third-party APIs
- backend ↔ DB/storage
- admin ↔ user-facing
- webhook sources ↔ your ingestion

## 3) Common attacker goals
- account takeover, session hijack
- data exfiltration (PII, docs, files)
- privilege escalation (user → admin)
- fraud (payments, credits)
- DoS / rate abuse
- supply-chain compromise (deps)

## 4) Abuse-case checklist (per feature)
For each endpoint / workflow:
- Can an unauth user call it?
- Can a normal user access another user’s resources (IDOR)?
- Can an attacker change roles/price/credits client-side?
- Can they brute force OTP/login?
- Can they bypass paywall?
- Can they poison logs or prompts?
- Can they abuse file upload (polyglots, SVG, zip bombs)?
- Can they cause SSRF by submitting URLs?
- Is there a path traversal or open redirect?

## 5) STRIDE quick pass
- **S**poofing: can identity be faked?
- **T**ampering: can params be modified to change outcome?
- **R**epudiation: can actions be denied without audit?
- **I**nfo disclosure: can data leak via errors/logs/caching?
- **D**oS: can it be spammed?
- **E**levation: can a user gain admin/system power?

## 6) Output format for agents
- Feature: …
- Assets: …
- Trust boundaries: …
- Threats (top 5): …
- Mitigations: …
- Tests to add: …
- Observability: (metrics, logs, alerts)


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
- https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool
- https://owasp.org/www-community/Threat_Modeling
- https://en.wikipedia.org/wiki/STRIDE_(security)
