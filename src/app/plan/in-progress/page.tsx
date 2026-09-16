import { PlanScreen } from '../PlanScreen';
import { PLAN_IN_PROGRESS } from '../planData';

export default function PlanInProgressPage() {
  // Not a first run: section 1 is already underway, so the voice step goes
  // straight to the loop rather than back through the primer — SPEC.md,
  // screen 1, "on a first run, /explain/1 after that".
  return <PlanScreen sections={PLAN_IN_PROGRESS} voiceHref="/explain/1" />;
}
