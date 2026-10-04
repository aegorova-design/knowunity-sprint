@AGENTS.md

## Hard rules

- Voice in, text out. Knowie never speaks — see design-brief.md.
- Push-to-talk, explicit send. No auto-endpointing — see design-brief.md, voice-ux.md.
- Two modes on this branch (`v2-real-voice`). **Real mode** (default) records the mic, transcribes it (`/api/voice-test/transcribe`) and judges it (`/api/judge`), behind the `/voice-test` passcode. **Demo mode** (`?demo=1`, saved per session, `?demo=0` to clear) replays the scripted walkthrough in `script.ts`/`session.ts` with no mic and no API calls. Every change must keep both working. sprint-context.md still describes the mocked sprint build; where it says "mocked", read that as demo mode.
- `judge/judging-rubric.json` is the only term source: prompts, answers, key ideas and hints all come from it, through `src/lib/judge-config.ts`. Only demo mode's scripted dialogue lives in `session.ts`.
- Mobile iOS only, 390px canvas, dark mode only — see design-brief.md.
- Every design value (color, space, type) comes from tokens/tokens.json, per the rules in design-system.md.
- App code lives in `src/app` (App Router). Import alias `@/*` → `./src/*` (tsconfig.json).
- Text fallback must be reachable from every answerable state — see voice-ux.md, design-brief.md.
- Flow, placement, and per-term-loop decisions are locked in sprint-context.md; don't re-derive them.
- Build from the components that already exist; if none fits, stop and write down the gap instead of making one — see design-system.md "Before you make anything".

## Session rules (v2)

- **Input mode is sticky session state.** `voice` or `type` (plus `denied`, type forced by a refused mic), in the `explain-input-mode` cookie so Server Component screens read it on first paint (`inputMode.ts`, `inputModeServer.ts`). It changes only on a Type instead / Switch to voice tap (`ModeButtons.tsx`), resets to voice on every new session (`/explain/1?new=1`, set by `SessionStart` on mount — never on render, so a prefetch cannot reset it), and dies with the session. Every answer surface puts the current mode in the Primary and the other mode in the Secondary; with the mic refused the Secondary is "Turn on mic", an explainer, not a live switch. Idle in type mode is the text field, so a reload mid-term and the next term open in the stored mode. Say it back is voice-only and is skipped in type mode.
- **Typed answers only fail one way.** Silent, unclear and slow are voice states. A typed unclear verdict returns to the field with the words kept and Knowie asking for more — no hint, no attempt spent. Only `failed` renders as its own screen for a typed answer. Typed answers read "What you typed", never "What Knowie heard" (`SaidAnswer.tsx`).
- **A revealed term is requeued once.** On its first reveal the term joins the back of the session queue (the `explain-requeue` cookie: queued terms plus the active requeue pass; `requeue.ts`, `requeueServer.ts`, `QueueState` in `session.ts`). It still requeues when it was the last term. It comes back with Knowie's "Let's try that one again.", the progress bar full (the denominator stays the session's term count), one hint, then the reveal. A second reveal keeps Revealed and does not requeue. The reveal screen has no Say it back in either mode — the requeue is the retry. Say it back stays only after a hinted pass in voice mode.
- **A requeue pass is hinted at best.** A pass on a requeued term routes to `pass-hinted` and records Hinted at the hinted rate, never Unaided; `outcomes.ts` guards it too. Only a revisit session may flip a term to Unaided, and **revisit sessions are not built in v2 — revealed and hinted terms cannot currently flip to Unaided at all.** The requeue result overwrites the first pass, so the summary row, terms to revisit, plan header and XP follow the final status, and the summary keeps only the last attempt's take.
- **No Redo after a session.** The summary's only exit is Continue, to the plan, and the plan offers no "Do it now anyway" on terms that needed help. An immediate redo is recognition, not recall; the revisit Knowie schedules is the intended second attempt. New sessions start only from the primer, Start over (`05b Resume`) and the plan's Explain out loud step — all through `/explain/1?new=1`, which resets input mode and the requeue.

## Open questions (not in v2 scope)

- What the revisit interval should be when the exam is one day away — the "couple of days" Knowie names would land after it.

## Never

