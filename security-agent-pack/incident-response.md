# Incident Response (When a Key Leaks)

## Immediate actions (first minutes)
1. **Revoke/rotate** the leaked key/token.
2. Identify where it leaked:
   - repo commit
   - frontend bundle/source maps
   - logs
   - third-party dashboard
3. Invalidate sessions if identity is impacted.

## Containment
- Disable affected endpoints temporarily if needed.
- Add rate limits / block abusive IPs.
- Patch the leak path (remove logging, move to backend).

## Investigation
- Check third-party logs for unauthorized usage.
- Identify data accessed; scope blast radius.
- Preserve evidence (logs, build artifacts, commit SHAs).

## Recovery
- Deploy fixed version.
- Rotate related credentials (if shared perms).
- Add tests/scanners to prevent recurrence.

## Communication
- Internal incident doc: timeline, root cause, action items.
- External disclosures if required (PII exposure).


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
- https://www.cisa.gov/resources-tools/resources/incident-response
- https://www.cisa.gov/stopransomware
- https://statuspage.io/
