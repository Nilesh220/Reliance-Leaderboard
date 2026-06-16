/**
 * Bootup India — POC Task Dashboard Logic
 * Loads tasks from Supabase, handles submissions + Cloudinary uploads
 */

const TASK_TYPE_META = {
  story_screenshot: { label: 'Story Screenshot', icon: '📸' },
  store_visit:      { label: 'Store Visit',       icon: '🏪' },
  reel_link:        { label: 'Reel Link',          icon: '🎬' },
};

let session = null;
let allTasks = [];
let mySubmissions = [];

async function initDashboard() {
  session = getSession();
  if (!session) return;

  // Populate welcome strip
  document.getElementById('welcome-name').textContent   = `Welcome back, ${session.poc_name} 👋`;
  document.getElementById('welcome-detail').textContent = `${session.city || ''} ${session.college || ''}`.trim() || 'Bootup India POC';

  // Fetch latest points from DB
  if (session.poc_id) {
    const { data: poc } = await db.from('pocs').select('points').eq('id', session.poc_id).single();
    if (poc) document.getElementById('welcome-pts').textContent = poc.points || 0;
  } else {
    document.getElementById('welcome-pts').textContent = session.points || 0;
  }

  await Promise.all([loadTasks(), loadSubmissions()]);
}

async function loadTasks() {
  const { data: tasks, error } = await db
    .from('tasks')
    .select('*')
    .eq('is_live', true)
    .order('created_at', { ascending: false });

  if (error || !tasks) {
    document.getElementById('tasks-grid').innerHTML = '<div class="empty-state"><div class="em-icon">⚠️</div>Could not load tasks.</div>';
    return;
  }

  allTasks = tasks;
  renderTasks();
}

async function loadSubmissions() {
  if (!session.poc_id) {
    document.getElementById('history-list').innerHTML = '<div class="empty-state"><div class="em-icon">ℹ️</div>Submissions not available — POC not linked to account.</div>';
    return;
  }

  const { data: subs } = await db
    .from('task_submissions')
    .select('*, tasks(title, task_type, points)')
    .eq('poc_id', session.poc_id)
    .order('submitted_at', { ascending: false });

  mySubmissions = subs || [];
  renderHistory();
}

