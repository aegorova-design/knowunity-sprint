# Scorecard A1 — Idle, Recording, Results (verdict tier), Plan screens

Scoped review of four screen groups only, against `eval/rubric.md`:

| Group | Screens | Routes |
|---|---|---|
| Idle | 06 Idle | `/explain/1`, `/explain/2`, `/explain/3` |
| Recording | 07 Recording | `/explain/1/recording` |
| Results (verdict tier) | 10 Got it, 10b Got it after a hint, 11 Hint 1 of 2, 12 Partial hint 2 of 2, 12b Last attempt, 13 Answer revealed, 13b Answer revealed said back, 09c Didn't catch that | `/explain/1/pass`, `/pass-hinted`, `/hint-1`, `/hint-2`, `/last-miss`, `/answer`, `/answer/said-back`, `/not-heard` |
| Plan screens | 02 Nothing started, 03 In progress, 19 1 of 3 unaided, 21 Section mastered | `/plan`, `/plan/in-progress`, `/plan/to-revisit`, `/plan/mastered` |

Method: this session first rendered every state above at a confirmed 390px `.appFrame` width in
dark mode and screenshot-compared pairs that carry different meaning, per hard gate 4. Three
adversarial critics (critic-system, critic-craft, critic-ux) then each graded two rubric
dimensions in an isolated context — given only these four screen groups, `eval/rubric.md`, and
their own dimensions, with no access to each other's output, to this session's own render pass,
or to any other scorecard. critic-ambition gave a separate, advisory Reach read, also blind.

## Total: 5.45 / 10

| # | Dimension | Score | Weight (table) | Weighted | Critic |
|---|---|---|---|---|---|
| 1 | System fidelity | 5/10 | 20% | 1.00 | critic-system |
| 2 | Coherence | 5/10 | 25% | 1.25 | critic-craft |
| 3 | Craft | 6/10 | 15% | 0.90 | critic-craft |
| 4 | UX judgment | 6/10 | 25% | 1.50 | critic-ux |
| 5 | Accessibility | 4/10 | 10% | 0.40 | critic-ux |
| 6 | Structure | 8/10 | 5% | 0.40 | critic-system |

**Rubric weight conflict — still unresolved, carried from scorecard-02.** `eval/rubric.md`'s
summary table (used above) gives Coherence 25% / Craft 15% / UX 25% / Accessibility 10%. The six
section headers give Coherence 20% / Craft 20% / UX 20% / Accessibility 15% instead, also summing
to 100. Scoring this run's six numbers under the header scheme gives **5.40/10**, not 5.45. Still
unresolved in the rubric file itself.

**Three of four hard gates fail on this screen set**, one narrowly — see below. The failures are
already reflected in the scores above (System fidelity and Accessibility are reported already
capped by their scoring critics); Coherence's cap from gate 4 does not change its number since
critic-craft's own evidence-based score was already at the 5 ceiling.

---

