/**
 * Bootup India — Public Leaderboard Logic (Supabase version)
 * Vigorlaunchpad × Reliance Digital
 */

/* ─────────────────────────────────────────────
   STATE
   ───────────────────────────────────────────── */
let currentCity = 'All';
let animatedValues = {};

/* ─────────────────────────────────────────────
   BOOTSTRAP
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await initializeData();
  initCanvas();
  await renderAll();
  startCountdown();
  startRealtimeSubscription(); // Live updates via Supabase Realtime
});

/* ─────────────────────────────────────────────
   PARTICLE CANVAS BACKGROUND
   ───────────────────────────────────────────── */
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
  const particles = Array.from({ length: 80 }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    r:  Math.random() * 1.5 + 0.3,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    a:  Math.random() * 0.4 + 0.1,
  }));
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 48, 135, ${p.a * 0.18})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ─────────────────────────────────────────────
   RENDER ALL
   ───────────────────────────────────────────── */
async function renderAll() {
  const data = await getLiveData();
  renderStats(data);
  renderCityTabs(data);
  renderPodium(data);
  renderRankings(data);
  renderCityBoard(data);
  renderPointsReference();
  await renderLastUpdated();
}

/* ─────────────────────────────────────────────
   HERO STATS
   ───────────────────────────────────────────── */
function renderStats(data) {
  const stats     = getCampaignStats(data);
  const colleges  = [...new Set(data.map(p => p.college))].length;
  animateCount('stat-total-pts',   stats.totalPoints);
  animateCount('stat-active-pocs', stats.activePocs);
  animateCount('stat-total-pocs',  stats.totalPocs);
  animateCount('stat-colleges',    colleges);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start    = animatedValues[id] || 0;
  const duration = 1200;
  const startTime = performance.now();
  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(start + (target - start) * eased);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else animatedValues[id] = target;
  }
  requestAnimationFrame(tick);
}

/* ─────────────────────────────────────────────
   CITY TABS
   ───────────────────────────────────────────── */
function renderCityTabs(data) {
  const container = document.getElementById('city-tabs');
  if (!container) return;
  const cities = ['All', 'Mumbai', 'Pune', 'Aurangabad'];
  const counts = {
    All: data.length,
    Mumbai: data.filter(p => p.city === 'Mumbai').length,
    Pune: data.filter(p => p.city === 'Pune').length,
    Aurangabad: data.filter(p => p.city === 'Aurangabad').length,
  };
  const icons = { All: '🌐', Mumbai: '🏙️', Pune: '🌸', Aurangabad: '🕌' };
  container.innerHTML = cities.map(city => `
    <button class="city-tab ${currentCity === city ? 'active' : ''}" onclick="switchCity('${city}')">
      ${icons[city]} ${city}
      <span class="count-pill">${counts[city]}</span>
    </button>`
  ).join('');
}

async function switchCity(city) {
  currentCity = city;
  const data = await getLiveData();
  renderCityTabs(data);
  renderPodium(data);
  renderRankings(data);
  renderCityBoard(data);
}

/* ─────────────────────────────────────────────
   FILTER BY CITY
   ───────────────────────────────────────────── */
function filterData(data) {
  if (currentCity === 'All') return data;
  return data.filter(p => p.city === currentCity);
}

/* ─────────────────────────────────────────────
   PODIUM (TOP 3)
   ───────────────────────────────────────────── */
