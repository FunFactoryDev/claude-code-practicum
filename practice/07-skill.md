# 7. Your own skill

**Lesson:** ["Skill patterns"](https://zero2vibecode.com/learn/claude-code-pro/5-2-skill-patterns)

## Why

If you keep explaining the same thing to Claude, turn it into a skill. Only the description lives in context; the body is read when it is needed.

## What to do

Create a skill `.claude/skills/<name>/SKILL.md` with `name` and `description` in its frontmatter. For example, a "check links" skill: run `npm run links`, find duplicates and broken relative links, print a short report. Call it as `/<name>`.

## Prompt for Claude

```
Create a skill at .claude/skills/check-links: run npm run links and briefly report which links are duplicated.
```

## Watch out

The `description` decides when Claude loads the skill on its own. Write *when* the skill is needed, not only what it does.

## Check

```bash
npm run check -- 7
```
