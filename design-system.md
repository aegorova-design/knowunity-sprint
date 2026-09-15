# Knowie design system rules

Rules, not values. Every value lives in tokens/tokens.json. If this file and tokens/tokens.json disagree, tokens/tokens.json wins and this file has a bug.

Source: Figma file Yummy__Knowie Design Sprint (key 2wQS1QXnRuDtXMJESRpeQh), renamed from Yummy__Knowie Design System. Scope for this sprint comes from sprint-context.md and design-brief.md: iOS-style web app, 390 iPhone canvas, dark mode only.

## Before you make anything

1. Check the component list below. If a component does the job, use it.
2. If a component almost does the job, use it and write down what's missing. Don't fork it.
3. If nothing does the job, stop. Write down the gap and a proposed name, then wait for a decision.
4. Take every value from the semantic layer in tokens/tokens.json. If the value you need isn't there, say so.

## Which component, when

**scaffold.** Every screen starts here. It handles the status bar, the home indicator and the page background. Build inside it, never around it. Use the size=iPhone 13 variant, and check the XS - iPhone SE variant for anything that could break at a narrow width.

**appBar.** Top navigation inside the scaffold's topNavigation slot.
- leftIconButtonOnly: a back or close action with nothing else.
- leftAndRightIconButton, leftAndTwoRightIconButtons: back or close plus icon actions such as a menu.
- leftAndRightButton, leftAnd2RightButtons: when a right-hand action needs a text label, like Skip.
- The center Slot holds a progressIndicator on flow screens, matching the app's quiz and setup flows.

**button.** Any action with a text label.
- Primary is the one main action on the screen. Never more than one per screen.
- Secondary is a supporting action such as Skip, Cancel or Why?.
- Tertiary is the lowest-emphasis text action.
- States are Default, Pressed, Disabled and Loading. Use Loading while the action's own request is in flight. It is not a screen-level waiting state.
- The placeholder label is "1/2 words". Keep labels to one or two words, and test the longest one in German.

**buttonIcon.** An action shown as an icon alone: close, back, menu. Same variants and states as button. An icon-only control needs an accessible label in code.

**buttonGroup.** A primary and a supporting action shown together, usually in bottomContent. The two variants are different shapes, not two arrangements of the same pair.
- Vertical stacks a full-width primary button over a full-width secondary button. Use it when either label could wrap after translation, which is the usual case.
- Horizontal puts a secondary buttonIcon first, hugging its square, and lets the primary fill the rest of the row. It carries one label, not two.
- M and L set the size of the controls inside. Pass the same size to both children.

**chips.** Selectable options: topics, filters, tool entry points. active=True marks the selected state. Use color=pro only for PRO content.

**iconSlot.** Every icon goes through iconSlot. Swap the icon with the Instance property. Never place a raw icon.

**mascotFigure.** Knowie, and only Knowie. size picks how much presence the moment needs and pose picks what Knowie is doing about it. Never scale the artwork by hand and never place .mascotFigureBase directly. See the Sprint components section.

**mascotSlot is retired.** mascotFigure replaces it. mascotSlot is still placed 17 times, all of it on the Example Screens, Mascot & components and Strategy pages and none of it in the Explain out loud mockups. Don't place it again, and don't fix its broken variant naming; move the instance to mascotFigure instead.

**progressIndicator.** Step progress through a flow. Use showText when the number itself matters to the student.

**snackbar.** A short, transient message with an optional action: Default, Success or Error. Two lines at most. It is not a verdict surface, and it has no partial variant.

**textBlock.** A title with an optional caption. Use XL and L for screen-level headings, and M and S for section headings.

**Sprint components.** recordButton, waveform, takePlayer, answerBlock, mascotMessage, statusTag, termRow, stepperStep, sectionHeader, mascotFigure, verdictHeader and textField were built for Explain out loud. See the Sprint components section below.

**Not in this system.** Chat Input and checkbox are instances from an external library. That library isn't connected to this file. Treat them as missing, not as available.

Text Field and Knowie's pose artwork used to be on that list. Both are local component sets now, textField and mascotFigure, and both are in the Sprint components section.

The app chrome on the home and plan mockups comes from the same unreachable library: Status Bar, Navbar, Navigation Button and Avatar. Nothing in this system draws them, so a screen that needs them can't be built from these components alone.

