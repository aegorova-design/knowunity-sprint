/**
 * sectionHeader — the plan section header, carrying the capstone result.
 *
 * Built from the Figma component set `sectionHeader` (node 13584:6360) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma
 * properties exactly: state, title and status.
 *
 * The icon goes through iconSlot at Size 300, the way Figma nests it.
 */

import type { ElementType, HTMLAttributes } from 'react';

import { IconSlot } from '../icon-slot/IconSlot';

import './sectionHeader.css';

export type SectionHeaderState = 'Default' | 'Mastered' | 'ToRevisit';

export type SectionHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> & {
  /** Where the section stands. Drives the status colour and the icon together. */
  state?: SectionHeaderState;
  /** The section's name. */
  title?: string;
  /**
   * The unaided count. Only rendered on Mastered and ToRevisit — Figma's
   * Default variant has no status layer at all.
   */
  status?: string;
  /**
   * Heading level for the title. Figma has no say in this, but the DOM does:
   * a section header usually sits under the screen's own heading, so it
   * defaults to h3 rather than h2.
   */
  titleAs?: Extract<ElementType, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;
};

export function SectionHeader({
  state = 'Default',
  title = 'The feudal system',
  status = '1 of 4 unaided',
  titleAs: Title = 'h3',
  ...rest
}: SectionHeaderProps) {
  return (
    <div className="knowieSectionHeader" data-state={state} {...rest}>
      <div className="knowieSectionHeader-text">
        <Title className="knowieSectionHeader-title">{title}</Title>
        {/* Default carries no status in Figma, so it carries none here either. */}
        {state === 'Default' ? null : (
          <p className="knowieSectionHeader-status">{status}</p>
        )}
      </div>
      {/* No className passed to iconSlot: it spreads its rest props after its
          own className, so one given here would replace knowieIconSlot rather
          than join it. The slot is styled by descendant selector instead. */}
      <IconSlot size="300">
        {/* The state picks the artwork in CSS, the way the Figma variant picks
            which icon the slot is swapped to. Decorative: the status line
            beside it already says where the section stands. */}
        <span className="knowieSectionHeader-icon" aria-hidden="true" />
      </IconSlot>
    </div>
  );
}
