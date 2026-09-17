/**
 * Knowie at size L over a `textBlock` variant L, centred in the free space
 * middleContent has left — the whole middle of a screen that opens on a
 * moment rather than on a task.
 *
 * Three screens draw it: `14 Permission denied`, `05b Resume` and `20b Revisit
 * complete`. `component-gaps.md` logged it at the second and said to build it
 * at the third, with the gap as the thing that varies — Space/400 on `14` and
 * `20b`, Space/600 on `05b`, because that is what the three frames bind.
 *
 * `pose` is never the message. Every screen that uses this puts the news in
 * the title beside her, so the pose is corroboration — SPEC.md, "no colour
 * carries meaning alone", and the same for a face. `mascotFigure` takes no
 * `alt` here for that reason: the heading already says it.
 *
 * It sits with the screens rather than in `src/components`, for the reason
 * `ActionStack`, `ButtonPair`, `SheetPanel` and `SessionAppBar` all do:
 * design-system.md does not let a screen invent a design-system component, and
 * this is a composition of two of them.
 */

import { MascotFigure, type MascotFigurePose } from '@/components/mascot-figure/MascotFigure';
import { TextBlock } from '@/components/text-block/TextBlock';

import './mascotHeading.css';

export function MascotHeading({
  pose,
  title,
  caption,
  gap = '400',
  behindSheet = false,
}: {
  /** What Knowie is doing about it. Corroborates the title, never replaces it. */
  pose: MascotFigurePose;
  /** The screen's h1. */
  title: string;
  /** The line under it. Every one of the three frames has one. */
  caption: string;
  /** Space between the two, as the screen's own frame binds it. */
  gap?: '400' | '600';
  /** Set while a sheet covers the screen, to keep Tab out of what it covers. */
  behindSheet?: boolean;
}) {
  return (
    <div className="mascotHeading" data-gap={gap} inert={behindSheet}>
      <MascotFigure size="L" pose={pose} />
      {/* Already centred: textBlock centres variants XL and L itself. */}
      <TextBlock variant="L" title={title} caption={caption} showCaption titleAs="h1" />
    </div>
  );
}
