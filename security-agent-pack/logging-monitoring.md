# Logging, Monitoring, and Audit Trails

## Secure logging rules
- Redact secrets/tokens/cookies always.
- Hash or truncate PII if needed for correlation.
- Don’t log full request bodies by default.
- Structured logs (JSON) with consistent fields.

## What to monitor
- auth failures spikes
- rate limit hits
- unusual export/download volume
- admin actions
- webhook signature failures
- 4xx/5xx anomaly spikes
- DB policy denials (RLS) spikes

## Alerts
- “new key used from new geo/IP”
- “sudden increase in password resets”
- “burst traffic to sensitive endpoints”
- “large object storage downloads”

## Audit trails
- Who did what, when, from where.
- Immutable append-only if possible.
- Protect audit logs from modification by app roles.


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
- https://opentelemetry.io/docs/
- https://www.elastic.co/what-is/elk-stack
- https://grafana.com/docs/
