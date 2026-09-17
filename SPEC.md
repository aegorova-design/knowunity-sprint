# Explain out loud — build spec

**This prototype is the Next.js app in this repo.** It is not a Figma prototype and not a Storybook demo.

- Every screen is a real page with its own route under `src/app`, using the App Router.
- The student moves between screens by clicking things on them. No hidden keyboard shortcuts, no dev menu, no URL typing required to see any state.
- **Storybook stays the component catalog.** Components live in `src/components/<kebab-name>/` and are documented and tested there. Pages compose them. A page never redefines a component's look, and nothing new gets drawn without going through the component library first (`design-system.md`, "Before you make anything").
- Screen numbers below (`06`, `09c`, `13b`) refer to frames on the **Mockups v2** page of the Figma file `Yummy__Knowie Design Sprint`. That page is the current one; the older `Mockups` page is superseded.

---

## What we're building

A voice active-recall capstone: the student explains three key terms from a plan section out loud, and Knowie answers in text with a pass, a two-step hint ladder, or the answer.

The section is left carrying a count of terms explained unaided, and the terms that needed help come back on a date Knowie names, which is what pulls the student back before the exam.

---

## Screen list, in build order

Easiest first. Each tier depends on the one above it only for shared session state.

### Tier 1 — plan and home (static compositions)

| # | Screen | Route | File |
|---|---|---|---|
| 1 | 02 Plan, nothing started | `/plan` | `src/app/plan/page.tsx` |
| 2 | 03 Plan, section 1 in progress | `/plan/in-progress` | `src/app/plan/in-progress/page.tsx` |
| 3 | 01 Home, first session | `/` | `src/app/page.tsx` |
| 4 | 20 Home, revisit | `/home/revisit` | `src/app/home/revisit/page.tsx` |
| 5 | 19 Plan, 1 of 3 unaided | `/plan/to-revisit` | `src/app/plan/to-revisit/page.tsx` |
| 6 | 21 Plan, section mastered | `/plan/mastered` | `src/app/plan/mastered/page.tsx` |

### Tier 2 — first run and permission

| # | Screen | Route | File |
|---|---|---|---|
| 7 | 04 First run, mic primer | `/explain/intro` | `src/app/explain/intro/page.tsx` |
| 8 | 05 First run, example | `/explain/intro/example` | `src/app/explain/intro/example/page.tsx` |
| 9 | 14 Permission denied | `/explain/denied` | `src/app/explain/denied/page.tsx` |

### Tier 3 — verdict screens (static, plus routing off session state)

| # | Screen | Route | File |
|---|---|---|---|
| 10 | 10 Got it | `/explain/[term]/pass` | `src/app/explain/[term]/pass/page.tsx` |
| 11 | 10b Got it, after a hint | `/explain/[term]/pass-hinted` | `src/app/explain/[term]/pass-hinted/page.tsx` |
| 12 | 11 Not quite, hint 1 of 2 | `/explain/[term]/hint-1` | `src/app/explain/[term]/hint-1/page.tsx` |
| 13 | 12 Partial, hint 2 of 2 | `/explain/[term]/hint-2` | `src/app/explain/[term]/hint-2/page.tsx` |
| 14 | 12b Not quite, last attempt | `/explain/[term]/last-miss` | `src/app/explain/[term]/last-miss/page.tsx` |
| 15 | 13 Answer revealed | `/explain/[term]/answer` | `src/app/explain/[term]/answer/page.tsx` |
| 16 | 13b Answer revealed, said back | `/explain/[term]/answer/said-back` | `src/app/explain/[term]/answer/said-back/page.tsx` |
| 17 | 09c Didn't catch that | `/explain/[term]/not-heard` | `src/app/explain/[term]/not-heard/page.tsx` |

### Tier 4 — the live loop (timers and playback)

| # | Screen | Route | File |
|---|---|---|---|
| 18 | 06 Idle | `/explain/[term]` | `src/app/explain/[term]/page.tsx` |
| 19 | 07 Recording | `/explain/[term]/recording` | `src/app/explain/[term]/recording/page.tsx` |
| 20 | 08 Review | `/explain/[term]/review` | `src/app/explain/[term]/review/page.tsx` |
| 21 | 09 Processing | `/explain/[term]/checking` | `src/app/explain/[term]/checking/page.tsx` |
| 22 | 09b Processing, still thinking | `/explain/[term]/checking/slow` | `src/app/explain/[term]/checking/slow/page.tsx` |

### Tier 5 — text mode

| # | Screen | Route | File |
|---|---|---|---|
| 23 | 15 + 16 Text fallback | `/explain/[term]/type` | `src/app/explain/[term]/type/page.tsx` |

### Tier 6 — session boundaries

| # | Screen | Route | File |
|---|---|---|---|
| 24 | 05b Resume | `/explain/resume` | `src/app/explain/resume/page.tsx` |
| 25 | 06b Leave session, confirm | `/explain/[term]/leave` | `src/app/explain/[term]/leave/page.tsx` |

