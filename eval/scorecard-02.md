# Scorecard 01 — Home (first session), Home (revisit), Resume, Permission denied

Scoped review of four screens only, against `eval/rubric.md`:

| # | Screen | Route |
|---|---|---|
| 01 | Home, first session | `/` |
| 20 | Home, revisit | `/home/revisit` |
| 05b | Resume | `/explain/resume` (`?from=2`, `?from=3` / default, and `?from=1` — documented fallback to `?from=3`) |
| 14 | Permission denied | `/explain/denied` (and `/explain/denied/how`) |

Method: three adversarial critics (critic-system, critic-craft, critic-ux) each graded
two rubric dimensions in an isolated context — given only these four screens,
`eval/rubric.md`, and their own dimensions, with no access to each other's output or to
`eval/scorecard-02.md`. critic-ambition gave a separate, advisory Reach read, also blind.
Before any critic ran, this screen set was rendered and screenshot/DOM-compared for hard
gate 4 — see `eval/scorecard-02.md`; nothing there was fixed, only flagged.

## Total: 6.25 / 10

| # | Dimension | Score | Weight (table) | Weighted | Critic |
|---|---|---|---|---|---|
| 1 | System fidelity | 8/10 | 20% | 1.60 | critic-system |
| 2 | Coherence | 6/10 | 25% | 1.50 | critic-craft |
| 3 | Craft | 5/10 | 15% | 0.75 | critic-craft |
| 4 | UX judgment | 6/10 | 25% | 1.50 | critic-ux |
| 5 | Accessibility | 6/10 | 10% | 0.60 | critic-ux |
| 6 | Structure | 6/10 | 5% | 0.30 | critic-system |

**Rubric weight conflict — still unresolved, and this time it changes the answer.**
`eval/rubric.md`'s summary table (used above, the intro text calls it authoritative —
"the percentages are the High/Medium/Low bands spread to sum to 100") gives Coherence
25% / Craft 15% / UX 25% / Accessibility 10%. The six section headers give a different
set that also sums to 100: Coherence 20% / Craft 20% / UX 20% / Accessibility 15%. The
last scorecard flagged this and noted both schemes happened to land on the same total
for that score distribution (5.55 either way) — they don't this time. Scoring this run's
six numbers under the header scheme instead gives **6.20/10**, not 6.25. The gap is
small but the rubric file itself is still the thing that should be fixed so the next
scorecard doesn't have to keep making this call.

**All four hard gates pass on this screen set** — none of the six scores above is capped.
See the hard gates table below.

---

## Hard gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Contrast 4.5:1 body text | **Pass** | critic-ux measured rendered-pixel contrast (alpha-composited against the true ancestor background, not token intent) on every text node across all four screens — lowest measured was 8.4:1, well clear of the floor. |
| 2 | Touch targets 44pt | **Pass** | critic-ux measured every interactive control on these four screens: Close 48×48, all `Button` instances 48–56 tall, `BottomNav` tabs 48×48. Nothing under the floor. |
| 3 | No raw hex / no `var(--token, fallback)` | **Pass on this screen set** | critic-system ran `check:tokens` (0 raw hex found) and confirmed by grep that `tokens:check`'s one repo-wide failure (`var(--i)` undefined in `src/components/waveform/waveform.css`) is not imported by any of these four screens or their components. critic-craft independently found no raw hex or fallback pattern in every file it read for these screens. |
| 4 | No two states that should differ rendering identically | **Pass** | Confirmed independently four times: this session's own render pass (`eval/scorecard-02.md`), plus critic-system, critic-craft and critic-ux each separately verified `?from=2` vs `?from=3` differ correctly, `/` vs `/home/revisit` differ correctly, `/explain/denied` vs `/explain/denied/how` differ correctly, and `?from=1`/no-param render identically to `?from=3` **by design** (documented fallback in `parseFrom`, exempted under rubric scoring rule 6 the same way the previous scorecard exempted it). |

**Methodology note on gate 4's confidence:** this session's own render pass
(`eval/scorecard-02.md`) hit a `resize_window` cap of 150 CSS px and fell back to
DOM-level comparison. The three adversarial critics, running later in separate tabs, did
better — critic-system, critic-craft and critic-ux each independently confirmed via
`getBoundingClientRect()` on `.appFrame` that their rendered canvas was a true 390 CSS px
wide (the app clamps its frame to `min(390px, 100vw)`, so a wide-enough outer window lets
it hit exactly 390 even though the outer window itself never reached 390×844 for anyone).
That's a stronger basis for gate 4 than this session's own 150px pass alone — treat the
critics' confirmation as the primary evidence and `scorecard-02.md`'s DOM-only checks as
corroborating, not the other way around.

---

## Findings

Ordered most-severe first. Every finding is from a critic's rendered/measured evidence
unless marked otherwise.

