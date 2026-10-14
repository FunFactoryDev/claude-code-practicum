# 3. Test first, then the fix

**Lesson:** ["/rewind: roll back a step that went wrong"](https://zero2vibecode.com/learn/claude-code-pro/0-3-rewind)

## Why

`extractLinks` treats the image `![logo](logo.png)` as a link. First a test that catches it, then the fix — that way you know the bug is really gone.

## What to do

1. Ask Claude to add a test to `test/links.test.js`: images like `![…](…)` are not links. Make sure it fails.
2. Then ask Claude to fix `extractLinks`.
3. If Claude wanders off in the wrong direction, `Esc Esc` or `/rewind` takes the code and the conversation back to an earlier step.

## Prompt for Claude

```
Add a test to test/links.test.js: extractLinks must not return images like ![alt](src). Run it and show me that it fails. Do not touch the code yet.
```

## Watch out

`/rewind` only rolls back edits made by Claude's own tools. Changes made by commands in the terminal stay.

## Check

```bash
npm run check -- 3
```
