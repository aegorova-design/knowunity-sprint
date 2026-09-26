# Explain out loud — prototype rubric

Grades the built prototype (`src/app`, `src/components`, `tokens/tokens.json`) against
`design-brief.md`, `voice-ux.md`, `design-system.md` and `sprint-context.md`.

Every dimension is scored 1–10. The weights below are the ones set for this eval;
the percentages are the High/Medium/Low bands spread to sum to 100.

| #   | Dimension       | What it asks                                                               | Weight       |
| --- | --------------- | -------------------------------------------------------------------------- | ------------ |
| 1   | System fidelity | Does every value trace back to a token, and every component to the library | High (20%)   |
| 2   | Coherence       | Does it read as one product, or as screens that arrived separately         | High (25%)   |
| 3   | Craft           | Spacing, rhythm, states, the small deliberate decisions                    | High (15%)   |
| 4   | UX judgment     | Are the states handled, the hierarchy clear, the failure paths designed    | High (25%)   |
| 5   | Accessibility   | Contrast, touch targets, whether meaning ever rests on color alone         | Medium (10%) |
| 6   | Structure       | Does the layout hold together and the thing render                         | Low (5%)     |

Weighted total out of 10. The hard gates at the end are pass/fail and sit outside the score.

---

## 1. System fidelity — High (20%)

**What it's scoring.** Whether the prototype is an instance of the design system or a
lookalike of it. Two questions: does every colour, space, radius and type value resolve
through `tokens/tokens.json` via `build/css/tokens.css`, and is every piece of UI either
a documented component from Storybook or a logged gap in `component-gaps.md` — never a
quiet fork, detach or reinvention.

**Verify by:** `npm run tokens:check` and `npm run check:tokens`; reading computed styles
in the rendered page, not just the CSS source; cross-reading each screen's components
against the Storybook docs and `component-gaps.md`.

**4 — It uses the system's vocabulary but not its machinery.**
Tokens appear, and so do raw values beside them: a `#1A1A1A` in a screen's CSS module, a
hand-set `padding: 18px` where no Space step is 18, a `var(--token, #333)` fallback
smuggling a value in. Components are imported and then overridden until they are something
else — a `Button` restyled into a record button, a `statusTag` with its label edited on the
instance. Nothing is written down in `component-gaps.md`, so the divergence is invisible
until you diff it.

**6 — Tokens hold, components mostly hold, the seams are undocumented.**
Both checker scripts pass. Screens compose real components. But one or two things were
built inline that a component already covers, or a component was stretched past its own
description — `takePlayer` on a screen where nothing was recorded, `recordButton` in the
Recording variant while no audio is live, `answerBlock kind="Hint"` carrying key ideas.
`component-gaps.md` has entries but they lag the code, and something on it has now been
needed twice without being promoted to a real component. This is the honest ceiling for
"it looks right and I read the CSS."

**9 — The system is the source and the prototype is downstream of it.**
Every value resolves through the semantic layer; the only hand-set numbers are the ones
design-system.md already licenses (iPhone geometry: the 390×844 canvas, the home
indicator pill). Every component is used inside its own Figma description's rules,
including its nevers — one `interactive.primary` per screen, `mascot.primary` only with
Knowie on screen, the variant driving nested meaning once (`termRow` setting its badge and
`statusTag` together). Anything the library didn't have is in `component-gaps.md` with the
screen that needed it, and anything listed twice has been built as a real component with a
story. The known system violations in design-system.md are not reproduced in the code.

---

## 2. Coherence — High (20%)

**What it's scoring.** Whether 30 routes read as one session. Does the same idea look the
same everywhere — the outcome taxonomy (unaided / hinted / revealed / skipped), the
section result (Mastered / ToRevisit), the verdict trio (Pass / Partial / Miss), Knowie's
voice — and does the flow's logic hold across screens that were built days apart.

**Verify by:** clicking the whole scripted run end to end at 390px (plan → session →
summary → plan → revisit home), plus the text-mode run and the denied-permission run;
screenshotting the verdict screens side by side; diffing the copy against
`sprint-context.md`'s locked decisions.

