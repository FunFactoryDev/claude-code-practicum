# 1. Project memory: CLAUDE.md

**Lesson:** ["CLAUDE.md — stop repeating yourself"](https://zero2vibecode.com/learn/claude-code/3-1-claude-md)

## Why

Claude starts every session with a blank slate. CLAUDE.md is the file it reads at startup: how to build the project, how to run the tests, what you have agreed on.

## What to do

Ask Claude to study the project and write a CLAUDE.md. Check that it mentions `npm test` and `npm run check`, and nothing extra: every line in CLAUDE.md takes up context in every session.

## Prompt for Claude

```
/init
```

## Watch out

`/init` writes CLAUDE.md on its own — read it afterwards and cut it down. A short, accurate file works better than a long one.

## Check

```bash
npm run check -- 1
```