- Never edit AGENTS.md.
- Never add voice output, tutoring, or a follow-up-question branch.
- Never require transcript correction as a step.
- Never trap the student without skip or text-mode as a way out.
- Never make an API call, touch the mic, or read `turnStore` in demo mode.
- Never call `/api/voice-test/transcribe` or `/api/judge` without the passcode session cookie — both routes reject it server-side (`src/lib/voicePasscode.ts`).
- Never merge `v2-real-voice` into `main`. `main` (tagged `v1-sprint`) is the mocked sprint prototype and stays that way.
- Never invent a token or component, or fork/detach one — see design-system.md "Never do this" and "Gaps waiting for a decision".
- Never capitalize a label, button, or heading beyond sentence case, except proper nouns (Knowie, PRO) — see design-system.md "Never do this".
- Never use a CSS fallback value on a token (e.g. `var(--token, #333)`).
- Never edit `build/css/tokens.css` — it is generated; edit `tokens/tokens.json` and run `npm run tokens`.
- Never treat 04-platform-constraints.md or explain-out-loud-sprint-flow.md as present — design-system.md references both but neither exists in this repo.

## Storybook

When working on UI, use the storybook tools to read the component library before answering or writing anything. Never assume a component prop exists. Query the documentation, and use only props that are documented or shown in a story. If a prop isn't there, stop and ask me.

## File map