## Scaffold slots

The scaffold stacks top to bottom: the status bar header, then topNavigation, then middleContent, then bottomContent. bottomSheetOnly overlays them.

**Status bar header.** Fixed. Put nothing here.

**topNavigation.** One appBar, nothing else. It hugs its content. Hide it with showTopNavSlot only on screens that genuinely have no navigation, such as a full-screen mascot moment.

**middleContent.** Everything the student reads: textBlock, mascotFigure, lists, the transcript, Knowie's reply. It fills the remaining height and scrolls. Its padding and gap are already bound to Space tokens, so don't add outer margins inside it.

**bottomContent.** Actions and input: a single button, a buttonGroup, a chat input or bottom navigation. It hugs its content. This is the thumb zone, so the mic and anything tapped repeatedly in the recall loop go here. showBottomNavSlot hides it.

**bottomSheetOnly.** Sheet content. Turn on showBottomSheetBackground with it so the sheet gets its backing surface. Only one sheet at a time.

**Scaffold status.** The main component has been restored and now lives on the Sprint components page, so it can be edited again. The slots' preferred components still point to a library this file can't reach, so the intended slot contents can't be read from Figma.

It carries two generations of properties at once. The seven camelCase ones above are current: topNavigation, middleContent, bottomContent, bottomSheetOnly, showTopNavSlot, showBottomNavSlot and showBottomSheetBackground. Alongside them sit eight older ones — Slot - Top navigation, Slot - Content, Slot - Bottom nav, Slot - Bottom-sheet, Show Top Nav Slot, Show Bottom nav slot?, Show nav scrim and Show bottom-sheet background. Use the camelCase set. The old set wants deleting, which is a change to a component every screen depends on, so it needs a decision first.

## Sprint components

Twelve component sets built for Explain out loud, one per section on the **Sprint components** page (page id 13605:12223). The same page also holds the restored scaffold and the private .mascotFigureBase. They are part of this system now: use them, don't fork them, and report gaps the same way as for anything else.

Every one of them is an addition made on purpose during the sprint, not a base-library component. They are built out of base components where one exists (iconSlot, buttonIcon, mascotFigure) rather than redrawn.

The block quoted under each heading is the component's own description in Figma, verbatim. That description is the source of truth for when to reach for it and what not to do with it. If this file and the Figma description disagree, the description wins.

Values are not repeated here. Every fill, padding, radius, gap and text style comes from the semantic layer in tokens/tokens.json.

**Term outcomes.** statusTag and termRow name the same four end states for a term: Unaided, Hinted, Revealed, Skipped. Their definitions and their XP live in sprint-context.md, not here — 10, 5, 2 and 0 XP in that order. A fifth outcome is a product decision before it is a variant.

**Section outcomes.** sectionHeader and mascotMessage name a section's capstone result, which is a different axis from a term's outcome. The rule is in sectionHeader's own description, not in a separate flow document: Mastered when every term came back unaided, ToRevisit when some did. mascotMessage adds Relearn for when none did. sectionHeader has no Relearn, so the two no longer pair across every value; see the gaps list.

### recordButton

> The mic for Explain out loud. One per screen, in bottomContent, where the thumb already is. Idle takes interactive.primary because it is the screen's one primary action; Recording takes accent.brand.bold because brand violet means audio is live and nothing else in this feature may use it that way. Stop occupies the same position as start, so the thumb does not move. Never pair it with a second primary action on the same screen, and never use the Recording variant for a state where audio is not actually being captured.

- **variant:** Idle, Recording
- **state:** Default, Pressed, Disabled
- **Other properties:** none
- 5 variants. Recording has Default and Pressed only, no Disabled: a live recording cannot be disabled mid-take.
- Fixed 96x96. Built from iconSlot carrying microphone-01.

### waveform

> The audio level display. Live while recording, Idle inside takePlayer for a take that exists but is not playing, Silent when nothing was captured. Progress fills the bars left to right as a take plays back, the same way progressIndicator fills. It is decoration for a state that is already carried by a label, a timer and an icon, so it must never be the only thing telling the student what is happening. Never recolour individual bars on an instance; if you need a split the variants do not offer, that is a gap to report. Reduced motion: the bars freeze, the timer and the label keep moving.