function renderTasks() {
  const grid = document.getElementById('tasks-grid');
  const now  = new Date();

  // Filter out expired tasks
  const liveTasks = allTasks.filter(t => !t.deadline || new Date(t.deadline) > now);

  if (!liveTasks.length) {
    grid.innerHTML = '<div class="empty-state"><div class="em-icon">🎉</div>No active tasks right now. Check back soon!</div>';
    return;
  }

  grid.innerHTML = liveTasks.map(task => {
    const meta       = TASK_TYPE_META[task.task_type] || { label: task.task_type, icon: '📌' };
    const deadline   = task.deadline ? new Date(task.deadline) : null;
    const isUrgent   = deadline && (deadline - now) < 24 * 60 * 60 * 1000;
    const deadlineStr = deadline
      ? `${isUrgent ? '⚠️' : '⏰'} Due: ${deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
      : '🟢 No deadline';

    // Check if already submitted
    const existing = mySubmissions.find(s => s.task_id === task.id);
    const submittedBlock = existing
      ? `<div class="submitted-badge ${existing.status}">${statusIcon(existing.status)} ${statusLabel(existing.status)}${existing.admin_note ? ` — "${existing.admin_note}"` : ''}</div>`
      : buildSubmitForm(task);

    return `
      <div class="task-card" id="task-card-${task.id}">
        <div class="task-card-top">
          <div class="task-card-title">${task.title}</div>
          <div class="task-card-pts">+${task.points} pts</div>
        </div>
        <div class="task-card-desc">${task.description || ''}</div>
        <div class="task-card-meta">
          <span class="task-meta-type">${meta.icon} ${meta.label}</span>
          <span class="task-meta-deadline ${isUrgent ? 'deadline-warning' : ''}">${deadlineStr}</span>
        </div>
        <div class="task-form">
          ${submittedBlock}
        </div>
      </div>
    `;
  }).join('');

  // Attach drag-and-drop to file areas
  grid.querySelectorAll('.file-upload-area').forEach(area => {
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragging'); });
    area.addEventListener('dragleave', () => area.classList.remove('dragging'));
    area.addEventListener('drop', e => {
      e.preventDefault(); area.classList.remove('dragging');
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelected(area.dataset.taskId, file);
    });
    area.querySelector('input[type="file"]').addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) handleFileSelected(area.dataset.taskId, file);
    });
  });
}

function buildSubmitForm(task) {
  const type = task.task_type;
  let mediaField = '';

  if (type === 'story_screenshot' || type === 'store_visit') {
    const geoNote = type === 'store_visit'
      ? '<div class="geo-note">📍 Geo-tagged photo of store visitor required. Make sure location is visible in the photo.</div>'
      : '';
    mediaField = `
      ${geoNote}
      <div class="form-group">
        <label>${type === 'store_visit' ? 'Store Visit Photo (Geo-tagged)' : 'Story Screenshot'}</label>
        <div class="file-upload-area" data-task-id="${task.id}">
          <input type="file" accept="image/*" />
          <div class="file-upload-icon">📁</div>
          <div class="file-upload-text">Drag & drop or <strong>click to upload</strong></div>
          <div class="file-preview" id="preview-${task.id}"></div>
        </div>
      </div>
    `;
  }

  const reelField = type === 'reel_link' ? `
    <div class="form-group">
      <label>Reel Link (Instagram / YouTube)</label>
      <input type="url" id="reel-${task.id}" placeholder="https://www.instagram.com/reel/..." />
    </div>
  ` : '';

  const notesField = `
    <div class="form-group">
      <label>Notes (optional)</label>
      <textarea id="notes-${task.id}" rows="2" placeholder="Any additional context..."></textarea>
    </div>
  `;

  return `
    ${mediaField}
    ${reelField}
    ${notesField}
    <button class="btn-submit" id="btn-${task.id}" onclick="submitTask(${task.id}, '${type}')">
      Submit Task →
    </button>
    <div id="submit-msg-${task.id}" style="font-size:13px;margin-top:8px;"></div>
  `;
}

function handleFileSelected(taskId, file) {
  const preview = document.getElementById(`preview-${taskId}`);
  if (!preview) return;
  const reader = new FileReader();
  reader.onload = e => {
    preview.style.display = 'block';
    preview.innerHTML = `<img src="${e.target.result}" alt="Preview"><div class="fname">${file.name}</div>`;
  };
  reader.readAsDataURL(file);

  // Store file reference
  preview.dataset.file = 'selected';
  preview._file = file;
}

async function submitTask(taskId, taskType) {
  if (!session?.poc_id) {
    alert('Your account is not linked to a POC. Please contact admin.');
    return;
  }

  const btn = document.getElementById(`btn-${taskId}`);
  const msg = document.getElementById(`submit-msg-${taskId}`);
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Submitting...';
  msg.textContent = '';

  try {
    let mediaUrl  = null;
    let reelLink  = null;
    const notes   = document.getElementById(`notes-${taskId}`)?.value.trim() || '';

    // Handle file upload
    if (taskType === 'story_screenshot' || taskType === 'store_visit') {
      const preview = document.getElementById(`preview-${taskId}`);
      const fileInput = document.querySelector(`[data-task-id="${taskId}"] input[type="file"]`);
      const file = fileInput?.files[0] || preview?._file;

      if (!file) {
        msg.innerHTML = '<span style="color:var(--red)">Please select a photo to upload.</span>';
        btn.disabled = false; btn.innerHTML = 'Submit Task →'; return;
      }

      // Upload via serverless function
      const form = new FormData();
      form.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
      mediaUrl = uploadData.url;
    }

    // Handle reel link
    if (taskType === 'reel_link') {
      reelLink = document.getElementById(`reel-${taskId}`)?.value.trim();
      if (!reelLink) {
        msg.innerHTML = '<span style="color:var(--red)">Please enter your reel link.</span>';
        btn.disabled = false; btn.innerHTML = 'Submit Task →'; return;
      }
    }

    // Insert submission into Supabase
    const { error } = await db.from('task_submissions').insert({
      poc_id:    session.poc_id,
      task_id:   taskId,
      media_url: mediaUrl,
      reel_link: reelLink,
      notes:     notes,
      status:    'pending',
    });

    if (error) throw new Error(error.message);

    // Update UI
    const card = document.getElementById(`task-card-${taskId}`);
    card.querySelector('.task-form').innerHTML = `<div class="submitted-badge pending">⏳ Submitted — Pending Review</div>`;
    mySubmissions.push({ task_id: taskId, status: 'pending' });
    renderHistory();

  } catch (err) {
    msg.innerHTML = `<span style="color:var(--red)">Error: ${err.message}</span>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Submit Task →';
  }
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (!mySubmissions.length) {
    list.innerHTML = '<div class="empty-state"><div class="em-icon">📭</div>No submissions yet. Complete your first task above!</div>';
    return;
  }

  list.innerHTML = mySubmissions.map(s => {
    const task     = s.tasks || allTasks.find(t => t.id === s.task_id);
    const title    = task?.title || `Task #${s.task_id}`;
    const pts      = task?.points || '?';
    const dateStr  = new Date(s.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const hasMedia = s.media_url ? `<a href="${s.media_url}" target="_blank" style="font-size:12px;color:var(--blue);font-weight:600;">View Photo ↗</a>` : '';
    const hasReel  = s.reel_link ? `<a href="${s.reel_link}" target="_blank" style="font-size:12px;color:var(--blue);font-weight:600;">View Reel ↗</a>` : '';

    return `
      <div class="history-card">
        <div class="history-card-info">
          <div class="history-card-title">${title} <span style="font-size:12px;font-weight:400;color:var(--text3)">+${pts} pts</span></div>
          <div class="history-card-date">Submitted ${dateStr} ${hasMedia} ${hasReel}</div>
          ${s.admin_note ? `<div style="font-size:12px;color:var(--text2);margin-top:3px">Admin: "${s.admin_note}"</div>` : ''}
        </div>
        <div class="history-card-right">
          <div class="submitted-badge ${s.status}">${statusIcon(s.status)} ${statusLabel(s.status)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function statusIcon(status) {
  return { pending: '⏳', approved: '✅', rejected: '❌' }[status] || '❓';
}
function statusLabel(status) {
  return { pending: 'Pending Review', approved: 'Approved', rejected: 'Rejected' }[status] || status;
}

// Init
document.addEventListener('DOMContentLoaded', initDashboard);
