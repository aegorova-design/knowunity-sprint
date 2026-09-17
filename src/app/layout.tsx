import type { Metadata, Viewport } from "next";

import { greed } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Explain out loud",
  description:
    "Explain the key ideas from a section out loud, and Knowie answers in text.",
};

// Next 16 keeps viewport separate from metadata, and both are Server Component
// exports only. A page that takes 'use client' cannot carry either.
export const viewport: Viewport = {
  // Mirrors --color-background-page (color.navy.950) from build/css/tokens.css.
  // It is a raw hex because this is browser chrome, not CSS: Safari reads the
  // meta tag before any stylesheet, so a var() here would resolve to nothing.
  // If that token changes, change this with it — nothing links the two.
  themeColor: "#090c18",
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
