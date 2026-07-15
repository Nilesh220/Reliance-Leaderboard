---
name: graphify
description: >
  Activates dependency-graph awareness for every prompt. Before editing any
  file, the agent builds a mental map of the project's file dependency graph,
  traces all downstream consumers of the target file, and surfaces side-effects
  up-front. Ends every response with a "Files Affected" section with clickable
  links. Always-on for the Reliance Leaderboard project.
---

# Graphify Skill

## Purpose

Graphify makes the agent **graph-aware** on every prompt. Instead of editing
files in isolation, it:

1. **Maps dependencies** before touching any file.
2. **Traces downstream consumers** — who imports or relies on the target file.
3. **Surfaces side-effects** before writing a single line of code.
4. **Reports impact** at the end of every response.

---

## Project Dependency Graph (Reliance Leaderboard)

```
index.html
  └── js/auth.js          ← session helpers used by ALL pages
  └── js/effects.js       ← canvas BG animation

leaderboard.html
  └── js/auth.js
  └── js/data.js          ← fetches POC/leaderboard data from Supabase
  └── js/leaderboard.js   ← renders leaderboard UI, uses data.js
  └── js/effects.js

dashboard.html
  └── js/auth.js
  └── js/data.js
  └── js/dashboard.js     ← renders dashboard, uses data.js

admin.html
  └── js/auth.js
  └── js/data.js
  └── js/admin.js         ← admin CRUD, uses data.js
  └── js/admin_tasks.js   ← task management, uses data.js
  └── js/effects.js

css/style.css             ← consumed by ALL html files (global vars)
css/admin.css             ← consumed only by admin.html

api/send-otp.js           ← Vercel serverless, standalone
api/verify-otp.js         ← Vercel serverless, standalone
api/upload.js             ← Vercel serverless, standalone
```

**Critical shared files** (changes have the widest blast radius):
- `css/style.css` → affects ALL pages
- `js/auth.js` → affects ALL pages (auth flow breaks everything)
- `js/data.js` → affects leaderboard, dashboard, admin, admin_tasks

---

## Activation Protocol (Every Prompt)

### Step 1 — Identify Target Files
Before writing any code, list the files the task requires editing.

### Step 2 — Build the Blast Radius
For each target file, check the graph above and note all downstream consumers.

Example:
> Task: "Edit `data.js` to add a new query"
> Blast radius: `leaderboard.js`, `dashboard.js`, `admin.js`, `admin_tasks.js`
> Action: Ensure the new function doesn't break existing call signatures.

### Step 3 — Check for Existing Utilities
Before creating new code, scan `data.js` and `auth.js` for:
- Existing Supabase query patterns that can be reused
- Existing helper functions that solve the same problem

### Step 4 — Execute Changes
Make the minimal change that satisfies the requirement without breaking the
dependency graph.

### Step 5 — Report Impact
End every response with:

```markdown
## Files Affected
- [filename.ext](file:///absolute/path) — brief reason
- [filename2.ext](file:///absolute/path) — brief reason

**Dependency Note**: (if > 2 files) Explain the impact chain.
```

---

## Rules

- **Never** hardcode colors — always `var(--token)` from `css/style.css`.
- **Never** re-initialize the Supabase client — use the one from `auth.js`/`data.js`.
- **Never** use `var` — always `const`/`let`.
- **Always** `async/await` + `try/catch` for Supabase calls.
- **Always** check the dependency graph before editing a shared file.
- **Always** end response with **Files Affected** section.
