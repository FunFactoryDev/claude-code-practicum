# 4. Allow and deny rules

**Lesson:** ["Allow and deny rules: where they live"](https://zero2vibecode.com/learn/claude-code-pro/1-2-allow-deny-rules)

## Why

Permission rules say what Claude may do without asking and what it may never do. Team rules live in `.claude/settings.json` and are committed with the project.

## What to do

Create `.claude/settings.json` with a `permissions` block:
- `allow`: `Bash(npm test)`;
- `deny`: `Read(./.env)` and `Bash(git push *)`.

Inside a session, `/permissions` shows that the rules were picked up.

## Prompt for Claude

```
Create .claude/settings.json: allow Bash(npm test) without asking, deny Read(./.env) and Bash(git push *).
```

## Watch out

Deny is checked first, then ask, then allow. No allow rule in any other file can override a deny.

## Check

```bash
npm run check -- 4
```
