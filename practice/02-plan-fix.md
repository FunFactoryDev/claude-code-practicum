# 2. Fix the failing test — plan first

**Lesson:** ["Permission modes and Shift+Tab"](https://zero2vibecode.com/learn/claude-code-pro/1-1-permission-modes)

## Why

`npm test` fails: `normalizeUrl` drops the query string (`?q=…`). The habit of a pro is plan first, edit second.

## What to do

1. Run `npm test` and see which test fails.
2. Press `Shift+Tab` until you see `⏸ plan mode on`.
3. Ask Claude to find the cause and propose a fix. In plan mode it changes nothing.
4. Read the plan, approve it, and Claude makes the fix.

## Prompt for Claude

```
npm test fails on the query string test. Find the cause in src/links.js and propose the smallest fix. Do not change the tests.
```

## Watch out

If Claude suggests changing the test so that it passes, say no. The test describes the correct behavior; it is the code that needs fixing.

## Check

```bash
npm run check -- 2
```