### Tier 7 — summary and after

| # | Screen | Route | File |
|---|---|---|---|
| 26 | 17 Summary | `/explain/summary` | `src/app/explain/summary/page.tsx` |
| 27 | 18 Summary, term tapped | `/explain/summary/[term]` | `src/app/explain/summary/[term]/page.tsx` |
| 28 | 20b Revisit complete | `/explain/revisit-done` | `src/app/explain/revisit-done/page.tsx` |

`[term]` is `1`, `2`, `3` — the position in the session, not the term's name.

---

## Screen detail

Every screen is a `Scaffold` (`size="iPhone 13"`), inside the app's own 390px frame — `scaffold.css` deliberately fills whatever it is given, so the canvas width is set once in `globals.css` (`.appFrame`), not by the component. The plan screens pass `showTopNavSlot={false}`, because the Figma frames hide that slot and put the subject and tabs in `middleContent`. Only the slots that differ are named below. Session screens put an `AppBar variant="leftAndRightButton"` in `topNavigation` with a close `ButtonIcon` on the left, a `ProgressIndicator variant="Primary" thickness="24"` in `Slot`, and a Skip `Button variant="Tertiary" size="S"` on the right.

**Skip rule.** Skip is `state="Default"` wherever the student can still act on the current term, and `state="Disabled"` once the term is in flight or resolved. Live on: 06, 07, 08, 09c, 15/16, 11, 12. Disabled on: 09, 09b, 10, 10b, 12b, 13, 13b.

**Progress rule.** `ProgressIndicator progress` is `"0"` on term 1 and advances a third on any resolution, including a skip.

---

### 1. 02 Plan, nothing started — `/plan`

- **States:** one.
- **Components:** `SectionHeader state="Default"` per section; `StepperStep type="Learning" state="NotStarted"` ×3 per section; `StepperStep type="Voice" state="NotStarted"` with `caption="Explain 3 terms from this section out loud, ~2 min"` per section.
- **Can do:** tap the Voice step of either section, or any of section 1's three learning steps.
- **Leads to:** the Voice step → `/explain/intro` on a first run, `/explain/1` after that. A section 1 learning step → `/plan/in-progress`.

The Voice step is **never** `state="Locked"`. It is available from the moment the section exists.

It carries `href`, which makes the whole row one focusable link. `StepperStep` is a non-interactive `<div>` without it — Figma cannot express a destination, so the prop exists in code only.

**The learning steps are a sprint shortcut.** Study and quiz is out of scope, so tapping one of section 1's steps moves the section along to `03` instead of opening it. The progress `03` shows is the frame's, not a record of which step was tapped — nothing tracks that. Section 2's steps stay inert, and so do `03`'s: the connection is one-way, from `02` into `03`.

**The plan's four stages are four routes, and every way back names the stage reached.** The study-plan tab lands on the route rendering it; `20 Home, revisit` returns to `19`; Leave and `05b Resume` return to `03`. Nothing is stored to do it — each stage is a pure function of its URL, so a reload gives the same stage back and a second student starting at `/` gets `02`. `21`'s home tab is the one remaining way back to `02`, which doubles as the reset between runs. See `src/app/plan/planHref.ts`.

### 2. 03 Plan, section 1 in progress — `/plan/in-progress`

- **States:** one.
- **Components:** as above, with section 1's learning steps at `state="Completed"` and `state="InProgress"`.
- **Can do:** tap the Voice step of either section. The learning steps are inert here — this is where `02`'s go, and there is nowhere further for them to lead.
- **Leads to:** `/explain/1`. Not a first run, so the Voice step skips the primer. With `?resume=`, `/explain/resume` instead.

This is where a started session returns to: **Leave** and `05b Resume`'s close both land here, not on `02`, which would claim nothing had started. It reads `?resume=` the way `/plan` does.

### 3. 01 Home, first session — `/`

- **States:** one.
- **Components:** `VerdictHeader verdict="Neutral" titleAs="h1"` reading "Your History exam is in 1 week", with its caption switched off — Knowie is the size L Standby figure nested inside the header, not a separate `MascotFigure` — and `Button variant="Primary" size="M" CTA="Continue studying" href="/plan"`. The top bar and the tool row / "Ask anything" strip are placeholder chrome (see Out of scope); the bottom bar is `BottomNav Active="home-chat" homeChatHref="/" studyPlanHref="/plan"`, a real component whose two live tabs navigate.
- **Can do:** Continue studying.
- **Leads to:** `/plan`.

No Explain out loud entry here. Entry on a first session is the step's caption in the plan, and nothing else.

**`?plan=` carries the stage.** Home is the one screen with no place in the story, so the plan's home tab names the stage the student was on and Continue studying returns there. A bare `/` — typed or reloaded — is the entry screen it has always been, and Continue studying goes to `02`. That is the reset between runs.

