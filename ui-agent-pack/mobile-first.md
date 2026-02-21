# mobile-first.md — Mobile-First Rules (360px → up)

## 1) Start at 360px
Design and validate layout at 360x800 first. Desktop is an enhancement.

## 2) Navigation
- If product is app-like: bottom nav (3–5 items) + “More” if needed.
- If content-like: top bar + menu drawer.
- Always keep the **primary CTA** visible without excessive scrolling.

## 3) Touch & Gestures
- Touch targets: 44–48px minimum.
- Avoid hover-dependent UI; provide explicit affordances.
- Use swipe gestures only as shortcuts, never as the only path.

## 4) Layout Patterns That Work
- Single column. Two columns only for tight, simple content on large phones.
- Use collapsible sections (accordion) for secondary details.
- Replace tables with:
  - cards
  - stacked rows with “details” expanders
  - horizontal scroll only as last resort

## 5) Forms
- Label above field.
- Use correct input type.
- Sticky submit button for long forms (if it improves completion).

## 6) Performance
- Budget:
  - keep first interaction fast
  - lazy-load below-the-fold
  - avoid huge hero videos on mobile

## 7) Responsive Breakpoints (suggested)
- 360–420: small phones
- 768: tablet
- 1024: small laptop
- 1280–1440: desktop

Define behavior at each breakpoint (don’t “let it happen”).


## References
- https://web.dev/responsive-web-design-basics/
- https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
- https://web.dev/vitals/
- https://web.dev/learn/images/
- https://developer.chrome.com/docs/lighthouse/overview/