**4 — Screens that each work and don't agree.**
The same outcome is "hinted" on one screen and "with help" on another. Knowie is warm on
the pass screen and clinical on the miss. Two verdict screens put their primary button in
different places or at different sizes. The summary's numbers don't reconcile with the run
the student just did — a rounder XP figure than the scripted 25, or an unaided count the
per-term rows don't add up to. Text mode looks like a different feature.

**6 — Consistent components, drifting details.**
The stack is the same everywhere and the taxonomy is used correctly. Drift is in the small
things: the supporting-action pair is `Secondary M` on three screens and `Tertiary` on the
fourth; one button is missing its icon against the locked rule that every button carries
one (mic for record, keyboard for Type instead); the scheduling line on `mascotMessage`
names a date the summary never mentioned. Recognisably one product, visibly assembled.

**9 — Nothing betrays the build order.**
The verdict screens are one family: same `verdictHeader` rhythm, same outcome line in the
same slot under the actions ("+15 XP · unaided" on a pass, the outcome word alone on a 0,
"revealed" on the reveal screens). The session's state travels intact — the scripted run
yields exactly 1 of 3 unaided and 25 XP, the summary rows say so, `sectionHeader` reads
"1 of 3 on your own", `mascotMessage` reads ToRevisit and its helper names the revisit
date, and the revisit home counts the terms actually due off the same source. Text mode is
the same session in another modality: sticky across terms, same outcomes, never marked as
the lesser path. Knowie's voice is one voice — sentence case, no praise for a skip, no
calibration copy on a reveal.

---

## 3. Craft — High (20%)

**What it's scoring.** The decisions a senior designer makes without being asked. Vertical
rhythm and optical alignment, whether every interactive thing has its pressed / disabled /
focus state, whether motion serves status rather than decorates it, and whether the copy
was written or defaulted.

**Verify by:** rendering each screen at 390 and at the SE width; measuring gaps against
Space steps in the inspector; tapping every control for its pressed and disabled state;
running the loop with `prefers-reduced-motion: reduce` set; timing the 2.5s waits and
term 2's ~7s wait against the 5s threshold.

**4 — Composed, not tuned.**
Spacing is arbitrary between blocks even when tokens are used for each — the mic zone's
lead-in and gap differ between Idle and Recording, `bottomContent`'s padding isn't the
locked 32 top and bottom. Pressed states are missing on tappable rows. Skip sits live
while the term is in flight, or dead where the student can still act. Copy is placeholder-
adjacent: "Body", "Message", a "1/2 words" ghost, or a label in Title Case.

**6 — Clean and unremarkable.**
The locked build rules are followed: the recording stack in order, brand violet on live
audio and nowhere else, supporting actions as `Secondary M` at 48 tall with a background,
progress at thickness 24 with no "1 of 3" label and 0 on the first term. States exist.
Nothing is ugly and nothing is considered. Reduced motion probably just turns animation
off wholesale. This is what "looks good" scores.

**9 — Every small decision is defensible out loud.**
The recording timer is real elapsed time and so is the take's duration, because that's the
one part of the loop the student controls. Reduced motion freezes decoration and keeps
status — waveform bars, the skeleton shimmer and the XP count-up stop while
the timer, the progress indicator and every copy change keep running, and the processing
screen steps "Sending your answer" → "Checking it" so something still evidences life. A
tap during processing is acknowledged rather than ignored. Past 5s the wait gains "Still
thinking" and a way out. Cancel returns to Idle, Record again discards and restarts. Key
idea chips appear on pass and reveal and never on a hint screen, where they'd give it
away. The say-back acknowledgement reuses the reveal screen with the chips ticked so the answer stays on view. Copy is specific, sentence case, and says the thing.

---

## 4. UX judgment — High (20%)

**What it's scoring.** Whether the six principles in `voice-ux.md` are designed into the
screens rather than cited: system status at every moment, the student owning start and
stop, in-context permission with a designed "No", generous judging that separates misheard
from didn't-know, a non-voice path always one tap away, and the wait designed as a state.
Plus the brief's non-negotiable: never trap the student.

**Verify by:** walking `voice-ux.md`'s states-to-design table and reaching each "Must" row
in the running prototype; trying to get stuck (close mid-session, deny the mic, say
nothing, leave and come back, skip from a hint screen); checking the summary claims only
what the session measured.

