// npm run check        — check every task
// npm run check -- 6   — check one task
//
// The check only reads project files (and ~/.claude/settings.json for task 10).
// It changes nothing, makes no network calls and never starts Claude.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { randomInt } from "node:crypto";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://zero2vibecode.com/learn";
const p = (...parts) => path.join(ROOT, ...parts);
const read = (rel) => (existsSync(p(rel)) ? readFileSync(p(rel), "utf8") : null);

/** A JSON file, or a string explaining why it could not be read. */
function json(file) {
  if (!existsSync(file)) return `no file ${path.relative(ROOT, file) || file}`;
  try {
    return { data: JSON.parse(readFileSync(file, "utf8")) };
  } catch (e) {
    return `${path.relative(ROOT, file)} is not valid JSON: ${e.message}`;
  }
}

/** A fresh copy of src/links.js (bypassing the module cache, so Claude's edits are seen). */
async function links() {
  return import(`${pathToFileURL(p("src", "links.js")).href}?t=${Date.now()}`);
}

function npmTest() {
  const r = spawnSync(process.execPath, ["--test"], { cwd: ROOT, encoding: "utf8" });
  const pass = Number(/# pass (\d+)/.exec(r.stdout)?.[1] ?? 0);
  return { ok: r.status === 0, pass };
}

/** A Markdown file's frontmatter as a key → value object (plain strings only). */
function frontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return null;
  return Object.fromEntries(
    m[1].split(/\r?\n/).map((l) => /^([\w-]+):\s*(.*)$/.exec(l)).filter(Boolean).map((x) => [x[1], x[2].trim()]),
  );
}

const settings = () => json(p(".claude", "settings.json"));

/** Runs a hook command the way Claude Code would and returns its exit code. */
function runHook(hook, filePath) {
  const sub = (s) => s.replaceAll("${CLAUDE_PROJECT_DIR}", ROOT).replaceAll("$CLAUDE_PROJECT_DIR", ROOT);
  const input = JSON.stringify({ hook_event_name: "PreToolUse", tool_name: "Edit", tool_input: { file_path: filePath } });
  const opts = { cwd: ROOT, input, encoding: "utf8", env: { ...process.env, CLAUDE_PROJECT_DIR: ROOT } };
  let cmd = sub(hook.command);
  let args = Array.isArray(hook.args) ? hook.args.map(sub) : null;
  if (args && /\.m?js$/.test(cmd)) [cmd, args] = [process.execPath, [cmd, ...args]];
  if (args && process.platform === "win32" && cmd.endsWith(".sh")) [cmd, args] = ["bash", [cmd, ...args]];
  const r = args ? spawnSync(cmd, args, opts) : spawnSync(cmd, { ...opts, shell: true });
  return { code: r.status, stderr: (r.stderr || "").trim(), error: r.error?.message };
}

