---
name: build-screen
description: Use when building or editing any screen in the Explain out loud prototype — any page under src/app, any route in the SPEC.md screen list, any request phrased as "build screen 06", "make the summary screen", "fix the hint screen", or "wire up /explain/[term]/type". Covers where screens live, reading the spec, checking Figma, composing from Storybook, and what to report at the end.
---

# Building a screen in this prototype

## Where screens live

Every screen is a **page in the Next.js app**, at its own route under `src/app`, reachable by clicking something on the screen before it. `SPEC.md` gives the route and the file path for all 28 screens — use them exactly as written.

- Storybook (`src/components/<kebab-name>/`) is the catalog for **components only**.
- A screen that only exists as a Storybook story **does not count as built**. Neither does one that can only be reached by typing its URL.
- No hidden keyboard shortcuts, no dev menu.

## The method

### 1. Read SPEC.md for this screen

Find the screen in the **Screen detail** section. It gives you, per screen: its states, the exact components and props, what the student can do, and where each action leads. Also re-read these rules that apply to every screen:

- **Skip rule** and **Progress rule** in the Screen detail preamble.
- **"Rules that must hold on every screen"** near the end — one Primary button per screen, no `StepperStep type="Voice"` with `state="Locked"`, no colour carrying meaning alone, sentence case, `prefers-reduced-motion` behaviour.

If SPEC.md and a Figma frame disagree, SPEC.md wins for behaviour and routing; the frame wins for visual detail. Note the disagreement in your report.

### 2. Check Figma for a frame

Screen numbers in SPEC.md (`06`, `09c`, `13b`) are frames on the **Mockups v2** page of the file `Yummy__Knowie Design Sprint`. The older `Mockups` page is superseded — ignore it.

Some screens have a frame and some don't, and it changes what you do at the end. Look before you build, using the Figma MCP tools (`get_metadata` / `get_screenshot` / `get_design_context` on the Mockups v2 page). Decide which branch you're on now, not after you've built it.

### 3. Query Storybook for every component

The Storybook MCP runs at `http://localhost:6006/mcp` (`npm run storybook`). Before using a component:

- `docs-list` once at the start to get the component ids.
- `docs-show` for each component you plan to use.
- `docs-show-story` for a variant the component docs don't cover.

**Never assume a prop.** Not `className`, not `onClick`, not something that sounds obvious. If a prop isn't in the docs or shown in a story, it doesn't exist — and if you need it, stop and ask.

The components that exist today: `answer-block`, `app-bar`, `button`, `button-group`, `button-icon`, `chips`, `icon-slot`, `mascot-figure`, `mascot-message`, `progress-indicator`, `record-button`, `scaffold`, `section-header`, `skeleton`, `status-tag`, `stepper-step`, `take-player`, `term-row`, `text-block`, `text-field`, `verdict-header`, `waveform`.

### 4. Compose from what's in Storybook

Storybook is the **only** place to look for something to reuse. Most of the Figma library was never built in code, so a component existing in Figma tells you nothing about whether you can use it. Don't go looking in the Figma library for something to import.

A page composes components. A page never redefines a component's look.

### 5. When something isn't in Storybook

Build it **inside the screen** from tokens, and add a line to `component-gaps.md` at the repo root (create the file if it isn't there) saying what the thing was and which screen needed it:

```
- Hint ladder counter — /explain/[term]/hint-1
```

Don't stop to ask. Keep building.

**Except:** if that same thing is already on the list from another screen, that's the second time it's been needed — build it properly as a component in `src/components/<kebab-name>/` with a story, and use it from both screens. Then mark the gap line as resolved rather than adding a third.

### 6. Every value from the generated tokens

Use the CSS custom properties in `build/css/tokens.css` (`var(--color-violet-400)`, `var(--space-...)`). No raw hex, no raw px, no raw font sizes.

- Never write a fallback: `var(--token, #333)` is banned.
- Never hand-edit `build/css/tokens.css`. If a value is genuinely missing, edit `tokens/tokens.json` and run `npm run tokens`.

### 7. Mobile only

390px canvas, dark mode only. The width is set once in `globals.css` (`.appFrame`) — `Scaffold` fills whatever it's given, so don't set a width on the page. No responsive breakpoints, no light mode.

### 8. Build every state listed

Including the failure ones — silence, denied permission, the slow processing wait, the last miss, the leave confirm. A screen with its happy state only is not finished. SPEC.md's **"Every failure path is reachable by clicking"** section says how each one is reached; make sure it actually is.

### 9. Every action goes where SPEC.md says

The **Leads to** line for each screen is the wiring list. Every button, link and row on the screen gets its destination. **A button that leads nowhere means the screen isn't finished** — no `href="#"`, no empty handler, no TODO.

Note that `StepperStep` takes `href` in code (Figma can't express a destination), which makes the whole row one focusable link.

## When you're done

**Always give me the link to the screen you built** — the running URL, like
`http://localhost:3000/explain/1`, not the route or the file path. One line, at
the top of what you report back. If the screen is a dynamic route, link the one
I can actually click into (`/explain/1`, not `/explain/[term]`). If the dev
server isn't running, start it so the link works.

Run the story tests if you touched or added a component:

```
npx vitest run --project=storybook
```

Then, depending on the branch you picked in step 2:

**If the screen has a Figma frame:** match it, and list **every difference** between what you built and the frame — spacing, copy, ordering, anything you substituted because the Figma component doesn't exist in code, anything SPEC.md told you to do differently.

**If it doesn't:** read `design-brief.md` and `voice-ux.md` for how the state should behave, then tell me **everything you had to decide that wasn't written down anywhere** — copy you wrote, layout you chose, a state's timing, an affordance you added. Those are decisions I need to make, not ones you should bury.

## Things that are already settled

Don't re-derive these, and don't "fix" them:

- Voice in, text out. Knowie never speaks.
- Push-to-talk with an explicit send. No auto-endpointing.
- Speech recognition, judging and latency are mocked and hard-coded.
- Text fallback is reachable from every answerable state.
- A section can read Mastered without being read — SPEC.md, "Known trade-off, accepted". Don't re-gate the voice step or discount redos.
- Flow, placement and the per-term loop are locked in `sprint-context.md`.
