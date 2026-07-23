/**
 * Bootup India — Admin Portal Logic (Supabase version)
 * Vigorlaunchpad × Reliance Digital
 */

/* ─────────────────────────────────────────────
   GOOGLE SHEETS LIVE SYNC CONFIG
   ─────────────────────────────────────────────
   Steps to activate:
   1. Open your Google Sheet → Extensions → Apps Script
   2. Paste the code from /scratch/apps_script_sheet_sync.js
   3. Deploy as Web App (Execute as: Me, Access: Anyone)
   4. Copy the Web App URL and paste it into APPS_SCRIPT_URL below
   5. Set GOOGLE_SHEET_ID from your sheet's URL
   ───────────────────────────────────────────── */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz0QAm4qQgz_nm7pd77Yj3NcNf7LHDRd7_T-JZd9TG6dcZygZdoo42bTgurpOTiOShNCA/exec';
const GOOGLE_SHEET_ID = '1kcYifDMCqYBg3l4KegwLYULpCzFTnc6kD1NniDMP3dU';

/* ─────────────────────────────────────────────
   STATE
   ───────────────────────────────────────────── */
let selectedPOC    = null;
let selectedTask   = null;
let activeCategory = 'All';
let adminCurrentCity = 'All';

/* ─────────────────────────────────────────────
   PASSWORD AUTHENTICATION (Nilesh2202)
   ───────────────────────────────────────────── */
const ADMIN_PASSWORD = 'Nilesh2202';

function checkAuth() {
  if (localStorage.getItem('admin_authorized') === 'true') {
    document.body.classList.remove('unauthorized');
    return true;
  }
  document.body.classList.add('unauthorized');
  return false;
}

function handleLogin(event) {
  event.preventDefault();
  const passwordInput = document.getElementById('login-password');
  const errorEl = document.getElementById('login-error');
  
  if (passwordInput.value === ADMIN_PASSWORD) {
    localStorage.setItem('admin_authorized', 'true');
    document.body.classList.remove('unauthorized');
    errorEl.textContent = '';
    initializeAdminDashboard();
  } else {
    errorEl.textContent = '❌ Incorrect password. Please try again.';
    passwordInput.value = '';
    passwordInput.focus();
    
    // Shake animation effect
    const card = document.querySelector('.login-card');
    if (card) {
      card.style.animation = 'none';
      card.offsetHeight; // trigger reflow
      card.style.animation = 'shake 0.4s ease';
    }
  }
}

function handleLogout() {
  localStorage.removeItem('admin_authorized');
  window.location.reload();
}

// Bind to window so HTML inline attributes can call them
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;

/* ─────────────────────────────────────────────
   BOOTSTRAP
   ───────────────────────────────────────────── */
let isInitialized = false;

async function initializeAdminDashboard() {
  if (isInitialized) return;
  isInitialized = true;
  
  await initializeData();
  await renderAdminStats();
  renderCategoryTabs();
  renderTaskOptions();
  await renderPendingQueue();
  await renderHistory();
  await renderPOCTable();
  await renderRegistrationsTab();
  setupQuantityInput();
  await updatePublishButton();
  await updatePendingIndicator();
  await renderStorySubmissionsSection();
}

document.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) {
    initializeAdminDashboard();
  } else {
    setTimeout(() => {
      const pwInput = document.getElementById('login-password');
      if (pwInput) pwInput.focus();
    }, 100);
  }
});

/* ─────────────────────────────────────────────
   ADMIN STATS OVERVIEW
   ───────────────────────────────────────────── */
async function renderAdminStats() {
  const data  = await getLiveData();
  const queue = await getPendingQueue();
  const stats = getCampaignStats(data);

  setEl('admin-stat-total-pts',   stats.totalPoints.toLocaleString());
  setEl('admin-stat-active-pocs', stats.activePocs);
  setEl('admin-stat-total-pocs',  stats.totalPocs);
  setEl('admin-stat-pending',     queue.length);
}

/* ─────────────────────────────────────────────
   POC SEARCH
   ───────────────────────────────────────────── */
const searchInput   = document.getElementById('poc-search');
const searchResults = document.getElementById('search-results');

if (searchInput) {
  searchInput.addEventListener('input', debounce(handleSearch, 250));
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) handleSearch();
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#search-wrap')) hideSearchResults();
  });
}

async function handleSearch() {
  const q = searchInput.value.trim();
  if (q.length < 1) { hideSearchResults(); return; }

  // Search directly in Supabase
  const { data: matches, error } = await db
    .from('pocs')
    .select('*')
    .or(`name.ilike.%${q}%,college.ilike.%${q}%,city.ilike.%${q}%`)
    .limit(8);

  if (error || !matches) { hideSearchResults(); return; }

  if (matches.length === 0) {
    searchResults.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text3);font-size:13px;">No POC found for "${q}"</div>`;
  } else {
    searchResults.innerHTML = matches.map(poc => {
      const initials = poc.name.split(' ').map(n => n[0]).join('').slice(0, 2);
      return `
        <div class="search-result-item" onclick="selectPOC('${poc.id}')">
          <div class="search-result-avatar">${initials}</div>
          <div>
            <div class="search-result-name">${poc.name}</div>
            <div class="search-result-college">${poc.college}</div>
          </div>
          <span class="search-result-city city-tag city-${poc.city.toLowerCase()}">${poc.city}</span>
        </div>`;
    }).join('');
  }
  searchResults.classList.add('visible');
}

function hideSearchResults() {
  if (searchResults) searchResults.classList.remove('visible');
}

/* ─────────────────────────────────────────────
   SELECT POC
   ───────────────────────────────────────────── */
