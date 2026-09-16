# Component gaps

Things a screen needed that Storybook did not have. Each line says what it was
and which screen needed it. Built inline in the screen, from tokens.

A thing that appears here twice gets built properly as a component with a
story instead — see `.claude/skills/build-screen/SKILL.md`, step 5.

- The record button's visible label and helper ("Tap to start" / "About 30 seconds is plenty") — `/explain/[term]` (06 Idle). `recordButton`'s own `label` is its accessible name, not visible text, and the two lines are centred under it.
- `href` on `buttonIcon` and `recordButton` — `/explain/[term]` (06 Idle). `button` renders a Next `Link` when given one; these two take `onClick` only, so the screen wraps them in a client shim to push the route.
- The session app bar — a close `buttonIcon`, a `progressIndicator` and a Skip `button` in one `appBar` — `/explain/[term]` (06 Idle) and `/explain/[term]/hint`. Storybook has `appBar` and its three slots, but nothing that fills them the way SPEC.md's screen-detail preamble prescribes for every session screen. Second screen to need it, so by the rule above it is built once at `src/app/explain/[term]/SessionAppBar.tsx` instead of copied a third time. No story: it is a composition of library components that only means anything inside the session, so it sits with the screens rather than in `src/components`.