const TASKS = [
  {
    title: "Project memory: CLAUDE.md",
    lesson: ["CLAUDE.md — stop repeating yourself", "claude-code/3-1-claude-md"],
    check() {
      const md = read("CLAUDE.md");
      if (!md) return "there is no CLAUDE.md in the project root";
      if (!md.includes("npm test")) return "CLAUDE.md does not say how to run the tests (npm test)";
      if (!md.includes("npm run check")) return "CLAUDE.md does not mention the task check (npm run check)";
      if (md.split("\n").filter((l) => l.trim()).length < 5) return "CLAUDE.md is too short — it needs at least 5 non-empty lines";
    },
  },
  {
    title: "Fix the failing test — plan first",
    lesson: ["Permission modes and Shift+Tab", "claude-code-pro/1-1-permission-modes"],
    async check() {
      const { normalizeUrl } = await links();
      const cases = [
        ["https://example.com/search/?q=claude", "https://example.com/search?q=claude"],
        ["https://Example.com/docs/#intro", "https://example.com/docs"],
        ["https://example.com/a?x=1&y=2#top", "https://example.com/a?x=1&y=2"],
      ];
      for (const [input, want] of cases) {
        const got = normalizeUrl(input);
        if (got !== want) return `normalizeUrl("${input}") returned "${got}", expected "${want}"`;
      }
      if (!npmTest().ok) return "npm test still fails";
    },
  },
  {
    title: "Test first, then the fix: images are not links",
    lesson: ["/rewind: roll back a step that went wrong", "claude-code-pro/0-3-rewind"],
    async check() {
      const { extractLinks } = await links();
      const got = extractLinks("![logo](logo.png) and [site](https://example.com)");
      if (got.length !== 1 || got[0].url !== "https://example.com") {
        return `extractLinks still treats an image as a link: ${JSON.stringify(got)}`;
      }
      const tests = read("test/links.test.js") ?? "";
      if ((tests.match(/\btest\(/g) ?? []).length < 5) return "no new test in test/links.test.js (there were 4)";
      if (!tests.includes("![")) return "the new test does not check an image like ![…](…)";
      if (!npmTest().ok) return "npm test fails";
    },
  },
  {
    title: "Allow and deny rules",
    lesson: ["Allow and deny rules: where they live", "claude-code-pro/1-2-allow-deny-rules"],
    check() {
      const s = settings();
      if (typeof s === "string") return s;
      const { allow = [], deny = [] } = s.data.permissions ?? {};
      if (!allow.some((r) => r.startsWith("Bash(npm test"))) return 'permissions.allow has no "Bash(npm test)" rule';
      if (!deny.includes("Read(./.env)")) return 'permissions.deny has no "Read(./.env)" rule';
      if (!deny.some((r) => r.startsWith("Bash(git push"))) return 'permissions.deny does not block "Bash(git push *)"';
    },
  },
  {
    title: "A sandbox for commands",
    lesson: ["The sandbox: a boundary the system enforces", "claude-code-pro/1-3-sandbox"],
    check() {
      const s = settings();
      if (typeof s === "string") return s;
      if (s.data.sandbox?.enabled !== true) return '.claude/settings.json has no "sandbox": { "enabled": true }';
    },
  },
  {
    title: "A guard hook for .env",
    lesson: ["Hooks: a rule that cannot be forgotten", "claude-code-pro/2-1-pretooluse-hooks"],
    check() {
      const s = settings();
      if (typeof s === "string") return s;
      const groups = s.data.hooks?.PreToolUse ?? [];
      const group = groups.find((g) => /Edit/.test(g.matcher ?? ""));
      const hook = group?.hooks?.find((h) => h.type === "command" && h.command);
      if (!hook) return 'hooks.PreToolUse has no hook with matcher "Edit|Write" and a command';
      const env = runHook(hook, p(".env"));
      if (env.error) return `the hook did not run: ${env.error}`;
      if (env.code !== 2) return `an edit to .env must be blocked with exit code 2, but the hook returned ${env.code}`;
      if (!env.stderr) return "the hook blocks but does not say why — print the reason to stderr";
      const src = runHook(hook, p("src", "links.js"));
      if (src.code !== 0) return `an edit to src/links.js must go through (exit code 0), but the hook returned ${src.code}`;
    },
  },
  {
    title: "Your own skill",
    lesson: ["Skill patterns", "claude-code-pro/5-2-skill-patterns"],
    check() {
      const dir = p(".claude", "skills");
      if (!existsSync(dir)) return "there is no .claude/skills folder";
      for (const name of readdirSync(dir)) {
        const text = read(path.join(".claude", "skills", name, "SKILL.md"));
        const fm = text && frontmatter(text);
        if (fm?.name && fm?.description) return;
      }
      return "no .claude/skills/<name>/SKILL.md with name and description in its frontmatter";
    },
  },
  {
    title: "A reviewer subagent",
    lesson: ["Choosing an orchestration pattern", "claude-code-pro/4-2-choosing-a-pattern"],
    check() {
      const dir = p(".claude", "agents");
      if (!existsSync(dir)) return "there is no .claude/agents folder";
      for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
        const fm = frontmatter(read(path.join(".claude", "agents", f)));
        if (!fm?.name || !fm?.description) continue;
        if (/\b(Edit|Write)\b/.test(fm.tools ?? "")) return `${f}: a reviewer needs no Edit or Write — keep its tools read-only`;
        if (!fm.tools) return `${f}: list its tools (for example Read, Grep, Glob) — otherwise the agent gets every tool`;
        return;
      }
      return "no .claude/agents/<name>.md with name and description in its frontmatter";
    },
  },
  {
    title: "An MCP server for the project",
    lesson: ["MCP — connecting outside tools", "claude-code/3-3-mcp-servers"],
    check() {
      const m = json(p(".mcp.json"));
      if (typeof m === "string") return m;
      const servers = Object.values(m.data.mcpServers ?? {});
      if (!servers.length) return ".mcp.json has no servers under mcpServers";
      if (!servers.some((s) => s.command || s.url)) return "the server in .mcp.json has neither a command nor a url";
    },
  },
  {
    title: "The status line",
    lesson: ["Your way: the status line, output styles and built-in teachers", "claude-code-pro/2-4-status-line-and-output-styles"],
    check() {
      for (const file of [path.join(homedir(), ".claude", "settings.json"), p(".claude", "settings.json")]) {
        const s = json(file);
        if (typeof s !== "string" && s.data.statusLine?.type === "command" && s.data.statusLine.command) return;
      }
      return 'no "statusLine": { "type": "command", "command": … } in either ~/.claude/settings.json or .claude/settings.json';
    },
  },
  {
    title: "An unattended run with limits",
    lesson: ["Unattended runs with limits", "claude-code-pro/3-2-bounded-unattended-runs"],
    check() {
      const b = json(p(".claude", "bounded-run.json"));
      if (typeof b === "string") return b;
      const { sandbox = {}, permissions = {} } = b.data;
      if (sandbox.enabled !== true || sandbox.failIfUnavailable !== true) {
        return "in bounded-run.json the sandbox must have enabled and failIfUnavailable set to true";
      }
      const deny = permissions.deny ?? [];
      if (!deny.some((r) => r.startsWith("Bash(git commit")) || !deny.some((r) => r.startsWith("Bash(git push"))) {
        return "in bounded-run.json, deny Bash(git commit *) and Bash(git push *)";
      }
      const pkg = json(p("package.json"));
      if (typeof pkg === "string") return pkg;
      const script = Object.values(pkg.data.scripts ?? {}).find((s) => /\bclaude\s+-p\b/.test(s));
      if (!script) return "package.json has no script with claude -p";
      for (const flag of ["--settings", "--permission-mode dontAsk", "--max-turns", "--max-budget-usd"]) {
        if (!script.includes(flag)) return `the claude -p script is missing ${flag}`;
      }
    },
  },
  {
    title: "Claude in GitHub Actions",
    lesson: ["GitHub Actions: Claude in issues and pull requests", "claude-code-pro/3-3-github-actions"],
    check() {
      const y = read(".github/workflows/claude.yml");
      if (!y) return "there is no .github/workflows/claude.yml";
      if (!y.includes("anthropics/claude-code-action")) return "the workflow has no anthropics/claude-code-action step";
      if (!/timeout-minutes:\s*\d+/.test(y)) return "no time limit: add timeout-minutes";
      if (!/^\s*permissions:/m.test(y)) return "the token's rights are not narrowed: add a permissions block";
      if (!/--max-turns/.test(y)) return "pass a turn limit through claude_args: --max-turns";
    },
  },
  {
    title: "Finale: /goal and the dedupeLinks function",
    lesson: ["/goal, /loop and Agent view: work that runs without you", "claude-code-pro/3-4-goal-loop-agent-view"],
    async check() {
      const { dedupeLinks } = await links();
      const input = [
        { text: "a", url: "https://example.com/docs/" },
        { text: "b", url: "./README.md" },
        { text: "c", url: "https://EXAMPLE.com/docs#x" },
        { text: "d", url: "https://example.com/docs?page=2" },
        { text: "e", url: "./README.md" },
        { text: "f", url: "./readme.md" },
      ];
      const copy = structuredClone(input);
      let got;
      try {
        got = dedupeLinks(input);
      } catch (e) {
        return `dedupeLinks throws: ${e.message}`;
      }
      if (JSON.stringify(input) !== JSON.stringify(copy)) return "dedupeLinks changes its input array — it must return a new one";
      const texts = (got ?? []).map((l) => l.text).join("");
      if (texts !== "abdf") return `expected links a, b, d, f (in that order), got: ${texts.split("").join(", ") || "nothing"}`;
      const cli = spawnSync(process.execPath, ["src/cli.js", "notes/links.md", "--unique"], { cwd: ROOT, encoding: "utf8" });
      if (!cli.stdout.includes("Total links: 5")) return "node src/cli.js notes/links.md --unique should find 5 unique links";
      if (!npmTest().ok) return "npm test fails";
    },
  },
  {
    title: "The full cycle: from request to commit",
    lesson: ["From request to commit", "claude-code-pro/5-4-request-to-commit"],
    check() {
      const cli = spawnSync(process.execPath, ["src/cli.js", "notes/links.md", "--json"], { cwd: ROOT, encoding: "utf8" });
      let data;
      try {
        data = JSON.parse(cli.stdout);
      } catch {
        return "node src/cli.js notes/links.md --json should print a JSON array and nothing else";
      }
      if (!Array.isArray(data) || !data.every((l) => typeof l.text === "string" && typeof l.url === "string")) {
        return "--json should print an array of { text, url } objects";
      }
      if (!/--json/.test(read("test/links.test.js") ?? "") && !readdirSync(p("test")).some((f) => /--json/.test(read(path.join("test", f)) ?? ""))) {
        return "no test for --json in the test/ folder";
      }
      if (!npmTest().ok) return "npm test fails";
      const plan = read("PLAN.md");
      if (!plan) return "there is no PLAN.md — save the plan there with the list of files it changes";
      const planned = new Set([...plan.matchAll(/`([^`]+\.[a-z]+)`/g)].map((m) => m[1]));
      if (!planned.size) return "PLAN.md has no list of files — list them in backticks: `src/cli.js`";
      const git = spawnSync("git", ["show", "--name-only", "--format=", "HEAD"], { cwd: ROOT, encoding: "utf8" });
      if (git.status !== 0) return "could not read the last commit — is this a git repository?";
      const touched = git.stdout.split("\n").filter(Boolean);
      if (!touched.some((f) => f.startsWith("src/"))) return "the last commit does not change src/ — commit your work";
      const extra = touched.filter((f) => f !== "PLAN.md" && !planned.has(f));
      if (extra.length) return `the commit touches files that are not in the plan: ${extra.join(", ")}`;
    },
  },
];

// ── completion code ──────────────────────────────────────────────────────────
// The site verifies the same code (zero2vibecode.com, lib/practicum/code.ts — keep the
// copies identical). The checksum catches typos; it is a reason to be proud, not a diploma.

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function checksum(nonce) {
  let h = 0x811c9dc5;
  for (const ch of `${nonce}|ccp14`) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  const n = h % (ALPHABET.length * ALPHABET.length);
  return ALPHABET[Math.floor(n / ALPHABET.length)] + ALPHABET[n % ALPHABET.length];
}

export function makePracticumCode(nonce) {
  const code = nonce + checksum(nonce);
  return `CCP-${code.slice(0, 4)}-${code.slice(4)}`;
}

// ── output ───────────────────────────────────────────────────────────────────

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
const [green, red, dim, bold] = [32, 31, 2, 1].map((c) => (s) => paint(c, s));

const only = Number(process.argv[2]);
if (process.argv[2] && !(only >= 1 && only <= TASKS.length)) {
  console.error(`The task number goes from 1 to ${TASKS.length}. For example: npm run check -- 3`);
  process.exit(1);
}

let passed = 0;
console.log(bold("\nClaude Code practicum — task check\n"));
for (const [i, task] of TASKS.entries()) {
  if (only && only !== i + 1) continue;
  let reason;
  try {
    reason = await task.check();
  } catch (e) {
    reason = `the check crashed: ${e.message}`;
  }
  const n = String(i + 1).padStart(2);
  if (!reason) {
    passed++;
    console.log(`${green("✓")} ${n}. ${task.title}`);
  } else {
    console.log(`${red("✗")} ${n}. ${task.title}`);
    console.log(`      ${reason}`);
    if (only) console.log(dim(`      Lesson: "${task.lesson[0]}" — ${SITE}/${task.lesson[1]}`));
  }
}

const total = only ? 1 : TASKS.length;
console.log(`\n${passed === total ? green(bold(`Done: ${passed} of ${total}`)) : `Passed: ${passed} of ${total}`}`);
if (!only && passed < total) console.log(dim("Details for one task: npm run check -- <number>"));
if (!only && passed === total) {
  const nonce = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  console.log(green("\nAll tasks passed!"));
  console.log(`Your completion code: ${bold(makePracticumCode(nonce))}`);
  console.log("Enter it at https://zero2vibecode.com/learn/claude-code-pro to get the \"Claude Code Practitioner\" badge.");
}
process.exit(passed === total ? 0 : 1);