## Hard gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Contrast 4.5:1 body text | **Fail** | critic-ux measured the recurring violet label color (`rgb(145,120,230)`) against the `AnswerBlock` card fill (`rgb(34,36,47)`) at **4.42:1** — under the floor for 15px/600-weight text, which is not large-scale. Recurs on `/explain/1/hint-1` ("Hint 1 of 2"), `/explain/1/hint-2` ("Hint 2 of 2, the last one"), `/explain/1/answer` and `/explain/1/answer/said-back` (the term-name label). critic-system did not independently measure this to a verdict (token math alone put it just over the floor, ≈4.62:1, but it could not confirm live rendered usage in scope); critic-craft was not asked to check this gate. Treated as **Fail** on critic-ux's direct rendered-pixel measurement, which the rubric's rule 2 favors over token math. |
| 2 | Touch targets 44pt | **Fail** | Confirmed **independently and identically** by critic-system and critic-ux: Skip (`Button variant="Tertiary" size="S"`) measures **29.77×48pt** live on `/explain/1`, `/explain/2`, `/explain/3`, `/explain/1/recording`, and `/explain/1/not-heard` — every in-scope screen with a live Skip. Both critics attribute it to the `Tertiary` variant having no side padding by design (`button.css:173-174`), not to a screen-level misuse. |
| 3 | No raw hex / no `var(--token, fallback)` | **Fail** | critic-system ran `npm run tokens:check` and it failed: `src/components/waveform/waveform.css:73` reads `var(--i)`, an undefined custom property, and `Waveform` is live in scope on `/explain/1/recording`. `npm run check:tokens` (raw hex) passed clean. critic-craft found no raw hex or fallback pattern in the specific files it read, which does not contradict critic-system's repo-wide command run. |
| 4 | No two states that should differ rendering identically | **Fail, on one specific pair** | This session's own render pass and critic-craft **independently** found that `/explain/1/answer` and `/explain/1/answer/said-back` render their four `Chips` (`data-active`) pixel-identical — both `"False"` — even though `sprint-context.md`'s own locked decision states the say-back screen reuses the reveal "with the key idea chips ticked," and `SPEC.md` (screen 16) repeats "the key ideas ticked." `RevealedAnswer.tsx`'s own code comment overrides this with different reasoning ("They are unticked on both screens... the component offers no other state") — a real, shipped decision, but one that contradicts the locked doc rather than superseding it in writing. Every other named pair in this scope (Idle vs Recording, pass vs pass-hinted, hint-1 vs hint-2, hint screens vs last-miss, not-heard vs the verdict screens, all four plan screens) was independently confirmed to differ in more than one channel by all three adversarial critics and this session's own pass — those all **pass**. This reconciliation treats the chip sub-state as its own failing pair under the gate's general principle ("no two states that should differ rendering identically"), a stricter read than the three critics took — each of them logged it as a Finding but scored the *whole screen pair* as technically clearing the gate, since headline, caption and button count do differ. Capped dimension: Coherence, where critic-craft's own scoring narrative already places the finding — already at the 5 ceiling, so no numeric change. |

---

## Findings

Ordered most-severe first. Every finding is from a critic's rendered/measured evidence, or this
session's own render pass, unless marked otherwise.

**F1 — A "Mastered" section still promises a revisit its own outcome data says can't happen.**
Found **independently** by critic-craft and critic-ux. `sprint-context.md`'s locked rule: hinted,
revealed and skipped terms come back on a date Knowie names, **unaided ones do not** — "a
consequence the student can see beats a claim they have to believe." `/plan/mastered` renders
`SectionHeader` reading "3 of 3 on your own" (all three terms unaided — nothing should be
scheduled) beside `MascotMessage`'s helper: **"I'll bring them all back Thursday, 2 days before
your exam,"** with a **Practice sooner** CTA — the identical "you're getting re-tested" framing as
the ToRevisit path, for a section with nothing left to revisit. The screen's own file comment
(`src/app/plan/mastered/page.tsx:3`) calls this "a session with nothing left to schedule," while
the copy it renders schedules one anyway. Compounding: `/plan/to-revisit`'s own helper doesn't
name a date either ("Try them on your own in a couple of days") — so between the two screens,
neither correctly executes the locked rule.
*Evidence:* `src/app/plan/planData.ts:183` (Mastered helper text), `:159` (ToRevisit helper text);
`src/app/plan/mastered/page.tsx:3`; rendered `/plan/mastered` and `/plan/to-revisit`. —
critic-craft, critic-ux
*Fix:* On Mastered, drop the "bring back"/date framing entirely — nothing is due. On ToRevisit,
name the actual next-check date rather than "a couple of days," matching the rubric's own 9-anchor
("helper names the revisit date").

**F2 — `npm run tokens:check` fails: an undefined custom property ships live on the Recording screen.**
`src/components/waveform/waveform.css:73` reads `var(--i)`, never defined by
`build/css/tokens.css` or the file itself. `Waveform` is live and rendering on
`/explain/1/recording`, which is in this scope. Hard gate 3 requires both checker scripts to pass;
this fails one. Per critic-system's nuance: `--i` is a per-bar animation index set inline by the
component, not a smuggled color/space value — but the gate is binary on the command passing.
*Evidence:* `npm run tokens:check` output: `Undefined custom properties (1): src/components/waveform/waveform.css: var(--i) is not defined anywhere`. — critic-system
*Fix:* register `--i` as an expected non-token custom property in `scripts/check-tokens.mjs`, or
set the bar index via a data attribute + `nth-child` instead of an inline custom property.

