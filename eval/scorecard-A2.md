# Scorecard A2 — Idle, Recording, Results (verdict tier), Plan screens

Scoped review of the same four screen groups as `eval/scorecard-A1.md`, against `eval/rubric.md`:

| Group | Screens | Routes |
|---|---|---|
| Idle | 06 Idle | `/explain/1`, `/explain/2`, `/explain/3` |
| Recording | 07 Recording | `/explain/1/recording` |
| Results (verdict tier) | 10 Got it, 10b Got it after a hint, 11 Hint 1 of 2, 12 Partial hint 2 of 2, 12b Last attempt, 13 Answer revealed, 13b Answer revealed said back, 09c Didn't catch that | `/explain/1/pass`, `/pass-hinted`, `/hint-1`, `/hint-2`, `/last-miss`, `/answer`, `/answer/said-back`, `/not-heard` |
| Plan screens | 02 Nothing started, 03 In progress, 19 1 of 3 unaided, 21 Section mastered | `/plan`, `/plan/in-progress`, `/plan/to-revisit`, `/plan/mastered` |

**Method.** This session first rendered every state above at a confirmed 390px `.appFrame` width in
dark mode and screenshot-compared every pair that carries different meaning, per hard gate 4 —
run alone, before any critic started, to avoid the Chrome-tab contention scorecard-A1 hit. Three
adversarial critics (critic-system, critic-craft, critic-ux) then each graded two rubric
dimensions in an isolated context — given only these four screen groups, `eval/rubric.md`, and
their own dimensions, with no access to each other's output, to this session's render pass, or to
scorecard-A1. critic-ambition gave a separate, advisory Reach read, also blind. All four critics
ran concurrently and independently hit the same shared-Chrome-tab contention scorecard-A1
documented; each mitigated it by re-confirming `location.href` inside the same call that captured
its evidence.

## Total: 5.75 / 10

| # | Dimension | Score | Weight (table) | Weighted | Critic |
|---|---|---|---|---|---|
| 1 | System fidelity | 7/10 | 20% | 1.40 | critic-system |
| 2 | Coherence | 5/10 | 25% | 1.25 | critic-craft |
| 3 | Craft | 5/10 | 15% | 0.75 | critic-craft |
| 4 | UX judgment | 6/10 | 25% | 1.50 | critic-ux |
| 5 | Accessibility | 4/10 | 10% | 0.40 | critic-ux |
| 6 | Structure | 9/10 | 5% | 0.45 | critic-system |

**Rubric weight conflict — still unresolved, carried from scorecard-A1.** `eval/rubric.md`'s
summary table (used above) gives Coherence 25% / Craft 15% / UX 25% / Accessibility 10%. The six
section headers give Coherence 20% / Craft 20% / UX 20% / Accessibility 15% instead, also summing
to 100. Scoring this run's six numbers under the header scheme gives **5.65/10**, not 5.75. Still
unresolved in the rubric file itself; not this review's to fix.

**Two of four hard gates fail on this screen set.** Gate 3 (no raw hex / no fallback) now passes
clean — the only one of scorecard-A1's four gate failures confirmed fixed. Gates 1, 2 and 4 still
fail, on partly different evidence than A1 found (see below); the caps they impose don't move any
score numerically, since both capped dimensions (Accessibility, Coherence) are already at or below
the cap for other, independently-scored reasons.

---

