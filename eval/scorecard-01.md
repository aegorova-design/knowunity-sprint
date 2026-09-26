# Scorecard 01 — Home (first session), Home (revisit), Resume, Permission denied

Scoped review of four screens only, against `eval/rubric.md`:

| # | Screen | Route |
|---|---|---|
| 01 | Home, first session | `/` |
| 20 | Home, revisit | `/home/revisit` |
| 05b | Resume | `/explain/resume` (`?from=2`, `?from=3`, and the `?from=1` fallback) |
| 14 | Permission denied | `/explain/denied` |

Method: three adversarial critics (critic-system, critic-craft, critic-ux) each graded two rubric dimensions in an isolated context — given only these four screens, `eval/rubric.md`, and their own dimensions, with no access to each other's findings. critic-ambition gave a separate, advisory Reach read. Before any critic ran, this screen set was rendered at 390px in dark mode and screenshot-compared for hard gate 4 (below).

## Total: 5.55 / 10 (stale — see note)

**Both hard gates below have since been fixed** (raw hex in `layout.tsx`, BottomNav's 40×40 tabs) — see the hard gates table and F5/F9. System fidelity and Accessibility were each explicitly capped at 5 by their respective gate failure, so both are now floors, not settled scores: neither critic has re-rendered against the fixed code, so the total above is not re-derived. A re-score of just those two dimensions (not a full re-run) would be enough to update it.

| # | Dimension | Score | Weight (table) | Weighted | Critic |
|---|---|---|---|---|---|
| 1 | System fidelity | 5/10 | 20% | 1.00 | critic-system |
| 2 | Coherence | 6/10 | 25% | 1.50 | critic-craft |
| 3 | Craft | 6/10 | 15% | 0.90 | critic-craft |
| 4 | UX judgment | 5/10 | 25% | 1.25 | critic-ux |
| 5 | Accessibility | 5/10 | 10% | 0.50 | critic-ux |
| 6 | Structure | 8/10 | 5% | 0.40 | critic-system |

**Rubric weight conflict, not resolved silently.** `eval/rubric.md`'s summary table (line 9-16) and its six section headers give two different weight sets that both happen to sum to 100 but disagree per dimension: the table has Coherence 25% / Craft 15% / UX 25% / Accessibility 10%; the section headers say Coherence 20% / Craft 20% / UX 20% / Accessibility 15%. The table is used above as the one the intro text calls authoritative ("the percentages are the High/Medium/Low bands spread to sum to 100"). For this particular score distribution the two schemes land on the identical total (5.55) either way, but the rubric file itself should be fixed so the next scorecard doesn't have to make that call again.

---

## Hard gates

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Contrast 4.5:1 body text | **Pass** | critic-ux measured computed color against actual composited background on all four screens; no violation found. |
| 2 | Touch targets 44pt | **Fixed** | Was 40×40 (`BottomNav`'s "Home chat"/"Study plan" tabs, `bottomNav.css:42`). `.knowieBottomNav-tab` now carries `min-width`/`min-height: var(--space-1200)` (48), reusing `buttonIcon`'s own "invisible tap target bigger than the visible icon" pattern rather than growing the icon's own padding past what Figma draws. Re-measured live on `/` and `/home/revisit`: all four tabs now 48×48. `component-gaps.md` not touched — no new component, an existing token added to an existing rule on an existing component. |
| 3 | No raw hex / no `var(--token, fallback)` | **Fixed** | Was `src/app/layout.tsx:19` — `themeColor: "#090c18"` typed as a literal. Now reads `tokens.color.navy["950"].$value.hex` from `tokens/tokens.json` at build time instead of hand-copying it — the value can't drift from the token because it's no longer a second copy of it. `npm run check:tokens` now passes (`No raw hex colours in src/.`); re-measured `<meta name="theme-color">` live, still renders `#090c18`. Separately, `npm run tokens:check` still fails repo-wide on `src/components/waveform/waveform.css` (`var(--i)` undefined) — not imported by any of these four screens and not part of this fix; still worth fixing on its own. |
| 4 | No two states that should differ rendering identically | **Pass** | Rendered `/` and `/home/revisit` side by side — differ correctly (caption, action count/emphasis). Rendered `/explain/resume?from=2` vs `?from=3` — differ correctly (term names, counts, pluralization). Rendered `/explain/resume?from=1` vs `?from=3` — render byte-identical, which is *correct*: the code's documented fallback rule (`explain/resume/page.tsx`, `parseFrom`) says an invalid `from` should render the same as the default rather than show a self-contradicting screen. No violation. |

---

## Findings

Ordered most-severe first, by rubric dimension. Every finding is from a critic's rendered/measured evidence, not a code read alone, unless marked otherwise.

### UX judgment

**F1 — Withdrawn.** ~~20 Home, revisit's only action fabricates an unearned result.~~
Originally: tapping the screen's one Primary, "Explain out loud," skips the entire recall loop and lands directly on `/explain/revisit-done`, reading "You got both terms on your own... You explained them unaided this time," with nothing said or judged.
*Withdrawn under `eval/rubric.md` scoring rule 6 (added after this scorecard was written): a jump SPEC.md itself names as a stub — `/home/revisit`'s Explain out loud is documented as "stubbed... skipping the revisit session at `/explain/1` that earns it" — is out of scope; the destination screen is judged on its own terms instead. `20b`'s own SPEC.md entry (screen 28) says its copy is correct for a student who actually finished a revisit session: "both come back unaided here." The copy isn't wrong for the screen it's written for — it's only reachable in fewer steps than the finished product allows. No defect on this screen under the current rubric.*

**F2 — The locked "Turn on voice" promise isn't implemented; a denied student can reach a live mic screen again.**
`sprint-context.md`'s locked decision: "Switch to voice becomes Turn on voice leading to the permission help, because an affordance they cannot use must not sit there live." Traced click path: 14 Permission denied → "Type my answers" (`/explain/1/type`) → "Switch to voice" lands on plain `/explain/1`, the ordinary live-mic Idle screen — not back to `/explain/denied`. `DENIED_TYPE_HREF` carries no denied marker for the type screen to branch on.
*Evidence:* `src/app/explain/denied/PermissionDenied.tsx:18` (`DENIED_TYPE_HREF = '/explain/1/type'`); rendered path confirmed the "Switch to voice" href on the resulting type screen is `/explain/1`, not `/explain/denied`; `/explain/1` renders a live, unguarded mic button. — critic-ux
*Not a hard trap today* only because "Type instead" also happens to sit on the voice Idle screen as a second way out — incidental, not designed for this case.

**F3 — "Allow in Settings" is a live-looking button that silently does nothing.**
On `/explain/denied`, "Allow in Settings" renders as a full default-state `Button` — pointer cursor, not disabled, identical styling to the working "How to allow it" button beside it — with no `href` and no `onClick`. A tap produces no navigation, no toast, no feedback of any kind.
*Evidence:* `src/app/explain/denied/PermissionDenied.tsx:57`; DOM check: `disabled:false, ariaDisabled:null, cursor:"pointer"`. Found independently by both critic-ux and critic-craft.
*Fix suggested by both critics:* render it in the system's documented `Disabled` state, or replace it with static (non-button) text, so "this doesn't act" is designed rather than discovered by tapping it.

**F4 — No designed `:focus-visible` on the Close control both 05b and 14 depend on.**
`ButtonIcon` (wrapped by `CloseButton`, the only top-chrome control on `/explain/resume` and `/explain/denied`) ships no `:focus-visible` rule in its own CSS, unlike `button`, `bottomNav`, `termRow`, `stepperStep`, and `textField`, which all define one against `--color-border-focus`.
*Evidence:* `src/components/button-icon/buttonIcon.css` (full file, no `:focus-visible` selector) vs. `src/components/bottom-nav/bottomNav.css:72-75`. — critic-ux
*Source-level finding, not rendered-confirmed* — see Blind spots below; per rubric rule 2 this alone wouldn't support a score above 7, but it's real regardless of confirmation method.

### Accessibility

**F5 — Gate 2 failure. Fixed.** See hard gates table above (BottomNav was 40×40 on `/` and `/home/revisit`, now 48×48).

### Coherence / Craft

**F6 — Bottom action stack ships at half the locked spacing.**
`sprint-context.md`'s locked build rules: "bottom stack gap Space/400" (16px), stated to apply to every new screen. Both `/explain/denied` and `/explain/resume` build their action stack with a measured gap of 8px (`--space-200`), not 16px.
*Evidence:* `sprint-context.md:105` ("bottom stack gap Space/400"); `src/app/explain/actionStack.css:10` (`gap: var(--space-200)`); measured `getComputedStyle('.actionStack').gap` → `"8px"` on both routes. — critic-craft
*Fix:* either correct `actionStack.css:10` to `var(--space-400)`, or correct the locked rule in `sprint-context.md` if `Space/200` was the actual intent — right now the doc and the code disagree and nothing flags it.

**F7 — Permission-denied screen's landmark label describes the wrong screen.**
`/explain/denied`'s `AppBar` carries `aria-label="Primer navigation"` — the exact string used on `/explain/intro`, `/explain/intro/example`, and `/explain/denied/how`. SPEC.md lists "14 Permission denied" as its own screen (#9), distinct from "04 First run, mic primer" (#7). A screen-reader user tabbing to the top nav on the denial screen is told they're in "Primer navigation."
*Evidence:* `src/app/explain/denied/page.tsx:23`; compare `src/app/explain/intro/page.tsx:28` (identical string); SPEC.md lines 164 and 180. — critic-craft

**F8 — `/home/revisit` reports a count where the same codebase already knows how to name names.**
`VerdictHeader`'s caption on `/home/revisit` reads "2 terms to revisit," derived from `SESSION_OUTCOMES.length`, while `/explain/resume`'s `resumeCaption()` two screens away joins the actual term names from the same kind of session data. The specificity pattern exists in this codebase; the screen that's supposed to be the retention trigger doesn't use it.
*Evidence:* `src/app/home/revisit/page.tsx:44-49` vs. `src/app/explain/resume/page.tsx:82-93`. — critic-ambition (Reach read, see below; recorded here because it's a legitimate coherence observation even though Reach itself isn't scored)

### System fidelity

**F9 — Gate 3 failure. Fixed.** See hard gates table above (`layout.tsx:19` no longer carries a raw hex literal).

**F10 — Repo-wide `tokens:check` also fails, off this screen set.** `var(--i)` undefined in `src/components/waveform/waveform.css`. Confirmed not imported by any of these four screens (grepped, no hits) — recorded for completeness, doesn't change any score here.

### Structure

No findings. 8/10 — clean build, clean lint, all four routes plus the three `?from=` variants load with no app-sourced console errors, `Scaffold` slots used correctly. Held below 9 only because no critic could confirm behavior at the literal 390/375 widths (see Blind spots) or a long/German-label stress test.

---

## Critic-ambition's read (Reach — advisory, not in the weighted total)

**Reach: 5/10** — every screen in this set follows the rules and takes no risk: each is a faithful, correctly-scoped build of its locked decision, and none does more for the student than report a fact back to them.

Three proposed patterns, each built from components already in `src/components`:

1. **Name the due terms on `/home/revisit`**, not just their count — reuse `resumeCaption`'s name-joining pattern in `VerdictHeader`'s existing `caption` prop. Cost: risks caption wrapping at 390px; adds a second call site that must stay in sync with `SESSION_OUTCOMES`.
2. **A visible fill on `/explain/resume`**, not prose alone — put a `ProgressIndicator` in `AppBar`'s center `Slot` (`current`/`total`, no visible label, so it doesn't violate the "no '1 of 4' label" build rule). Cost: extends this indicator's use outside the term loop it's currently scoped to.
3. **Keep the in-flight term in view on `/explain/denied`** — name the actual term in the caption's second sentence instead of generic mic-access copy. Cost: requires threading session position into a screen sprint-context.md deliberately keeps outside the term loop.

Ambition's own uncertainty: least sure about proposal 1 — the count-only pattern on `/home/revisit` may have been a deliberate consistency call the source doesn't fully explain.

---

## Each critic's blind spot

**critic-system:** Could not resize the browser to the literal 390/375px widths — the shared MCP tab was fixed at ~150 CSS px. No-overflow at 150px is suggestive, not equivalent evidence. Did not test a long/German-label reflow. Noted another concurrent agent sharing the same tab group; mitigated by switching to a dedicated tab.

**critic-craft:** Same 150px viewport ceiling — excluded any layout-width finding not corroborated by `scrollWidth`/`clientWidth`. Live `:focus-visible` testing was inconclusive (`Tab` didn't reliably move focus in this environment). Could not test `prefers-reduced-motion: reduce` live. Also shared the tab group with other concurrent processes — re-verified findings on a fresh dedicated tab and discarded anything observed before that.

**critic-ux:** Same 150px viewport ceiling — treated wrap/overflow as inapplicable rather than a finding at that width. Keyboard-focus render-check was inconclusive (focus kept resolving to `<body>`), so F4 rests on source, not an observed ring. Did not test reduced-motion/greyscale specifically on these four screens, judged largely inapplicable since none carries a color-only verdict or animated status state — but didn't independently confirm that with the media feature actually set.

**critic-ambition:** Did not render `/explain/denied/how` or click every Resume destination — judged unnecessary since these are static, single-state screens and the source read confirmed the branches.

**Shared methodology caveat:** none of the three adversarial critics had a `resize_window` tool available, so none could render at the actual 390px canvas this rubric asks for — all three compensated with viewport-independent DOM/token measurements and explicitly excluded width-dependent judgments rather than guess. This is an eval-infrastructure gap (the critic agent definitions don't grant `resize_window`), not a screen defect, and it caps confidence in anything Craft would otherwise catch through optical alignment or line-wrap at 390 specifically. Worth fixing before the next scorecard.