### 4. 20 Home, revisit — `/home/revisit`

- **States:** one. Shown only when terms are due.
- **Components:** same chrome, plus `VerdictHeader verdict="Neutral" titleAs="h1"` reading "Your History exam is in 5 days" with a `caption` counting the terms actually due — **"2 terms to revisit"** on the scripted run, derived off `SESSION_OUTCOMES`, not the frame's "1 term"; the frame draws that line as the header's own caption rather than as a separate block — `Button variant="Primary" size="M" CTA="Explain out loud" showLeftIcon leftIcon="microphone-01"`, and Continue studying demoted to `Button variant="Tertiary" size="S" showRightIcon rightIcon="arrow-right"`. Both buttons hug and sit centred under the header.
- **Can do:** Explain out loud; Continue studying.
- **Leads to:** Explain out loud → `/explain/revisit-done`; Continue studying → `/plan/to-revisit`. Home in the bottom bar is this screen, not `/`.

**Explain out loud is stubbed.** It goes straight to `20b Revisit complete`, skipping the revisit session at `/explain/1` that earns it. A second pass of the recall loop is not built this sprint, so the stakeholder walkthrough jumps the middle.

### 5. 19 Plan, 1 of 3 unaided — `/plan/to-revisit`

- **States:** one.
- **Components:** `SectionHeader state="ToRevisit" status="1 of 3 on your own"`; `StepperStep type="Voice" state="Completed"`; `MascotMessage state="ToRevisit"` with `showHelper={true}` carrying the scheduling line, and a `Button variant="Tertiary" size="XS"` in `actionSlot`.
- **Can do:** tap the Voice step to redo; tap **Do it now anyway** in `actionSlot`.
- **Leads to:** the Voice step → `/explain/1`. **Do it now anyway → `/explain/revisit-done`, stubbed**: it means "start the recall loop now instead of waiting for the scheduled date", and `20b` is where that lands once the term comes back unaided — but the second pass of the loop is not built, so the walkthrough jumps the middle.
- **Home in the bottom bar goes to `/home/revisit`, not `/`.** The first session is done and terms are pending, so the home the student returns to is the one that says a term is due. This is the only route into `20 Home, revisit`, and so the only way `21 Plan, section mastered` is reachable by clicking.

`showHelper` must be `true` here. The scheduling line is the calibration mechanism, so it cannot be hidden on the screen that has something to schedule.

### 6. 21 Plan, section mastered — `/plan/mastered`

- **States:** one.
- **Components:** `SectionHeader state="Mastered" status="3 of 3 on your own"`; `MascotMessage state="Mastered"`.
- **Can do:** tap the Voice step; tap **Practice sooner** in `actionSlot`.
- **Leads to:** both go to `/explain/1`, running the recall loop over the terms Knowie named rather than waiting for the scheduled date.

`SectionHeader` reports the **latest session** and may regress from Mastered to ToRevisit if a later run goes worse.

### 7. 04 First run, mic primer — `/explain/intro`

- **States:** one. Shown once per student.
- **Components:** `AppBar variant="leftIconButtonOnly"`; `MascotFigure size="L" pose="Excited"`; `TextBlock variant="L"`; three explainer lines each with an `IconSlot`; one `Button variant="Primary" size="L" CTA="Allow mic" showLeftIcon leftIcon="microphone-01"`, with `See example` and `Type instead` as `Button variant="Secondary" size="M"`.
- **Can do:** Allow mic (fires the browser permission prompt); See example; Type instead; close.
- **Leads to:** granted → `/explain/1`; denied → `/explain/denied`; See example → `/explain/intro/example`; Type instead → `/explain/1/type`; close → `/plan`.

One Primary only, and no Skip. The primer is the permission ask, and its own three buttons are the ways out.

### 8. 05 First run, example — `/explain/intro/example`

- **States:** one. The primer with a sheet over it.
- **Components:** the primer, plus `Scaffold showBottomSheetBackground={true}` and a sheet in `bottomSheetOnly` holding the worked example and a `Got it` button.
- **Can do:** Got it.
- **Leads to:** back to `/explain/intro`.

### 9. 14 Permission denied — `/explain/denied`

- **States:** one.
- **Components:** `AppBar variant="leftIconButtonOnly"`; `MascotFigure size="L" pose="Questioning"`; `TextBlock variant="L"`; `Button variant="Primary" size="L" CTA="Type my answers" showLeftIcon leftIcon="keyboard-01"`; `Allow in Settings` and `How to allow it` as `Button variant="Secondary" size="M"`.
- **Can do:** Type my answers; Allow in Settings; How to allow it; close.
- **Leads to:** `/explain/1/type`; the browser's settings (see Out of scope); the help content; `/plan`.

