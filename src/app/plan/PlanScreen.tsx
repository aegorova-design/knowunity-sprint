/**
 * The plan screen, shared by /plan and /plan/in-progress. The two routes pass
 * different step states and nothing else.
 *
 * topNavigation is hidden: the Figma frames hide that slot and put the subject
 * and tabs inside middleContent instead.
 *
 * The subject heading and the tabs are page-local markup rather than exported
 * chrome, because the subject is this screen's h1 and a picture of a heading is
 * not a heading. The bottom navigation is a `bottomNav` instance with
 * study-plan lit, because a bar that marks where you are is the only reason
 * that variant exists. It replaces the ChromeStrip this screen used to carry:
 * the exported `plan-bottom.png` had home-chat lit, which reads as a
 * duplicated frame rather than intent.
 */

import { BottomNav } from '@/components/bottom-nav/BottomNav';
import { Button } from '@/components/button/Button';
import { IconSlot } from '@/components/icon-slot/IconSlot';
import { MascotMessage } from '@/components/mascot-message/MascotMessage';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { SectionHeader } from '@/components/section-header/SectionHeader';
import { StepperStep } from '@/components/stepper-step/StepperStep';

import { SUBJECT, type PlanSection } from './planData';

import './planScreen.css';

export type PlanScreenProps = {
  sections: PlanSection[];
  /**
   * Where a voice step goes. First run sends the student through the primer.
   * Knowie's action on a result section goes to the same place: SPEC.md
   * screens 5 and 6 send both there, because "Do it now anyway" and "Practice
   * sooner" start the recall loop now rather than on the date Knowie named.
   */
  voiceHref: string;
  /**
   * Where a **learning** step goes, on the first section only.
   *
   * A sprint shortcut, not the product: `02 Plan, nothing started` is the one
   * screen that passes it, so tapping any of section 1's three steps lands on
   * `03 Plan, section 1 in progress` and the two frames are connected without
   * a Study and quiz flow to walk through. The progress it lands on is the
   * frame's, not a record of what was tapped — nothing here tracks that, and
   * nothing is meant to.
   *
   * The first section because that is the section `03` moves. Left off, every
   * learning step stays the non-interactive `div` `stepperStep` draws without
   * an href, which is what `03` and the two result screens want — there is
   * nowhere further to go from them.
   */
  learningHref?: string;
};

export function PlanScreen({ sections, voiceHref, learningHref }: PlanScreenProps) {
  return (
    <Scaffold
      showTopNavSlot={false}
      middleContent={
        <div className="planScreen">
          <div className="planScreen-header">
            {/* Wrapped because `iconSlot` sets its own colour on itself, so a
                parent cannot recolour it by inheritance — see planScreen.css. */}
            <span className="planScreen-headerIcon">
              <IconSlot size="400" icon="graduation-hat-01" aria-hidden="true" />
            </span>
            <h1 className="planScreen-subject">{SUBJECT}</h1>
          </div>

          {/* Inert: Materials is not part of this sprint, so the tabs report
              where the student is rather than offering a second destination. */}
          <div className="planScreen-tabs">
            <span className="planScreen-tab" data-active="true">
              Plan
            </span>
            <span className="planScreen-tab">Materials</span>
          </div>

          {sections.map((section, index) => (
            <section className="planScreen-section" key={section.title}>
              <SectionHeader
                /* Default carries no status layer at all, which is why a
                   section with no result behind it passes none. */
                state={section.result?.state ?? 'Default'}
                status={section.result?.status}
                title={section.title}
                titleAs="h2"
              />
              <div className="planScreen-stepper">
                {section.learning.map((step) => (
                  <StepperStep
                    key={step.label}
                    type="Learning"
                    state={step.state}
                    label={step.label}
                    caption={step.caption}
                    /* Undefined on every section but the first, and on every
                       screen that does not pass one — `stepperStep` renders a
                       plain div then, so the row keeps its press and focus
                       states off rather than offering a target that goes
                       nowhere. */
                    href={index === 0 ? learningHref : undefined}
                  />
                ))}
                <StepperStep
                  type="Voice"
                  state={section.voice.state}
                  label={section.voice.label}
                  caption={section.voice.caption}
                  href={voiceHref}
                />
              </div>

              {section.result ? (
                <MascotMessage
                  state={section.result.message.state}
                  message={section.result.message.message}
                  helper={section.result.message.helper}
                  /* Always on where a result exists. SPEC.md screen 5: the
                     scheduling line is the calibration mechanism, so it cannot
                     be hidden on the screen that has something to schedule.
                     Frame 19 has it off; reported with the build. */
                  showHelper
                  actionSlot={
                    /* Tertiary XS per SPEC.md, and the screen's lowest
                       emphasis — the scheduled date is the recommendation and
                       this is the way around it, not the way through. */
                    <Button
                      variant="Tertiary"
                      size="XS"
                      CTA={section.result.message.action}
                      /* The mic, because the action starts the recall loop —
                         the same icon the plan's Voice step and every "Try
                         again" in the session carry. The frame reserves a left
                         icon container without naming what goes in it. */
                      showLeftIcon
                      leftIcon="microphone-01"
                      href={voiceHref}
                    />
                  }
                />
              ) : null}
            </section>
          ))}
        </div>
      }
      bottomContent={<BottomNav Active="study-plan" homeChatHref="/" studyPlanHref="/plan" />}
    />
  );
}
