---
name: frontend-craft
description: |
  Produces stunning, extraordinary UI for the Reliance Leaderboard project.
  Activates on any task that touches visual output — HTML structure, CSS,
  animations, component layout, or user-facing interactions.

  Use when any of the following conditions are true:
    1. User asks to add, update, or redesign any UI element, page, or component.
    2. User says "make it look better", "improve design", "add animation", or similar.
    3. A new HTML page, section, card, modal, or table is being created.
    4. User asks about styling, spacing, colors, typography, or effects.
    5. Any change touches .html files or css/style.css or css/admin.css.

  Do NOT use when:
    1. The task is purely backend / Supabase query logic with zero UI impact.
    2. The task only modifies Vercel serverless API routes (/api/*).
    3. The task is data migration or SQL-only.

metadata:
  version: v1
  publisher: nilesh-reliance
---

# Frontend Craft Skill
## Produce Extraordinary UI — Reliance Brand Edition

Every prompt that touches UI MUST pass through this skill. Mediocre output is
unacceptable. The bar is **premium SaaS / award-winning campaign micro-site**.

Read `references/brand_tokens.md` for the complete token reference before
writing any CSS.
Read `references/component_patterns.md` for reusable component recipes.
Read `references/animation_playbook.md` for motion design rules.

---

## Step 0 — Pre-flight Checklist

Before writing a single line of CSS or HTML:

- [ ] Identify which page(s) are affected (index / leaderboard / dashboard / admin).
- [ ] Check `css/style.css` `:root {}` — never hardcode any color, shadow, or radius.
- [ ] Check if the component already exists in `css/style.css` before writing new rules.
- [ ] Confirm the target viewport: desktop-first but responsive down to 375px.

---

## Step 1 — Visual Hierarchy Protocol

Every screen must have a clear hierarchy. Apply in this order:

### 1.1 Establish the Focal Point
- One dominant element per section captures attention first.
- Use `font-size: clamp(...)`, `font-weight: 800`, or a bold gradient text for
  headings. Reference the `.hero-title` pattern in `style.css`.
- Never let two equally-weighted elements compete.

### 1.2 Spacing Rhythm
- Use multiples of 8px for all spacing (8, 16, 24, 32, 48, 64, 80, 96).
- Section padding: `80px 24px` on desktop, `48px 20px` on mobile.
- Card internal padding: `24px` standard, `32px` for feature cards.

### 1.3 Type Scale
```
Display   : Space Grotesk 800  clamp(52px, 10vw, 100px)
H1        : Space Grotesk 700  clamp(32px, 5vw,  56px)
H2        : Space Grotesk 700  clamp(24px, 4vw,  40px)
H3        : Inter        600   20px
Body      : Inter        400   15–16px  line-height: 1.6
Caption   : Inter        600   11px     letter-spacing: 1px  text-transform: uppercase
Stat      : Space Grotesk 800  clamp(28px, 5vw, 48px)
```

---

## Step 2 — Brand Color Usage Rules

CRITICAL: Only use `var(--token)` — never raw hex values.

### Primary Palette
```
var(--blue)       #003087   → Primary CTAs, nav, brand elements
var(--blue-mid)   #0052CC   → Hover states on blue elements
var(--blue-light) #1A73E8   → Links, interactive accents
var(--blue-pale)  #EEF4FF   → Light blue fills, tag backgrounds
var(--red)        #E31837   → Rank badges, alerts, accent CTAs
var(--red-dark)   #B5142C   → Hover on red elements
var(--red-pale)   #FFF0F2   → Light red backgrounds for warnings
```

### Surface & Background
```
var(--bg)         #FFFFFF   → Page background
var(--bg2)        #F5F8FF   → Alternate section background
var(--bg3)        #EDF2FF   → Chip / tag fills
var(--surface)    rgba(0,48,135,0.04)  → Card fill (glass effect base)
var(--surface2)   rgba(0,48,135,0.07)  → Hover card fill
var(--surface3)   rgba(0,48,135,0.11)  → Active card fill
```

### Text
```
var(--text)       #1A1F36   → Primary text (dark navy)
var(--text2)      #374878   → Secondary text
var(--text3)      #7A8BA8   → Tertiary / placeholder text
```

### Ranking Colors
```
var(--gold)   + var(--gold-bg)    → Rank #1
var(--silver) + var(--silver-bg)  → Rank #2
var(--bronze) + var(--bronze-bg)  → Rank #3
```

### Gradients — The Reliance Signature
```css
/* Brand gradient — use on hero titles, primary buttons, strip bars */
background: linear-gradient(90deg, var(--blue) 0%, var(--red) 100%);

/* Gradient text — hero title pattern */
background: linear-gradient(135deg, var(--blue) 0%, var(--blue) 48%, var(--red) 52%, var(--red) 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;

/* Blue-only depth gradient */
background: linear-gradient(135deg, var(--blue) 0%, var(--blue-light) 100%);

/* Subtle page background (already on html element — do not override) */
/* radial-gradient ellipses in blue + red at corners */
```

---

## Step 3 — Component Recipes

### 3.1 Glass Card (Standard)
```css
.card {
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: var(--transition);
}
.card:hover {
  border-color: var(--border2);
  box-shadow: var(--shadow-blue);
  transform: translateY(-4px);
}
```

### 3.2 Glass Card — Red Accent (Highlight / Rank #1)
```css
.card-highlight {
  background: rgba(255, 255, 255, 0.90);
  border: 2px solid rgba(227, 24, 55, 0.30);
  border-radius: var(--radius);
  box-shadow: var(--shadow-red), inset 0 0 0 1px rgba(227, 24, 55, 0.07);
  backdrop-filter: blur(16px);
}
```

### 3.3 Pill / Badge
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.badge-blue { background: var(--blue-pale); color: var(--blue); border: 1px solid var(--border); }
.badge-red  { background: var(--red-pale);  color: var(--red);  border: 1px solid var(--border-red); }
```

### 3.4 Primary Button (Blue)
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--blue) 0%, var(--blue-mid) 100%);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 48, 135, 0.28);
  transition: var(--transition);
}
.btn-primary:hover {
  background: linear-gradient(135deg, var(--blue-mid) 0%, var(--blue-light) 100%);
  box-shadow: 0 6px 24px rgba(0, 48, 135, 0.38);
  transform: translateY(-2px);
}
.btn-primary:active { transform: translateY(0); }
```

### 3.5 Red CTA Button
```css
.btn-red {
  background: linear-gradient(135deg, var(--red-dark) 0%, var(--red) 100%);
  box-shadow: 0 4px 16px rgba(227, 24, 55, 0.28);
}
.btn-red:hover {
  box-shadow: 0 6px 24px rgba(227, 24, 55, 0.42);
}
```

### 3.6 Section Title Block
```css
/* Use this pattern for every new section heading */
.section-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--red);
  background: var(--red-pale);
  border: 1px solid rgba(227, 24, 55, 0.15);
  border-radius: 999px;
  padding: 4px 16px;
  display: inline-block;
  margin-bottom: 12px;
}
.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 800;
  color: var(--text);
  line-height: 1.1;
}
.section-accent-bar {
  width: 64px; height: 4px;
  background: linear-gradient(90deg, var(--blue), var(--red));
  border-radius: 2px;
  margin: 16px 0 32px;
}
```

### 3.7 Stat / KPI Card
```css
.kpi-card {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 24px 28px;
  box-shadow: var(--shadow);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--blue), var(--red));
}
.kpi-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  color: var(--blue);
  line-height: 1;
  display: block;
}
.kpi-label {
  font-size: 11px; font-weight: 600;
  letter-spacing: 1px; text-transform: uppercase;
  color: var(--text3); margin-top: 8px;
}
```

### 3.8 Data Table
```css
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead th {
  background: var(--bg2);
  font-size: 11px; font-weight: 700;
  letter-spacing: 1px; text-transform: uppercase;
  color: var(--text2);
  padding: 12px 16px;
  border-bottom: 2px solid var(--border);
  text-align: left;
}
.data-table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: var(--transition);
}
.data-table tbody tr:hover { background: var(--bg2); }
.data-table tbody td { padding: 14px 16px; font-size: 14px; color: var(--text); }
/* Rank #1 row special treatment */
.data-table tbody tr.rank-1 { background: var(--gold-bg); }
.data-table tbody tr.rank-1:hover { background: rgba(212, 168, 0, 0.18); }
```

### 3.9 Nav Bar (Glassmorphism)
```css
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1.5px solid var(--border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
```

### 3.10 Modal / Overlay
```css
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 30, 80, 0.42);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9000;
  animation: fadeIn 0.2s ease;
}
.modal-box {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 40px;
  max-width: 480px; width: 90%;
  box-shadow: 0 24px 80px rgba(0, 48, 135, 0.22);
  animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
```

---

## Step 4 — Animation Playbook

### 4.1 Entry Animations (Page Load)
Always stagger with delays. Use `animation-fill-mode: both` so elements
start hidden and end in final state.

```css
/* Standard entry — use for cards, sections, stats */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}