A denied student keeps text for the whole session, and `Switch to voice` on the text screen becomes `Turn on voice`, leading back here rather than to the mic.

### 10. 10 Got it — `/explain/[term]/pass`

- **States:** one. Reached when a term passes unaided.
- **Components:** `VerdictHeader verdict="Pass" title="You got it" caption="Every key idea, first try, no help."`; a "You covered" label with `Chips size="S" active="True" showLeftIcon={false} showRightIcon={false}` ×4; `Button variant="Primary" size="L" CTA="Next term" showRightIcon rightIcon="arrow-right"`; the outcome line `+15 XP · unaided`.
- **Can do:** Next term.
- **Leads to:** the next term's `/explain/[n]`, or `/explain/summary` on the last term.

On the last term the button reads **See how you did**.

### 11. 10b Got it, after a hint — `/explain/[term]/pass-hinted`

- **States:** one. Reached when a term passes after one or two hints.
- **Components:** as 10, with `caption="Took a nudge, and you got there."`, an added `Button variant="Secondary" size="M" CTA="Say it back" showLeftIcon leftIcon="microphone-01"`, and the outcome line `+10 XP · hinted` or `+5 XP · hinted`.
- **Can do:** Next term; Say it back.
- **Leads to:** next term or `/explain/summary`; Say it back → `/explain/[term]/recording` and back to this screen acknowledged.

### 12. 11 Not quite, hint 1 of 2 — `/explain/[term]/hint-1`

- **States:** one.
- **Components:** `VerdictHeader verdict="Miss" title="Not quite"`; `AnswerBlock kind="Said" label="What Knowie heard"`; `AnswerBlock kind="Hint" label="Hint 1 of 2"`; `Button variant="Primary" size="L" CTA="Try again" showLeftIcon leftIcon="microphone-01"`; `Show answer` and `Type instead` as `Button variant="Secondary" size="M"`.
- **Can do:** Try again; Show answer; Type instead; Skip (live); close.
- **Leads to:** `/explain/[term]/recording`; `/explain/[term]/answer`; `/explain/[term]/type`; next term; `/explain/[term]/leave`.

No key-idea chips on a hint screen — they give the answer away.

### 13. 12 Partial, hint 2 of 2 — `/explain/[term]/hint-2`

- **States:** one.
- **Components:** as 11, with `VerdictHeader verdict="Partial" title="Almost there"` and `AnswerBlock kind="Hint" label="Hint 2 of 2, the last one"`.
- **Can do / leads to:** as 11.

### 14. 12b Not quite, last attempt — `/explain/[term]/last-miss`

- **States:** one. Reached when the retry after hint 2 is still wrong.
- **Components:** `VerdictHeader verdict="Miss" title="Not quite" caption="That was the last hint. Let's look at it together."`; `AnswerBlock kind="Said"`; a single `Button variant="Primary" size="L" CTA="Show me the answer" showRightIcon rightIcon="arrow-right"`.
- **Can do:** Show me the answer.
- **Leads to:** `/explain/[term]/answer`.

The ladder has nowhere else to go, but the student taps through to the answer rather than being jumped to it.

### 15. 13 Answer revealed — `/explain/[term]/answer`

- **States:** one.
- **Components:** `VerdictHeader verdict="Neutral" title="Here's the idea"`, with a caption that credits the attempt only if there was one; `AnswerBlock kind="Answer"` carrying the term's four key ideas inside it, under "The key ideas" and unticked; `Button variant="Primary" size="L" CTA="Say it back" showLeftIcon leftIcon="microphone-01"`; `Button variant="Secondary" size="M" CTA="Next term" showRightIcon rightIcon="arrow-right"`.
- **Can do:** Say it back; Next term.
- **Leads to:** `/explain/[term]/recording` then `/explain/[term]/answer/said-back`; next term or `/explain/summary`.

The outcome line reads **`+0 XP · revealed`**, in the same shape and the same slot as a pass's `+15 XP · unaided`. The outcome is Revealed at 0 XP and nothing on this screen can change that — the number says so, and the word says why.

Next term is **Secondary**, not Tertiary as the frame draws it. Tertiary put the one way forward at the lowest emphasis on the screen — below even the ways out on the hint screens above it — and moving on after a reveal is allowed, not discouraged. The step down from the Primary is all that carries the discouragement. `13b` promotes it to Primary once the saying-back is done.

### 16. 13b Answer revealed, said back — `/explain/[term]/answer/said-back`

- **States:** one.
- **Components:** as 13, with `VerdictHeader title="That's the one to remember"`, `Next term` promoted to `Button variant="Primary" size="L"`, and the same **`+0 XP · revealed`** outcome line.
- **Can do:** Next term.
- **Leads to:** next term or `/explain/summary`.

The say-back is recorded and never judged. Outcome and XP are unchanged, and the outcome line still reads `revealed`.

### 17. 09c Didn't catch that — `/explain/[term]/not-heard`

