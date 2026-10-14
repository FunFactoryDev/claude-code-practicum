# 14. The full cycle: from request to commit

**Lesson:** ["From request to commit"](https://zero2vibecode.com/learn/claude-code-pro/5-4-request-to-commit)

## Why

A pro neither asks for "build the feature" nor commits everything in sight. The cycle is: explore, plan, write a test, implement, verify, read the diff, commit exactly what you planned.

## What to do

Add a `--json` flag to `src/cli.js`: instead of lines, print a JSON array `[{ "text": …, "url": … }]`.

1. In plan mode (`Shift+Tab`), ask Claude for a plan. Save it to `PLAN.md` with the list of files the plan changes, in backticks: `` `src/cli.js` ``, `` `test/cli.test.js` ``.
2. Test first for `--json` — let it fail.
3. Then the implementation, `npm test`, `/diff` — read the changes.
4. Commit: `git add` only the files from the plan plus `PLAN.md`, then `git commit`.

## Prompt for Claude

```
I want a --json flag in src/cli.js: print a JSON array of links { text, url }. Make a plan and list the files it will touch. Do not change any code yet.
```

## Watch out

The check looks at the last commit: if it contains a file that is not in the plan, the task does not count. That is the whole point — a commit holds what you decided to change, not everything that happened to change.

## Check

```bash
npm run check -- 14
```