**F1 — A live-looking button on `/explain/denied` does nothing, with zero feedback.**
Found independently by all three adversarial critics. "Allow in Settings"
(`src/app/explain/denied/PermissionDenied.tsx:57`) renders as a full `Secondary` button —
`disabled:false`, `aria-disabled:null`, `cursor:pointer`, `opacity:1`, in tab order, same
focus ring as its working neighbor — with no `href` and no `onClick`. critic-ux clicked it
two ways (simulated and `el.click()`) and confirmed `window.location.href` never changes
and nothing else fires. Visually and behaviorally indistinguishable from "How to allow
it" beside it, which does navigate.
*Evidence:* `PermissionDenied.tsx:57`; rendered DOM on `/explain/denied` (all three
critics, independently). — critic-system, critic-craft, critic-ux
*Context:* critic-system notes the button's inertness is *deliberate* and documented in
source (iOS Safari can't deep-link to mic permissions), so this isn't an unlogged
System-fidelity gap — but nothing in the rendered UI tells the student that. All three
critics recommend the same fix: `state="Disabled"` on the `Button` instance (a documented
state), not a dead `Default`.

**F2 — The one built recovery path gives instructions for the wrong surface.**
`/explain/denied/how`'s sheet walks the student through iOS Settings → Privacy & Security
→ Microphone → Knowunity — but this is a website in Safari; that path doesn't govern a
site's mic permission. The actual control is Safari's own per-site toggle (Settings →
Safari → that website, or the page's aA menu → Website Settings). The source's own
comment admits the mismatch. A denied student who follows the only help screen built for
them will not find "Knowunity" in the list they're sent to and has no further way forward
from there.
*Evidence:* `src/app/explain/denied/how/page.tsx:31-40` (the `STEPS` array) and the file's
own comment at lines 10-13. — critic-ux
*Fix:* write the Safari-specific steps for the browser this prototype actually runs in.

**F3 — The home indicator pill floats ~40px off the true bottom edge, on both Home screens.**
Found independently by critic-system and critic-craft. `Scaffold`'s `bottomContent` uses
the flow's default `padding: var(--space-800) var(--space-400)` (32px top/bottom)
unconditionally, instead of the 0/0 regime the Home frames draw. Measured on `/`:
`.appFrame` bottom edge vs `.knowieBottomNav-homeIndicatorPill` bottom — a 40px gap,
identical on `/home/revisit`.
*Evidence:* `src/components/scaffold/scaffold.css:71-77`; measured via
`getBoundingClientRect()` on both routes. — critic-system, critic-craft
*Not a System-fidelity penalty* — `component-gaps.md` already names this exact gap and
calls this "the strongest argument" for the per-family padding variant it's waiting on
(rubric rule 4: a logged, not-yet-built decision doesn't score against fidelity). It is
still a real, measured Craft/Structure defect, and critic-craft counts it against
Coherence too, on the grounds that the same wrong padding regime shipped identically on
both scored screens sharing that chrome rather than being caught once.

**F4 — `/home/revisit`'s CTA is pushed below the fold at iPhone SE height, with no visible affordance that more exists.**
The two-line headline ("Your History exam is in 5 days") adds height the screen's
vertical rhythm didn't budget for. At a 390×667 window (the rubric's own "Verify by" line
for Craft calls for testing "at 390 and at the SE width"), `middleContent`'s
`scrollHeight` measured 364px against a 305px `clientHeight` — 59px cut off, including
"Continue studying." `/` never triggers this because its one-line "1 week" headline is
shorter. The region does scroll (`overflow-y: auto`), so nothing is unreachable, but
there's no signal telling the student to scroll.
*Evidence:* rendered `/home/revisit` at 390×667; `middleContent.scrollHeight=364` vs
`clientHeight=305`; `src/app/home.css:4-22`. — critic-craft
*Disputed read, not resolved:* critic-ux measured the same overflow independently while
checking a different question and concluded it's *not* a UX-judgment finding — the link
is fully functional once scrolled to, so nothing traps the student — and didn't count it.
Both reads are kept here: it's real and measured (not a viewport artifact — the frame's
*width* was independently confirmed at true 390px by both critics; only the *height* was
capped by the tool), and whether it rises to a defect depends on whether "no affordance
signals scrollability" counts as UX judgment or Craft. Recorded under Craft, where
critic-craft scored it.

**F5 — Focus-visible is inherited per-component, not designed, on `/explain/denied`.**
Tabbing the screen: the `ButtonIcon` Close control gets the browser's native default ring
(`outline: auto`, 1px), while the `Button`-based links two tab-stops later get a custom
2px solid ring. Same screen, same interaction, two different focus treatments.
*Evidence:* `document.activeElement` + computed style after sequential `Tab` presses on
`/explain/denied`. — critic-ux

**F6 — Two screens built from the identical composition disagree on their own rhythm.**
`/explain/resume` and `/explain/denied` both compose `MascotHeading` (Knowie L +
`TextBlock` L) over `ActionStack` — both are a single centred moment before the term loop
starts — but Resume is bound to `gap="600"` (24px) and Denied to `gap="400"` (16px), with
no functional difference that explains it. Visible in both screenshots.
*Evidence:* `src/app/explain/resume/page.tsx:116-121` vs `MascotHeading`'s default
`gap="400"` used by `PermissionDenied.tsx:26-31`. — critic-craft

**F7 — `ChromeStrip` (flat PNG chrome) on `/` and `/home/revisit` — not a violation.**
Both Home screens' top strip and tool row render as images, not library components. This
is explicitly logged and licensed: the file's own header states it draws chrome from "a
library this project cannot reach," is `aria-hidden`, `pointer-events: none`, and is
barred from `src/components`. Recorded for completeness only, per critic-system.

**F8 — Repo-wide `tokens:check` failure, confirmed off this screen set.**
`var(--i)` undefined in `src/components/waveform/waveform.css`. Confirmed by grep, by
critic-system, not imported by any of these four screens or anything they compose.
Matches the previous scorecard's F10; still unfixed, still out of scope here.

---

## Critic-ambition's read (Reach — advisory, not in the weighted total)

**Reach: 5/10** — every rule holds on all four screens (locked decisions honored, one
`interactive.primary` per screen, components used inside their documented rules), and
none of the four does more for the student than state a fact.

Two proposed patterns, each built from components already in `src/components`:

1. **Name what's due on `/home/revisit`, not how many.** Build `VerdictHeader`'s caption
   the way `/explain/resume`'s own `resumeCaption()` already does — from
   `TERM_POSITIONS`/`TERMS`/`SESSION_OUTCOMES`, already imported by that file — so it
   reads "Serfdom and Manorialism are ready to revisit" instead of "2 terms to revisit."
   Cost: the naming logic is currently local to `resume/page.tsx` and would need
   factoring into something shared; untested at 3+ due terms for caption wrap.
2. **Show the position `/explain/resume` currently only states.** Populate `AppBar`'s
   center `Slot` with `ProgressIndicator` (`thickness="24"`, no "1 of 4" label, matching
   the locked rule) at the step matching where the student stopped. Cost: this reopens a
   decision the code's own comment already reasoned through — Resume is deliberately
   scoped "outside the term loop" — and doing it wrong puts a progress bar on a screen its
   author withheld one from on purpose.

Ambition's own uncertainty: least sure about proposal 2, for exactly the reason above —
there may be a reason visible only in Figma or a conversation not in this repo for why
Resume was kept outside the progress bar's vocabulary.

---

## Each critic's blind spot

**critic-system:** Confirmed a true 390px frame via `.appFrame`'s own
`getBoundingClientRect()`, but did not test the SE width (320/375) on any of the four
screens and isn't asserting the rubric's "holds at SE width" claim either way. Did not run
`npm run lint`. Did not test `prefers-reduced-motion` or focus-visible (out of scope for
its two dimensions). Two stray tabs appeared in the shared tab group mid-task, navigating
on their own — not opened by this critic, believed not to have affected its measurements
but not fully explained.

**critic-craft:** Confirmed true 390px width the same way, but `resize_window` never
pushed the window past 667px tall regardless of requested height — so F4 (the SE-height
overflow) is measured at 667px, which happens to be the real SE height, but couldn't be
independently re-measured at the iPhone 13's full 844px to see whether the extra room
absorbs it; reasoned from `scaffold.css`'s `height: 100dvh` that it likely would, but
didn't measure it. Did not run `tokens:check`/`check:hex` itself (read-only); its "no raw
hex" conclusion rests on the specific files it read, not a full-repo sweep. No looping
motion exists on any of these four screens, so reduced-motion verification wasn't
exercisable. Also hit a shared tab being navigated by a concurrent process; abandoned it
and re-verified everything in a fresh, isolated tab.

**critic-ux:** Same 667px height ceiling and same shared-tab contamination concern,
independently — also abandoned the shared tab for a fresh one. Measured the same
`/home/revisit` overflow as critic-craft but read it as a test-viewport artifact for its
own dimensions rather than a UX-judgment finding (see F4's disputed-read note). Did not
test with actual screen-reader software (VoiceOver) — relied on accessibility-tree
signals (`aria-hidden`, `inert`, `tabIndex`, computed focus styles) a screen reader would
key off. Did not test reduced-motion, since no element on any of the four screens carries
`animation-name`.

**critic-ambition:** Did not render `/explain/resume?from=1`; confirmed the documented
`from=3` fallback by reading `parseFrom()`'s guard clause rather than by screenshotting
it.

**Shared methodology note:** unlike the last scorecard, all three adversarial critics
this time confirmed a genuinely 390px-wide render via `.appFrame`'s own
`getBoundingClientRect()`, even though none could get the *outer* browser window to
390×844 (`resize_window` capped width differently per session — 150px for this session's
own `eval/scorecard-02.md` pass, ~542px and ~430px for two of the critics — and height
capped near 667–705px for everyone). Width-dependent findings in this scorecard rest on
the confirmed-390 inner frame; height-dependent findings (F4) are honestly flagged as
measured at 667px, not the full 844px canvas.