/* Stagger pattern */
.item:nth-child(1) { animation: fadeInUp 0.6s 0.0s ease both; }
.item:nth-child(2) { animation: fadeInUp 0.6s 0.1s ease both; }
.item:nth-child(3) { animation: fadeInUp 0.6s 0.2s ease both; }
/* max delay: 0.5s — beyond that, users feel lag */
```

### 4.2 Hover Micro-interactions
Every interactive element MUST have a hover state. Minimum bar:

| Element       | Hover effect                                   |
|---------------|------------------------------------------------|
| Card          | `translateY(-4px)` + deeper shadow             |
| Button        | `translateY(-2px)` + brighter gradient + glow  |
| Table row     | `background: var(--bg2)`                       |
| Nav link      | `color: var(--blue)` + `background: var(--bg2)`|
| Rank badge    | `scale(1.08)` transform                        |
| Logo / image  | `scale(1.07)` + stronger drop-shadow           |

### 4.3 Loading States
```css
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: var(--radius-sm);
}
```

### 4.4 Count-up Animation (For Stats / KPIs)
```javascript
function countUp(el, target, duration = 1400) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
    el.textContent = Math.floor(ease * target).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
```

### 4.5 Pulse Glow (Live / Real-time indicator)
```css
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 134, 90, 0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(0, 134, 90, 0); }
}
.live-dot {
  width: 8px; height: 8px;
  background: var(--green);
  border-radius: 50%;
  animation: pulseGlow 2s infinite;
}
```

### 4.6 Confetti / Celebration (Rank #1 reveal)
Reference `js/effects.js` for existing canvas confetti implementation.
Trigger with `triggerConfetti()` or `launchCelebration()` if exported.

---

## Step 5 — Responsiveness Rules

ALWAYS implement mobile breakpoints. Use this exact breakpoint set:

```css
/* Tablet */
@media (max-width: 768px) {
  /* stack grids to 1 col, reduce font sizes via clamp, 
     stack nav to hamburger or pill links */
}
/* Mobile */
@media (max-width: 480px) {
  /* full-width cards, smaller padding (16px), 
     hide secondary columns in tables */
}
```

Grid shorthand:
```css
/* Auto-fit cards — desktop 3-col, tablet 2-col, mobile 1-col */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
gap: 20px;
```

---

## Step 6 — Quality Gate (Acceptance Criteria)

Before marking any UI task complete, verify:

- [ ] All colors use `var(--token)` — zero hardcoded hex in new code.
- [ ] Entry animations present on new elements (fadeInUp / fadeInDown).
- [ ] Hover states on every interactive element.
- [ ] Mobile layout tested at 375px width — no horizontal scroll, no overflow.
- [ ] New HTML elements have unique, descriptive `id` attributes.
- [ ] No `var` declarations — only `const` / `let` in any JS.
- [ ] Inline `<style>` blocks kept minimal — new reusable styles go to `css/style.css`.
- [ ] `backdrop-filter` used on all floating panels / navbars (glassmorphism).
- [ ] Text remains readable — contrast ratio ≥ 4.5:1 on all backgrounds.
- [ ] Loading / empty states are handled (skeleton or placeholder text).

---

## Step 7 — "Wow Factor" Checklist

Use at least 3 of these on any major UI feature:

- [ ] **Gradient text** — hero titles, section headers.
- [ ] **Glass card with blur** — backdrop-filter panels.
- [ ] **Staggered entry animation** — sequential fadeInUp on list/grid items.
- [ ] **Count-up number** — KPI stats and leaderboard scores.
- [ ] **Brand gradient bar** — 4–6px top border on key cards.
- [ ] **Rank podium treatment** — gold/silver/bronze with scale + glow on top 3.
- [ ] **Shimmer skeleton** — while Supabase data loads.
- [ ] **Subtle parallax or scroll-triggered reveal** — via IntersectionObserver.
- [ ] **Pulse / live indicator** — green dot for real-time leaderboard.
- [ ] **Micro-bounce on CTA** — `cubic-bezier(0.34, 1.56, 0.64, 1)` spring easing.

---

## Anti-Patterns (NEVER DO)

| ❌ Bad                                              | ✅ Good                                          |
|-----------------------------------------------------|--------------------------------------------------|
| `color: #003087`                                    | `color: var(--blue)`                             |
| `border-radius: 8px` (hardcoded)                   | `border-radius: var(--radius-sm)`               |
| `transition: all 0.3s`                             | `transition: var(--transition)`                 |
| Plain white cards with no depth                    | `box-shadow: var(--shadow)` + subtle border     |
| Generic grey placeholder text                      | `color: var(--text3)` with proper opacity        |
| No loading state                                   | Skeleton shimmer while fetching                 |
| All-caps buttons with no hover effect              | Gradient button with `translateY(-2px)` hover   |
| Adding Google Fonts without asking                 | Use Inter + Space Grotesk already loaded        |
| Dark mode implementation                           | Light mode only unless explicitly requested     |
| New CSS file for a single component                | Add to `css/style.css` or `css/admin.css`       |