- **state:** Live, Idle, Silent
- **progress:** 0, 25, 50, 75, 100
- **Other properties:** none
- 7 variants. progress only exists at 0 for Live and for Silent; the four filled steps exist on Idle only.
- 236x32, 24 bars named `bar`. Playback lands on the nearest step, so a take reads in quarters and not continuously.

### takePlayer

> A recorded answer the student can listen back to before sending, and again from the summary sheet. Reach for it anywhere a take already exists. Use surface=Sheet when it sits inside bottomSheetOnly, so it stays distinct from the sheet behind it. It plays the take that was judged, never a re-record, so never reuse it as a generic audio player or put it on a screen where the student has not recorded anything yet.

- **state:** Default, Playing, Silent
- **surface:** Page, Sheet
- **duration:** text, default "0:14"
- 6 variants, 358x72. Built from buttonIcon plus a nested waveform.
- Default is a take at rest, Playing is the take running with waveform progress filling. What Silent is for is not stated in the description; it matches waveform state=Silent, so read it as a take with no captured audio.
- On the Review screen the radius is overridden to Radius/Full on the instance. That override is not in the component.

### answerBlock

> A labelled passage of text about the current term. Said is what Knowie heard, quoted back so a mishear reads as the app's mistake. Hint is the nudge, and it is the loudest of the three because it is the thing to act on. Answer is the reveal. Reach for it inside a verdict sheet or under a prompt, never as a screen heading, which is textBlock's job. Keep bodies to three lines; this is a glance, not a passage. Never recolour an instance to make one kind look like another. If you need a fourth treatment, that is a new kind and a decision.

- **kind:** Said, Hint, Answer
- **label:** text, default "What you said"
- **body:** text, default "Body"
- **showIcon:** boolean, default true
- 3 variants, 358 wide, hugging height. `labelRow` holds an iconSlot and the label; `body` sits under it.

### mascotMessage

> Knowie speaking to the student about their own recall. One per screen, in middleContent on the plan overview, where the stepper needs a human read on what just happened.
>
> state pairs with sectionHeader and drives the colour of the message and the pose Knowie pulls. Default is neutral, before a capstone result exists. ToRevisit is feedback/partial and Questioning: some terms needed a nudge. Mastered is feedback/success and Approving: the section is done. Relearn is feedback/error and means none of the terms came back unaided; the recommendation is to read the section again rather than practise harder, and the copy must say that without blaming the student. Relearn borrows the Standby pose because there are only four poses and none of them fits a gentle setback; a fifth pose is the proper fix and is a decision, not a variant.
>
> mascotFigure is size S here. Put the call to action in actionSlot rather than nesting a fixed button, so its emphasis can change without an override. helper carries the scheduling line, where Knowie says when these terms come back. Never use this as a generic tooltip or empty state: it is Knowie's voice about this student's recall, not a container for any message that needs a mascot beside it. Never carry the unaided count here, that read belongs to sectionHeader. Never recolour the message on an instance; a fifth reading is a product decision before it is a state.

- **state:** Default, ToRevisit, Mastered, Relearn
- **message:** text, default "Message"
- **helper:** text, default "Helper" / **showHelper:** boolean, default false
- **actionSlot:** slot, empty by default, stretches its child on insert
- 4 variants, 358x92. Built from mascotFigure at size S plus a `bubble` frame with a `tail`.
- There is no term line. An earlier version carried `term` and `showTermLine`; both are gone.
- The mapping from a section's result to a state is in sectionHeader's description. sectionHeader has no Relearn, so that one value has no header to pair with.

### statusTag

> One term's outcome as a label. Same four values and the same colours as termRow, so the two read as a set. The label is decided by the variant and is never edited on an instance: a fifth outcome is a new variant and a decision. Use it wherever the outcome needs naming beside a term, in the summary row and in the sheet header.

- **variant:** Unaided, Hinted, Revealed, Skipped
- **Other properties:** none. The label is a fixed text layer, deliberately not a text property.
- 4 variants, 24 tall, hugging width.

### termRow

> One term's outcome on the session summary. Four end states, each carrying its own icon and label as well as a colour, so they read apart in greyscale. The whole row is the tap target and it opens that term's sheet, so it needs a Pressed state and a 64 minimum height. Reach for it in the summary list and nowhere else; the sheet header shows the same trio but is not this component. Never change a tag's label on an instance to say something the variant does not: if you need a fifth outcome, that is a new variant and a decision.

