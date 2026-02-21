# ui-ux-guidelines.md — Best-Practice Web UI/UX Guidelines

## 1) Layout System (use tokens)
Use a 4/8px spacing system.
- Page max width: 1200–1440px (content), with generous gutters.
- Vertical rhythm: consistent section spacing (e.g., 24/32/48/64).
- Use a grid:
  - Mobile: 4 columns
  - Tablet: 8 columns
  - Desktop: 12 columns

## 2) Visual Hierarchy
- One H1 per page. Clear scanning:
  - H1: page intent
  - H2: major sections
  - H3: sub-sections
- Prefer **left-aligned** paragraphs (RTL changes alignment rules; see `hebrew-rtl.md`).
- Limit line length: ~60–80 characters for long text.

## 3) Components: How They Should Look/Behave

### Cards / Boxes
- Purpose: group related content + CTA.
- Anatomy:
  - header (title + optional meta)
  - body (content)
  - footer (actions)
- Rules:
  - Keep shadow subtle; prefer border + slight shadow.
  - Use consistent radius (e.g., 12–16px).
  - Entire card may be clickable **only** when the primary action is navigation.

### Navigation Bars
- Desktop:
  - left: logo
  - center/left: primary nav
  - right: utilities (search, profile, CTA)
- Mobile:
  - prioritize top 3 actions
  - use bottom nav for 3–5 core destinations if app-like
  - otherwise: top bar + hamburger with clear sections
- Sticky nav only if it improves task completion.

### Buttons
- Sizes: sm / md / lg with fixed heights.
- Primary button: 1 per view (avoid multiple competing primaries).
- Loading state: keep width stable, show spinner + label if possible.
- Disabled is not a tooltip substitute: explain *why*.

### Forms
- Prefer single-column forms.
- Label above input (best for mobile + RTL).
- Provide:
  - helper text
  - inline validation
  - top summary for submit errors
- Input types must match intent (email/tel/number) to get correct mobile keyboard.

### Tables / Dense Data
- Mobile: switch to cards or “row-details” pattern.
- Always support sorting and filtering if dataset is non-trivial.

### Modals
- Use for short, focused tasks only.
- Trap focus; ESC closes; clicking backdrop closes (unless destructive).
- Avoid full-page modals on mobile; use bottom sheets.

### Empty / Loading / Error States
- Empty: explain what it is + primary next action.
- Loading: skeleton for layout stability, avoid spinners-only for large views.
- Error: human message + recovery action + diagnostics if needed.

## 4) Icons, SVGs, and Motion
- Prefer **SVG icons** (inline or component) for crisp scaling.
- Use icon sets that match style (stroke width, roundedness).
- Motion rules:
  - 150–250ms for micro-interactions
  - 250–400ms for page-level transitions
  - Keep easing consistent (avoid bouncy unless brand demands)
- Motion must be **accessible**:
  - respect `prefers-reduced-motion`
  - never rely on motion alone to convey meaning

### Recommended libraries / resources
- Components: https://21st.dev/community/components
- UI blocks/templates: https://magicui.design/docs/components
- Motion components: https://animate-ui.com/docs

## 5) Color, Type, and Theming
- Use semantic tokens: `bg`, `fg`, `muted`, `border`, `primary`, `danger`, etc.
- Provide dark mode if product context expects it.
- Typography:
  - base 14–16px
  - headings scale (e.g., 16/20/24/32/40)
  - consistent font weights (avoid 6+ weights)

## 6) Accessibility Checklist (minimum)
- Visible focus ring.
- Correct roles/labels for:
  - buttons, links, toggles
  - inputs (label + aria-describedby for errors)
- Touch targets: ~44–48px.
- Contrast AA.

## 7) Performance Checklist (minimum)
- Image formats: AVIF/WebP preferred; correct `sizes`/`srcset`.
- Avoid heavy animation libraries for small effects.
- Defer non-critical scripts; avoid layout shift (CLS).


## References
- https://www.nngroup.com/articles/
- https://material.io/
- https://developer.apple.com/design/human-interface-guidelines/
- https://developer.android.com/design
- https://www.w3.org/WAI/standards-guidelines/wcag/
- https://www.w3.org/WAI/ARIA/apg/
- https://developer.mozilla.org/en-US/docs/Web/Accessibility
- https://tailwindcss.com/docs
- https://ui.shadcn.com/
- https://www.radix-ui.com/
- https://www.framer.com/motion/
- https://lottiefiles.com/
- https://lucide.dev/
- https://heroicons.com/
- https://iconify.design/
- https://phosphoricons.com/
- https://21st.dev/community/components
- https://magicui.design/
- https://animate-ui.com/docs/icons
