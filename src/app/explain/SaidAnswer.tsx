/**
 * The student's own answer, quoted back on a hint, last-miss or summary
 * screen. A spoken answer is "What Knowie heard", in quotation marks — a
 * mishear reads as the app's mistake. A typed one is "What you typed", as
 * typed: no quotation marks, and no microphone icon, because it was not
 * spoken. `answerBlock` has no typed treatment; see component-gaps.md.
 */

import { AnswerBlock } from '@/components/answer-block/AnswerBlock';

const OPEN = '“';
const CLOSE = '”';

export function SaidAnswer({ text, typed }: { text: string | null; typed: boolean }) {
  if (typed) {
    const plain = (text ?? '').replace(new RegExp(`^${OPEN}|${CLOSE}$`, 'g'), '');
    return <AnswerBlock kind="Said" label="What you typed" body={plain || '…'} showIcon={false} />;
  }

  const quoted = !text ? `${OPEN}…${CLOSE}` : text.startsWith(OPEN) ? text : `${OPEN}${text}${CLOSE}`;
  return <AnswerBlock kind="Said" label="What Knowie heard" body={quoted} />;
}