**F3 — Skip's hit box is 29.77×48pt, under the 44pt floor, on every in-scope screen with a live Skip.**
Confirmed **independently and identically** by critic-system and critic-ux: `getBoundingClientRect()`
on `/explain/1`, `/explain/2`, `/explain/3`, `/explain/1/recording`, `/explain/1/not-heard` all
return `{width: 29.765625, height: 48}` for Skip. Root cause: `Button variant="Tertiary"` has no
side padding by design (`src/components/button/button.css:173-174` — "Tertiary has no fill, so it
has no side padding to hold one"), so the label alone defines the hit box. This is a documented
component contract, not a screen-level misuse — `Tertiary`/`S` is a valid Storybook variant — but
it is a verified, recurring hard-gate 2 failure.
*Evidence:* live `getBoundingClientRect()` measurements, both critics, five routes. —
critic-system, critic-ux
*Fix:* give `Tertiary` a minimum hit-box floor independent of label width (pad the invisible hit
area, not the visible label), or log Skip specifically as a gap in `component-gaps.md` since
`sprint-context.md` mandates `Tertiary` for it.

**F4 — Contrast: a recurring violet label sits at 4.42:1 against its card fill, under the 4.5:1 floor.**
`rgb(145,120,230)` label text (hint badge headers "Hint 1 of 2" / "Hint 2 of 2, the last one," and
the reveal screens' term-name label) on `rgb(34,36,47)` card fill measures **4.42:1** — 15px/600
weight, not large-scale text, so it needs 4.5:1. Recurs on every hint and reveal screen in scope:
`/explain/1/hint-1`, `/explain/1/hint-2`, `/explain/1/answer`, `/explain/1/answer/said-back`.
*Evidence:* rendered-pixel contrast measurement via `getComputedStyle` + luminance compositing
against the true ancestor background. — critic-ux
*Fix:* swap the label color to a token that clears 4.5:1 against `surface/raised`, or pair a
violet icon with `text/primary` text instead of coloring the text itself.

**F5 — The say-back screen's "chips ticked" state — a locked decision and a named SPEC requirement — was never built; it renders identically to the unticked reveal.**
Found **independently** by this session's own render pass and critic-craft. `sprint-context.md`:
"The say-back acknowledgement reuses the reveal screen with the key idea chips ticked... because
the answer should stay on view while the confirmation lands." `SPEC.md` screen 16 repeats "the key
ideas ticked." `RevealedAnswer.tsx`'s own comment overrides both with new, undocumented reasoning:
"They are unticked on both screens... the component offers no other state." Measured:
`/explain/1/answer` and `/explain/1/answer/said-back` both render all four `Chips` at
`data-active="False"` — pixel-identical chip rows, confirmed by direct screenshot comparison and
by DOM attribute read.
*Evidence:* `sprint-context.md:58`; `SPEC.md` screen 16; `src/app/explain/[term]/RevealedAnswer.tsx:14-17`;
`data-active` attribute read on both routes; side-by-side screenshot crop of the chip row on both
screens. — this session's render pass, critic-craft
*Fix:* either give `AnswerBlock`'s `Answer` kind a ticked-state prop driven by whether the screen
is the say-back acknowledgement, or update `sprint-context.md`/`SPEC.md` to record the reversal as
the current decision — right now the docs and the shipped code disagree.

**F6 — Screen-level compositions used across the entire in-scope surface were never promoted, well past the project's own "twice" threshold.**
`SessionAppBar` is imported by 13+ route files spanning every in-scope Idle, Recording and verdict
screen; `ActionStack`/`VerdictActions` backs every verdict screen in scope (8 files); `ButtonPair`
backs Idle and four more screens; `TermPrompt` backs Idle and Recording. None live in
`src/components/<kebab-name>/`, none has a `.stories.*` file. `component-gaps.md`'s own first line
is the rule being broken: "A thing that appears here twice gets built properly as a component with
a story instead." Each entry gives a considered, current rationale for staying inline — the log is
honest, not silently divergent — but the rubric's 9-anchor requires "anything listed twice... built
as a real component with a story," and this pattern is at dozens of call sites, well past the
6-anchor's "needed twice" trigger.
*Evidence:* `grep -rl "SessionAppBar" src/app/explain` → 13 files; `grep -rl "ActionStack" src/app/explain`
→ 9 files; `find src/components` → no matching directories. — critic-system
*Fix:* promote at minimum `SessionAppBar` and `ActionStack`/`VerdictActions` to `src/components/`
with a Storybook story each, and close the corresponding `component-gaps.md` entries as resolved.

**F7 — A locked spacing value doesn't match its own spec: the bottom-stack gap measures 8px, not the locked 16px.**
`sprint-context.md`'s locked build rules state "bottom stack gap Space/400" (16px, per
`--space-400` in `build/css/tokens.css:80`). Measured on both `/explain/1` and
`/explain/1/recording`, the gap between the mic zone and the button row is 8px (`--space-200`).
*Evidence:* `getComputedStyle('.idleScreen-bottom').gap` → `"8px"`; same on
`.recordingScreen-bottom`; `build/css/tokens.css:77,80`. — critic-craft
*Fix:* change the gap on the shared bottom-stack class from `var(--space-200)` to `var(--space-400)`.

**F8 — Full-width plan step rows are 48pt tall against the system's own 64pt convention for a tappable row.**
`design-system.md:264`: "If the whole row or card is tappable, it gets a Pressed state and at
least 64 of height." The plan's step rows ("What feudalism was," "Explain out loud") measure
343×48 on `/plan` and `/plan/in-progress` — clears the 44pt hard gate but misses the sprint's own
64pt convention that the rubric's 9-anchor measures against.
*Evidence:* `getBoundingClientRect()` on `/plan` and `/plan/in-progress`, both step rows. — critic-ux
*Fix:* raise the row height to 64 to match `termRow`'s own spec (358×64).

**F9 — `component-gaps.md`'s bottomNav entry is stale in the other direction — informational, not a penalty.**
The log states bottomNav tabs are "a 40×40 tap target, under the 64 working floor," but shipped
CSS gives each tab a 48×48 minimum, confirmed live on `/plan/mastered`. Passes the hard gate;
flagged only because the gap log has drifted from code in the direction of the code being ahead.
*Evidence:* `src/components/bottom-nav/bottomNav.css:41-51`; live measurement 48×48 ×2 on
`/plan/mastered`. — critic-system
*Fix:* update the `component-gaps.md` entry to close it — no code change needed.

**F10 — Minor: Skip's disabled state relies on a single, subtle opacity delta.**
Enabled Skip label is `rgb(244,242,255)` at full strength; disabled is `rgba(255,255,255,0.4)`.
Real and measured, and it does clear the "not color alone" bar (also `disabled:true`, no pointer
events) — noted for completeness, no fix prescribed.
*Evidence:* computed style on `/explain/1` vs `/explain/1/pass`. — critic-craft

**F11 — Minor: the hint ladder's cost curve is optional by spec, not enforced.**
`SPEC.md:208-209` confirms "Show answer" is available as early as hint-1 — a student can go
straight from "Hint 1 of 2" to the 0-XP reveal without a second hint or retry, at the same cost as
exhausting the full ladder. This is documented intent (serves "never trap the student") but sits
in tension with `sprint-context.md`'s stated reasoning that "a miss should cost hints, not the
answer." Flagged for awareness only.
*Evidence:* rendered `/explain/1/hint-1`; `SPEC.md:210`. — critic-ux

---

## Critic-ambition's read (Reach — advisory, not in the weighted total)

**Reach: 5/10** — every screen in this scope executes a locked `sprint-context.md` decision
competently, but none takes a risk beyond what was already decided for it.

What it settles for: the pass/pass-hinted split is resolved by assertion (copy + chips + XP line)
rather than by playing back the take that just earned it; `/plan/mastered` gives the rarest, best
outcome in the whole flow the smallest visual unit in the system (an inline `MascotMessage` at
size S, the same register as ToRevisit's partial-credit message beside it); the three Idle screens
repeat roughly 600px of empty `middleContent` doing no work for the student; the ToRevisit
calibration line — which `sprint-context.md` calls the whole mechanism for earned trust — is one
sentence in a small message bubble, no different in kind from any other status text on the page.

Two proposed patterns, each built from components already in `src/components`:

1. **Play back the take that earned the pass.** Insert `TakePlayer state="Default" surface="Page"`
   in `middleContent` on `/explain/1/pass`, `/pass-hinted`, and `/answer/said-back` — the only
   verdict screens where a take exists and isn't already offered back — so the student hears the
   exact answer that just passed rather than being told it passed. Cost: real plumbing —
   `script.ts` currently drops the take after Review/Checking, so it would need to be carried into
   three more routes — and it adds a tap target and real-time replay to a beat `sprint-context.md`
   wants short.
2. **Give the section's mastery moment the plan's biggest surface, not a bubble.** Lead
   `/plan/mastered`'s `middleContent` with `VerdictHeader verdict="Neutral" title="You got all 3
   terms right" showCaption={false} titleAs="h1"` — the same pattern `01 Home` already uses for a
   headline-led, non-turn moment with Knowie at size L — then drop the inline `MascotMessage`.
   Cost: `VerdictHeader` is described as "the top of a turn result," and stretching "turn" to
   "section" isn't explicitly licensed the way the Home usage is; also risks redundancy with
   `SectionHeader`'s adjacent "3 of 3 on your own."

Ambition's own uncertainty: least sure about proposal 2, for the reason given above — a designer
closer to the Figma file may have already ruled this out (visual competition with `SectionHeader`,
or a decision to keep `VerdictHeader` scarce) for a reason not written down in this repo.

---

## Each critic's blind spot

**critic-system:** Chrome tab-group state was unreliable mid-session — several `navigate` calls
silently reverted to a prior route on the next tool call, confirmed once by re-reading
`location.href` immediately after a navigate and getting the previous URL back. This cost a clean
live contrast-measurement pass and a full touch-target sweep of the plan screens' rows beyond the
two sampled. Attributed to the browser-automation tooling (four concurrent critic sessions sharing
the same Chrome extension) rather than the app, since a static Next.js route has no client-side
mechanism to self-navigate backward — but not fully ruled out. Did not exhaustively cross-read
`SPEC.md` beyond the specific rules it cited.

**critic-craft:** Same tab-group contamination, independently observed and more severe — tab
groups and URLs changed between its own consecutive tool calls with no navigation from it,
sometimes discarding a freshly set-up tab entirely. Treated a screenshot as trustworthy only when
its own accompanying tab-context URL matched the intended screen, re-shooting anything that
drifted, which cost most of its tool budget. Did not force `prefers-reduced-motion: reduce` (no
tool in its kit sets that emulation — read the source CSS instead, which is source-level
corroboration, not rendered proof), did not resize to the SE width, did not capture a true
pressed-state screenshot (tap-and-hold isn't expressible with available click actions), and did
not time the 2.5s/7s waits (out of this scope's screen list regardless).

**critic-ux:** Same shared-tab churn, independently confirmed via `window.location.href` mismatches
immediately after navigation and tab-group teardown/recreation on `tabs_context_mcp` calls. Entered
verdict and plan states directly by URL (explicitly permitted) rather than by a continuous
click-through, cross-checking each against `SPEC.md`'s per-screen "Can do" contracts instead of
proving them by interaction. Could not reliably test `:focus-visible` (Tab-key focus landed
inconsistently amid the churn) or live reduced-motion emulation — read `waveform.css`,
`checkingScreen.css`, `skeleton.css` instead, source-verified corroboration only. Did not touch the
mic-denied route, leave-confirm sheet, or resume prompt, per this task's explicit exclusion.

**critic-ambition:** Did not render `/explain/summary`, `/explain/intro`, `/explain/[term]/checking`,
or the text-mode screens (outside its assigned scope), so it can't say whether the mastery-signal
gap it names on the pass screens is already addressed better in the summary or revisit-done
screens it wasn't asked to look at — if so, proposal 1 may be partially redundant with something
already built there.

**Shared methodology note:** all three adversarial critics independently reported the same
symptom — Chrome tabs and URLs changing between their own consecutive tool calls with no
navigation from them — consistent with four critic subagents sharing one Chrome extension
concurrently rather than any defect in the app itself (none found a client-side redirect mechanism
that could explain it in source). Each critic mitigated by confirming `location.href` at capture
time and re-shooting anything that drifted; findings above are drawn only from citations each
critic reports as URL-confirmed at capture. This session's own render pass, run before the critics
were launched and without that contention, is the cleanest single evidence source for the screens
it covered and is treated as corroborating, not superseding, the critics' independently confirmed
findings.
