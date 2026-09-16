# Explain out loud, sprint context

## What this is

A 2.5-week redesign of Explain out loud, Knowunity's voice active-recall step, built as a web app that behaves like an iOS screen: 390px, dark mode only.
Speech recognition, judging and latency are mocked, so transcripts, verdicts and the wait are all hard-coded.

## Committed concept

A section capstone where the student explains 3 key terms out loud, Knowie replies in text with a pass, a hint ladder or a reveal, and the section is left carrying an unaided count that pulls the student back for a spaced revisit before the exam.

## Where the recall step lives

At the end of a plan section, after that section's last learning step, not at position 2 in the stepper. The position is fixed; the availability is not. The step is tappable from the moment its section exists and is never gated on the learning steps.

## Decisions

Placement and return

- Capstone at the end of the section, not position 2, because position 2 fires retrieval before the student has encoded enough to retrieve. That reasoning sets the position, not a gate: the step never locks, so the sequence is a recommendation the student can ignore.
- The voice step is available at all times, including before any learning step in its section is complete, because a lock spends activation to protect a pedagogy the ordering already communicates. This reverses the earlier gated-step decision.
- Tapping it cold starts the session with no warning screen and no different framing, because a student choosing to test themselves early does not need to be talked out of it.
- A cold session counts exactly like a capstone one, same XP, same outcomes, same unaided count on sectionHeader, because a student who already knows the material should not have to work through three learning steps to get credit for it.
- Home changes only when terms are due: exam headline unchanged, one "1 term to revisit" line, Explain out loud primary, Continue studying demoted to a text link, because the return trigger is plan state, not elapsed time.
- First entry is the step's own caption in the plan, "Explain 3 terms from this section out loud, ~2 min", and nothing else, because removing the lock removed the unlock moment and no substitute moment is worth the surfaces it would cost.
- Continue on the summary returns to the plan, because the section header and Knowie's scheduling line are the consequence of the session and the student should watch them land.
- Knowie's action on a plan section, "Do it now anyway" and "Practice sooner", starts the recall loop immediately over the terms Knowie just named, because the scheduled date is a recommendation and a student who wants to practise sooner should not have to wait for it.
- A section can read Mastered without having been read, and that is accepted. Availability and full credit are worth more than protecting the claim from a determined student, so the step is never re-gated and a redo is never discounted.

Session

- 3 terms per session, end states unaided / hinted / revealed / skipped, because the summary claim is a count of unaided terms.
- XP is 15 unaided, 10 correct after one hint, 5 correct after two hints, 0 revealed and 0 skipped, because the ladder should cost something at every rung rather than only at the bottom.
- The outcome taxonomy stays at four. Hinted carries both 10 and 5 and the row's XP value is what tells them apart, because a fifth variant is a product decision and statusTag's label is owned by the variant.
- Terms are drawn from the section's fixed term set whatever the student has read, because the step is available cold and the draw cannot depend on progress it does not require.
- Text is a session-level mode reachable from every answerable state, because a student who cannot speak right now must not be trapped mid-session.
- Text is sticky across terms once chosen, with Switch to voice present on every text screen, because a student who cannot speak should not decline the same offer three times.
- Leaving mid-session goes through a confirm sheet on the appBar's close action, because two terms of work is too much to lose to a mis-tap.
- Returning opens a resume prompt naming where they stopped, with Continue primary and Start over secondary, because a student coming back days later needs re-orienting before they are asked to speak.
- Redo from the summary awards full XP, because a student who works through the whole section again has done the work.
- The first-run primer carries one primary, Allow mic, with See example and Type instead as secondary, because the screen is the permission ask and only one action can be the ask.
- Revisit sessions are partial and open in voice with Type instead available, whatever the last session used, because voice stays the primary affordance and mode is not a saved preference this sprint.
- The first-run screen doubles as the mic permission primer and shows once, because a denied prompt has to route into text mode instead of dead-ending.
- Revisit sessions award no XP, because repeat-session XP is out of scope this sprint.
- A revisit ends on a short confirmation naming the next date, not the full summary, because one term does not warrant a per-term breakdown.
- A student denied the mic gets Type my answers, and Switch to voice becomes Turn on voice leading to the permission help, because an affordance they cannot use must not sit there live.

Per-term loop

