import { cookies } from 'next/headers';

import { REQUEUE_COOKIE, parseQueue } from './requeue';
import type { QueueState } from './session';

export async function readQueue(): Promise<QueueState> {
  const store = await cookies();
  return parseQueue(store.get(REQUEUE_COOKIE)?.value);
}
