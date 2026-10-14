# 9. An MCP server for the project

**Lesson:** ["MCP — connecting outside tools"](https://zero2vibecode.com/learn/claude-code/3-3-mcp-servers)

## Why

MCP gives Claude tools beyond your files: a browser, a database, an external API. Project servers live in `.mcp.json` and are committed.

## What to do

Connect any server at the project level, for example a browser:

```bash
claude mcp add --scope project playwright -- npx @playwright/mcp@latest
```

The command creates `.mcp.json`. Inside a session, `/mcp` shows its state.

## Watch out

Only connect servers you trust: a server runs with your user's permissions.

## Check

```bash
npm run check -- 9
```