- **States:** one. Reached when a take has no audio.
- **Components:** `VerdictHeader verdict="Neutral" title="Didn't catch that"`; `Button variant="Primary" size="L" CTA="Try again" showLeftIcon leftIcon="microphone-01"`; `Button variant="Secondary" size="M" CTA="Type instead" showLeftIcon leftIcon="keyboard-01"`.
- **Can do:** Try again; Type instead; Skip (live); close.
- **Leads to:** `/explain/[term]/recording`; `/explain/[term]/type`; next term; `/explain/[term]/leave`.

`verdict` is **Neutral**, never Miss. A mic failure must not read as a wrong answer, and a retry costs no rung on the hint ladder — the student returns to whatever attempt they were on.

### 18. 06 Idle — `/explain/[term]`

- **States:** one.
- **Components:** the prompt in `middleContent` beside `MascotFigure size="S" pose="Questioning"`; `RecordButton variant="Idle" label="Start recording"` in `bottomContent` with its label and helper text, and a `ButtonPair` under the mic carrying `Button variant="Secondary" size="M" CTA="I don't know" showLeftIcon leftIcon="help-circle"` and `Button variant="Secondary" size="M" CTA="Type instead" showLeftIcon leftIcon="keyboard-01"`.
- **Can do:** start recording; I don't know; Type instead; Skip; close.
- **Leads to:** `/explain/[term]/recording`; `/explain/[term]/hint`; `/explain/[term]/type`; next term; `/explain/[term]/leave`.

The mic is the main action, so the two ways out sit beside each other under it rather than competing with it. This is where "I don't know" lives; the text screen carries the other copy.

### 19. 07 Recording — `/explain/[term]/recording`

- **States:** one, with a live timer.
- **Components:** a "Listening, 0:11" status line; `Waveform state="Live" progress="0"`; `RecordButton variant="Recording" label="Stop recording"`; "Tap to stop" in Body M Bold; Cancel as `Button variant="Tertiary"`.
- **Can do:** stop; Cancel; Skip; close.
- **Leads to:** stop → `/explain/[term]/review`; Cancel → `/explain/[term]` with the take discarded; next term; `/explain/[term]/leave`.

Push-to-talk with an explicit stop. No auto-endpointing. Brand violet is reserved for live audio here and nowhere else in the feature.

### 20. 08 Review — `/explain/[term]/review`

- **States:** `TakePlayer state="Default"` at rest, `state="Playing"` during playback.
- **Components:** `TakePlayer surface="Page"` with `duration` set to the real elapsed time of the take, its radius overridden to Radius/Full on this screen; `Button variant="Primary" size="L" CTA="Send answer" showRightIcon rightIcon="arrow-right"`; `Record again` and `Type instead` as `Button variant="Secondary" size="M"`.
- **Can do:** play the take; Send answer; Record again; Type instead; Skip; close.
- **Leads to:** `/explain/[term]/checking`; `/explain/[term]/recording` with the old take discarded; `/explain/[term]/type`; next term; `/explain/[term]/leave`.

No transcript on this screen. Correcting a transcript turns the loop into an editing step.

### 21. 09 Processing — `/explain/[term]/checking`

- **States:** one, 2.5s.
- **Components:** `VerdictHeader verdict="Checking" title="Checking your answer"`; `Skeleton lines="3"`. `bottomContent` is empty.
- **Can do:** nothing that changes the request. A tap is inert but Knowie acknowledges it with a pulse.
- **Leads to:** automatically to the verdict the script gives — `pass`, `pass-hinted`, `hint-1`, `hint-2`, `last-miss`, or `not-heard` for a silent take.

### 22. 09b Processing, still thinking — `/explain/[term]/checking/slow`

- **States:** one. Entered at 5s into a wait that runs long.
- **Components:** as 09, with `VerdictHeader title="Still thinking" caption="This one is taking a moment. Your answer is safe."` and a `Button variant="Tertiary" size="M" CTA="Cancel and try again"`.
- **Can do:** Cancel and try again.
- **Leads to:** `/explain/[term]/review` with the take intact; otherwise resolves to the verdict as normal.

### 23. 15 + 16 Text fallback — `/explain/[term]/type`

- **States:** two on one route — `TextField state="Empty"` and `state="Filled"`. The field moves between them as the student types.
- **Components:** the prompt; `TextField label="Your explanation"`; a helper line reading "Typed answers are judged the same way and count the same."; `Button variant="Primary" size="L" CTA="Send answer"`, disabled while empty; under it a `ButtonPair` of `Button variant="Secondary" size="M" CTA="I don't know" showLeftIcon leftIcon="help-circle"` and `Button variant="Secondary" size="M" CTA="Switch to voice" showLeftIcon leftIcon="microphone-01"`.
- **Can do:** type; Send answer; I don't know; Switch to voice; Skip; close.
- **Leads to:** `/explain/[term]/checking`; `/explain/[term]/hint`; `/explain/[term]`; next term; `/explain/[term]/leave`.

