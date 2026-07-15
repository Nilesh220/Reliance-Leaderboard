# Animation Playbook — Reliance Leaderboard

Complete motion design reference. Every animation in this project MUST follow
these rules to maintain a consistent, premium feel.

---

## Core Philosophy

> **Motion has meaning.** Every animation should communicate state, hierarchy,
> or delight — not just decoration. Keep it fast, purposeful, and smooth.

| Principle       | Rule                                                  |
|-----------------|-------------------------------------------------------|
| Speed           | Entry animations: 500–700ms. Hover: 200–350ms max.    |
| Easing          | Always use `cubic-bezier`. Never linear.              |
| Stagger         | Max 50ms delay between siblings. Max total: 500ms.    |
| Performance     | Use `transform` + `opacity` only — never animate layout properties (width, height, padding). |
| Respect motion  | Wrap in `@media (prefers-reduced-motion: reduce)` guards for critical paths. |

---

## 1. Easing Curves

```css
/* Standard — most hovers and entries */
cubic-bezier(0.4, 0, 0.2, 1)    /* Material ease-in-out */

/* Spring / bounce — CTAs, rank reveals, celebration */
cubic-bezier(0.34, 1.56, 0.64, 1)  /* Overshoot spring */

/* Exit / decelerate */
cubic-bezier(0, 0, 0.2, 1)      /* Ease-out */

/* Enter / accelerate */
cubic-bezier(0.4, 0, 1, 1)      /* Ease-in */
```

---

## 2. Keyframe Library

Paste these into `css/style.css` if not already present. Check before adding.

```css
/* ── Entries ── */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── Scale ── */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}

/* ── Persistent ── */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0   rgba(0, 134, 90, 0.45); }
  50%       { box-shadow: 0 0 0 8px rgba(0, 134, 90, 0); }
}

@keyframes pulseBlue {
  0%, 100% { box-shadow: 0 0 0 0   rgba(0, 48, 135, 0.45); }
  50%       { box-shadow: 0 0 0 8px rgba(0, 48, 135, 0); }
}

@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

@keyframes barGrow {
  from { width: 0; }
}

@keyframes rankReveal {
  0%   { opacity: 0; transform: scale(0.5) rotate(-10deg); }
  60%  { transform: scale(1.15) rotate(3deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
```

---

## 3. Stagger Patterns

### Grid / Card Stagger (use for leaderboard cards, stat grids)
```css
/* CSS-only stagger — works for up to 8 items */
.cards-grid > *:nth-child(1) { animation: fadeInUp 0.6s 0.00s ease both; }
.cards-grid > *:nth-child(2) { animation: fadeInUp 0.6s 0.08s ease both; }
.cards-grid > *:nth-child(3) { animation: fadeInUp 0.6s 0.16s ease both; }
.cards-grid > *:nth-child(4) { animation: fadeInUp 0.6s 0.24s ease both; }
.cards-grid > *:nth-child(5) { animation: fadeInUp 0.6s 0.32s ease both; }
.cards-grid > *:nth-child(6) { animation: fadeInUp 0.6s 0.40s ease both; }
```

### JS-driven stagger (for dynamic lists — e.g., leaderboard rows)
```javascript
function staggerReveal(selector, delay = 60) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, i * delay);
  });
}
// Usage: staggerReveal('.lb-row', 50);
```

---

## 4. IntersectionObserver (Scroll-triggered Reveals)

Use for below-the-fold content — never run expensive animations on elements
the user hasn't scrolled to yet.

```javascript
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target); // fire once
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-on-scroll').forEach(el => {
  revealObserver.observe(el);
});
```

```css
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
.reveal-on-scroll.revealed {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 5. Hover Effect Reference

| Component        | CSS Rule                                                     |
|------------------|--------------------------------------------------------------|
| Standard card    | `transform: translateY(-4px); box-shadow: var(--shadow-blue);` |
| Primary button   | `transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,48,135,0.38);` |
| Red CTA button   | `transform: translateY(-2px); box-shadow: 0 8px 28px rgba(227,24,55,0.38);` |
| Table row        | `background: var(--bg2);`                                   |
| Nav link         | `background: var(--bg2); color: var(--blue);`               |
| Rank #1 card     | `transform: scale(1.03); box-shadow: 0 12px 48px rgba(212,168,0,0.25);` |
| Logo / image     | `transform: scale(1.07); filter: drop-shadow(...more);`     |
| Score pill       | `transform: scale(1.08);`                                   |
| Icon button      | `background: var(--surface2); transform: scale(1.1);`       |

---

## 6. Loading Spinner

```html
<div id="spinner-{context}" class="spinner" role="status" aria-label="Loading"></div>
```

```css
.spinner {
  width: 40px; height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
/* Small variant */
.spinner-sm { width: 20px; height: 20px; border-width: 2px; }
```

---

## 7. Rank Reveal Animation (Leaderboard update)

When a rank changes in real-time, highlight the moving row:

```javascript
function animateRankChange(rowEl, direction) {
  const color = direction === 'up' ? 'rgba(0,134,90,0.12)' : 'rgba(227,24,55,0.10)';
  rowEl.style.transition = 'background 0.4s ease, transform 0.4s ease';
  rowEl.style.background = color;
  rowEl.style.transform = direction === 'up' ? 'translateY(-3px)' : 'translateY(3px)';
  setTimeout(() => {
    rowEl.style.background = '';
    rowEl.style.transform = '';
  }, 1200);
}
```

---

## 8. Celebration / Rank #1 Reveal

Trigger after leaderboard data loads or when a podium is first revealed:

```javascript
// Reference js/effects.js for the existing canvas confetti.
// Call the exported function if available:
if (typeof triggerConfetti === 'function') triggerConfetti();

// Pair with rank badge reveal animation:
const topBadge = document.querySelector('.rank-badge.rank-1');
if (topBadge) {
  topBadge.style.animation = 'rankReveal 0.7s cubic-bezier(0.34,1.56,0.64,1) both';
}
```

---

## 9. Reduced Motion Guard

Always wrap decorative animations in this check for accessibility:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Performance Rules

| ✅ Do                              | ❌ Never                          |
|------------------------------------|-----------------------------------|
| Animate `transform` and `opacity`  | Animate `width`, `height`, `top`, `left`, `padding` |
| Use `will-change: transform` sparingly on elements that animate | Apply `will-change` to everything |
| Use `requestAnimationFrame` for JS animations | Use `setInterval` for frame updates |
| Use CSS `transition` for simple state changes | Use JS animation libs for simple hovers |
| Observe elements before animating  | Animate off-screen elements       |
