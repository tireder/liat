# Security Agent Pack (Markdown)

Purpose: Drop-in `.md` guidance files for AI agents / dev teams to **prevent security leaks**, **test for flaws**, and **ship safely**.
Includes practical checklists and guardrails to avoid exposing secrets in the frontend (Console/Network/Source maps), plus CI testing patterns.

Files:
- `security-rules.md` — baseline non-negotiables (do/don’t)
- `threat-modeling.md` — lightweight threat modeling + abuse cases
- `secrets-and-api-keys.md` — key management + frontend leak prevention
- `security-testing.md` — SAST/DAST/dependency scanning, CI pipelines
- `frontend-leak-prevention.md` — what leaks where (console, network, bundles)
- `dependency-supply-chain.md` — npm/pnpm lock hygiene, SBOM, provenance
- `logging-monitoring.md` — secure logging, alerting, audit trails
- `incident-response.md` — what to do when you leak a key
- `ui-ux-security-addendum.md` — UX refs + secure UI patterns (auth, forms, errors)

Use: copy into your repo under `/docs/agents/` or similar, and point agents to follow them.
