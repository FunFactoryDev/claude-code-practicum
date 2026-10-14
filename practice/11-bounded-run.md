# 11. An unattended run with limits

**Lesson:** ["Unattended runs with limits"](https://zero2vibecode.com/learn/claude-code-pro/3-2-bounded-unattended-runs)

## Why

An unattended run does exactly what you allowed in advance. The boundaries live in a file, the limits in flags.

## What to do

1. Create `.claude/bounded-run.json`: the sandbox with `enabled` and `failIfUnavailable`, and `Bash(git commit *)` and `Bash(git push *)` in `deny`.
2. Add a script to `package.json`, for example `claude:fix`:

```
claude -p "Fix the failing test" --settings .claude/bounded-run.json --permission-mode dontAsk --max-turns 15 --max-budget-usd 2
```

3. Run it, then read `git diff` and commit what you accept yourself.

## Watch out

`claude -p` with `ANTHROPIC_API_KEY` in the environment spends money from that key, not from your subscription.

## Check

```bash
npm run check -- 11
```
