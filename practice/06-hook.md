# 6. A guard hook for .env

**Lesson:** ["Hooks: a rule that cannot be forgotten"](https://zero2vibecode.com/learn/claude-code-pro/2-1-pretooluse-hooks)

## Why

CLAUDE.md is advice, a hook is a rule. A `PreToolUse` hook that exits with code 2 blocks the edit in any mode, even in Auto.

## What to do

1. Write a script `.claude/hooks/protect-env.sh` (or `.mjs`): it reads JSON from stdin, and if `tool_input.file_path` is `.env`, it prints the reason to stderr and exits with code 2.
2. Register it in `.claude/settings.json` under `hooks.PreToolUse` with `matcher: "Edit|Write"`.
3. Test it without Claude:

```bash
echo "{\"tool_input\":{\"file_path\":\"$PWD/.env\"}}" | .claude/hooks/protect-env.sh; echo "exit $?"
```

## Prompt for Claude

```
Write a PreToolUse hook that blocks edits to .env and .env.* files with exit code 2 and an explanation on stderr. Register it in .claude/settings.json for Edit|Write.
```

## Watch out

The hook only sees the Edit and Write tools. It will not notice `echo X >> .env` run through Bash.

## Check

```bash
npm run check -- 6
```
