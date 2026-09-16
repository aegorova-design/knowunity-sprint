/**
 * 15 + 16 Text fallback — `/explain/[term]/type`. SPEC.md screen 23.
 *
 * Two states on one route: the field is Empty until the student types and
 * Filled after, and Send answer is disabled until there is something to send.
 * The field and the buttons that depend on it live in TypeScreen, a client
 * component; everything the server can render is rendered here and passed in.
 *
 * Skip is live — the student can still act on this term — per SPEC.md's Skip
 * rule, which lists 15/16 among the live screens.
 */

import { notFound } from 'next/navigation';

import { TERMS, isTermPosition, nextTermHref } from '../../session';
import { SessionAppBar } from '../SessionAppBar';
import { TermPrompt } from '../TermPrompt';
import { TypeScreen } from './TypeScreen';

export default async function TypePage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  return (
    <TypeScreen
      appBar={<SessionAppBar term={term} skipHref={nextTermHref(term)} />}
      prompt={<TermPrompt term={TERMS[term]} />}
      sendHref={`/explain/${term}/checking`}
      voiceHref={`/explain/${term}`}
    />
  );
}
