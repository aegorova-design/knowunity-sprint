import { PlanScreen } from './PlanScreen';
import { PLAN_NOTHING_STARTED } from './planData';

export default function PlanPage() {
  // First run: the voice step goes through the mic primer. After that it would
  // go straight to /explain/1 — see SPEC.md, screen 1.
  return <PlanScreen sections={PLAN_NOTHING_STARTED} voiceHref="/explain/intro" />;
}
