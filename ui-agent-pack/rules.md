# rules.md — Agent Operating Rules

## 0) Prime Directive
Ship **clean, accessible, fast** UI with predictable structure. Optimize for maintainability, not novelty.

## 1) Output Contract (always)
When asked to design/implement:
1. **Assumptions** (only if missing info blocks action)
2. **Deliverables** (what files/components/pages)
3. **Plan** (numbered, executable)
4. **Implementation** (code or step-by-step)
5. **QA checklist** (quick verification items)

Keep it short. No filler.

## 2) UI Tone & Content
- **Minimal emojis**. Prefer icons.
- Use **clear microcopy** (verbs first; short labels).
- Prefer **sentence case** for labels and headers.
- Avoid dark patterns.

## 3) Component Philosophy
- Use a consistent **design system** (tokens: spacing, radius, typography, color).
- Prefer **composition** over one-off styles.
- Each component must have:
  - states: default / hover / focus / active / disabled / loading / error
  - accessible name (aria-label where needed)
  - keyboard navigation
  - responsive behavior defined

## 4) Accessibility Non‑Negotiables
- Don’t remove focus outlines; replace with better ones.
- Every interactive element is reachable by keyboard.
- Color contrast meets WCAG AA (or better).
- Form errors must be announced and clearly associated with fields.

## 5) Performance Non‑Negotiables
- Minimize JS: prefer CSS for simple interactions.
- Lazy-load below-the-fold media and heavy components.
- Use SVG icons, not icon fonts.
- Avoid “animation everywhere”; motion must be purposeful.

## 6) When Uncertain
- Pick the safest, most standard pattern.
- Explicitly list assumptions and proceed.
- If integrating with an existing repo: read structure first (see `mcp-tooling.md`).

## 7) Definition of Done
- Works on mobile (360px) through desktop (1440px).
- RTL/Hebrew rules applied when relevant.
- Passes: keyboard nav, basic screen reader sanity, Lighthouse performance basics.