async function selectPOC(pocId) {
  const { data: poc, error } = await db.from('pocs').select('*').eq('id', pocId).single();
  if (error || !poc) return;
  selectedPOC = poc;

  hideSearchResults();
  if (searchInput) searchInput.value = '';

  const card     = document.getElementById('selected-poc-card');
  const avatar   = document.getElementById('sel-poc-avatar');
  const name     = document.getElementById('sel-poc-name');
  const college  = document.getElementById('sel-poc-college');
  const points   = document.getElementById('sel-poc-points');
  const cityBadge = document.getElementById('sel-poc-city');

  const initials = poc.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  if (avatar)    avatar.textContent   = initials;
  if (name)      name.textContent     = poc.name;
  if (college)   college.textContent  = poc.college;
  if (points)    points.innerHTML     = `${poc.points.toLocaleString()} <span>pts</span>`;
  if (cityBadge) { cityBadge.className = `city-tag city-${poc.city.toLowerCase()}`; cityBadge.textContent = poc.city; }
  if (card)      card.classList.add('visible');

  updatePointsPreview();
  showToast(`Selected: ${poc.name}`, 'info');
}

function clearSelection() {
  selectedPOC = null;
  const card = document.getElementById('selected-poc-card');
  if (card) card.classList.remove('visible');
  updatePointsPreview();
}

/* ─────────────────────────────────────────────
   TASK CATEGORIES & OPTIONS
   ───────────────────────────────────────────── */
function renderCategoryTabs() {
  const container = document.getElementById('category-tabs');
  if (!container) return;
  const categories = ['All', ...new Set(Object.values(TASKS).map(t => t.category))];
  container.innerHTML = categories.map(cat => `
    <button class="category-tab ${activeCategory === cat ? 'active' : ''}" onclick="switchCategory('${cat}')">
      ${cat}
    </button>`
  ).join('');
}

function switchCategory(cat) {
  activeCategory = cat;
  renderCategoryTabs();
  renderTaskOptions();
}

function renderTaskOptions() {
  const container = document.getElementById('tasks-grid');
  if (!container) return;
  const tasks = Object.values(TASKS).filter(t => activeCategory === 'All' || t.category === activeCategory);
  container.innerHTML = tasks.map(task => `
    <div class="task-option ${selectedTask?.id === task.id ? 'selected' : ''}" onclick="selectTask('${task.id}')">
      <div class="task-option-icon">${getTaskIcon(task.icon)}</div>
      <div>
        <div class="task-option-name">${task.name}</div>
        <div class="task-option-pts">${task.points}<span class="task-option-unit"> ${task.unit}</span></div>
      </div>
    </div>`
  ).join('');
}

function selectTask(taskId) {
  selectedTask = TASKS[taskId];
  renderTaskOptions();

  const qtyWrap  = document.getElementById('qty-wrap');
  const noteWrap = document.getElementById('note-wrap');
  if (qtyWrap)  qtyWrap.style.display  = selectedTask?.multiplier ? 'flex' : 'none';
  if (noteWrap) noteWrap.style.display  = selectedTask?.multiplier ? 'none' : 'block';

  const previewName = document.getElementById('preview-task-name');
  if (previewName) previewName.textContent = selectedTask?.name || 'Select a task above';

  updatePointsPreview();
}

/* ─────────────────────────────────────────────
   QUANTITY INPUT
   ───────────────────────────────────────────── */
function setupQuantityInput() {
  const qtyInput = document.getElementById('qty-input');
  if (qtyInput) qtyInput.addEventListener('input', updatePointsPreview);
}

function updatePointsPreview() {
  const el = document.getElementById('points-preview-value');
  if (!el) return;
  if (!selectedTask) { el.textContent = '— pts'; return; }
  const qty = selectedTask.multiplier ? (parseInt(document.getElementById('qty-input')?.value) || 1) : 1;
  el.textContent = `+${selectedTask.points * qty} pts`;
}

/* ─────────────────────────────────────────────
   ADD TO PENDING QUEUE
   ───────────────────────────────────────────── */
