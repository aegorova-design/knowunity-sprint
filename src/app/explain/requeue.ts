/**
 * The requeue half of the session queue (`QueueState` in `session.ts`), in a
 * cookie so the Server Component screens can read it (`requeueServer.ts`).
 * Written only from effects — the reveal screen adding its term, a requeued
 * Idle starting its pass, a new session clearing it — never on render, so a
 * prefetch cannot change it.
 *
 * Stored as `queued|active`, e.g. `2,3|2`.
 */

import { EMPTY_QUEUE, isTermPosition, type QueueState, type TermPosition } from './session';

export const REQUEUE_COOKIE = 'explain-requeue';

export function parseQueue(raw: string | undefined): QueueState {
  if (!raw) return EMPTY_QUEUE;
  const [queuedPart = '', activePart = ''] = decodeURIComponent(raw).split('|');
  const queued = queuedPart.split(',').filter(isTermPosition);
  return { queued, active: isTermPosition(activePart) ? activePart : null };
}

function readQueueClient(): QueueState {
  const match = document.cookie.match(new RegExp(`(?:^|; )${REQUEUE_COOKIE}=([^;]*)`));
  return parseQueue(match?.[1]);
}

function writeQueue(queue: QueueState): void {
  const value = encodeURIComponent(`${queue.queued.join(',')}|${queue.active ?? ''}`);
  document.cookie = `${REQUEUE_COOKIE}=${value}; path=/; samesite=lax`;
}

/** A first-pass reveal: the term goes to the back of the queue, once. */
export function requeueTerm(term: TermPosition): void {
  const queue = readQueueClient();
  if (queue.active === term || queue.queued.includes(term)) return;
  writeQueue({ ...queue, queued: [...queue.queued, term] });
}

export function startRequeuePass(term: TermPosition): void {
  const queue = readQueueClient();
  if (queue.active === term || !queue.queued.includes(term)) return;
  writeQueue({ ...queue, active: term });
}

export function clearQueue(): void {
  document.cookie = `${REQUEUE_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
