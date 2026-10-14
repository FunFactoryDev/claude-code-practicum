# 10. The status line

**Lesson:** ["Your way: the status line, output styles and built-in teachers"](https://zero2vibecode.com/learn/claude-code-pro/2-4-status-line-and-output-styles)

## Why

The share of context in use, right under the input box, is a `/context` that is always in front of you.

## What to do

Ask Claude to set up a status line. It goes into your `~/.claude/settings.json`.

## Prompt for Claude

```
/statusline show the model, the folder name and what percentage of the context is used
```

## Watch out

A status line is a script that Claude Code runs for you. Read someone else's script before you use it.

## Check

```bash
npm run check -- 10
```