- Record, hear the take back, then explicit send, because a wasted take costs the student a full processing wait to discover.
- Review shows no transcript, because correcting a transcript turns the loop into an editing step.
- Miss ladder is hint 1, retry, hint 2, retry, reveal, because a miss should cost hints, not the answer.
- "I don't know" shows one hint and then the reveal, not the full two-hint ladder, because it is a routing rule rather than its own state and a student who says they do not know has already told you the ladder will not help.
- Skip is live wherever the student can still act on the current term, including the hint screens, and disabled once the term is in flight or resolved, because otherwise the only exit from the hint ladder is the reveal.
- A skip jumps straight to the next term without showing the answer, because a skip that reveals is just a slower reveal.
- A wrong answer after hint 2 gets one beat naming the miss before the reveal, because being jumped to the answer ignores the third attempt.
- Say it back is offered on the reveal as the primary and on a hinted pass as a secondary. It records, is never judged and changes no outcome or XP, because a term that needed the answer shown cannot earn its way back up.
- The say-back acknowledgement reuses the reveal screen with the key idea chips ticked and Say it back replaced by Next term, because the answer should stay on view while the confirmation lands.
- The forward action on the last term reads "See how you did", because "Next term" names something that does not exist.
- A verdict names its value in one slot under the actions: "+15 XP · unaided" on a pass, the outcome word alone on a 0, because a zero at the session's lowest point is the harshest possible read. The reveal screens carry "revealed" in that slot, and a Revealed row on the summary carries its tag and no number.
- Progress advances on any resolution including a skip, because the bar reports position in the session and never doubles as a score.
- Record again discards the take and starts recording; Cancel during a recording returns to Idle, because a fumbled first sentence must never force a bad submission.
- Key idea chips appear on pass and reveal only, never on hint screens, because on a hint screen they give the answer away.
- Reveal shows encouragement only if the student actually attempted, and carries no calibration copy, because praise for a skip reads as false.
- Processing shows Knowie rolling and no transcript on a fake delay of about 2.5s, because the wait is the hardest state and has to be designed, not removed.
- A tap during processing changes nothing but Knowie acknowledges it, because a screen that does not react at all is what convinces a student the app has broken.
- Past 5s the wait gains "Still thinking" and a Cancel and try again, because a wait with no way out is a trap.
- A take with no audio is caught after processing as "Didn't catch that", and retrying costs no rung on the ladder, because a mic failure is not a knowledge failure.

## How the mock behaves

Speech recognition and judging are hard-coded. These are the rules the prototype actually runs.

- A scripted session yields one unaided term of three and collects 25 XP: term 1 unaided at 15, term 2 revealed at 0, term 3 correct after one hint at 10. The summary reports the script and never a rounder number.

- The verdict is scripted per term: term 1 passes, term 2 runs the full ladder to a reveal, term 3 passes after one hint, because a demo has to be reproducible and a script is the only way to guarantee it.
- Term 2's first attempt waits about 7s and crosses the 5s threshold; every other wait is 2.5s, because the slow-wait state has to be reachable in a normal run-through without making runs differ.
- A typed answer is judged on length alone, 20 characters or more passes, because the mock cannot read meaning and a length rule is honest scaffolding rather than a pretend judge.
- A typed answer records as Unaided and the mode is not recorded anywhere, not on the row and not in the sheet, because text is an equal path and marking it would price the accessible route below the spoken one.
- The recording timer and the take's duration are both real elapsed time, because the one part of the loop the student controls should respond to them.

## Summary and after

- The summary claims a count of unaided terms and nothing more, because that is the only claim the session actually measures.
- Calibration is carried by the revisit schedule, not by summary copy: hinted, revealed and skipped terms come back on a date Knowie names, unaided ones do not, because a consequence the student can see beats a claim they have to believe.
- sectionHeader reports the latest session and can regress, because a count that only ever goes up is a trophy rather than a claim.
- A term's sheet has two shapes: a recorded term shows the take player with what Knowie heard and the answer, and a term with no take shows the answer and the key ideas alone, because takePlayer must never appear where nothing was recorded.
- mascotMessage drops Relearn and a 0-of-3 section reads ToRevisit, because three states that pair with sectionHeader beat four that do not.

## Motion and accessibility

- Reduced motion freezes decoration and keeps status: the waveform bars, Knowie's roll, the skeleton shimmer and the summary's XP count-up stop, while the recording timer, the progress indicator and every copy change keep running.
- Under reduced motion the processing screen steps its status line, "Sending your answer" then "Checking it", because removing the animation otherwise removes the only evidence anything is happening.

## Locked build rules

Set in the corrected Idle, Recording, Review and Processing mockups. Every new screen matches these.

- Live recording uses brand violet, not coral: record button fill, live waveform bars, status dot.
- Recording stack: "Listening, 0:11" status line, live waveform, record button, "Tap to stop" in Body M Bold, Cancel as tertiary. No helper line.
- Review stack: take player at full radius, Send answer as primary L with arrow, then Record again and Type instead side by side as Secondary M.
- Every button carries an icon: mic for record actions, keyboard for Type instead.
- Supporting actions under a primary are Secondary M, 48 tall, both with a background.
- Progress indicator: primary, thickness 24, no "1 of 4" label, 0 on the first term.
- bottomContent padding 32 top and bottom, bottom stack gap Space/400, mic label and helper text in one frame at Space/100.

## Not building

- The learning steps themselves. The prototype cuts to a completed section.
- Knowie speaking, and any tutoring or follow-up question branch.
- Leaderboard interstitial, XP for repeat sessions, the all-mastered home state, same-day or multiple exams.
- Mic busy, language switch mid-answer, pause and resume into one take.
- A dropped network mid-answer. Noted as a known gap; every other failure path here is a designed screen.
- A recording interrupted by a call, a screen lock or backgrounding. Grouped with mic busy.
- Light mode, tablet, desktop, Android, real speech recognition, real judging.
