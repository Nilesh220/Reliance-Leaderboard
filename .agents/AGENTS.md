# Reliance Leaderboard — Agent Rules

## Project Overview

This is the **Bootup India · Reliance Digital** leaderboard web application.
It is a **vanilla HTML/CSS/JS** project (no build step, no framework) deployed on **Vercel**.
Backend is powered by **Supabase** (PostgreSQL + Auth + Edge Functions).

## Project Structure

```
.
├── index.html          # Login / OTP entry page
├── leaderboard.html    # Live leaderboard view (POC rankings)
├── dashboard.html      # User dashboard
├── admin.html          # Admin panel
├── js/
│   ├── auth.js         # Supabase auth helpers, session management
│   ├── data.js         # All Supabase data-fetching logic
│   ├── leaderboard.js  # Leaderboard rendering + real-time updates
│   ├── dashboard.js    # Dashboard logic
│   ├── admin.js        # Admin UI logic
│   ├── admin_tasks.js  # Admin task management
│   └── effects.js      # Canvas animations, visual effects
├── css/
│   ├── style.css       # Global design system (vars, components)
│   └── admin.css       # Admin-specific styles
├── api/
│   ├── send-otp.js     # Vercel serverless: send OTP via email
│   ├── verify-otp.js   # Vercel serverless: verify OTP
│   └── upload.js       # Vercel serverless: file upload handler
└── *.sql               # Supabase schema & seed scripts
```

## Technology Rules

- **No frameworks**: Pure HTML, CSS, JavaScript only. No React, Vue, Tailwind, etc.
- **No build step**: All JS is loaded as `<script src="...">` tags or inline.
- **CSS variables**: All colors, spacing, typography live in `css/style.css` `:root {}`. Always use `var(--token)` — never hardcode hex values.
- **Supabase client**: Always use the existing Supabase client initialized in `js/auth.js` or `js/data.js`. Never re-initialize it.
- **Vercel serverless**: API routes in `/api/` are Node.js Vercel functions. Keep them lightweight.

## Coding Standards

- Use `const` / `let`, never `var`.
- Use `async/await` for all Supabase calls; always wrap in `try/catch`.
- Prefix all Supabase table queries with comments describing what data is fetched.
- Keep inline `<style>` blocks in HTML files minimal — prefer `css/style.css`.
- All new HTML elements must have a unique, descriptive `id` attribute for testability.
- Always preserve existing comments and docstrings; only remove them if explicitly asked.

## Design System (Non-Negotiable)

- **Brand colors**: `var(--blue)` (#0047CC Reliance blue), `var(--red)` (#E31837 Reliance red).
- **Typography**: Use fonts already loaded in the page; do not add new Google Font imports without asking.
- **Animations**: Subtle micro-animations are preferred. Reference `js/effects.js` for canvas animation patterns.
- **Glassmorphism**: Use `backdrop-filter: blur(...)` + semi-transparent backgrounds for cards/navs.
- **Dark/Light**: The app is light-mode; do not add dark mode unless explicitly requested.

## Graphify — Always On

The **Graphify** skill is active for this project. On every prompt:
1. Before editing any file, mentally map the dependency graph: which files import/use the target file.
2. Identify all side effects: a change in `data.js` may affect `leaderboard.js`, `dashboard.js`, and `admin.js`.
3. When adding new features, check if a similar utility already exists in `data.js` or `auth.js` before creating new code.
4. Always mention which files are affected by your changes at the end of your response.

## Response Format

- End every response with a **"Files Affected"** section listing all modified/created files with clickable links.
- If a change touches more than 2 files, provide a brief **dependency note** explaining the impact chain.
