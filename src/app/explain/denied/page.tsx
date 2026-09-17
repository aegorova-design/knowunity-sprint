/**
 * 14 Permission denied — `/explain/denied`. SPEC.md screen 9. One state,
 * reached by denying the browser's mic prompt on `/explain/intro`.
 *
 * Matches the Mockups v2 frame "14 Permission denied" (13662:14548).
 *
 * No Skip and no progress bar: like the primer, this is outside the term loop.
 */

import { AppBar } from '@/components/app-bar/AppBar';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { CloseButton } from '../navigation';
import { DENIED_CLOSE_HREF, DeniedActions, DeniedContent } from './PermissionDenied';

export default function PermissionDeniedPage() {
  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={
        <AppBar
          variant="leftIconButtonOnly"
          aria-label="Primer navigation"
          left={<CloseButton href={DENIED_CLOSE_HREF} label="Close" />}
        />
      }
      middleContent={<DeniedContent />}
      bottomContent={<DeniedActions />}
    />
  );
}
