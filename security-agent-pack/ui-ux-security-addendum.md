# UI/UX + Security Addendum (Patterns + References)

## Secure UX patterns
- **Auth forms**
  - Generic error messages (“Invalid credentials”) to reduce enumeration.
  - Rate limit + backoff after repeated failures.
  - Password rules shown inline; never over-restrict.

- **Reset password / OTP**
  - Same response time and message whether account exists or not.
  - OTP input with auto-advance; lock after N attempts.

- **Sessions**
  - “Log out other devices” and session list UI.
  - Clear “Last login” and device info (helps detect compromise).

- **Sensitive actions**
  - Re-auth for critical changes (email, payout, delete).
  - Confirmation dialogs with friction (type-to-confirm) for destructive actions.

- **Error handling**
  - No stack traces in UI.
  - Provide correlation IDs to support without revealing internals.

## UI/UX references (more)
Component & UI kits:
- https://ui.shadcn.com/
- https://tailwindui.com/
- https://radix-ui.com/
- https://mui.com/
- https://chakra-ui.com/
- https://mantine.dev/

Patterns & docs:
- https://www.nngroup.com/ (usability research)
- https://material.io/design
- https://developer.apple.com/design/human-interface-guidelines/
- https://www.w3.org/WAI/standards-guidelines/wcag/
- https://webaim.org/resources/contrastchecker/

Icons (SVG-first):
- https://lucide.dev/
- https://heroicons.com/
- https://tabler.io/icons
- https://phosphoricons.com/

Motion/animation:
- https://www.framer.com/motion/
- https://motion.dev/
- https://lottiefiles.com/ (Lottie animations)
- https://rive.app/ (interactive animations)

Security UX references:
- OWASP cheat sheets: https://cheatsheetseries.owasp.org/
- Web security guidance: https://developer.mozilla.org/en-US/docs/Web/Security