async function addToQueue() {
  if (!selectedPOC) { showToast('Please select a POC first', 'error'); return; }
  if (!selectedTask) { showToast('Please select a task', 'error'); return; }

  const qty   = selectedTask.multiplier ? (parseInt(document.getElementById('qty-input')?.value) || 1) : 1;
  const noteA = document.getElementById('task-note')?.value?.trim() || '';
  const noteB = document.getElementById('task-note-single')?.value?.trim() || '';
  const note  = noteA || noteB;

  const entry = await addToPendingQueue(selectedPOC.id, selectedTask.id, qty, note);
  if (!entry) { showToast('Error adding task. Try again.', 'error'); return; }

  await renderPendingQueue();
  await updatePendingIndicator();
  await updatePublishButton();
  await renderAdminStats();

  // Clear notes
  ['task-note', 'task-note-single'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  showToast(`+${entry.points_earned} pts queued for ${selectedPOC.name}`, 'success');
}

/* ─────────────────────────────────────────────
   PENDING QUEUE
   ───────────────────────────────────────────── */
async function renderPendingQueue() {
  const container = document.getElementById('pending-queue');
  if (!container) return;

  const queue    = await getPendingQueue();
  const totalPts = queue.reduce((s, e) => s + e.points_earned, 0);
  setEl('queue-total-pts', totalPts > 0 ? `+${totalPts} pts pending` : '');

  if (queue.length === 0) {
    container.innerHTML = `<div class="queue-empty"><div class="queue-empty-icon">📋</div>No tasks queued yet. Add tasks above.</div>`;
    return;
  }

  container.innerHTML = queue.map(entry => `
    <div class="queue-item" id="qitem-${entry.id}">
      <div class="queue-item-icon">${getTaskIcon(entry.task_icon, 'sm')}</div>
      <div class="queue-item-info">
        <div class="queue-item-poc">${entry.poc_name}</div>
        <div class="queue-item-task">${entry.task_name}${entry.quantity > 1 ? ` × ${entry.quantity}` : ''}</div>
        ${entry.note ? `<div class="queue-item-note">${entry.note}</div>` : ''}
        <div style="font-size:11px;color:var(--text3);margin-top:3px">${entry.college} · ${entry.city}</div>
      </div>
      <div class="queue-item-points">+${entry.points_earned}</div>
      <button class="queue-item-remove" onclick="removeQueueItem('${entry.id}')" title="Remove">✕</button>
    </div>`
  ).join('');
}

async function removeQueueItem(id) {
  await removeFromPendingQueue(id);
  await renderPendingQueue();
  await updatePendingIndicator();
  await updatePublishButton();
  await renderAdminStats();
  showToast('Task removed from queue', 'info');
}

/* ─────────────────────────────────────────────
   PUBLISH
   ───────────────────────────────────────────── */
async function publishUpdate() {
  const queue = await getPendingQueue();
  if (queue.length === 0) { showToast('No tasks in queue to publish', 'error'); return; }

  const modal   = document.getElementById('publish-modal');
  const summary = document.getElementById('publish-summary');
  if (summary) {
    const totalPts   = queue.reduce((s, e) => s + e.points_earned, 0);
    const affectedPOCs = [...new Set(queue.map(e => e.poc_id))].length;
    summary.innerHTML = `
      <div style="margin-bottom:12px">You are about to publish <strong>${queue.length} task${queue.length > 1 ? 's' : ''}</strong> affecting <strong>${affectedPOCs} POC(s)</strong>.</div>
      <div style="color:var(--accent);font-size:18px;font-weight:700">+${totalPts} total points</div>
      <div style="color:var(--text3);font-size:13px;margin-top:8px">This will update the live leaderboard immediately.</div>`;
  }
  if (modal) modal.classList.add('visible');
}

async function confirmPublish() {
  closePublishModal();

  const btn = document.getElementById('publish-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Publishing…'; }

  const result = await publishPendingQueue();

  if (btn) { btn.textContent = '✅ Publish Update Now'; }

  await renderPendingQueue();
  await updatePendingIndicator();
  await updatePublishButton();
  await renderAdminStats();
  await renderHistory();
  await renderPOCTable();

  showToast(`✅ Published! ${result.published} tasks are now live`, 'success');
}

function closePublishModal() {
  const modal = document.getElementById('publish-modal');
  if (modal) modal.classList.remove('visible');
}

async function updatePublishButton() {
  const btn   = document.getElementById('publish-btn');
  const queue = await getPendingQueue();
  if (btn) btn.disabled = queue.length === 0;
}

/* ─────────────────────────────────────────────
   PENDING INDICATOR (header)
   ───────────────────────────────────────────── */
async function updatePendingIndicator() {
  const queue = await getPendingQueue();
  setEl('header-pending-count', `${queue.length} pending`);
  setEl('header-pending-badge', queue.length);
}

/* ─────────────────────────────────────────────
   HISTORY LOG
   ───────────────────────────────────────────── */
async function renderHistory() {
  const container = document.getElementById('history-log');
  if (!container) return;
  const log = await getAuditLog();
  if (log.length === 0) {
    container.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:16px 0">No history yet</div>`;
    return;
  }
  container.innerHTML = log.slice(0, 30).map(entry => {
    const d   = new Date(entry.published_at || entry.added_at);
    const pts = entry.points_earned >= 0 ? `+${entry.points_earned}` : entry.points_earned;
    return `
      <div class="history-item ${entry.status}">
        <div class="history-item-header">
          <span class="history-poc">${entry.task_icon ? getTaskIcon(entry.task_icon, 'xs') : ''} ${entry.poc_name}</span>
          <span class="history-pts">${pts} pts</span>
        </div>
        <div class="history-task">${entry.task_name}</div>
        <div class="history-time">${formatDateTime(d)}</div>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   POC TABLE
   ───────────────────────────────────────────── */
async function renderPOCTable() {
  const container = document.getElementById('poc-table-body');
  if (!container) return;

  let query = db.from('pocs').select('*').order('points', { ascending: false });
  if (adminCurrentCity !== 'All') query = query.eq('city', adminCurrentCity);
  const { data, error } = await query;
  if (error || !data) return;

  // Use data-* attributes to avoid ALL HTML quote-escaping bugs with POC names
  container.innerHTML = data.map(poc => {
    const safeName = (poc.name || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const regLink = `${window.location.origin}/register?poc=${poc.id}`;
    return `
    <div class="poc-table-row poc-table-row--ext" data-action="select" data-poc-id="${poc.id}">
      <div>
        <div class="poc-table-name">${poc.name}</div>
        <div class="poc-table-college">${poc.college}</div>
      </div>
      <div class="poc-table-city col-city">${poc.city}</div>
      <div class="poc-table-pts">${poc.points}</div>
      <div class="poc-table-actions" style="display:flex;gap:6px">
        <button class="action-btn" data-action="history" data-poc-id="${poc.id}" data-poc-name="${safeName}" title="Point history">📈</button>
        <button class="action-btn" data-action="override" data-poc-id="${poc.id}" title="Edit points">✏️</button>
        <button class="action-btn action-btn-delete" data-action="delete" data-poc-id="${poc.id}" data-poc-name="${safeName}" title="Remove POC">🗑️</button>
      </div>
      <div>
        <button class="action-btn action-btn-link" data-action="copylink"
          data-poc-id="${poc.id}" data-poc-name="${safeName}" data-reg-link="${regLink}"
          title="Get registration link">🔗 Link</button>
      </div>
    </div>`;
  }).join('');

  container.onclick = (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    e.stopPropagation();
    const action  = btn.dataset.action;
    const pocId   = btn.dataset.pocId;
    const pocName = btn.dataset.pocName || '';
    if (action === 'select')   selectPOC(pocId);
    if (action === 'history')  openPointHistory(pocId, pocName);
    if (action === 'override') openOverrideModal(pocId);
    if (action === 'delete')   openDeletePOCModal(pocId, pocName);
    if (action === 'copylink') openPOCLinkModal(pocId, pocName, btn.dataset.regLink);
  };
}

async function filterPOCTable(city) {
  adminCurrentCity = city;
  document.querySelectorAll('.poc-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.city === city);
  });
  await renderPOCTable();
}

/* ─────────────────────────────────────────────
   MANUAL OVERRIDE MODAL
   ───────────────────────────────────────────── */
async function openOverrideModal(pocId) {
  const { data: poc, error } = await db.from('pocs').select('*').eq('id', pocId).single();
  if (error || !poc) return;

  const modal     = document.getElementById('override-modal');
  const pocName   = document.getElementById('override-poc-name');
  const ptsInput  = document.getElementById('override-pts-input');
  const reasonEl  = document.getElementById('override-reason');
  const hiddenId  = document.getElementById('override-poc-id');

  if (pocName)  pocName.textContent = poc.name;
  if (ptsInput) ptsInput.value      = poc.points;
  if (reasonEl) reasonEl.value      = '';
  if (hiddenId) hiddenId.value      = poc.id;
  if (modal)    modal.classList.add('visible');
}

async function confirmOverride() {
  const pocId  = document.getElementById('override-poc-id')?.value;
  const newPts = parseInt(document.getElementById('override-pts-input')?.value);
  const reason = document.getElementById('override-reason')?.value?.trim() || 'Manual override';

  if (!pocId || isNaN(newPts)) { showToast('Invalid input', 'error'); return; }

  await overridePoints(pocId, newPts, reason);
  closeOverrideModal();
  await renderAdminStats();
  await renderPOCTable();
  await renderHistory();
  showToast(`Points updated to ${newPts} pts`, 'success');
}

function closeOverrideModal() {
  const modal = document.getElementById('override-modal');
  if (modal) modal.classList.remove('visible');
}

/* ─────────────────────────────────────────────
   TOAST NOTIFICATIONS
   ───────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

/* ─────────────────────────────────────────────
   UTILITIES
   ───────────────────────────────────────────── */
function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatDateTime(d) {
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) +
    ' at ' + d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
}

function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    closePublishModal();
    closeOverrideModal();
    closeAddPOCModal();
    closePointHistory();
    closeDeletePOCModal();
    closePOCLinkModal();
  }
});

/* ─────────────────────────────────────────────
   POC LINK MODAL
   ───────────────────────────────────────────── */
function openPOCLinkModal(pocId, pocName, regLink) {
  const modal    = document.getElementById('poc-link-modal');
  const nameEl   = document.getElementById('poc-link-poc-name');
  const urlInput = document.getElementById('poc-link-url');
  const copied   = document.getElementById('poc-link-copied');
  if (nameEl)   nameEl.textContent = `👤 ${decodeURIComponent(pocName)}`;
  if (urlInput) urlInput.value     = regLink;
  if (copied)   copied.style.display = 'none';
  if (modal)    modal.classList.add('visible');
}

function closePOCLinkModal() {
  const modal = document.getElementById('poc-link-modal');
  if (modal) modal.classList.remove('visible');
}

async function doCopyPOCLink() {
  const urlInput = document.getElementById('poc-link-url');
  const copied   = document.getElementById('poc-link-copied');
  try {
    await navigator.clipboard.writeText(urlInput.value);
    if (copied) { copied.style.display = 'block'; setTimeout(() => copied.style.display = 'none', 3000); }
    showToast('Link copied to clipboard!', 'success');
  } catch {
    urlInput.select();
    document.execCommand('copy');
    showToast('Link copied!', 'success');
  }
}

window.openPOCLinkModal  = openPOCLinkModal;
window.closePOCLinkModal = closePOCLinkModal;
window.doCopyPOCLink     = doCopyPOCLink;

/* ─────────────────────────────────────────────
   REGISTRATIONS TAB
   ───────────────────────────────────────────── */
let registrationsCurrentCity = 'All';
let allRegistrations = [];

async function renderRegistrationsTab() {
  /* Load KPI stats */
  const stats = await getRegistrationStats();
  const el = id => document.getElementById(id);
  if (el('reg-kpi-total'))      el('reg-kpi-total').textContent      = stats.total;
  if (el('reg-kpi-mumbai'))     el('reg-kpi-mumbai').textContent     = stats.cities['Mumbai']     || 0;
  if (el('reg-kpi-pune'))       el('reg-kpi-pune').textContent       = stats.cities['Pune']       || 0;
  if (el('reg-kpi-aurangabad')) el('reg-kpi-aurangabad').textContent = stats.cities['Aurangabad'] || 0;

  /* Load table */
  allRegistrations = await getRegistrations('All');
  renderRegistrationsTable(allRegistrations);
}

async function filterRegistrations(city) {
  registrationsCurrentCity = city;
  document.querySelectorAll('.reg-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.city === city);
  });
  const filtered = city === 'All'
    ? allRegistrations
    : await getRegistrations(city);
  renderRegistrationsTable(filtered);
}

function renderRegistrationsTable(rows) {
  const container = document.getElementById('reg-table-body');
  if (!container) return;

  if (!rows || rows.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:var(--text3)">
        <div style="font-size:32px;margin-bottom:10px">📝</div>
        <div style="font-size:14px">No registrations yet</div>
      </div>`;
    return;
  }

  container.innerHTML = rows.map(r => {
    const date = new Date(r.registered_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    const store = (r.preferred_store || '').replace('Reliance Digital — ', '');
    return `
      <div class="reg-table-row">
        <div>
          <div class="reg-row-name">${r.full_name}</div>
          <div class="reg-row-email">${r.email}</div>
          <div class="reg-row-riot">🎮 ${r.valorant_username}</div>
        </div>
        <div class="reg-row-mono">${r.mobile}</div>
        <div>
          <div class="reg-row-college">${r.college_name}</div>
          <div class="reg-row-city">${r.college_city}</div>
        </div>
        <div class="reg-row-store">${store}</div>
        <div><span class="rank-badge rank-${(r.current_rank || '').toLowerCase()}">${r.current_rank}</span></div>
        <div class="reg-row-poc">${r.poc_name}</div>
        <div class="reg-row-date">${date}</div>
      </div>`;
  }).join('');
}

/* CSV Export */
async function exportRegistrationsCSV() {
  const rows = allRegistrations.length ? allRegistrations : await getRegistrations('All');
  if (!rows.length) { showToast('No registrations to export', 'error'); return; }

  const headers = ['Full Name','Mobile','Email','College Name','College City','Preferred Store','Valorant Username','Current Rank','POC Name','POC ID','Registered At'];
  const csvRows = rows.map(r => [
    `"${(r.full_name      || '').replace(/"/g,'""')}"`,
    `"${(r.mobile         || '').replace(/"/g,'""')}"`,
    `"${(r.email          || '').replace(/"/g,'""')}"`,
    `"${(r.college_name   || '').replace(/"/g,'""')}"`,
    `"${(r.college_city   || '').replace(/"/g,'""')}"`,
    `"${(r.preferred_store|| '').replace(/"/g,'""')}"`,
    `"${(r.valorant_username||'').replace(/"/g,'""')}"`,
    `"${(r.current_rank   || '').replace(/"/g,'""')}"`,
    `"${(r.poc_name       || '').replace(/"/g,'""')}"`,
    `"${(r.poc_id         || '').replace(/"/g,'""')}"`,
    `"${new Date(r.registered_at).toLocaleString('en-IN')}"`,
  ].join(','));

  const csvContent = [headers.join(','), ...csvRows].join('\n');
  const blob       = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url        = URL.createObjectURL(blob);
  const a          = document.createElement('a');
  const timestamp  = new Date().toISOString().slice(0,10);
  a.href           = url;
  a.download       = `valorant_registrations_${timestamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`✅ Exported ${rows.length} registrations`, 'success');
}

window.renderRegistrationsTab   = renderRegistrationsTab;
window.filterRegistrations      = filterRegistrations;
window.exportRegistrationsCSV   = exportRegistrationsCSV;

/* ─────────────────────────────────────────────
   ADD / REMOVE POC MANAGEMENT
   ───────────────────────────────────────────── */
function openAddPOCModal() {
  const modal = document.getElementById('add-poc-modal');
  if (modal) modal.classList.add('visible');
}

function closeAddPOCModal() {
  const modal = document.getElementById('add-poc-modal');
  if (modal) modal.classList.remove('visible');
  // clear fields
  ['new-poc-name', 'new-poc-email', 'new-poc-college', 'new-poc-points'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = id === 'new-poc-points' ? '0' : '';
  });
}

async function confirmAddPOC() {
  const name = document.getElementById('new-poc-name')?.value?.trim();
  const email = document.getElementById('new-poc-email')?.value?.trim()?.toLowerCase();
  const college = document.getElementById('new-poc-college')?.value?.trim();
  const city = document.getElementById('new-poc-city')?.value;
  const points = parseInt(document.getElementById('new-poc-points')?.value || 0, 10);

  if (!name || !email || !college || !city) {
    showToast('All fields except points are required', 'error');
    return;
  }

  if (!email.includes('@')) {
    showToast('Invalid email address', 'error');
    return;
  }

  // Fetch existing POCs to calculate next sequential ID
  const { data: allPocs, error: fetchError } = await db.from('pocs').select('id');
  if (fetchError) {
    showToast('Error generating POC ID: ' + fetchError.message, 'error');
    return;
  }

  // Generate prefix and sequential number
  const prefix = city.substring(0, 3).toLowerCase();
  let maxSeq = 0;
  allPocs.forEach(poc => {
    if (poc.id.startsWith(prefix + '_')) {
      const numStr = poc.id.substring(prefix.length + 1);
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  const nextSeq = maxSeq + 1;
  const nextSeqStr = nextSeq < 10 ? '0' + nextSeq : '' + nextSeq;
  const newId = `${prefix}_${nextSeqStr}`;

  // Insert new POC row
  const newPoc = {
    id: newId,
    name,
    email,
    college,
    city,
    points,
    task_log: []
  };

  const { error: insertError } = await db.from('pocs').insert(newPoc);
  if (insertError) {
    showToast('Error adding POC: ' + insertError.message, 'error');
    return;
  }

  showToast(`Successfully added POC: ${name} (${newId})`, 'success');
  closeAddPOCModal();

  // Reload admin views
  await renderAdminStats();
  await renderPOCTable();
}

function openDeletePOCModal(pocId, pocName) {
  const modal = document.getElementById('delete-poc-modal');
  const nameEl = document.getElementById('delete-poc-name');
  const idInput = document.getElementById('delete-poc-id');
  if (nameEl) nameEl.textContent = pocName;
  if (idInput) idInput.value = pocId;
  if (modal) modal.classList.add('visible');
}

function closeDeletePOCModal() {
  const modal = document.getElementById('delete-poc-modal');
  if (modal) modal.classList.remove('visible');
}

async function confirmDeletePOC() {
  const pocId = document.getElementById('delete-poc-id')?.value;
  const pocName = document.getElementById('delete-poc-name')?.textContent;
  if (!pocId) return;

  closeDeletePOCModal();

  // Clean up any pending queue entries for this POC
  const { error: queueError } = await db.from('pending_queue').delete().eq('poc_id', pocId);
  if (queueError) {
    console.error('Error cleaning up pending queue for deleted POC:', queueError.message);
  }

  // Delete from pocs table
  const { error: deleteError } = await db.from('pocs').delete().eq('id', pocId);
  if (deleteError) {
    showToast('Error deleting POC: ' + deleteError.message, 'error');
    return;
  }

  showToast(`Successfully removed POC: ${pocName}`, 'success');

  // Reload admin views
  await renderAdminStats();
  await renderPOCTable();
}

// Bind to window
window.openAddPOCModal = openAddPOCModal;
window.closeAddPOCModal = closeAddPOCModal;
window.confirmAddPOC = confirmAddPOC;
window.openDeletePOCModal = openDeletePOCModal;
window.closeDeletePOCModal = closeDeletePOCModal;
window.confirmDeletePOC = confirmDeletePOC;

/* ─────────────────────────────────────────────
   POINT HISTORY MODAL
   ───────────────────────────────────────────── */
async function openPointHistory(pocId, pocName) {
  const modal   = document.getElementById('point-history-modal');
  const titleEl = document.getElementById('point-history-title');
  const summaryEl = document.getElementById('point-history-summary');
  const bodyEl  = document.getElementById('point-history-body');

  if (!modal) return;

  if (titleEl) titleEl.textContent = `${pocName} — Point History`;
  if (summaryEl) summaryEl.innerHTML = '';
  if (bodyEl) bodyEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text3)">Loading…</div>`;
  modal.classList.add('visible');

  // Fetch POC current data
  const { data: poc, error: pocErr } = await db.from('pocs').select('*').eq('id', pocId).single();

  // Fetch audit log entries for this POC
  const { data: log, error: logErr } = await db
    .from('audit_log')
    .select('*')
    .eq('poc_id', pocId)
    .order('published_at', { ascending: false })
    .limit(50);

  if (pocErr || logErr || !poc) {
    if (bodyEl) bodyEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--red)">Failed to load history.</div>`;
    return;
  }

  // Summary chips
  if (summaryEl) {
    const taskCount = log.length;
    const totalEarned = log.reduce((s, e) => s + (e.points_earned || 0), 0);
    summaryEl.innerHTML = `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:8px 14px;font-size:12px;color:var(--text2)">
        <span style="font-weight:700;color:var(--accent);font-size:16px">${poc.points.toLocaleString()}</span> current pts
      </div>
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:8px 14px;font-size:12px;color:var(--text2)">
        <span style="font-weight:700;font-size:15px">${taskCount}</span> tasks logged
      </div>
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:8px 14px;font-size:12px;color:var(--text2)">
        <span style="font-weight:700;color:var(--green);font-size:15px">+${totalEarned.toLocaleString()}</span> pts earned
      </div>
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:8px 14px;font-size:12px;color:var(--text2)">
        🏙️ ${poc.city} · ${poc.college}
      </div>`;
  }

  // Timeline entries
  if (!log || log.length === 0) {
    if (bodyEl) bodyEl.innerHTML = `
      <div style="text-align:center;padding:32px;color:var(--text3)">
        <div style="font-size:36px;margin-bottom:12px">📭</div>
        <div style="font-size:14px">No point history yet for this POC.</div>
      </div>`;
    return;
  }

  if (bodyEl) {
    // Group by date
    const grouped = {};
    log.forEach(entry => {
      const d = new Date(entry.published_at || entry.added_at);
      const dateKey = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(entry);
    });

    bodyEl.innerHTML = Object.entries(grouped).map(([date, entries]) => {
      const dayTotal = entries.reduce((s, e) => s + (e.points_earned || 0), 0);
      return `
        <div style="margin-bottom:4px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="flex:1;height:1px;background:var(--border)"></div>
            <div style="font-size:11px;font-weight:700;color:var(--text3);white-space:nowrap">${date}</div>
            <div style="font-size:11px;color:var(--accent);font-weight:700;white-space:nowrap">+${dayTotal} pts</div>
            <div style="flex:1;height:1px;background:var(--border)"></div>
          </div>
          ${entries.map(e => {
            const t    = new Date(e.published_at || e.added_at);
            const time = t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const pts  = e.points_earned >= 0 ? `+${e.points_earned}` : `${e.points_earned}`;
            const ptsColor = e.points_earned >= 0 ? 'var(--green)' : 'var(--red)';
            const icon = e.task_icon ? getTaskIcon(e.task_icon, 'xs') : '📌';
            return `
              <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg2);border-radius:10px;border:1px solid var(--border);margin-bottom:6px">
                <div style="flex-shrink:0">${icon}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.task_name}</div>
                  ${e.note ? `<div style="font-size:11px;color:var(--text3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">📝 ${e.note}</div>` : ''}
                  <div style="font-size:11px;color:var(--text3);margin-top:2px">⏰ ${time}</div>
                </div>
                <div style="font-size:15px;font-weight:800;color:${ptsColor};flex-shrink:0">${pts}</div>
              </div>`;
          }).join('')}
        </div>`;
    }).join('');
  }
}

