/**
 * Adding to a link that may already carry a query.
 *
 * The session has no store: everything a screen needs to know about the run so
 * far travels in the URL, which is what keeps every page a Server Component
 * and the Back button honest. That means several links now carry more than one
 * thing — a take's length and the rung of the hint ladder it was made on, or
 * where a say-it-back should return to — and the second one cannot assume it
 * is the first.
 *
 * Three screens had grown their own `?`/`&` join. This is that join, once.
 */

/** Undefined values are dropped, so a caller can pass an optional straight in. */
export function withQuery(
  href: string,
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }

  const encoded = search.toString();
  if (!encoded) return href;

  return `${href}${href.includes('?') ? '&' : '?'}${encoded}`;
}
