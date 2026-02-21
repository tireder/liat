# Dependency & Supply-Chain Security

## Lockfile discipline
- Commit lockfiles (`package-lock.json` / `pnpm-lock.yaml`).
- CI uses `npm ci` / `pnpm i --frozen-lockfile`.
- Disallow unpinned versions for production builds.

## Update strategy
- Automated PRs (Dependabot/Renovate).
- Patch quickly; batch minor/major carefully.
- Review changelogs for auth/crypto/netcode deps.

## Provenance and integrity
- Use `npm audit signatures` / provenance when available.
- Prefer maintained packages with active releases.
- Avoid “typosquats” by verifying names and publishers.

## Risk heuristics
High risk:
- packages that execute postinstall scripts
- crypto/auth libraries with few maintainers
- dependencies with recent ownership changes
- packages with extremely high transitive breadth

## SBOM
- Generate SBOM (CycloneDX/SPDX) for releases.
- Store artifacts with build metadata.

## Frontend dependency safety
- Avoid DOM sanitizers that are outdated.
- Avoid markdown renderers without strict sanitization.


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
- https://docs.npmjs.com/cli/v10/commands/npm-audit
- https://docs.github.com/en/code-security/dependabot
- https://github.com/actions/dependency-review-action
- https://pnpm.io/cli/audit
