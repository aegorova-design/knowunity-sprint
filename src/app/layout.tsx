import type { Metadata, Viewport } from "next";

import tokens from "../../tokens/tokens.json";

import { greed } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Explain out loud",
  description:
    "Explain the key ideas from a section out loud, and Knowie answers in text.",
};

// --color-background-page (color.navy.950). Read from tokens/tokens.json
// rather than hand-copied, so the two can't drift apart.
const themeColorHex = tokens.color.navy["950"].$value.hex;

// Next 16 keeps viewport separate from metadata, and both are Server Component
// exports only. A page that takes 'use client' cannot carry either.
export const viewport: Viewport = {
  // This is browser chrome, not CSS: Safari reads the meta tag before any
  // stylesheet, so a var() here would resolve to nothing — the value has to
  // be a literal at this call site, sourced from the token above instead of
  // typed out a second time.
  themeColor: themeColorHex,
  viewportFit: "cover",
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={greed.variable}>
      <body>
        {/* The 390 canvas. scaffold.css deliberately fills whatever it is given
            — "a screen container has no business fixing its own size" — so the
            device width is the app shell's job, not the component's. On a phone
            this is the whole viewport; on a desktop it is a 390 column. */}
        <div className="appFrame">{children}</div>
      </body>
    </html>
  );
}
