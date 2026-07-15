# Component Patterns — Reliance Leaderboard

Production-ready component implementations. Copy, adapt, never re-invent from
scratch. Every pattern here has been validated against the brand guidelines.

---

## 1. Rank Podium (Top 3 — Trophy Layout)

```html
<div id="podium-section" class="podium-wrap">
  <!-- Rank 2 (left, shorter) -->
  <div id="podium-rank-2" class="podium-step podium-silver">
    <div class="podium-avatar">AB</div>
    <div class="podium-name">POC Name</div>
    <div class="podium-score">1,240 pts</div>
    <div class="podium-rank-badge silver">2</div>
    <div class="podium-block" style="height:100px"></div>
  </div>
  <!-- Rank 1 (center, tallest) -->
  <div id="podium-rank-1" class="podium-step podium-gold">
    <div class="podium-crown">👑</div>
    <div class="podium-avatar">NM</div>
    <div class="podium-name">POC Name</div>
    <div class="podium-score">1,890 pts</div>
    <div class="podium-rank-badge gold">1</div>
    <div class="podium-block" style="height:140px"></div>
  </div>
  <!-- Rank 3 (right, shortest) -->
  <div id="podium-rank-3" class="podium-step podium-bronze">
    <div class="podium-avatar">RK</div>
    <div class="podium-name">POC Name</div>
    <div class="podium-score">980 pts</div>
    <div class="podium-rank-badge bronze">3</div>
    <div class="podium-block" style="height:72px"></div>
  </div>
</div>
```

```css
.podium-wrap {
  display: flex; align-items: flex-end;
  justify-content: center; gap: 16px;
  padding: 40px 24px 0;
}
.podium-step { display: flex; flex-direction: column; align-items: center; }
.podium-avatar {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px; font-weight: 800; color: #fff;
  margin-bottom: 8px; position: relative;
}
.podium-gold   .podium-avatar { background: linear-gradient(135deg, var(--gold2), var(--gold)); box-shadow: 0 4px 20px var(--gold-bg); }
.podium-silver .podium-avatar { background: linear-gradient(135deg, #8C9CB8, var(--silver)); box-shadow: 0 4px 20px var(--silver-bg); }
.podium-bronze .podium-avatar { background: linear-gradient(135deg, #C67650, var(--bronze)); box-shadow: 0 4px 20px var(--bronze-bg); }
.podium-name  { font-size: 13px; font-weight: 700; color: var(--text); text-align: center; }
.podium-score { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 800; color: var(--blue); }
.podium-block {
  width: 120px; border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  margin-top: 8px;
}
.podium-gold   .podium-block { background: linear-gradient(180deg, var(--gold-bg), rgba(212,168,0,0.06)); border: 1.5px solid rgba(212,168,0,0.3); }
.podium-silver .podium-block { background: linear-gradient(180deg, var(--silver-bg), rgba(122,139,168,0.06)); border: 1.5px solid rgba(122,139,168,0.3); }
.podium-bronze .podium-block { background: linear-gradient(180deg, var(--bronze-bg), rgba(160,82,45,0.06)); border: 1.5px solid rgba(160,82,45,0.3); }
.podium-rank-badge {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 900; margin-top: 4px;
}
.podium-rank-badge.gold   { background: var(--gold);   color: #fff; box-shadow: 0 2px 10px var(--gold-bg); }
.podium-rank-badge.silver { background: var(--silver); color: #fff; }
.podium-rank-badge.bronze { background: var(--bronze); color: #fff; }
.podium-crown { font-size: 28px; margin-bottom: 4px; animation: bounce 2s infinite; }
```

---

## 2. Live Leaderboard Row

```html
<tr id="row-poc-{id}" class="lb-row rank-{n}">
  <td class="lb-rank">
    <span class="rank-badge rank-{n}">{n}</span>
  </td>
  <td class="lb-poc">
    <div class="lb-poc-inner">
      <div class="lb-avatar">{initials}</div>
      <div>
        <div class="lb-poc-name">{name}</div>
        <div class="lb-poc-college">{college}</div>
      </div>
    </div>
  </td>
  <td class="lb-score">{score}</td>
  <td class="lb-change positive">▲ 2</td>
</tr>
```

```css
.lb-row { transition: var(--transition); cursor: pointer; }
.lb-row:hover { background: var(--bg2); }
.lb-row.rank-1 { background: var(--gold-bg); }
.lb-row.rank-2 { background: var(--silver-bg); }
.lb-row.rank-3 { background: var(--bronze-bg); }
.rank-badge {
  width: 32px; height: 32px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 800;
}
.rank-badge.rank-1 { background: var(--gold);   color: #fff; box-shadow: 0 2px 12px var(--gold-bg); }
.rank-badge.rank-2 { background: var(--silver); color: #fff; }
.rank-badge.rank-3 { background: var(--bronze); color: #fff; }
.rank-badge:not(.rank-1):not(.rank-2):not(.rank-3) { background: var(--bg3); color: var(--text2); }
.lb-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--blue), var(--red));
  color: #fff; font-size: 13px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.lb-poc-inner { display: flex; align-items: center; gap: 10px; }
.lb-poc-name  { font-size: 14px; font-weight: 600; color: var(--text); }
.lb-poc-college { font-size: 11px; color: var(--text3); }
.lb-change.positive { color: var(--green); font-size: 12px; font-weight: 700; }
.lb-change.negative { color: var(--red);   font-size: 12px; font-weight: 700; }
```

---

