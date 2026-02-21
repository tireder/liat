# prompt-playbook.md — Breaking Down Complex Tasks (Agent Method)

## Goal
Turn a vague request into a **bounded plan** with measurable deliverables.

## 1) Decompose (Task Tree)
Split into:
- **User outcomes** (what success looks like)
- **Pages/flows** (screens, entry points)
- **Components** (reusable building blocks)
- **Data** (entities, API calls, loading/error)
- **Edge cases** (empty, error, permissions, RTL, offline-ish)
- **Non-functional** (a11y, perf, i18n)

Output a task tree with 2–3 levels max.

## 2) Specify Interfaces Early
For each component:
- props (inputs)
- events (callbacks)
- states (loading/error/empty)
- accessibility requirements

For each page:
- route
- layout
- primary action
- data dependencies

## 3) Choose Patterns (avoid novelty)
Use standard patterns:
- list → detail
- wizard for multi-step
- drawer for secondary actions
- modal for short confirmation

## 4) Execution Plan Template
1. Read repo structure (or define target stack).
2. Define tokens + layout grid.
3. Implement primitives (Button, Input, Card, Modal, Navbar).
4. Implement pages/flows.
5. Add states + a11y.
6. Performance pass.
7. RTL/Hebrew pass (if relevant).
8. QA checklist.

## 5) Output Format (recommended)
- **Plan** (numbered steps)
- **File map** (paths)
- **Components** (what + why)
- **Acceptance criteria** (bullets)
- **Test checklist**

## 6) Complexity Control
If task is large:
- create milestones
- ship vertical slices (one full flow end-to-end)
- avoid building every variant before one happy path works


## References
- https://martinfowler.com/articles/agileArchitecture.html
- https://en.wikipedia.org/wiki/Specification_by_example
