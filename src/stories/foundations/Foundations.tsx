/** Shared chrome for the foundations stories: page, section and token meta. */

import type { ReactNode } from 'react';

import { NO_DESCRIPTION, type TokenEntry } from './tokens';
import './foundations.css';

export function Page({
  title,
  intro,
  children,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="fnd-page">
      <header className="fnd-pageHeader">
        <h1 className="fnd-pageTitle">{title}</h1>
        <p className="fnd-pageIntro">{intro}</p>
      </header>
      {children}
    </div>
  );
}

export function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="fnd-section">
      <div className="fnd-sectionHeader">
        <h2 className="fnd-sectionTitle">{title}</h2>
        {note ? <p className="fnd-sectionNote">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** The token's own `$description`, or a marked note when it has none. */
export function Description({ description }: { description: string | null }) {
  return (
    <p className={description ? 'fnd-desc' : 'fnd-desc fnd-desc--missing'}>
      {description ?? NO_DESCRIPTION}
    </p>
  );
}

/** Token name, resolved value, what it aliases, and its description. */
export function TokenMeta({ entry }: { entry: TokenEntry }) {
  return (
    <div className="fnd-meta">
      <span className="fnd-name">{entry.cssVar}</span>
      <span className="fnd-value">{entry.value}</span>
      {entry.aliasOf ? <span className="fnd-alias">{entry.label} → {entry.aliasOf}</span> : null}
      <Description description={entry.description} />
    </div>
  );
}