Text is **sticky** for the rest of the session once chosen — term 2 opens here, not on Idle, with Switch to voice still offered. For a student whose mic is denied, this button reads **Turn on voice** and leads to `/explain/denied`.

### 24. 05b Resume — `/explain/resume`

- **States:** one. Shown when a session is reopened part-done.
- **Components:** `AppBar variant="leftIconButtonOnly"`; `MascotFigure size="L" pose="Standby"`; `TextBlock variant="L" title="Pick up where you left off"` naming which terms are done; `Button variant="Primary" size="L" CTA="Continue"`; `Button variant="Secondary" size="M" CTA="Start over"`.
- **Can do:** Continue; Start over; close.
- **Leads to:** the term they stopped on; `/explain/1` with outcomes cleared; `/plan`.

### 25. 06b Leave session, confirm — `/explain/[term]/leave`

- **States:** one. The current screen behind a sheet.
- **Components:** `Scaffold showBottomSheetBackground={true}` with a sheet in `bottomSheetOnly`: "Leave Explain out loud?", "Your progress is saved…", `Button variant="Primary" size="L" CTA="Keep going"`, `Button variant="Tertiary" size="M" CTA="Leave"`.
- **Can do:** Keep going; Leave.
- **Leads to:** back to the screen underneath; `/plan`.

Leave is **Tertiary**, per the frame: the way out stays available without being invited, and the screen's one Primary is the *staying* one — a confirm should make the reversible choice the easy one.

The sheet is currently hand-built. `bottomSheet` is a decided component that does not exist yet — see `design-system.md`, "Gaps waiting for a decision". When it is built, this sheet, 05's and 18's all re-point at it.

### 26. 17 Summary — `/explain/summary`

- **States:** one.
- **Components:** the claim headline — for a scripted run, **"You explained 1 of 3 without help."**; an XP total of **25 XP**; `TermRow` ×3 — `Feudalism` Unaided `+15 XP`, `Serfdom` Revealed `+0 XP`, `Manorialism` Hinted `+10 XP`; a "Tap any term…" line; `Button variant="Primary" size="L" CTA="Continue"`; `Button variant="Secondary" size="M" CTA="Redo 2 terms"`.
- **Can do:** tap a row; Continue; Redo 2 terms.
- **Leads to:** `/explain/summary/[term]`; Continue → `/plan/to-revisit` when terms are coming back, `/plan/mastered` when none are — on the scripted run, always `/plan/to-revisit`; Redo → `/explain/1` for a fresh run.

Continue's destination is derived from the outcomes, not written down, so it can never name a different state from the one the rows report. The scripted run finishes 1 of 3, so it always resolves to `/plan/to-revisit`; `/plan/mastered` is reached by clicking through `20b`'s Done — see screen 28.

`TermRow variant` stays the four values. A Hinted term reads `+10 XP` or `+5 XP` and the XP value is what tells the two apart — there is no fifth outcome. Redo awards full XP.

### 27. 18 Summary, term tapped — `/explain/summary/[term]`

- **States:** two shapes. A **recorded** term shows `TakePlayer surface="Sheet"` with `AnswerBlock kind="Said"` and `AnswerBlock kind="Answer"`. A term with **no take** — skipped, or typed — shows the answer and its key ideas alone, with no player.
- **Components:** the summary behind a sheet; a header carrying the outcome's badge, the term and the outcome as a word in its own colour — **not** `StatusTag`, which the updated frame replaced and whose own description no longer claims this place; the blocks above, with the key ideas inside the `AnswerBlock kind="Answer"`; `Button variant="Primary" size="L" CTA="Done"` back to the summary.
- **Can do:** play the take where there is one; close the sheet.
- **Leads to:** back to `/explain/summary`.

`TakePlayer` must never appear where the student did not record. That is the component's own rule.

### 28. 20b Revisit complete — `/explain/revisit-done`

- **States:** one. The end of a revisit session, in place of the full summary.
- **Components:** `MascotFigure size="L" pose="Excited"`; `TextBlock variant="L"` naming the terms that came back and the next check; `Button variant="Primary" size="L" CTA="Done"`.
- **Can do:** Done.
- **Leads to:** `/plan/mastered`. The close icon goes to the same place.

A revisit awards no XP, and does not warrant a per-term breakdown.

**Done has one destination, not two.** The terms that were outstanding came back unaided, so the section's latest session is now all-unaided — which is what `sectionHeader` reports and what Mastered means. This is also the only click path to `21` in the whole flow: the scripted run always finishes 1 of 3, so `17 Summary`'s Continue always lands on `/plan/to-revisit` instead.

