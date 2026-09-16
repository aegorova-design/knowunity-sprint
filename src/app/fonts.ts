/**
 * Greed Standard-TRIAL, the family every text style in tokens/tokens.json
 * names. Self-hosted from src/fonts/greed via next/font/local.
 *
 * The faces are declared one per weight on purpose. This trial release ships
 * most weights as their own family — SemiBold's internal family name is
 * "Greed Standard-TRIAL SemiBold", not "Greed Standard-TRIAL" — so a bare
 * family reference would never find them and the browser would synthesise a
 * fake bold instead. Mapping each file to a weight here gives us one family
 * that behaves normally.
 *
 * Only the four weights tokens/tokens.json declares are loaded. Light (300),
 * Medium (500) and the italics are on disk but no token references them.
 *
 * The .otf files are used directly. next/font/local self-hosts and
 * fingerprints them, and this prototype runs locally, so the woff2 step is
 * not worth a toolchain.
 */

import localFont from 'next/font/local';

export const greed = localFont({
  src: [
    { path: '../fonts/greed/GreedStandard-TRIAL-Regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/greed/GreedStandard-TRIAL-SemiBold.otf', weight: '600', style: 'normal' },
    { path: '../fonts/greed/GreedStandard-TRIAL-Bold.otf', weight: '700', style: 'normal' },
    { path: '../fonts/greed/GreedStandard-TRIAL-Heavy.otf', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-greed',
});