- `AGENTS.md` — Next.js version-specific agent rules, regenerated by `next dev`. Read if Next.js APIs behave unexpectedly.
- `README.md` — stock create-next-app instructions, not project-specific.
- `design-brief.md` — the problem, hard constraints, and mandate. Read before designing any flow or screen.
- `design-system.md` — component and token usage rules, plus the 8 sprint-built components. Read before building or styling any screen.
- `component-gaps.md` — running list of things built inline during a screen build because no component existed, with the screen each was for. Read before building a new screen; if something on it is needed again, build it as a real component instead.
- `sprint-context.md` — locked decisions on placement, session/loop structure, and build specs. Read before touching flow logic, states, or copy.
- `voice-ux.md` — voice UX principles and the states-to-design priority table. Read before designing recording/processing/permission screens.
- `tokens/tokens.json` — source of truth for every design value. Consult when styling; never hardcode a value it defines.
- `style-dictionary.config.mjs` — Style Dictionary build: reads `tokens/*.json`, writes `build/css/tokens.css`. Edit when the output format or variable naming needs to change.
- `build/css/tokens.css` — generated CSS custom properties, tracked in git. Never hand-edit; change the token and run `npm run tokens`.
- `reference/*.png` — screenshots of the shipped beta and existing app flows referenced in design-brief.md. Check when comparing against what's already live.
- `package.json` — scripts (`dev`, `build`, `start`, `lint`, `tokens`, `tokens:check`, `check:tokens`, `storybook`, `build-storybook`, `chromatic`) and dependencies.
- `scripts/check-tokens.mjs` — run by `npm run tokens:check`. Fails if any CSS in `src/` reads a `var(--x)` that neither `build/css/tokens.css` nor the same file defines, and flags banned `var(--token, fallback)` forms.
- `scripts/check-hex.mjs` — run by `npm run check:tokens`. Fails if any non-comment line in `src/` (stories excluded) carries a raw hex colour, printing file and line for each.
- `tsconfig.json` — compiler options and the `@/*` path alias.
- `next.config.ts` — Next.js config, currently empty.
- `eslint.config.mjs` — lint rules (next/core-web-vitals + next/typescript).
- `next-env.d.ts` — Next.js ambient types, regenerated; don't hand-edit.
- `public/images/knowie-*.svg` — Knowie mascot artwork, one file per pose. Use through `mascotSlot`, per design-system.md.
- `public/audio/demo/term-{1,2,3}.m4a` — demo mode's sample takes for the summary player, one per term. A missing file hides the player.
- `src/app/layout.tsx` — root layout, fonts, metadata.
- `src/app/page.tsx` — 01 Home, first session.
- `src/app/globals.css` — global resets; imports `build/css/tokens.css`.
- `src/components/*` — the design-system components, each with a Storybook story. Read through the Storybook tools, not the source.
- `src/app/explain/*` — the Explain out loud session screens. Shared session-level files:
  - `session.ts` — the three terms (camouflage, hibernation, mammal), derived from the rubric, plus demo mode's scripted dialogue.
  - `script.ts` — demo mode's scripted verdicts, waits, XP and `SESSION_OUTCOMES`.
  - `demoMode.ts`, `DemoModeGate.tsx`, `layout.tsx`, `demoBadge.css` — the demo flag and the "Demo" badge on every `/explain` screen.
  - `turnStore.ts` — real mode's in-memory answer, transcript, verdict and per-idea hint counts. Deliberately lost on reload.
  - `outcomes.ts` — each term's result (outcome, XP, final transcript) in `sessionStorage`, and `useSessionOutcomes`, which every post-session screen reads: the script in demo mode, the recorded run in real mode. `RecordOutcome.tsx` writes it on 10, 10b and 13; `SessionStart.tsx` clears it on term 1's Idle.
  - `sessionTakes.ts` — each term's final recording, in memory, for the summary player. Lost on reload, and the player hides.
  - `realVerdict.ts` — where a real verdict routes (the real-mode counterpart to `script.ts`'s table).
  - `PendingAnswerGuard.tsx` — sends a reload mid-term back to Idle in real mode.
  - `VoicePasscodePrompt.tsx` — the passcode ask, shown once per session before the first real judge call.
  - `RealTakePlayback.tsx` — plays a real recording or audio file, and renders nothing if it cannot. Used on Review (real mode) and the summary sheet (both modes).
  - `ReviewPlayback.tsx`, `TakePlayback.tsx` — Review's choice between the real player and the decorative one demo mode uses.
  - `[term]/checking/CheckingWait.tsx` — the processing wait: demo mode's timer, or real mode's transcribe and judge (each request retried once). Past 5s in real mode it says "Still thinking", and `SlowCancel.tsx` (via `slowWait.ts`) shows "Cancel and try again".
  - `inputMode.ts`, `inputModeServer.ts`, `ModeButtons.tsx` — the sticky input mode: the cookie, its server read, and the buttons that change it.
  - `requeue.ts`, `requeueServer.ts`, `RequeueEffects.tsx` — the requeue cookie, its server read, and the two mount effects that write it (on a first reveal, on entering a requeued term).
  - `SaidAnswer.tsx` — the student's answer quoted back: "What Knowie heard" or "What you typed".
  - `[term]/type/TypeAnswerScreen.tsx` — the text fallback for a term and rung; also what Idle draws in type mode.
  - `[term]/NeutralRetryScreen.tsx` — the shared layout for the three non-verdict outcomes: `not-heard` (silence), `unclear` (an unclear verdict) and `failed` (a request that failed twice). Neutral, no rung spent.
  - `[term]/hint-1/HintOneBody.tsx`, `[term]/hint-2/HintTwoBody.tsx`, `[term]/last-miss/LastMissBody.tsx` — the parts of those screens that differ between demo and real mode.
- `src/app/plan/planData.ts` — plan screen content.
- `src/app/voice-test/page.tsx` — standalone debug page for the real record → transcribe → judge loop, behind the passcode. Not a designed screen; its raw hex and lint findings are known and out of scope.
- `src/app/api/voice-test/verify/route.ts` — checks the passcode and sets the session cookie (`POST`); reports whether the session is unlocked (`GET`).
- `src/app/api/voice-test/transcribe/route.ts` — OpenAI transcription. Needs the session cookie.
- `src/app/api/judge/route.ts` — Anthropic judge call. Needs the session cookie. Takes `inputMode` (`voice` or `typed`).
- `src/lib/judge-config.ts` — the judge's system prompt, message template, model, temperature and max_tokens, and the rubric import. Shared by the app and `judge/run-tests.mjs`.
- `src/lib/voicePasscode.ts` — mints and checks the signed passcode session cookie.
- `judge/judging-rubric.json` — the rubric: terms, ideas, pass rules, hints. The single source of term content.
- `judge/judge-prompt.md` — the judge prompt as a readable document. Keep in sync with `judge-config.ts`.
- `judge/judge-test-set.json`, `judge/run-tests.mjs` — judge regression tests. Run `node judge/run-tests.mjs [model]`; results go to `judge/results/` (gitignored).
- `eval/rubric.md`, `eval/scorecard-*.md` — the prototype grading rubric and past scorecards, used by the critic agents.
- Env vars (in `.env`, not committed): `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `VOICE_TEST_PASSCODE`. The same three must be set on Vercel.
- `.claude/launch.json` — dev-server config for browser-preview tooling.
- `.claude/settings.local.json` — local, machine-specific permission grants.
- `.claude/agents/*` — `spec-reviewer` and the four critics (`critic-system`, `critic-craft`, `critic-ux`, `critic-ambition`) that grade against `eval/rubric.md`.
- `.claude/skills/*` — generic Claude Code skills (interactive-prototype, ui-designer, ux-designer, ux-motion), not specific to this project.