**It reports both terms the first session left behind**, not one. The scripted run ends 1 of 3 — Serfdom revealed, Manorialism hinted — and both come back unaided here, which is what makes `21`'s "You got all 3 terms right" true on the other side of Done. The recall itself is not built.

**Two entries, and neither may show in the copy.** `19`'s "Do it now anyway" arrives with no time passed; `20 Home, revisit` arrives five days later. So the title says the term was got on the student's own rather than that it "came back", and the caption names no day. Both are stubbed — see below.

---

## Out of scope

Not built, on purpose. Anything here that shows on a screen is a static placeholder.

- **The learning steps themselves.** The prototype cuts to a section whose reading and quizzes are already done.
- **Knowie speaking.** Voice in, text out. No audio output anywhere.
- **Tutoring, or any follow-up-question branch.** If the student asks a question, this does not become a conversation.
- **Real speech recognition and real judging.** See the next section.
- **A dropped network mid-answer.** Known gap. Every other failure path here is a designed screen.
- **A recording interrupted by a call, screen lock, or backgrounding.** Grouped with mic-busy.
- **Mic busy, a language switch mid-answer, pause and resume into one take.**
- **Leaderboard interstitial, XP for revisit sessions, the all-mastered home state, same-day or multiple exams.**
- **Light mode, tablet, desktop, Android.** 390px, dark mode, iOS-shaped only.
- **The app chrome on home and plan** — Status Bar, Navbar, Navigation Button, Avatar come from a library this file cannot reach. Decided: it ships as flat PNGs exported from Mockups v2 into `public/chrome/`, rendered by `src/app/_chrome/ChromeStrip.tsx` and inert. Nothing on it is in the click path and none of it is announced. `ChromeStrip` is not a design-system component and never enters Storybook.
  - **The bottom bar is no longer part of this.** `bottomNav` is a real component set in Figma now, so home and plan carry a `BottomNav` instance instead of a strip: two live tabs — home-chat to `/`, study-plan to `/plan` — and search, trophy and the avatar drawn inert, which is the component's own rule. The strip on the home screens is now `bottomContent.png`, the tool row and "Ask anything" alone. `home-bottom.png` and `plan-bottom.png` are unreferenced and kept only as a record of what the bar used to be.
- **`Allow in Settings` actually opening settings.** A web app on iOS Safari cannot deep-link to microphone permissions. The button is present because the student needs to be told where to go; it does not navigate.

---

## How the mocked recall behaves

Speech recognition, judging and latency are all hard-coded. These are the rules the app actually runs.

**The verdict is scripted per term.** Nothing the student says changes it.

| Term | Path |
|---|---|
| 1 | Pass → `10 Got it`, Unaided, +15 XP |
| 2 | Miss → hint 1 → Partial → hint 2 → wrong → `12b` → `13 Answer revealed`, Revealed, 0 XP |
| 3 | Partial → hint 1 → Pass → `10b Got it, after a hint`, Hinted, +10 XP |

Identical every run, which is what makes a demo repeatable.

**Waits.** Every processing wait is 2.5s, except **term 2's first attempt, which runs about 7s** and crosses the 5s threshold into `09b Processing, still thinking`. That is the only place the slow-wait state appears, and it appears in a normal run-through without being summoned.

**Silence.** A take with no audio is caught *after* the wait, not before, and resolves to `09c Didn't catch that`. Retrying costs no rung on the hint ladder.

**"I don't know."** It is a routing rule, not a screen of its own: it shows **one hint, then the reveal**. It does not run the full two-hint ladder, and a term resolved this way records as Revealed at 0 XP.

**Timers are real.** The recording counter and `TakePlayer duration` both report actual elapsed time, and playback runs for that long. This is the one part of the loop that responds to the student.

**Typed answers are judged on length alone.** 20 characters or more passes; anything shorter gets a hint; an empty field leaves Send answer disabled. This is scaffolding, not a judging model — in the real product one judge grades both modes.

**Mode is not recorded.** A typed answer that passes records as Unaided at the full 15 XP, and nothing on the row or in the sheet says it was typed. Text is an equal path.

**XP.** Unaided 15, correct after one hint 10, correct after two hints 5, revealed 0, skipped 0. A scripted session therefore collects 25 XP. **Every outcome prints its number, including the zeroes** — a revealed or skipped term reads `+0 XP`, on its summary row and in its outcome line, so the three rows visibly add up to the total above them. The word beside the number is what says why it is what it is.

---

## Verification

How someone checks this is done and correct, without reading the code.

### 1. The component library still passes

```
npm run storybook          # catalog at :6006
```

Run the story tests from the Storybook MCP `test-run`, or directly:

```
npx vitest run --project=storybook
```

Every story passes, including accessibility checks. No component is used with a prop that isn't in its Storybook docs.

### 2. The happy path, end to end, by clicking only

Start at `/` and never type a URL again.

