# Explain out loud, sprint context

## What this is

A 2.5-week redesign of Explain out loud, Knowunity's voice active-recall step, built as a web app that behaves like an iOS screen: 390px, dark mode only.
Speech recognition, judging and latency are mocked, so transcripts, verdicts and the wait are all hard-coded.

## Committed concept

A section capstone where the student explains 3 key terms out loud, Knowie replies in text with a pass, a hint ladder or a reveal, and the section is left carrying an unaided count that pulls the student back for a spaced revisit before the exam.

## Where the recall step lives

At the end of a plan section, after that section's last learning step, not at position 2 in the stepper.

## Decisions

Placement and return

- Capstone at the end of the section, not position 2, because position 2 fires retrieval before the student has encoded enough to retrieve.
- Home changes only when terms are due: exam headline unchanged, one "1 term to revisit" line, Explain out loud primary, Continue studying demoted to a text link, because the return trigger is plan state, not elapsed time.

Session

- 3 terms per session, end states unaided / hinted / revealed / skipped at 10 / 5 / 2 / 0 XP, because the summary claim is a count of unaided terms.
- 
- Text is a session-level mode reachable from every answerable state, because a student who cannot speak right now must not be trapped mid-session.
- Revisit sessions are partial and open in voice with Type instead available, whatever the last session used, because voice stays the primary affordance and mode is not a saved preference this sprint.
- The first-run screen doubles as the mic permission primer and shows once, because a denied prompt has to route into text mode instead of dead-ending.
- Revisit sessions award no XP, because repeat-session XP is out of scope this sprint.

Per-term loop

- Record, hear the take back, then explicit send, because a wasted take costs the student a full processing wait to discover.
- Review shows no transcript, because correcting a transcript turns the loop into an editing step.
- Miss ladder is hint 1, retry, hint 2, retry, reveal, because a miss should cost hints, not the answer.
- "I don't know" shows a hint first, then try again or reveal, because it is a routing rule, not its own state.
- Skip sits in the header on every answerable screen and jumps straight to the next term without showing the answer, because a skip that reveals is just a slower reveal.
- Key idea chips appear on pass and reveal only, never on hint screens, because on a hint screen they give the answer away.
- Reveal shows encouragement only if the student actually attempted, and carries no calibration copy, because praise for a skip reads as false.
- Processing shows Knowie rolling and no transcript on a fake delay of about 2.5s, because the wait is the hardest state and has to be designed, not removed.

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
- Light mode, tablet, desktop, Android, real speech recognition, real judging.
