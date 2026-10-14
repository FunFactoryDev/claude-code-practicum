// Working with links in Markdown: find them, normalize them, drop duplicates.

const LINK = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/** Every link in a Markdown text: [{ text, url }]. */
export function extractLinks(markdown) {
  const links = [];
  for (const m of markdown.matchAll(LINK)) {
    links.push({ text: m[1], url: m[2] });
  }
  return links;
}

/** Brings a URL to one canonical form so that equal links compare equal. */
export function normalizeUrl(url) {
  const u = new URL(url);
  const path = u.pathname.replace(/\/+$/, "");
  return `${u.protocol}//${u.host}${path}`;
}

/**
 * Drops duplicates, keeping the first occurrence and the original order.
 * The rules are in practice/13-final-goal.md.
 */
export function dedupeLinks(links) {
  throw new Error("dedupeLinks is not written yet — it is the final task of the practicum");
}
