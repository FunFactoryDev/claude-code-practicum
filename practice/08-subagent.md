# 8. A reviewer subagent

**Lesson:** ["Choosing an orchestration pattern"](https://zero2vibecode.com/learn/claude-code-pro/4-2-choosing-a-pattern)

## Why

A subagent works in its own context window and returns only the result. A reviewer has no reason to edit files — give it read-only tools.

## What to do

Create `.claude/agents/reviewer.md` with `name`, `description` and `tools: Read, Grep, Glob`. Then ask Claude: "use the reviewer agent to review the changes in src/".

## Prompt for Claude

```
Create a subagent in .claude/agents/reviewer.md: a read-only code reviewer with tools Read, Grep, Glob.
```

## Watch out

Without a `tools` field, a subagent gets every tool, including file editing.

## Check

```bash
npm run check -- 8
```