function renderPodium(data) {
  const container = document.getElementById('podium');
  if (!container) return;
  const filtered = filterData(data).sort((a, b) => b.points - a.points);
  const top3     = filtered.slice(0, 3);
  if (top3.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🏆</div><div class="empty-title">No rankings yet</div><div class="empty-desc">Points will appear here after the first update</div></div>`;
    return;
  }
  // Visual order: 2nd, 1st, 3rd
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  container.innerHTML = order.map(poc => {
    const rank      = filtered.findIndex(p => p.id === poc.id) + 1;
    const rankLabel = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
    const initials  = poc.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    return `
      <div class="podium-card rank-${rank}">
        <div class="podium-rank-badge">${rankLabel}</div>
        <div class="podium-avatar">${initials}</div>
        <div class="podium-name">${poc.name}</div>
        <div class="podium-college">${poc.college}</div>
        <span class="podium-city-badge city-${poc.city.toLowerCase()}">${poc.city}</span>
        <div class="podium-points">${poc.points.toLocaleString()}</div>
        <div class="podium-pts-label">Points</div>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   RANKINGS TABLE
   ───────────────────────────────────────────── */
function renderRankings(data) {
  const container = document.getElementById('rankings-body');
  if (!container) return;
  const filtered  = filterData(data).sort((a, b) => b.points - a.points);
  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-title">No data yet</div><div class="empty-desc">Rankings will appear after points are published</div></div>`;
    return;
  }
  container.innerHTML = filtered.map((poc, idx) => {
    const rank      = idx + 1;
    const rankClass = rank === 1 ? 'gold-text' : rank === 2 ? 'silver-text' : rank === 3 ? 'bronze-text' : '';
    const rankDisplay = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
    const taskBadges  = getTaskBadges(poc);
    return `
      <div class="ranking-row ${rank <= 3 ? 'top-3' : ''}" style="animation-delay:${Math.min(idx * 0.04, 0.5)}s">
        <div class="rank-num ${rankClass}">${rankDisplay}</div>
        <div class="poc-info">
          <div class="poc-name">${poc.name}</div>
          <div class="poc-college">${poc.college}</div>
        </div>
        <div class="poc-city">
          <span class="city-tag city-${poc.city.toLowerCase()}">${poc.city}</span>
        </div>
        <div class="poc-tasks">${taskBadges}</div>
        <div class="poc-points">${poc.points.toLocaleString()}</div>
      </div>`;
  }).join('');
}

function getTaskBadges(poc) {
  const log = poc.task_log || [];
  if (log.length === 0) return '<span style="color:var(--text3);font-size:12px;">—</span>';
  const seen = new Set();
  return log
    .filter(t => { if (seen.has(t.taskIcon)) return false; seen.add(t.taskIcon); return true; })
    .map(t => `<span class="task-badge" data-tooltip="${t.taskName}">${t.taskIcon}</span>`)
    .join('');
}

/* ─────────────────────────────────────────────
   COLLEGE LEADERBOARD
   ───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   CITY RANKINGS (Computed from live data)
   ───────────────────────────────────────────── */
function renderCityBoard(data) {
  const container = document.getElementById('city-rankings-grid');
  if (!container) return;

  // Compute city statistics
  const cityStats = {
    Mumbai: { city: 'Mumbai', totalPoints: 0, pocCount: 0, icon: '🏙️' },
    Pune: { city: 'Pune', totalPoints: 0, pocCount: 0, icon: '🌸' },
    Aurangabad: { city: 'Aurangabad', totalPoints: 0, pocCount: 0, icon: '🕌' }
  };

  // Group POC points by city
  data.forEach(poc => {
    if (cityStats[poc.city]) {
      cityStats[poc.city].totalPoints += poc.points;
      cityStats[poc.city].pocCount++;
    }
  });

  // Calculate averages and convert to list
  const citiesList = Object.values(cityStats).map(c => {
    const avg = c.pocCount > 0 ? (c.totalPoints / c.pocCount) : 0;
    return {
      ...c,
      avgPoints: Math.round(avg * 10) / 10 // 1 decimal place
    };
  });

  // Sort by average points descending
  citiesList.sort((a, b) => b.avgPoints - a.avgPoints);

  const maxAvg = citiesList.length > 0 ? citiesList[0].avgPoints : 1;

  container.innerHTML = citiesList.map((col, idx) => {
    const rank      = idx + 1;
    const rankClass = rank === 1 ? 'gold-text' : rank === 2 ? 'silver-text' : rank === 3 ? 'bronze-text' : '';
    const rankDisp  = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
    const pct       = maxAvg > 0 ? (col.avgPoints / maxAvg) * 100 : 0;
    return `
      <div class="college-card" style="animation-delay:${idx * 0.05}s">
        <div class="college-rank ${rankClass}">${rankDisp}</div>
        <div class="college-info">
          <div class="college-name">${col.icon} ${col.city} City</div>
          <div class="college-meta">
            ${col.pocCount} Active POC${col.pocCount > 1 ? 's' : ''} &nbsp;·&nbsp; Total: ${col.totalPoints.toLocaleString()} pts
          </div>
          <div class="score-bar-wrap">
            <div class="score-bar" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="college-points" style="text-align:right">
          ${col.avgPoints.toLocaleString()}
          <div style="font-size:11px;color:var(--text3);font-family:Inter;font-weight:400">avg pts/poc</div>
        </div>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   POINTS REFERENCE
   ───────────────────────────────────────────── */
function renderPointsReference() {
  const container = document.getElementById('points-grid');
  if (!container) return;
  container.innerHTML = Object.values(TASKS).map(task => `
    <div class="point-item">
      <div class="point-icon">${task.icon}</div>
      <div class="point-text">
        <div class="point-name">${task.name}</div>
        <div class="point-category">${task.category}</div>
      </div>
      <div>
        <div class="point-value">${task.points}</div>
        <div class="point-unit">${task.unit}</div>
      </div>
    </div>`
  ).join('');
}

/* ─────────────────────────────────────────────
   LAST UPDATED
   ───────────────────────────────────────────── */
async function renderLastUpdated() {
  const el = document.getElementById('last-updated');
  if (!el) return;
  const ts = await getLastPublished();
  if (ts) {
    const d = new Date(ts);
    el.textContent = `Last updated: ${d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} at ${d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}`;
  } else {
    el.textContent = 'No updates published yet';
  }
}

/* ─────────────────────────────────────────────
   COUNTDOWN TO 8PM
   ───────────────────────────────────────────── */
function startCountdown() {
  const el = document.getElementById('countdown-time');
  if (!el) return;
  function update() {
    const now    = new Date();
    const target = new Date();
    target.setHours(20, 0, 0, 0);
    if (now >= target) target.setDate(target.getDate() + 1);
    const diff = target - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  update();
  setInterval(update, 1000);
}

/* ─────────────────────────────────────────────
   SUPABASE REALTIME — Auto-refresh on publish
   ───────────────────────────────────────────── */
function startRealtimeSubscription() {
  db.channel('leaderboard_live')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pocs' }, async () => {
      await renderAll();
      showRefreshBanner();
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'campaign_meta' }, async () => {
      await renderLastUpdated();
    })
    .subscribe();
}

function showRefreshBanner() {
  const banner = document.getElementById('refresh-banner');
  if (!banner) return;
  banner.classList.add('visible');
  setTimeout(() => banner.classList.remove('visible'), 4000);
}
