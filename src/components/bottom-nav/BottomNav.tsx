/**
 * bottomNav — the app's bottom tab bar.
 *
 * Built from the Figma component set `bottomNav` (node 13709:4117) in
 * Yummy__Knowie Design Sprint. `Active` carries the Figma variant axis
 * unchanged, with the same two options.
 *
 * Figma builds the row out of five Navigation Button instances plus an Avatar,
 * both from a library this file cannot reach — design-system.md lists Navbar,
 * Navigation Button and Avatar as unreachable, and `navBar` is still on its
 * gaps list. Nothing local draws a tab, so the tab is drawn here out of
 * iconSlot, which is the one part of it the system does provide.
 *
 * Two of the five tabs are live and three are not, which the component's own
 * description sets: search, trophy and avatar are there for app fidelity. They
 * are rendered inert — no tag that can take focus, hidden from the
 * accessibility tree, no pointer events — so the bar cannot be tabbed into a
 * tab that goes nowhere.
 *
 * The Home Indicator under the tabs is part of this component, the way Figma
 * builds it: every mockup puts it at bottomContent / Navbar / Home Indicator,
 * and the scaffold component draws none. design-system.md says scaffold
 * "handles the status bar, the home indicator and the page background"; the
 * first and the third are true and the second is not. See the story docs.
 */

import Link from 'next/link';
import type { HTMLAttributes, ReactNode } from 'react';

import { IconSlot, type IconName } from '../icon-slot/IconSlot';

import './bottomNav.css';

/** The Figma variant axis, values unchanged. */
export type BottomNavActive = 'home-chat' | 'study-plan';

export type BottomNavProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /** Which of the two live tabs the student is on. */
  Active?: BottomNavActive;
  /**
   * Where the home-chat tab goes. With an href the tab is a Next `Link`, so
   * the page around it can stay a Server Component. Without one it is a
   * `button`, for a bar wired up in code.
   *
   * Figma has no way to express a destination, so this lives in code only.
   */
  homeChatHref?: string;
  /** The same, for the study-plan tab. */
  studyPlanHref?: string;
  /**
   * Fires on either live tab, with the tab that was pressed.
   *
   * Left off, no handler is attached at all, so a bar with hrefs and nothing
   * else stays renderable from a Server Component — which is how every screen
   * uses it. Passing one puts the bar behind a client boundary.
   */
  onNavigate?: (tab: BottomNavActive) => void;
};

/** Which icon each of the five tabs carries, named the way Figma names them. */
const ICON = {
  'home-chat': 'myai-chat',
  search: 'search-md',
  'study-plan': 'target-04',
  trophy: 'trophy-02',
} satisfies Record<string, IconName>;

/** The accessible name of each live tab, taken from its name in Figma. */
const LABEL: Record<BottomNavActive, string> = {
  'home-chat': 'Home chat',
  'study-plan': 'Study plan',
};

export function BottomNav({
  Active = 'home-chat',
  homeChatHref,
  studyPlanHref,
  onNavigate,
  ...rest
}: BottomNavProps) {
  /** One of the two tabs that do something. */
  const liveTab = (tab: BottomNavActive, href: string | undefined): ReactNode => {
    /* The look is carried by the class and the data attributes, not the tag,
       the same way button does it. */
    const skin = {
      className: 'knowieBottomNav-tab',
      'data-tab': tab,
      /* Icon-only, because Figma switches the Navigation Button's label off,
         so the name has to live on the control itself. */
      'aria-label': LABEL[tab],
      'aria-current': Active === tab ? ('page' as const) : undefined,
    };
    const face = <IconSlot size="300" icon={ICON[tab]} aria-hidden="true" />;

    /* Only attached when there is something to call. A function prop is what
       forces a client boundary, so a bar that only navigates must not carry
       one. */
    const onClick = onNavigate ? () => onNavigate(tab) : undefined;

    return href !== undefined ? (
      <Link href={href} {...skin} onClick={onClick}>
        {face}
      </Link>
    ) : (
      <button type="button" {...skin} onClick={onClick}>
        {face}
      </button>
    );
  };

  /** One of the two icon shapes that are drawn but do nothing. */
  const fidelityTab = (tab: 'search' | 'trophy'): ReactNode => (
    <span className="knowieBottomNav-tab" data-tab={tab} data-fidelity="true" aria-hidden="true">
      <IconSlot size="300" icon={ICON[tab]} />
    </span>
  );

  return (
    <nav className="knowieBottomNav" data-active={Active} aria-label="Main" {...rest}>
      {/* The five, in the order Figma lays them out. */}
      <div className="knowieBottomNav-tabs">
        {liveTab('home-chat', homeChatHref)}
        {fidelityTab('search')}
        {liveTab('study-plan', studyPlanHref)}
        {fidelityTab('trophy')}
        {/* The last of the three that are there for fidelity. Figma fills the
            Avatar with an image rather than initials, so it is the artwork
            exported from that instance, drawn inert. */}
        <span className="knowieBottomNav-avatar" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/avatar-knowie.png" alt="" draggable={false} />
        </span>
      </div>

      {/* The OS's, never the app's — the bottom end of the same chrome the
          scaffold draws a status bar for at the top. Hidden from the
          accessibility tree: a picture of a home indicator has nothing to
          announce, and nothing can be done with it. */}
      <div className="knowieBottomNav-homeIndicator" aria-hidden="true">
        <span className="knowieBottomNav-homeIndicatorPill" />
      </div>
    </nav>
  );
}