**4 — The happy path is designed and the rest is assumed.**
Idle, recording and a result exist. Processing is a spinner or absent, so the ~2.5s and
the 7s waits read as a freeze. Permission is requested cold or the denied state
dead-ends. Text fallback exists on one screen instead of every answerable state. The
summary asserts mastery the run didn't earn.

**6 — All the Must states exist, the hard ones are thin.**
Idle, recording, cancel-and-re-record, processing, pass/partial/miss, the hint ladder,
skip, text fallback, the primer and the denied route are all reachable. But the wait is a
single flat state with no 5s escape; "Didn't catch that" either doesn't exist or costs the
student a rung on the ladder; the leave-mid-session confirm is missing so two terms of
work go to a mis-tap; the summary is accurate but inert — it reports and nothing follows
from it.

**9 — The failure paths are the designed part.**
Status is unmistakable at every moment and never carried by one channel alone. The ladder
is exactly hint 1 → retry → hint 2 → retry → reveal, "I don't know" routes to one hint and
the reveal rather than the full ladder, and a wrong answer after hint 2 gets a beat naming
the miss before the answer. Skip is live wherever the student can still act, including the
hint screens, disabled once the term is in flight, and a skip jumps to the next term
without revealing. A no-audio take is caught as "Didn't catch that" and costs no rung,
because a mic failure is not a knowledge failure. Text is a session-level mode reachable
from every answerable state, sticky once chosen, with Switch to voice on every text
screen — and Turn on voice routing to permission help when the mic is denied, so no
affordance sits there unusable. Leaving goes through a confirm; returning offers Continue
primary and Start over secondary. And the summary claims a count of unaided terms and
nothing more: the calibration is carried by the revisit schedule the student can see, not
by copy they have to believe.

---

## 5. Accessibility — Medium (15%)

**What it's scoring.** Whether the dark-mode-only prototype is usable by someone with low
contrast sensitivity, colour vision deficiency, a large finger or a motion sensitivity —
and whether any verdict, status or outcome would survive greyscale.

**Verify by:** measuring contrast on rendered pixels against the actual background behind
the text, not against token intent; measuring hit boxes in the inspector; screenshotting
the verdict and summary screens and desaturating them; running with reduced motion on;
tabbing the flow for focus-visible; checking icon-only controls for accessible names.

**4 — Colour is doing work alone somewhere that matters.**
Pass / partial / miss differ by headline colour and mascot pose, both of which vanish in
greyscale. Body text sits under 4.5:1 — a caption on a surface fill, a disabled-looking
secondary label. Controls under 44pt: `bottomNav`'s 40×40 tabs, a chevron-only row, an
icon button with no accessible label.

**6 — Passes the checks, doesn't go past them.**
Body text clears 4.5:1, targets clear 44pt, outcomes carry an icon and a label as well as
a colour. But the redundancy is inherited from the components rather than reasoned about:
focus-visible exists only where a component happened to ship it, an icon-only control has
a label that names the icon instead of the action, reduced motion kills the animation that
was the only evidence the app was working.

**9 — Meaning never rests on one channel, and it was measured.**
Every outcome reads in greyscale: `termRow` and `statusTag` carry icon, label and colour;
`verdictHeader`'s headline names the result in words; `stepperStep` is a shape before it is
a colour — dashed ring, empty ring, half-filled, filled. Contrast is measured on the
rendered screen and recorded, including text over Knowie's artwork and inside sheets, and
the failures found in the source system (the invisible snackbar action, Caption S, tight
body line height) are not repeated. Targets meet 44pt with 64 held as the floor for a
tappable full-width row, per the sprint components' own convention. The waveform is never
the only thing telling the student what's happening — a label, a timer and an icon carry
it too — and reduced motion keeps every status signal alive.

---

## 6. Structure — Low (5%)

**What it's scoring.** The floor: it builds, it renders, the routes resolve, the layout
holds at 390 without horizontal scroll or overflow, and each screen is built inside
`scaffold`'s slots rather than around them.

**Verify by:** `npm run build`, `npm run lint`, loading every route in the screen list,
checking the console for errors, resizing to the SE width.

