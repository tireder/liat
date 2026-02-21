# hebrew-rtl.md — Hebrew-First Product Guidelines (RTL)

## 1) RTL First, Not RTL Later
- Set `dir="rtl"` at the document or app root for Hebrew-first experiences.
- Test with mixed Hebrew/English content early (names, emails, numbers).

## 2) Typography
- Use a Hebrew-friendly font with good punctuation + numeral rendering.
- Maintain comfortable letter spacing; avoid overly tight tracking.

## 3) Layout Mirroring Rules
- Primary alignment: right.
- Navigation order flips:
  - logo usually on the right
  - primary nav flows right → left
- Icons:
  - Directional icons must flip (arrows, chevrons, “next/back”).
  - Non-directional icons do not flip.

## 4) Numbers, Dates, Currency
- Numbers are LTR inside RTL text; use proper bidi handling.
- Phone numbers, credit cards, IDs: preserve LTR display.
- Currency:
  - Ensure ₪ placement is correct for your locale formatting.
- Dates:
  - Decide format explicitly (e.g., DD/MM/YYYY common in Israel).
  - Consider Hebrew month names only if product requires it.

## 5) Inputs & Forms
- Text inputs in Hebrew: RTL text alignment.
- Emails/URLs: LTR alignment inside the field.
- Error messages should appear near the field and align right.

## 6) Copywriting (Microcopy)
- Keep labels short.
- Prefer clear verbs:
  - “שמור”, “המשך”, “שלח”, “בטל”
- Avoid slang unless your brand demands it.

## 7) QA Traps
- Mixed strings: “הזמנה #12345”, “john@site.com”, “$19.99”
- Tables: column alignment and sort arrow direction.
- Breadcrumbs: order must feel natural in RTL.


## References
- https://developer.mozilla.org/en-US/docs/Web/CSS/direction
- https://developer.mozilla.org/en-US/docs/Web/CSS/unicode-bidi
- https://www.w3.org/International/articles/inline-bidi-markup/uba-basics
- https://www.w3.org/International/articles/inline-bidi-markup/overview
- https://material.io/design/usability/bidirectionality.html
