/**
 * Bootup India — Admin Portal Logic (Supabase version)
 * Vigorlaunchpad × Reliance Digital
 */

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
  setupQuantityInput();
  await updatePublishButton();
  await updatePendingIndicator();
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
    return `
    <div class="poc-table-row" data-action="select" data-poc-id="${poc.id}">
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
    if (action === 'delete')   deletePOC(pocId, pocName);
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
  }
});

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

async function deletePOC(pocId, pocName) {
  const confirmed = confirm(`Are you sure you want to delete POC "${pocName}" (${pocId})?\nThis will permanently remove them and all their submissions.`);
  if (!confirmed) return;

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
window.deletePOC = deletePOC;

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