- **variant:** Unaided, Hinted, Revealed, Skipped
- **state:** Default, Pressed
- **term:** text, default "Feudalism"
- **xp:** text, default "+10 XP"
- 8 variants, 358x64. Built from a `badge` frame with an iconSlot, the term and xp text, a nested statusTag and a chevron.
- The variant drives the badge icon and the nested statusTag together. Set the outcome once on the row, never on the tag inside it.

### stepperStep

> One step in a section's plan stepper. Invented for this sprint: the stepper exists in the app but not in this system.
>
> type says what the step asks for. Learning carries the quiz icon and bundles reading and quiz together. Voice carries the mic and is the Explain out loud capstone, which sits after the section's last learning step and never in the middle.
>
> state runs Locked, NotStarted, InProgress, Completed, and every one of them is a shape before it is a colour: Locked is a dashed ring with the icon and label at text/disabled, NotStarted is a solid empty ring, InProgress fills half the ring, Completed fills the ring and the core. Learning uses NotStarted, InProgress and Completed. Voice uses Locked, NotStarted and Completed, where NotStarted is what available looks like: a voice step stays Locked until every learning step in its section is Completed. Learning/Locked and Voice/InProgress exist so the matrix is square; neither is used in the sprint flow.
>
> Only Locked is untappable. Never fake a locked step by dimming an instance, use the Locked variant. Never carry the section's unaided count here; that read belongs to sectionHeader and mascotMessage. The caption is off by default and earns its place on Locked, where it should say what unlocks the step.

- **type:** Learning, Voice
- **state:** Locked, NotStarted, InProgress, Completed
- **label:** text, default "Neural circuits"
- **caption:** text, default "Study and quiz" / **showCaption:** boolean, default false
- 8 variants, 171x56 at the default label. Built from a `step` frame (track, core and iconSlot) plus a `text` frame.
- Learning uses ai-quiz, Voice uses microphone-01, matching the icons in the live app.
- There is no Default. The resting value is NotStarted, and the sprint flow never shows Learning/Locked or Voice/InProgress.
- An earlier version of this component ruled out locking entirely, and sprint-context.md carried the matching decision. Both were replaced. The description above is the current one.

### sectionHeader

> Invented. Plan section header. Carries the capstone result (option C): Mastered when all terms unaided, ToRevisit shows the unaided count.

- **state:** Default, Mastered, ToRevisit
- **title:** text / **status:** text
- 3 variants, 358x50. A `text` frame plus an iconSlot.
- Default draws the title alone. The `status` layer exists only on Mastered and ToRevisit, so a status value set on a Default instance is carried but never drawn.
- This is where the section-result rule lives. Don't restate it in a screen or a flow document.

### mascotFigure

> Knowie, and only Knowie. size picks how much presence the moment needs, pose picks what Knowie is doing about it: Standby is neutral and the default, Questioning belongs on a prompt, Approving on a pass, Excited on a summary or a streak, Thinking on a moment where Knowie is working something out and the student is waiting. The frame follows the artwork's 200:217 ratio, so height carries the size token and width follows. Never scale the artwork by hand, never place .mascotFigureBase directly, and never let a pose be the only thing carrying a verdict, since pose and colour both disappear in greyscale. Thinking is not one of mascotMessage's states and must not be wired to one. A sixth pose is a product decision before it is a variant.

- **size:** S, M, L
- **pose:** Standby, Excited, Questioning, Approving, Thinking
- 15 variants. Height carries the size token and width follows the artwork's ratio; S is 48 tall.
- Built from `.mascotFigureBase`, which is private and holds the five poses and nothing else. Never place the base directly.
- This replaces mascotSlot.

### verdictHeader

> Invented. The top of a turn result: Knowie at size L, a headline and a caption, centred. The verdict picks the pose and the headline's colour — Pass is Excited, Partial Approving, Miss Questioning — and the headline names the result in words, which is what still reads when colour and pose both disappear in greyscale. Neutral and Checking are not verdicts: Neutral is a term read back on the summary, Checking is the wait while an answer is judged, and both keep text.primary. One per result screen or verdict sheet. Never let the headline stop naming the result, never set the pose on the nested mascotFigure since the verdict drives it, and never recolour the headline on an instance — a sixth colour is a sixth verdict, and that is a decision.