function closePointHistory() {
  const modal = document.getElementById('point-history-modal');
  if (modal) modal.classList.remove('visible');
}

window.openPointHistory = openPointHistory;
window.closePointHistory = closePointHistory;

/* ─────────────────────────────────────────────
   STORY SUBMISSIONS SECTION
   ───────────────────────────────────────────── */
let allStorySubmissions  = [];
let storyCurrentFilter   = 'All';

async function renderStorySubmissionsSection() {
  const stats = await getStorySubmissionStats();
  const el = id => document.getElementById(id);

  /* KPI pills */
  if (el('ss-kpi-total'))   el('ss-kpi-total').textContent   = stats.total            || 0;
  if (el('ss-kpi-story'))   el('ss-kpi-story').textContent   = stats.story_submitted   || 0;
  if (el('ss-kpi-views'))   el('ss-kpi-views').textContent   = stats.views_submitted   || 0;
  if (el('ss-kpi-verified'))el('ss-kpi-verified').textContent= stats.verified          || 0;

  /* Table */
  allStorySubmissions = await getStorySubmissions('All');
  renderStoryTable(allStorySubmissions);
}

async function filterStorySubmissions(status) {
  storyCurrentFilter = status;
  document.querySelectorAll('.ss-filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.status === status);
  });
  const filtered = status === 'All'
    ? allStorySubmissions
    : allStorySubmissions.filter(r => r.status === status);
  renderStoryTable(filtered);
}

