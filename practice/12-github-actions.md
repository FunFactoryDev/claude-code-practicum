# 12. Claude in GitHub Actions

**Lesson:** ["GitHub Actions: Claude in issues and pull requests"](https://zero2vibecode.com/learn/claude-code-pro/3-3-github-actions)

## Why

The official action runs Claude Code as a CI step and answers `@claude` in issues and pull requests.

## What to do

The easiest path is `/install-github-app` inside a session: Claude Code installs the app, saves the secret and opens a PR with the workflow. Or write `.github/workflows/claude.yml` yourself: an `anthropics/claude-code-action@v1` step, `timeout-minutes`, a `permissions` block and `claude_args: "--max-turns 5"`.

## Prompt for Claude

```
/install-github-app
```

## Watch out

The text of an issue that mentions `@claude` is untrusted input. Keep the token's permissions minimal. Without a secret holding a key the workflow simply fails — that is fine for practice.

## Check

```bash
npm run check -- 12
```
