/**
 * The plan screen, shared by /plan and /plan/in-progress. The two routes pass
 * different step states and nothing else.
 *
 * topNavigation is hidden: the Figma frames hide that slot and put the subject
 * and tabs inside middleContent instead.
 *
 * The subject heading and the tabs are page-local markup rather than exported
 * chrome, because the subject is this screen's h1 and a picture of a heading is
 * not a heading. The bottom navigation is a ChromeStrip — it is out of scope
 * for the sprint and nothing on it is in the click path.
 */

import { IconSlot } from '@/components/icon-slot/IconSlot';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { SectionHeader } from '@/components/section-header/SectionHeader';
import { StepperStep } from '@/components/stepper-step/StepperStep';

import { ChromeStrip } from '../_chrome/ChromeStrip';
import { SUBJECT, type PlanSection } from './planData';

import './planScreen.css';

export type PlanScreenProps = {
  sections: PlanSection[];
  /** Where a voice step goes. First run sends the student through the primer. */
  voiceHref: string;
};

export function PlanScreen({ sections, voiceHref }: PlanScreenProps) {
  return (
    <Scaffold
      showTopNavSlot={false}
      middleContent={
        <div className="planScreen">
          <div className="planScreen-header">
            <IconSlot size="400" icon="graduation-hat-01" aria-hidden="true" />
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

          {sections.map((section) => (
            <section className="planScreen-section" key={section.title}>
              <SectionHeader state="Default" title={section.title} titleAs="h2" />
              <div className="planScreen-stepper">
                {section.learning.map((step) => (
                  <StepperStep
                    key={step.label}
                    type="Learning"
                    state={step.state}
                    label={step.label}
                    caption={step.caption}
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
            </section>
          ))}
        </div>
      }
      bottomContent={<ChromeStrip src="/chrome/plan-bottom.png" height={96} />}
    />
  );
}