**4 — It runs with visible damage.**
Console errors or hydration warnings on a main route. Something overflows 390 or scrolls
sideways. A route in the spec's screen list 404s or renders an unstyled fragment. Content
placed around the scaffold instead of in `middleContent` / `bottomContent`, so the status
bar or the thumb zone is wrong on at least one screen.

**6 — Builds clean, renders correctly, structured plainly.**
`build` and `lint` pass, every route in `SPEC.md`'s list loads, nothing overflows,
scaffold's slots are used as intended. Layout is fixed-height in places it didn't need to
be, and long copy or a German label would break it.

**9 — Nothing to fix, and it doesn't break when pushed.**
Clean build, clean console, every route including the sheets and the per-term summary
sheets. `middleContent` scrolls and `bottomContent` stays in the thumb zone. Holds at the
SE width and with the longest label; a wrapped button label reflows rather than clips.
Session state is driven from one source, so the routes can be entered directly without
rendering a screen that contradicts itself.

---

## Scoring rules

1. **"Looks good" is a 6, not a 9.** A 9 survives a senior critique untouched — a reviewer
   who knows this system finds nothing to change. If the honest reaction is "this looks
   good," the score is 6. 7 and 8 are for work with specific, nameable strengths beyond
   competence.
2. **A dimension scores 8 or above only if it was verified by rendering, measuring or
   testing.** Never from reading code. Reading source tells you what was intended;
   rendering tells you what shipped. Without a screenshot, a measured value, a checker run
   or a click-through, a dimension is capped at 7 no matter how good the code looks.
3. **Record the evidence.** Each dimension's score carries the method that earned it —
   which screens were rendered, what was measured, which command was run. A score with no
   method attached is capped at 7 by rule 2.
4. **Score the prototype, not the docs.** A decision documented in `sprint-context.md` but
   not built scores nothing. A gap honestly logged in `component-gaps.md` is not a penalty
   under System fidelity; an undocumented one is.
5. **Weighted total.** Multiply each score by its weight and sum. Report the six scores
   alongside the total — the total hides which High dimension failed.
6. **A stub is not the screen at the far end of it.** SPEC.md names its own scripted
   shortcuts as stubs — `20 Home, revisit`'s Explain out loud, `19`'s Do it now anyway —
   that skip a loop not built this sprint. The jump itself is out of scope: don't score a
   screen down for how few taps a stub took to reach it. Judge the destination screen on
   its own terms instead, the way a student who arrived the long way would read it — its
   copy, its claims, its states. If that screen would be wrong even for a student who
   actually did the thing (a claimed outcome the interaction it depicts couldn't produce,
   a dead end, a broken state), that is still a finding; if it's only reachable in fewer
   steps than the finished product will allow, it isn't. Confirm a jump qualifies by
   checking it's named as a stub in SPEC.md before waiving it — an unscripted shortcut is
   not exempt.

---

## Hard gates

Pass/fail, checked before scoring. A failed gate is reported on its own, with the specific
screen and value, and no dimension it touches can score above 5 until it is fixed.

1. **Contrast at 4.5:1 for body text.** Measured on the rendered screen against the pixels
   actually behind the text, including text on surface fills, inside sheets, and over
   Knowie's artwork. Large-scale text may use 3:1; body may not.
2. **Touch targets at 44pt.** Every interactive control's hit box is at least 44×44pt.
   A tappable full-width row is held to the sprint components' 64 floor — below 64 but at
   or above 44 is a Craft finding, below 44 fails the gate.
3. **No raw hex in component source.** No hex literal in `src/` outside stories, no
   `var(--token, fallback)` anywhere. `npm run tokens:check` and `npm run check:tokens`
   both pass.
4. **No two states that should differ rendering identically.** Screenshot-compare every
   pair that carries different meaning and confirm they differ in more than one channel:
   Idle vs Recording, Processing vs Processing-past-5s, pass vs pass-after-a-hint, hint 1
   vs hint 2, the four `termRow` outcomes, the three `sectionHeader` states, voice mode vs
   text mode, and `waveform` Live vs Idle vs Silent. Two states that render the same pixel
   for pixel is a failure even if the code paths differ.