## 3. OTP / Auth Input

```html
<div id="otp-input-group" class="otp-group">
  <input id="otp-d1" class="otp-digit" type="text" maxlength="1" inputmode="numeric">
  <input id="otp-d2" class="otp-digit" type="text" maxlength="1" inputmode="numeric">
  <input id="otp-d3" class="otp-digit" type="text" maxlength="1" inputmode="numeric">
  <input id="otp-d4" class="otp-digit" type="text" maxlength="1" inputmode="numeric">
  <input id="otp-d5" class="otp-digit" type="text" maxlength="1" inputmode="numeric">
  <input id="otp-d6" class="otp-digit" type="text" maxlength="1" inputmode="numeric">
</div>
```

```css
.otp-group { display: flex; gap: 10px; justify-content: center; }
.otp-digit {
  width: 52px; height: 60px;
  text-align: center; font-size: 24px; font-weight: 800;
  font-family: 'Space Grotesk', sans-serif; color: var(--blue);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm); background: var(--bg);
  outline: none; transition: var(--transition);
  caret-color: var(--red);
}
.otp-digit:focus {
  border-color: var(--blue-mid);
  box-shadow: 0 0 0 4px rgba(0, 48, 135, 0.12);
  background: var(--blue-pale);
}
.otp-digit.filled { border-color: var(--blue); }
.otp-digit.error  { border-color: var(--red); box-shadow: 0 0 0 4px rgba(227,24,55,0.12); }
```

---

## 4. Toast Notification

```javascript
function showToast(message, type = 'info', duration = 4000) {
  const colors = {
    success: { bg: '#00865A', icon: '✓' },
    error:   { bg: 'var(--red)',  icon: '✕' },
    info:    { bg: 'var(--blue)', icon: 'ℹ' },
    warn:    { bg: 'var(--gold)', icon: '⚠' },
  };
  const c = colors[type] || colors.info;
  const toast = document.createElement('div');
  toast.id = `toast-${Date.now()}`;
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    display:flex; align-items:center; gap:10px;
    padding:14px 20px; border-radius:12px;
    background:${c.bg}; color:#fff;
    font-size:14px; font-weight:600;
    box-shadow:0 8px 32px rgba(0,0,0,0.18);
    animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    max-width: 320px;
  `;
  toast.innerHTML = `<span style="font-size:18px">${c.icon}</span>${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
```

---

## 5. Stat Counter Card (with count-up)

```html
<div id="stat-card-{metric}" class="kpi-card" data-target="{number}">
  <div class="kpi-icon">🏆</div>
  <span id="kpi-val-{metric}" class="kpi-value">0</span>
  <span class="kpi-label">Total Points</span>
</div>
```

```javascript
// Run after DOM ready, when data is loaded
document.querySelectorAll('.kpi-card[data-target]').forEach(card => {
  const el = card.querySelector('.kpi-value');
  const target = parseInt(card.dataset.target, 10);
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / 1400, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.floor(ease * target).toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
});
```

---

## 6. Skeleton Loader

```html
<div id="skeleton-leaderboard" class="skeleton-list">
  <div class="skeleton-row">
    <div class="skeleton" style="width:32px;height:32px;border-radius:50%"></div>
    <div class="skeleton" style="width:36px;height:36px;border-radius:50%"></div>
    <div style="flex:1">
      <div class="skeleton" style="width:60%;height:14px;margin-bottom:6px"></div>
      <div class="skeleton" style="width:40%;height:11px"></div>
    </div>
    <div class="skeleton" style="width:64px;height:20px"></div>
  </div>
  <!-- Repeat 5× -->
</div>
```

```css
.skeleton-row { display:flex; align-items:center; gap:12px; padding:12px 16px; }
.skeleton {
  background: linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: var(--radius-sm);
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
```

---

## 7. Score / Progress Bar

```html
<div id="progress-{id}" class="score-bar-wrap">
  <div class="score-bar" style="--pct: {percentage}%">
    <div class="score-bar-fill"></div>
  </div>
  <span class="score-bar-label">{percentage}%</span>
</div>
```

```css
.score-bar-wrap { display:flex; align-items:center; gap:10px; }
.score-bar {
  flex:1; height: 8px;
  background: var(--bg3);
  border-radius: 999px; overflow:hidden;
}
.score-bar-fill {
  height:100%; width: var(--pct, 0%);
  background: linear-gradient(90deg, var(--blue), var(--red));
  border-radius: 999px;
  transition: width 1s cubic-bezier(0.4,0,0.2,1);
  animation: barGrow 1s cubic-bezier(0.4,0,0.2,1) both;
}
@keyframes barGrow { from { width: 0; } }
.score-bar-label { font-size:12px; font-weight:700; color:var(--text2); white-space:nowrap; }
```

---

## 8. Empty State

```html
<div id="empty-state-{section}" class="empty-state">
  <div class="empty-state-icon">📊</div>
  <div class="empty-state-title">No data yet</div>
  <div class="empty-state-sub">Scores will appear once POCs submit results.</div>
</div>
```

```css
.empty-state {
  text-align:center; padding: 64px 24px;
  animation: fadeInUp 0.6s ease both;
}
.empty-state-icon { font-size:56px; margin-bottom:16px; opacity:0.7; }
.empty-state-title {
  font-family:'Space Grotesk',sans-serif; font-size:20px; font-weight:700;
  color:var(--text); margin-bottom:8px;
}
.empty-state-sub { font-size:14px; color:var(--text3); }
```