function renderStoryTable(rows) {
  const container = document.getElementById('ss-table-body');
  if (!container) return;

  if (!rows || rows.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:var(--text3)">
        <div style="font-size:32px;margin-bottom:10px">📭</div>
        <div style="font-size:14px">No story submissions yet</div>
      </div>`;
    return;
  }

  const statusBadge = s => {
    const map = {
      pending:         { label: 'Pending',         bg: '#f5f5f5',           color: 'var(--text3)',  border: '#eee' },
      story_submitted: { label: 'Story Done',       bg: 'var(--blue-pale)',  color: 'var(--blue)',   border: 'var(--border)' },
      views_submitted: { label: 'Views Done',       bg: 'var(--orange-pale)',color: 'var(--orange)', border: 'rgba(224,124,0,0.2)' },
      verified:        { label: '✅ Verified',       bg: 'var(--green-pale)', color: 'var(--green)',  border: 'rgba(0,134,90,0.2)' },
      rejected:        { label: '❌ Rejected',       bg: 'var(--red-pale)',   color: 'var(--red)',    border: 'rgba(227,24,55,0.2)' },
    };
    const c = map[s] || map.pending;
    return `<span style="font-size:10px;font-weight:700;letter-spacing:0.4px;padding:3px 10px;border-radius:99px;background:${c.bg};color:${c.color};border:1px solid ${c.border}">${c.label}</span>`;
  };

  container.innerHTML = rows.map(r => {
    const date       = new Date(r.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    const name       = r.full_name || '—';
    const initials   = name.split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase();
    const pocDisplay = r.referral_poc_name ? `<span style="font-size:11px;color:var(--blue);background:var(--blue-pale);border:1px solid var(--border);border-radius:99px;padding:2px 8px;font-weight:700;">👤 ${r.referral_poc_name}</span>` : `<span style="font-size:11px;color:var(--text3);">—</span>`;
    const storyThumb = r.story_url
      ? `<button onclick="previewImage('${r.story_url}','Story Screenshot')" style="background:none;border:none;cursor:pointer;padding:0;" title="View story"><img src="${r.story_url}" alt="Story" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1.5px solid var(--border);transition:var(--transition);" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform=''" /></button>`
      : `<span style="font-size:11px;color:var(--text3);">—</span>`;
    const viewsThumb = r.views_url
      ? `<button onclick="previewImage('${r.views_url}','Views Screenshot')" style="background:none;border:none;cursor:pointer;padding:0;" title="View screenshot"><img src="${r.views_url}" alt="Views" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1.5px solid var(--border);transition:var(--transition);" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform=''" /></button>`
      : `<span style="font-size:11px;color:var(--text3);">—</span>`;
    const viewsCount = r.views_count != null ? `<span style="font-size:13px;font-weight:700;color:var(--text)">👁️ ${r.views_count.toLocaleString()}</span>` : `<span style="font-size:11px;color:var(--text3);">—</span>`;

    const canVerify = r.status === 'views_submitted' || r.status === 'story_submitted';
    const canReject = r.status !== 'rejected';

    return `
      <div class="ss-table-row" id="ss-row-${r.id}">
        <div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--blue-mid));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0">${initials}</div>
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text)">${name}</div>
              <div style="font-size:11px;color:var(--text3)">${r.email}</div>
            </div>
          </div>
        </div>
        <div>${pocDisplay}</div>
        <div>${storyThumb}</div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start">${viewsThumb}${viewsCount}</div>
        <div>${statusBadge(r.status)}</div>
        <div style="font-size:11px;color:var(--text3);white-space:nowrap">${date}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${canVerify ? `<button onclick="verifyStory('${r.id}')" class="btn btn-primary" style="padding:5px 12px;font-size:11px;font-weight:700">✅ Verify</button>` : ''}
          ${canReject ? `<button onclick="rejectStory('${r.id}')" class="btn btn-ghost" style="padding:5px 12px;font-size:11px;font-weight:700;color:var(--red);border-color:rgba(227,24,55,0.3)">✕ Reject</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

async function verifyStory(id) {
  try {
    await updateStorySubmissionStatus(id, 'verified');
    const row = allStorySubmissions.find(r => r.id === id);
    if (row) row.status = 'verified';
    renderStoryTable(storyCurrentFilter === 'All' ? allStorySubmissions : allStorySubmissions.filter(r => r.status === storyCurrentFilter));
    await renderStorySubmissionsSection();
    showToast('✅ Story submission verified!', 'success');
  } catch (err) {
    showToast('Error verifying: ' + err.message, 'error');
  }
}

async function rejectStory(id) {
  try {
    await updateStorySubmissionStatus(id, 'rejected');
    const row = allStorySubmissions.find(r => r.id === id);
    if (row) row.status = 'rejected';
    renderStoryTable(storyCurrentFilter === 'All' ? allStorySubmissions : allStorySubmissions.filter(r => r.status === storyCurrentFilter));
    await renderStorySubmissionsSection();
    showToast('Story submission rejected.', 'error');
  } catch (err) {
    showToast('Error rejecting: ' + err.message, 'error');
  }
}

/* Image preview lightbox */
function previewImage(url, title) {
  let overlay = document.getElementById('ss-image-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'ss-image-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      background:rgba(0,20,60,0.85);
      backdrop-filter:blur(8px);
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
      cursor:pointer;animation:fadeIn 0.2s ease;
    `;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;text-transform:uppercase">${title}</div>
    <img src="${url}" alt="${title}"
         style="max-width:90vw;max-height:80vh;object-fit:contain;border-radius:12px;box-shadow:0 24px 80px rgba(0,0,0,0.5);" />
    <div style="font-size:12px;color:rgba(255,255,255,0.4)">Click anywhere to close</div>`;
  overlay.style.display = 'flex';
}

window.renderStorySubmissionsSection = renderStorySubmissionsSection;
window.filterStorySubmissions        = filterStorySubmissions;
window.verifyStory                   = verifyStory;
window.rejectStory                   = rejectStory;
window.previewImage                  = previewImage;

/* ─────────────────────────────────────────────
   GOOGLE SHEETS LIVE SYNC
   ───────────────────────────────────────────── */

/**
 * Update the "Open Sheet ↗" button href using GOOGLE_SHEET_ID.
 * Called once on init.
 */
function initSheetButton() {
  const btn = document.getElementById('open-sheet-btn');
  if (!btn) return;
  if (GOOGLE_SHEET_ID) {
    btn.href = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`;
  }
  // Show/hide sync strip based on whether Apps Script is configured
  const strip = document.getElementById('sheet-sync-strip');
  if (strip) strip.style.display = APPS_SCRIPT_URL ? 'flex' : 'none';
}

