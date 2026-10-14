// node src/cli.js <file.md> [--unique] — prints the links found in a Markdown file.

import { readFileSync } from "node:fs";
import { extractLinks, dedupeLinks } from "./links.js";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
if (!file) {
  console.error("Usage: node src/cli.js <file.md> [--unique]");
  process.exit(1);
}

let links = extractLinks(readFileSync(file, "utf8"));
if (args.includes("--unique")) links = dedupeLinks(links);

for (const { text, url } of links) console.log(`${text} — ${url}`);
console.log(`\nTotal links: ${links.length}`);
