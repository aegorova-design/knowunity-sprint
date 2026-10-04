'use client';

/** The two writes to the session queue, each on mount. Render nothing. */

import { useEffect } from 'react';

import { requeueTerm, startRequeuePass } from './requeue';
import type { TermPosition } from './session';

/** On a first-pass reveal: the term comes back once at the end of the session. */
export function RequeueOnReveal({ term }: { term: TermPosition }) {
  useEffect(() => requeueTerm(term), [term]);
  return null;
}

/** On a requeued term's Idle: its second pass has started. Drops `?again=1`, which the cookie now carries. */
export function RequeueStart({ term }: { term: TermPosition }) {
  useEffect(() => {
    startRequeuePass(term);
    window.history.replaceState(null, '', window.location.pathname);
  }, [term]);
  return null;
}