- **verdict:** Pass, Partial, Miss, Neutral, Checking
- **title:** text / **caption:** text
- 5 variants, 358x192. Built from a nested mascotFigure at size L plus `title` and `caption`.
- The verdict drives the nested pose. Never set the pose on the instance.

### textField

> Invented, fills the gap listed in design-system.md. Multiline answer input for the typed fallback. Focus state uses border/focus.

- **state:** Empty, Filled
- **value:** text
- 2 variants, 358x160.
- Empty and Filled differ in the border and the text colour only. Everything else is shared, so a real field moves between them on its own as the student types.
- This closed the textField gap. The "Not in this system" line that called Text Field an external instance is gone with it.

## Conventions for a new component

These are the conventions the sprint components follow. Anything new in this file follows them too.

**One component, one section.** Each component set lives alone in a Section on the Sprint components page, and the section carries the same name as the component. No loose sets on the canvas.

**Write the description before you call it done.** Every sprint component carries a description that says what it is, where to reach for it, what each option means and what not to do with it. A component without one is not finished. Descriptions go on the component set, not on individual variants.

**Names.** Component names are camelCase, singular, and name the thing rather than the screen it appears on: recordButton, takePlayer, termRow. Layer names are camelCase and name a role: labelRow, bubble, tail, badge, step, track, core. Repeated atoms share one name, like `bar` in waveform.

**Text layers carry the property name.** The layer that a text property drives is named exactly after the property: label, body, term, xp, duration, message, helper, caption. That way a spec reads the same in Figma and in code.

**Variant axes.** The interaction axis is always `state`, with values from the base system: Default, Pressed, Disabled, Loading. The role or outcome axis is `variant`. A second non-state axis is named after what it varies: `surface` for what it sits on, `progress` for a numeric fill. Values are PascalCase, name a role or a state, and never name an appearance. Numeric values are bare: 0, 25, 50, 75, 100.

**Booleans are show plus the layer they toggle:** showIcon, showCaption, showHelper, showText. Default to false for anything optional. Default to true only where the layer is part of the component's basic read, as showIcon is on answerBlock.

**Slots over nested fixed components.** When a component needs to host an action whose emphasis may change, expose a slot named after its job plus Slot, like actionSlot, rather than nesting a fixed button. This matches the base system's iconSlot.

**Compose, don't redraw.** Build on what exists: takePlayer nests buttonIcon and waveform, termRow nests statusTag, mascotMessage and verdictHeader nest mascotFigure, and every icon goes through iconSlot. If you find yourself drawing something a base component already draws, stop.

**One place to set a meaning.** When a nested component repeats the parent's meaning, the parent's variant drives both. termRow's variant sets the badge icon and the nested statusTag together; the tag is never set separately on an instance.

**Widths.** A full-width component is 358, which is the 390 canvas minus the side padding. Anything narrower hugs. Only fixed-shape controls are given a hard size, like recordButton at 96x96.

**Tap targets.** If the whole row or card is tappable, it gets a Pressed state and at least 64 of height.

**Fixed labels stay fixed.** A label the variant decides is a plain text layer, not a text property, so it cannot drift on an instance. statusTag works this way.

**Every value from tokens/tokens.json.** Auto layout on everything, padding and gap from Size tokens, fills and text from the semantic layer. No hand-set spacing, no hand-set type.

### Open on naming

The role axis is not named consistently across the twelve. Most use `variant` or `state`; answerBlock uses `kind` and stepperStep uses `type`. Both readings are defensible: `kind` and `type` say the axis is content, not state, and `variant` is what the rest of the file uses. This needs one answer before these components are reused outside the sprint.

verdictHeader's `verdict` and mascotFigure's `pose` are not part of that question. They follow the rule below for a second non-state axis, which is to name it after what it varies.

## Naming conventions

**Components** are camelCase: appBar, buttonIcon, textBlock. Private base parts start with a dot, like .mascotFigureBase, and are never placed directly.

**Component properties** are camelCase. A boolean that toggles a layer starts with show: showLeftIcon, showCaption, showText.

