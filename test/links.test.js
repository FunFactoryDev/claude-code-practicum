import { test } from "node:test";
import assert from "node:assert/strict";
import { extractLinks, normalizeUrl } from "../src/links.js";

test("extractLinks finds links and their text", () => {
  assert.deepEqual(extractLinks("Read [the docs](https://example.com/docs) and [the blog](/blog)."), [
    { text: "the docs", url: "https://example.com/docs" },
    { text: "the blog", url: "/blog" },
  ]);
});

test("extractLinks understands a link with a title", () => {
  assert.deepEqual(extractLinks('[site](https://example.com "Home")'), [{ text: "site", url: "https://example.com" }]);
});

test("normalizeUrl drops the anchor and the trailing slash", () => {
  assert.equal(normalizeUrl("https://Example.com/docs/#intro"), "https://example.com/docs");
});

test("normalizeUrl keeps the query string", () => {
  assert.equal(normalizeUrl("https://example.com/search/?q=claude"), "https://example.com/search?q=claude");
});
