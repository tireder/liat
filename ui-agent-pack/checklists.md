# checklists.md — Pre-Ship Checklists

## Design QA
- Visual hierarchy is obvious in 3 seconds.
- One primary action per view.
- Spacing is token-based and consistent.
- Components match system radius/shadow/border.

## UX QA
- Navigation paths are clear (no dead ends).
- Empty state explains next step.
- Errors are actionable and human.
- Destructive actions require confirmation.

## Mobile QA (360px)
- No horizontal scrolling.
- Tap targets >= 44px.
- Sticky nav/CTA only if helpful.
- Forms usable with mobile keyboard.

## Accessibility QA
- Keyboard: tab through everything.
- Focus visible and logical.
- Inputs have labels + error associations.
- Contrast AA.

## Performance QA
- Images optimized + lazy-loaded.
- No large layout shifts (CLS).
- Heavy components deferred.
- Minimal client-side JS for static sections.

## Hebrew/RTL QA (if applicable)
- `dir="rtl"` applied correctly.
- Directional icons flipped.
- Mixed Hebrew/English/numbers render correctly.
- Inputs: Hebrew RTL, email/URL LTR.