/**
 * Sync a SINGLE registration row to Google Sheets.
 * @param {Object} row - A registration record from Supabase
 */
async function syncRegistrationToSheet(row) {
  return syncBatchToSheet([row]);
}

/**
 * Sync ALL registrations in a SINGLE batch request — fast.
 * Called by the "↑ Sync All" button.
 */
async function syncAllToSheet() {
  if (!APPS_SCRIPT_URL) {
    showToast('⚠️ Apps Script URL not configured. See admin.js.', 'error');
    return;
  }

  const syncBtn = document.getElementById('sync-all-sheet-btn');
  if (syncBtn) { syncBtn.disabled = true; syncBtn.textContent = '⏳ Syncing…'; }

  try {
    /* Load all registrations from Supabase */
    const rows = (typeof allRegistrations !== 'undefined' && allRegistrations.length)
      ? allRegistrations
      : await getRegistrations('All');

    if (!rows || !rows.length) {
      showToast('No registrations to sync', 'error');
      return;
    }

    /* Send ONE batch request with all rows */
    const ok = await syncBatchToSheet(rows);

    if (ok) {
      updateSheetSyncStatus(rows.length);
      showToast(`✅ Batch synced ${rows.length} registrations to Google Sheet`, 'success');
    } else {
      showToast('❌ Batch sync failed. Check Apps Script logs.', 'error');
    }
  } catch (err) {
    console.error('[SheetSync] syncAllToSheet error:', err);
    showToast('❌ Sheet sync error. Check console.', 'error');
  } finally {
    if (syncBtn) { syncBtn.disabled = false; syncBtn.textContent = '↑ Sync All'; }
  }
}

