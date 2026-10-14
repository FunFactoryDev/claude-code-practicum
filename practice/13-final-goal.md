# 13. Finale: /goal and dedupeLinks

**Lesson:** ["/goal, /loop and Agent view: work that runs without you"](https://zero2vibecode.com/learn/claude-code-pro/3-4-goal-loop-agent-view)

## Why

Claude does the last task on its own — until a checkable condition holds. Your job is to write the condition and the rules.

## What to do

Write `dedupeLinks(links)` in `src/links.js`:
- it returns a **new** array and does not change the input;
- it keeps the first occurrence and preserves the order;
- `http(s)` URLs are compared after `normalizeUrl` (domain case, trailing slash and anchor do not matter; the query string does);
- everything else (`./README.md`) is compared as is, case-sensitive.

Tasks 2 and 3 must be done first. Afterwards `npm run links -- --unique` should find 5 links.

## Prompt for Claude

```
/goal npm run check -- 13 prints "Done: 1 of 1", existing tests are not changed, new tests for dedupeLinks are added; or stop after 10 turns
```

## Watch out

A `/goal` condition is judged by a separate model that reads the conversation. So the condition names a command whose output will show up in the conversation, and it ends with a turn limit.

## Check

```bash
npm run check -- 13
```
