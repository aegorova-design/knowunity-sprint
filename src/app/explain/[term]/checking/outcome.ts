/**
 * What a wait resolves to, and how the query that decides it travels.
 *
 * Both processing screens need this: `09 Processing` resolves the ordinary
 * 2.5s wait, and `09b Processing, still thinking` resolves the long one after
 * taking over at 5s. It was `09`'s own until `09b` existed, and copying it
 * would have meant two places where a silent take stops being silent.
 *
 * Everything here reads the query the sending screen carried, because the
 * session has no store — see `href.ts`.
 */

import { typedVerdictSegment, verdictSegment } from '../../script';
import type { TermPosition } from '../../session';

export type Query = { [key: string]: string | string[] | undefined };

export function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/** The segment under `/explain/[term]` that this answer resolves to. */
export function outcomeSegment(term: TermPosition, attempt: number, query: Query): string {
  // Silence beats everything: there was nothing to judge.
  if (first(query.seconds) === '0') return 'not-heard';

  const typed = first(query.typed);
  if (typed !== undefined) return typedVerdictSegment(attempt, Number(typed));

  return verdictSegment(term, attempt);
}

/**
 * The verdict this wait ends on. The rung rides along, because a verdict has
 * to say what the term recorded and the ladder is what decides that.
 */
export function verdictHref(term: TermPosition, attempt: number, query: Query): string {
  return `/explain/${term}/${outcomeSegment(term, attempt, query)}?attempt=${attempt}`;
}

/**
 * The query, handed on unchanged, so `09b` resolves to the same verdict `09`
 * would have reached.
 */
export function queryString(query: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') params.set(key, value);
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
}