/**
 * Core batch sender — sends an array of rows in ONE POST.
 * @param {Object[]} rows
 * @returns {Promise<boolean>}
 */
async function syncBatchToSheet(rows) {
  if (!APPS_SCRIPT_URL) return false;
  try {
    /* Map Supabase rows to the flat payload the Apps Script expects */
    const mapped = rows.map(row => ({
      full_name:         row.full_name         || '',
      mobile:            row.mobile            || '',
      email:             row.email             || '',
      college_name:      row.college_name      || '',
      college_city:      row.college_city      || '',
      preferred_store:   row.preferred_store   || '',
      valorant_username: row.valorant_username || '',
      current_rank:      row.current_rank      || '',
      poc_name:          row.poc_name          || '',
      registered_at:     row.registered_at
        ? new Date(row.registered_at).toLocaleString('en-IN')
        : '',
    }));

    /* URLSearchParams with no-cors (avoids CORS preflight) */
    const form = new URLSearchParams();
    form.set('data', JSON.stringify({ action: 'batch_append', rows: mapped }));

    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode:   'no-cors', // required — response will be opaque but request goes through
      body:   form,
    });

    return true; // no-cors hides response; absence of exception = success
  } catch (err) {
    console.error('[SheetSync] syncBatchToSheet error:', err);
    return false;
  }
}

/**
 * Update the last-sync timestamp shown in the strip.
 * @param {number} [count] - number of rows synced (optional display)
 */
function updateSheetSyncStatus(count) {
  const el = document.getElementById('sheet-last-sync');
  if (!el) return;
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  el.textContent = count !== undefined
    ? `Last synced ${count} rows at ${now}`
    : `Last synced at ${now}`;
}

window.syncAllToSheet           = syncAllToSheet;
window.syncRegistrationToSheet  = syncRegistrationToSheet;
window.initSheetButton          = initSheetButton;

/* ── Wire initSheetButton into the dashboard bootstrap ── */
const _origInit = initializeAdminDashboard;
initializeAdminDashboard = async function () {
  await _origInit();
  initSheetButton();
};