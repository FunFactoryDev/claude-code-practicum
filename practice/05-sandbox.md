# 5. A sandbox for commands

**Lesson:** ["The sandbox: a boundary the system enforces"](https://zero2vibecode.com/learn/claude-code-pro/1-3-sandbox)

## Why

The `Read(./.env)` rule stops Claude's tools, but not a script that opens the file itself. The sandbox limits what the commands themselves can do.

## What to do

Turn on the sandbox in `.claude/settings.json`: `"sandbox": { "enabled": true }`. Inside a session, `/sandbox` shows its state.

## Prompt for Claude

```
Turn on the sandbox in .claude/settings.json without touching the other settings.
```

## Watch out

If the sandbox cannot start — on Linux it needs `bubblewrap` and `socat` — Claude Code by default keeps running commands without it. The task still counts, but you get no protection. Check `/sandbox` to see whether it is really on.

## Check

```bash
npm run check -- 5
```
