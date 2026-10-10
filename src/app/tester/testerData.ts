/**
 * What the launcher's two session buttons do to the stored state. Client only.
 */

import { clearInputMode, setInputMode } from '../explain/inputMode';
import {
  clearDemoAfterSession,
  clearHistory,
  clearOutcomes,
  clearPlanPreview,
} from '../explain/outcomes';
import { clearQueue } from '../explain/requeue';
import { clearAllTakes } from '../explain/sessionTakes';
import { resetTurnStore } from '../explain/turnStore';

/**
 * "1 week until exam: first session": Home as it is before any session, in
 * voice, with no preview, requeue or session results in the way. Stored
 * results from earlier sessions stay — Reset tester data clears those.
 */
export function prepareFirstSession(): void {
  clearPlanPreview();
  clearDemoAfterSession();
  clearQueue();
  clearOutcomes();
  resetTurnStore();
  setInputMode('voice');
}

/**
 * "Reset tester data": every result and recording this browser holds, the
 * input mode, the requeue, any plan-state preview and the answer in flight.
 * The passcode stays entered, so the launcher stays open.
 */
export function resetTesterData(): void {
  clearHistory();
  clearAllTakes();
  clearOutcomes();
  clearPlanPreview();
  clearDemoAfterSession();
  clearQueue();
  clearInputMode();
  resetTurnStore();
}