1. `/` → **Continue studying** → `/plan`.
2. The Voice step reads "Explain 3 terms from this section out loud, ~2 min" and is **tappable even though no learning step is complete**. Tap it.
3. `/explain/intro` — one Primary (`Allow mic`), no Skip. Tap **See example**, then **Got it**, then **Allow mic**, and grant permission.
4. **Term 1.** Hold record for at least 3 seconds. The timer counts real seconds. Stop → Review shows that same duration. Play it back; it runs for that long. **Send answer** → 2.5s wait → **You got it**, chips ticked, `+15 XP · unaided`.
5. **Term 2.** Record and send. **The wait runs about 7 seconds**, and at 5s the screen says "Still thinking" and offers Cancel and try again. Let it finish → **Not quite**, hint 1 of 2, with what Knowie heard. Skip is live here. Try again → hint 2 → try again → **Not quite, last attempt** → **Show me the answer** → the reveal, chips not ticked, and the outcome line reading `revealed`. Tap **Say it back**, record, and land back on the reveal with the chips now ticked and Next term promoted to Primary.
6. **Term 3.** Record and send → hint 1 → try again → **Got it**, caption "Took a nudge, and you got there.", `+10 XP · hinted`, with **Say it back** offered as a secondary. The forward button reads **See how you did**, not Next term.
7. `/explain/summary` — **"You explained 1 of 3 without help."**, **25 XP**, three rows: `Feudalism` Unaided `+15 XP`, `Serfdom` Revealed `+0 XP`, `Manorialism` Hinted `+10 XP`. Tap each row: a recorded term shows a player, a term with no take shows the answer alone.
8. **Continue** → `/plan/to-revisit`. The section header reads its unaided count, and Knowie's scheduling line is **visible**, naming when the terms come back.

### 3. Every failure path is reachable by clicking

- **Silence:** on any term, tap record and stop immediately. After the wait, "Didn't catch that" — headline in the neutral colour, not the miss colour — and the hint ladder has not advanced.
- **Denied permission:** clear the site's mic permission, restart at `/explain/intro`, tap **Allow mic**, deny. `/explain/denied` offers Type my answers. Take it; the text screen offers **Turn on voice**, not Switch to voice.
- **Text mode is sticky:** type an answer for term 1 and send. Term 2 opens on the text screen, not on Idle, with Switch to voice present.
- **Leaving:** tap the close icon mid-session. The confirm sheet appears. **Keep going** returns to the same screen. **Leave** goes to `/plan/in-progress`, the stage a started session leaves the plan on.
- **Resuming:** leave mid-session, then tap the Voice step again. `/explain/resume` names which terms are done. **Continue** returns to the term you left; **Start over** clears it.
- **Impatience:** tap the screen repeatedly during a wait. Nothing breaks and nothing double-sends, but Knowie reacts.
- **Saying you don't know:** tap **I don't know** on `06 Idle`, and again on the text screen. Both land on `/explain/[term]/hint` — one hint, headline in the neutral colour — and **Show me the answer** resolves the term as Revealed at 0 XP, with no take quoted back and no attempt credited. The row of ways out reads in the mode the student came from: from Idle it offers **Have a go** at the mic and **Type instead**; from the text screen it offers **Have a go** at the field and **Switch to voice**.

### 4. Rules that must hold on every screen

- Exactly **one** `Button variant="Primary"` visible per screen.
- Skip is live on 06, 07, 08, 09c, 11, 12, and the text screen; disabled on 09, 09b, 10, 10b, 12b, 13, 13b.
- No `StepperStep type="Voice"` is ever `state="Locked"`.
- No colour carries meaning alone — every verdict has a word and an icon or a pose beside it.
- Every value resolves to a token from `tokens/tokens.json`. No `var(--token, #fallback)` anywhere.
- Sentence case on every label, button and heading, except Knowie and PRO.
- Under `prefers-reduced-motion`, the waveform bars, Knowie's roll, the skeleton shimmer and the XP count-up all stop, while the recording timer, the progress indicator and every copy change keep running. The processing screen steps its status line — "Sending your answer", then "Checking it" — so the wait still shows it is alive.

---

## Known trade-off, accepted

**A section can read Mastered without being read.** The voice step is available cold, a cold session counts fully, a redo awards full XP, and `SectionHeader` reports the latest session. Together these let a student open a section they have never opened, redo until 3 of 3, and see **Mastered**.

This is a deliberate decision, not an oversight. Availability and full credit are worth more than protecting the claim from a student who is determined to game it, and the revisit schedule still does its work for everyone else. Do not "fix" it by re-gating the step or by discounting redos.

---

## Open

Nothing. The last open question — which screen carries the "I don't know" control — is settled: it sits in the `ButtonPair` on `06 Idle` and again on the text screen, in both cases as the left half of the row of ways out, so the same control is in the same place whichever way the student is answering. What it does was already settled and has not changed: one hint, then the reveal, recorded as Revealed at 0 XP.