## Hard gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Contrast 4.5:1 body text | **Fail** | critic-ux measured the disabled `Skip` label — `rgba(255,255,255,0.4)` alpha-composited onto the `rgb(9,12,24)` scaffold background — at **3.78:1**, on every resolved verdict screen in scope (`/explain/1/pass`, `/hint-2` after retry-exhausted, `/last-miss`, `/answer`). This is a **different** instance than scorecard-A1's F4 (a violet label at 4.42:1 on hint/reveal cards): no critic this round re-flagged that specific violet-label contrast, consistent with it having been fixed, but the disabled-Skip contrast is a newly-surfaced failure of the same gate. Neither critic-system nor critic-craft independently measured contrast this round (outside their assigned dimensions). |
| 2 | Touch targets 44pt | **Fail** | critic-ux measured two independent classes of sub-44pt live interactive controls: `mascotMessage`'s action links — "Practice sooner" **128×20pt** on `/plan/mastered`, "Do it now anyway" **136×20pt** on `/plan/to-revisit`, both real `<a>` elements with zero padding — and the key-idea chips, which render as real, focusable `<button aria-pressed="false">` toggles at **32pt tall** on `/explain/1/pass`, `/pass-hinted`, `/answer`, `/answer/said-back`. Neither critic-system nor critic-craft re-measured `Skip`'s hit box this round (scorecard-A1's F3, 29.77×48), so its status is unconfirmed, not cleared. |
| 3 | No raw hex / no `var(--token, fallback)` | **Pass** | critic-system ran `npm run tokens:check` ("All custom properties resolve (343 tokens defined)") and `npm run check:tokens` ("No raw hex colours in src/"), both clean. Scorecard-A1's F2 (`var(--i)` undefined in `waveform.css`) does not reproduce — consistent with the "Fix scorecard-A1's four hard gates" commit. |
| 4 | No two states that should differ rendering identically | **Fail, on one specific pair** | This session's own render pass and critic-craft **independently** confirmed `/explain/1/answer` and `/explain/1/answer/said-back` still render all four key-idea `Chips` pixel-identical and DOM-identical (`data-active="False"` on both) — an exact reproduction of scorecard-A1's F5. Every other pair in scope — the three Idle screens, Idle vs Recording, all seven verdict-tier pairs, and all four Plan screens against each other — was independently confirmed by the render pass and by whichever critics touched them to differ in more than one channel. |

Capped dimensions: **Accessibility** (gates 1 & 2) is already at 4/10 from critic-ux's own
scoring, below the cap. **Coherence** (gate 4) is already at 5/10 from critic-craft's own scoring,
at the cap, so no numeric change either way.

---

## Findings

Ordered most-severe first. Every finding is from a critic's rendered/measured evidence, or this
session's own render pass, unless marked otherwise.

**F1 — `Skip` stays fully live and enabled during an actual in-progress recording, risking a silent, unconfirmed loss of the take in progress.**
Found **independently** by critic-craft and critic-ux. On `/explain/1/recording`, mid-take
("Listening, 0:03", live waveform), `Skip` renders as `<a data-state="Default" href="/explain/2">`
— not `disabled` — identical to its enabled state at Idle. `sprint-context.md`'s own rule is "Skip
disabled once the term is in flight," and a live recording is the clearest case of "in flight"
there is; a mis-tap here discards the in-progress take and jumps to the next term with no confirm.
Skip correctly renders `disabled=true` on resolved verdict screens (`/last-miss`, `/pass`),
confirming this is a Recording-specific gap, not a global one.
*Evidence:* DOM read on `/explain/1/recording`: `{tag:"A", href:"/explain/2", ariaDisabled:null,
cs:{opacity:"1", pointerEvents:"auto"}}` — critic-craft. Independently: `data-state="Default"` on
the same element, contrasted against correctly-disabled `Skip` on resolved screens — critic-ux.
*Fix:* Disable `Skip` the moment the `Recording` route mounts, the same way `answer/page.tsx` and
`answer/said-back/page.tsx` already pass `skipState="Disabled"` for resolved terms.

**F2 — `mascotMessage`'s action link measures ~20pt tall on both Plan result screens — a hard-gate touch-target failure on the flow's own re-entry point.**
critic-ux measured "Practice sooner" (`/plan/mastered`) at **128×20px** and "Do it now anyway"
(`/plan/to-revisit`) at **136×20px** — both real `<a>` links, zero padding, parent bounding box
identical to the link's own box (the actual hit target, not a visual crop of a larger one). These
are the links that start the next recall session; under half the 44pt floor.
*Evidence:* `getBoundingClientRect()` on both routes: `{"rect":{"w":128,"h":20}}` (Mastered),
`{"rect":{"w":136,"h":20}}` (ToRevisit); computed `padding: 0px`, `minHeight: auto`. Source:
`src/app/plan/planData.ts:184` and `:160`. — critic-ux
*Fix:* Give the action its own tappable row inside `mascotMessage` — full label width, minimum
44×44, ideally the sprint's own 64pt row convention — not an inline text link sized to its glyphs.

**F3 — Key-idea chips are live, focusable, `aria-pressed` toggle buttons at 32pt tall that do nothing when activated.**
critic-ux found each chip on `/explain/1/pass`, `/pass-hinted`, `/answer` and `/answer/said-back`
renders as `<button type="button" aria-pressed="false" data-active="False">`, `tabIndex 0`, not
disabled — a genuine interactive control in the tab order, announced to assistive tech as
pressable, 32pt tall. Nothing observable happens on activation (chips never tick — a known,
already-logged divergence, see F5). This compounds two separate problems: a hard-gate touch-target
failure, and a false affordance for anyone using a keyboard or screen reader.
*Evidence:* `getBoundingClientRect()` on `/explain/1/answer`: `{"text":"Land","w":50,"h":32}` and
all siblings `h:32`; `outerHTML`: `<button type="button" class="knowieChips" data-size="S"
data-color="Primary" data-active="False" aria-pressed="false">`. — critic-ux
*Fix:* If the chips are purely informational, render them as non-interactive elements (no
`aria-pressed`, not in the tab order) rather than disabled-looking buttons; if a future tap-to-
expand interaction is intended, bring the hit box to 44×44 and give `aria-pressed` a real effect.

**F4 — Disabled `Skip`'s label sits at 3.78:1, under the 4.5:1 floor, on every resolved verdict screen in scope.**
`rgba(255,255,255,0.4)` label text, alpha-composited onto the `rgb(9,12,24)` scaffold background,
measures **3.78:1** — 15px text, not large-scale, needs 4.5:1. Recurs on `/explain/1/pass`,
`/explain/1/hint-2` (after retry-exhausted), `/explain/1/last-miss`, `/explain/1/answer`. Measuring
at the outer `<button>` level (`color: rgb(244,242,255)`, `opacity:1`) would wrongly read ~17.6:1 —
the dimming lives on the nested `.knowieButton-label` span, which is where critic-ux measured it.
*Evidence:* rendered-pixel alpha-compositing against the true ancestor background. — critic-ux
*Fix:* Raise the disabled label's opacity to clear 4.5:1 (roughly 0.55+), or explicitly adopt
WCAG's own exemption for disabled controls rather than leaving it uncleared by omission.

**F5 — The say-back screen's chips still render identically to the unticked reveal — unchanged since scorecard-A1, and the file's own comment still overrides the locked decision.**
Found **independently** by this session's own render pass and critic-craft, reproducing
scorecard-A1's F5 exactly. `/explain/1/answer` and `/explain/1/answer/said-back` both render all
four `Chips` at `data-active="False"` — pixel-identical and DOM-identical. `sprint-context.md` and
`SPEC.md` both call for the say-back screen to reuse the reveal "with the key idea chips ticked";
`RevealedAnswer.tsx`'s own comment still states the opposite ("they are unticked on both screens").
Per this session's memory of prior review of this repo, this specific gap is a known, accepted
current-behavior divergence rather than a fresh regression — carried here because it is still a
live hard-gate-4 failure regardless of its history.
*Evidence:* `data-active` attribute read on both routes; side-by-side screenshot crop of the chip
row on both screens. — this session's render pass, critic-craft
*Fix:* Either give `AnswerBlock`'s `Answer` kind a ticked-state prop driven by whether the screen
is the say-back acknowledgement, or update `sprint-context.md`/`SPEC.md` to record the reversal as
the current decision.

**F6 — `/plan/mastered` still tells a student who got everything right that their terms are coming back anyway — unchanged since scorecard-A1's F1.**
Found **independently** by critic-craft and critic-ux. `sprint-context.md`'s locked rule: "hinted,
revealed and skipped terms come back on a date Knowie names, unaided ones do not — a consequence
the student can see beats a claim they have to believe." `/plan/mastered` (3 of 3 unaided) still
reads "You got all 3 terms right" beside "I'll bring them all back Thursday, 2 days before your
exam" with a "Practice sooner" CTA — the same re-testing framing as the ToRevisit path, for a
section with nothing left to revisit. `planData.ts`'s own comment confirms this is deliberate, not
an oversight: the helper "keeps a date, and now says all three come back rather than 'it.'"
*Evidence:* `src/app/plan/planData.ts:183`, comment at `:173-174`; rendered `/plan/mastered`. —
critic-craft, critic-ux
*Fix:* Drop the "bring back"/date framing on Mastered entirely — nothing is due.

**F7 — `/plan/to-revisit`'s calibration copy is vaguer than Mastered's, inverting which screen should carry the date.**
critic-craft found `/plan/to-revisit`'s helper reads "Try them on your own in a couple of days" —
no date — while `/plan/mastered`, the state that shouldn't be scheduling anything, gives an exact
date and reason ("Thursday, 2 days before your exam"). The rubric's own Coherence-9 anchor and the
locked decision both expect the *revisit* screen to be the one naming the date. `planData.ts`'s own
comment acknowledges the ToRevisit helper "carries the advice rather than a date" as a deliberate
departure.
*Evidence:* `src/app/plan/planData.ts:159` (ToRevisit helper) vs `:183` (Mastered helper), comment
at `:144-150`. — critic-craft
*Fix:* Give `PLAN_TO_REVISIT`'s helper a specific date (e.g. "Manorialism and serfdom come back
Thursday"), matching the mechanism `PLAN_MASTERED` already uses.

**F8 — The record button moves 20px between Idle and Recording, contradicting the component's own rule and the code's own comment.**
critic-craft measured `.knowieRecordButton`'s `top` at `427px` on `/explain/1` (Idle) and `447px`
on `/explain/1/recording` — a 20px downward shift. `recordButton`'s Figma description states "Stop
occupies the same position as start, so the thumb does not move," and
`recordingScreen.css:4-7`'s own comment claims the mic zone is "unchanged... so the record button
does not move" — a claim the measured layout contradicts, because `RecordingTake.tsx` inserts a
status line and waveform above the button with nothing compensating for the added height.
*Evidence:* `getBoundingClientRect()` on `.knowieRecordButton`, same tab, re-verified: Idle
`top:427`, Recording `top:447`. Source: `recordingScreen.css:4-9`, `RecordingTake.tsx:63-90`. —
critic-craft
*Fix:* Reserve the status-line + waveform height inside `.recordingScreen-micZone` (a spacer, or
absolute positioning above the zone) so the button's rect is identical across both screens.

**F9 — "Unaided" is reused as plain English directly beside a "revealed" outcome tag it contradicts.**
critic-craft found `/explain/1/answer/said-back`'s caption reads "You said it back in your own
words, unaided." directly above "+0 XP · revealed." "Unaided" is a loaded taxonomy word everywhere
else in the product (meaning full-XP, no-hint) — reusing it colloquially one line above a
contradicting outcome tag is the Coherence-4 failure mode by name. The screen's own code comment
concedes the risk: "'unaided' in the caption is about the saying-back, not the term."
*Evidence:* `/explain/1/answer/said-back` caption text; `src/app/explain/[term]/answer/said-back/page.tsx:53-60`. — critic-craft
*Fix:* Drop the taxonomy word from this caption — e.g. "with nothing in front of you" — so
"unaided" keeps exactly one meaning across the product.

**F10 — Bottom-stack gap still measures 8px against the locked 16px (Space/400) rule — unchanged since scorecard-A1's F7.**
critic-craft measured `gap: 8px` (`--space-200`) on both `.idleScreen-bottom` and
`.recordingScreen-bottom`, against `design-system.md`'s locked "bottom stack gap Space/400" (16px).
*Evidence:* `getComputedStyle()` reads; `tokens/tokens.json:906-912`. Source:
`idleScreen.css:7-10`, `recordingScreen.css:11-15`. — critic-craft
*Fix:* Change both classes' `gap` to `var(--space-400)`, or correct `design-system.md` if the
locked rule was only ever meant for the Review screen's stack.

**F11 — Full-width `stepperStep` rows still measure 48pt against the system's own 64pt convention — unchanged since scorecard-A1's F8.**
critic-ux measured all five `stepperStep` rows across `/plan`, `/plan/in-progress`,
`/plan/to-revisit` and `/plan/mastered` — including the "Explain out loud" entry-point row — at a
uniform 343×48. Clears the 44pt hard gate but misses the sprint's own 64pt floor for a tappable
full-width row (`termRow` is 358×64).
*Evidence:* `getBoundingClientRect()` on all five rows; `design-system.md:264, 313`. — critic-ux
*Fix:* Raise `stepperStep`'s row height to 64, matching `termRow`.

**F12 — The mic-zone label/helper duplication `component-gaps.md` itself calls "due to be built once" is still deferred, not built.**
critic-system confirmed `idleScreen.css` and `recordingScreen.css` define an identical
`.{screen}-micZone { gap: var(--space-300); padding-top: var(--space-200); }` rule, and
`component-gaps.md:9` states outright: "Second screen to need it, so by the rule above it is due
to be built once... Deferred rather than done, because it means editing a screen that is already
signed off." This is the rubric's System fidelity-6 anchor by name — logged honestly, but past the
project's own "twice" threshold and still unbuilt.
*Evidence:* `component-gaps.md:9`; `idleScreen.css:13-19` vs `recordingScreen.css:17-23`
(identical token values). — critic-system
*Fix:* Build the shared `MicZone` component `component-gaps.md` already names as due, with a
story, in `src/components/`.

**F13 — The key-idea chip colour override is duplicated across two files, repeating a pattern design-system.md already flags as a known violation.**
critic-system found `answerBlock.css` and `coveredIdeas.css` each independently override
`.knowieChips` to `interactive/secondary`/`interactive/onSecondary`, since `chips` has no variant
for "label, not a control." Logged in `component-gaps.md` and correctly attributed as awaiting an
owner's decision — not invented or forked — but it's a second live instance of the same override
shape `design-system.md`'s own "Where the file currently breaks these rules" section already
names.
*Evidence:* `coveredIdeas.css:57-61`; `component-gaps.md` ("`chips` has no colour for a key-idea
chip"). — critic-system
*Fix:* No screen-level fix available under current rules; needs the design owner's variant
decision, per the gap log's own note.

**F14 — Minor, no action: one extension-level console exception, not app code.**
critic-system saw `[EXCEPTION] Error: A listener indicated an asynchronous response...` once on
`/explain/1/hint-1`, sourced to `http://localhost:3000/explain/1/hint-1:0:0` (no file/line into
`src/`) — the standard Chrome-extension messaging error, not reproduced on a clean re-navigation.
Not counted against Structure.
*Evidence:* console read, tabId 294124788. — critic-system

---

## Critic-ambition's read (Reach — advisory, not in the weighted total)

**Reach: 6/10** — one deliberate risk holds up: after the third miss, `/explain/2/last-miss` stops
rather than auto-advancing to the reveal, forcing a tap through "Show me the answer" instead of
sweeping the student forward (`src/app/explain/[term]/last-miss/page.tsx:9-11`, "tapping is what
you do"). The rest of the flow sits at 5.

What it settles for: `/explain/1/pass` and `/pass-hinted` render the identical `CoveredIdeas` chip
row at the same size regardless of whether the pass was clean or hinted, pushing the entire felt
distinction onto a caption sentence and an XP number — `CoveredIdeas.tsx` states outright that only
`aria-pressed` still tells them apart. The three Idle screens are structurally identical templates
with only the prompt and progress fill changing — nothing acknowledges what the previous term cost
or earned. `/explain/2/answer` vs `/answer/said-back` push their entire distinction into one
caption swap and which button is primary, on the same unchanged chip row. `/plan/to-revisit` and
`/plan/mastered` are the strongest material in scope — a real, revisitable plan-state change rather
than a one-off summary claim — but neither goes further than the locked count and a generic
scheduling line.

Three proposed patterns, each built from documented props on components already in
`src/components`:

1. **Scale the mastery signal instead of captioning it.** Render `CoveredIdeas`' chip row at
   `chips size="M"` on a clean unaided pass and keep `size="S"` on a hinted pass — same component,
   same active state and colour rule, only the documented size axis changes, so a clean pass reads
   physically heavier. Cost: two now-divergent presentations to maintain, and the larger row needs
   a wrap check at 390px with four multi-word ideas.
2. **Name the terms, not just the count, on the revisit trigger.** Under `/plan/to-revisit`'s
   `mascotMessage`, add a labelled `chips size="S" active="False"` row naming the specific terms
   still owed, reusing `CoveredIdeas`' own established pattern. Cost: repeats the
   button-shaped-but-not-pressable accessibility problem `CoveredIdeas` already had to solve, and
   busies a screen `sprint-context.md` scoped as "one line and nothing else."
3. **Carry the session's own memory into the next idle screen.** Above the prompt on term 2's and
   term 3's idle screens, show the prior term's name beside a `statusTag` naming its outcome.
   Least certain of the three: `statusTag`'s own description scopes it to the summary list, so a
   badge on an idle screen is a defensible but unlicensed reading — flagged as a decision to make,
   not a build to just do.

Ambition's own uncertainty: did not render `/explain/3` directly (inferred it shares
`[term]/page.tsx`'s template from source); least sure of proposal 3, since a restraint instinct
around `mascotFigure` ("never let a pose be the only thing carrying a verdict") or a reduced-motion
constraint not visible from a static render could rule it out faster than expected.

---

## Each critic's blind spot

**critic-system:** Could not get a reliable SE-width (375px) overflow measurement —
`resize_window` reported success but `window.innerWidth` kept reading back 2560 regardless — so it
fell back to reading `globals.css`'s `min(390px, 100vw)` rule as a structural, source-level
argument against overflow rather than a rendered/measured one; the Structure score's SE-width
component rests on source, not a confirmed screenshot. Also hit the same shared-Chrome-tab
contention as the other critics (its assigned tab self-navigated mid-task); mitigated by opening
and using its own fresh tab for every measurement cited, closed when done.

**critic-craft:** Same shared-tab contention, independently observed (tab IDs it created were
navigated to other routes between its own calls); mitigated by re-verifying `location.pathname` in
the same call that captured every measurement. Could not reliably force
`prefers-reduced-motion: reduce` or test pressed/focus-visible states with real interaction (no
tool exposes OS-level media-feature emulation or genuine mouse-down/tab-key events) — the
reduced-motion and pressed-state claims implicit in its Craft score rest on reading CSS source, not
on rendered proof.

**critic-ux:** Same shared-tab contention, independently confirmed; mitigated the same way. Could
not test `prefers-reduced-motion` for the same tooling reason, so both principles' reduced-motion
requirements are unverified rather than assumed passing. Per the assigned scope, did not test the
leave-mid-session confirm, the resume prompt, the permission primer/denied route, or the
processing/"Still thinking" wait — none of their routes are in this scope's four screen groups.

**critic-ambition:** Did not render `/explain/3` directly — inferred from source that it shares
`[term]/page.tsx`'s template with `/explain/1` and `/explain/2`, which is a fair reading of a
single shared route file but not something it watched load.

**Shared methodology note:** all three adversarial critics independently reported the same
symptom this run as scorecard-A1 did — a shared Chrome tab group being navigated by other
concurrent sessions between their own consecutive tool calls. Each mitigated by confirming
`location.href`/`location.pathname` inside the same call that captured its evidence, and by
opening a dedicated tab where needed. This session's own render pass, run alone before any critic
started, had no such contention and is treated as corroborating, not superseding, the critics'
independently-confirmed findings.