**Variant values** name a role, state or size. They never name an appearance: Primary, Secondary, Tertiary, Default, Pressed, Disabled, Loading, and S, M, L. Sizes run in T-shirt steps, with XXS and 2XL onward for the ends.

**Semantic tokens** follow role, then element, then state: background/surface, interactive/primaryHover, text/linkHover. Figma uses slashes and tokens/tokens.json uses dots.
- Foreground on a fill takes the on prefix plus the fill's name: interactive/onPrimary, accent/brand/onBold.
- Emphasis pairs are bold and subtle, each with its matching on token.
- States are a camelCase suffix: Hover, Active, Pressed, Inverse.

**Color primitives** are color/hue/step. Steps run from 50 to 950, and a higher step means darker. Translucent primitives are color/alpha/light-NN or dark-NN, where NN is the opacity.

**Size tokens** are Family/step, and the step is the pixel value multiplied by 25. Negative steps take a Negative prefix. Radius/Full is the only named step.

**Typography primitives** are font/property/step. Text styles are Greed/Role Size Weight, for example Greed/Body S Bold.

**Copy** is sentence case everywhere. See the never list.

## Never do this

- Never invent a value that isn't in tokens/tokens.json. If something is missing, say so instead of filling the gap.
- Never use a CSS fallback value like var(--token, #333). If a token resolves to nothing, that's a bug to fix, not to hide.
- Never use capitals on a label, button or heading except for proper nouns. Sentence case everywhere: "Start practice", not "Start Practice". Knowie and PRO are proper nouns.
- Never put an appearance word in a semantic name. A word that describes how a color looks belongs in the primitive layer only. The same goes for variant values.
- Never read a primitive directly. Components consume the semantic layer, and the semantic layer references the primitives.
- Never build something new when a component in this system already does the job. Look at what exists before you make anything.
- Never invent a component to fill a gap. This is a real system that gets extended on purpose, so say what's missing and what you'd call it, and let the owner decide.
- Never detach an instance to change it. If an instance can't do what you need, that's a gap, so report it.
- Never set type by hand. Every text layer uses a text style.
- Never use more than one interactive.primary action on a screen.
- Never use mascot.primary unless Knowie is on screen.
- Never let color alone carry meaning. Got it, partial and missed each need an icon, a label or a shape as well as a color.
- Never break a sprint component's own rules. Each one carries its nevers in its Figma description, quoted in the Sprint components section. They count the same as the ones in this list.
- Never put anything on hover. There is no hover on this canvas, and the hover tokens exist for other platforms.
- Never make a tap target smaller than the platform minimum, and never use a text style below the platform minimum for text a student has to read. **Both numbers are unavailable.** They live in 04-platform-constraints.md, which isn't in this repo, and they aren't in tokens/tokens.json either. Until someone supplies them these two rules can't be checked, so treat 64 of height for a tappable row — the number the sprint components already use — as the working floor and flag anything smaller.
- Never override a component's fill to a token its variants don't offer. Add the variant through a decision instead.

## Where the file currently breaks these rules

These are known violations. Don't copy them.

- **Hue names in semantic tokens.** accent/green, accent/coral, accent/blue and accent/magenta are semantic tokens named for how they look. progressIndicator has a variant named Coral. Whether bold and subtle also count as appearance words is your call.
- **Size and type primitives read directly.** Size and font tokens have no semantic layer, so every component binds Space, Radius, Icon, Illustration and font primitives directly. The rule can't be met for size and type until that layer exists.
- **mascotSlot is broken and retired.** Its variants are named size=XL, size=L, **2XL**, size=3XL and size=4XL: one is missing its `size=` prefix, which puts the whole set in an error state that Figma won't read properties from. It is superseded by mascotFigure, so it is not worth repairing. It binds Homie/Inkwell and Homie/Eyes directly, and those primitives are still named Homie, not Knowie.
- **Dead bindings.** progressIndicator's track stroke binds border/subtle, and snackbar Default's vertical padding binds Padding/sm. Both variables were deleted, so both bindings resolve to nothing.
- **Invisible snackbar action.** The snackbar's "Check it" action label uses interactive.primary as text on background.inverse. Those are the same primitive, so the label can't be seen.
- **Snackbar chip override.** The snackbar's chip is overridden to accent.blue.bold, which isn't a chips variant.
- **Loose type on button.** button has nine text layers with no text style, and buttonGroup and buttonIcon have one each.
- **Example screens detach components.** They build the app bar and main buttons from detached frames instead of appBar and button instances.
- **Caption S may be too small.** It was recorded as below the minimum caption size in 04-platform-constraints.md, and chips XXS, progressIndicator and textBlock S all use it. The threshold can't be checked while that file is missing.
- **Body line height may be too tight.** Body M and Body S were recorded as below the platform line-height range. Same missing file, same unverifiable threshold.
- **Font family mismatch.** tokens/tokens.json holds Greed Standard-TRIAL, and the platform constraints were recorded as requiring Inter Variable for prototypes. Inter Variable isn't in tokens/tokens.json. The requirement can't be confirmed while that file is missing.
- **Progress fill conflicts with the token description.** interactive.primary's description claims progress bar fills, but progressIndicator uses accent.brand.bold.
- **Inconsistent naming.**
  - chips is plural and every other component is singular.
  - chips' color values mix Primary and pro.
  - appBar mixes Two and 2 in its variant names.
  - Text properties are variously named CTA, Text, title and caption.
- **iconSlot's size property is labelled "Size (IGNORE)".** The intent isn't recorded in the file.
- **Four components carry no description.** buttonIcon, buttonGroup, snackbar and mascotSlot have none, against this file's own rule that a component without one isn't finished. button and scaffold both have one, and so does every sprint component.
- **button can't specify its icons.** It has showLeftIcon and showRightIcon booleans and a CTA text property, but no instance swap for either container, so which icon a button carries can't be set in Figma at all. sprint-context.md's build rules require one on every button — mic for record actions, keyboard for Type instead — so that rule currently cannot be expressed in the design file. The React component carries `leftIcon` and `rightIcon` and is ahead of Figma here.
- **scaffold carries two generations of properties.** Eight superseded slot and boolean properties sit beside the seven current camelCase ones. See the Scaffold slots section.
- **skeleton is orphaned.** It is a real component with a description, used three times on the Processing mockup, but it sits on no page and can only be reached through its instances. It needs restoring to the Sprint components page the way scaffold was.

## Gaps waiting for a decision

Open decisions first, then proposed names. A proposed name doesn't exist yet.

**Decisions waiting on someone**

- **A Relearn state on sectionHeader.** mascotMessage has four states and sectionHeader has three. Both descriptions say the two pair, and for Default, ToRevisit and Mastered they do. When none of a section's terms come back unaided, Knowie says to read the section again while the header above still reads Default, as though nothing happened. Either sectionHeader gains a fourth state or Relearn sections show a ToRevisit header and the two stop being a matched set. Nothing in the mockups exercises this yet.
- **A fifth Knowie pose.** mascotMessage's Relearn borrows Standby because none of the five poses fits a gentle setback. The component's own description calls a fifth pose the proper fix and a decision rather than a variant.
- **An icon property on button.** See the known violations above. Without an instance swap per container, "every button carries an icon" can't be set in Figma.
- **Deleting scaffold's eight superseded properties.** Every screen depends on that component, so this is a decision before it is an edit.
- **The role axis name.** answerBlock's `kind` and stepperStep's `type` against `variant` everywhere else. See "Open on naming".

**Proposed names**

- **bottomSheet.** The scaffold has a sheet slot but no sheet component. Every sheet in the file is a plain frame. Why? and verdict content need one.
- **verdictSheet.** Got it, partial and missed as a whole sheet. verdictHeader now covers the top of one, so what's left is the sheet around it.
- **listItem.** Example screens build lists from raw frames.
- **checkbox.** It's currently an external instance.
- **navBar.** The home and plan mockups use Navbar, Navigation Button and Avatar from the unreachable library. Nothing local draws bottom navigation.

**Closed**

- ~~**Recording state.**~~ recordButton was built for this sprint, with Idle and Recording variants.
- ~~**textField.**~~ Built for this sprint, Empty and Filled.
- ~~**skeleton.**~~ Built, and used on the Processing mockup. It still needs restoring to a page; see the known violations.
- ~~**Focus state.**~~ Proposed on the Proposals page as a focused boolean on button and buttonIcon, and still not applied in Figma. The React components draw it from `:focus-visible` against border/focus and border/focusSecondary, so the behaviour exists in code and not in the file.
