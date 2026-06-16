
/* ═══════════════════════════════════════════════════
   TASK MANAGEMENT — Create / Toggle / Delete Tasks
   ═══════════════════════════════════════════════════ */

const TASK_TYPE_LABELS = {
  story_screenshot: 'Story Screenshot',
  store_visit:      'Store Visit',
  reel_link:        'Reel Link',
};

function toggleCreateTaskForm() {
  const form = document.getElementById('create-task-form');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}
window.toggleCreateTaskForm = toggleCreateTaskForm;

async function createTask() {
  const title      = document.getElementById('ntask-title') ? document.getElementById('ntask-title').value.trim() : '';
  const type       = document.getElementById('ntask-type')  ? document.getElementById('ntask-type').value : 'story_screenshot';
  const desc       = document.getElementById('ntask-desc')  ? document.getElementById('ntask-desc').value.trim() : '';
  const pts        = parseInt(document.getElementById('ntask-pts') ? document.getElementById('ntask-pts').value : '50') || 50;
  const deadlineEl = document.getElementById('ntask-deadline');
  const deadline   = deadlineEl ? deadlineEl.value : '';
  const liveEl     = document.getElementById('ntask-live');
  const isLive     = liveEl ? liveEl.checked : false;
  const penaltyEl  = document.getElementById('ntask-late-penalty');
  const latePenalty = penaltyEl ? penaltyEl.checked : false;
  const msg        = document.getElementById('create-task-msg');

  if (!title) {
    if (msg) msg.innerHTML = '<span style="color:var(--red)">Please enter a task title.</span>';
    return;
  }
  if (msg) msg.textContent = 'Creating...';

  const payload = {
    title: title,
    description: desc,
    task_type: type,
    points: pts,
    is_live: isLive,
    late_submission_penalty: latePenalty,
  };
  if (deadline) payload.deadline = new Date(deadline).toISOString();

  const result = await db.from('tasks').insert(payload);
  if (result.error) {
    if (msg) msg.innerHTML = '<span style="color:var(--red)">Error: ' + result.error.message + '</span>';
    return;
  }

  if (msg) msg.innerHTML = '<span style="color:var(--green)">Task created successfully!</span>';
  const titleEl = document.getElementById('ntask-title');
  const descEl  = document.getElementById('ntask-desc');
  const ptsEl   = document.getElementById('ntask-pts');
  if (titleEl) titleEl.value = '';
  if (descEl)  descEl.value  = '';
  if (ptsEl)   ptsEl.value   = '50';
  if (deadlineEl) deadlineEl.value = '';
  if (liveEl)  liveEl.checked = false;
  if (penaltyEl) penaltyEl.checked = false;

  await loadAdminTasks();
  setTimeout(function() {
    if (msg) msg.textContent = '';
    toggleCreateTaskForm();
  }, 1500);
}
window.createTask = createTask;

async function loadAdminTasks() {
  const list = document.getElementById('admin-tasks-list');
  if (!list) return;

  const result = await db.from('tasks').select('*').order('created_at', { ascending: false });
  const tasks = result.data;

  if (!tasks || !tasks.length) {
    list.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text3);font-size:13px">No tasks yet. Create one above.</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    var now = new Date();
    var deadlineDate = t.deadline ? new Date(t.deadline) : null;
    var dl = deadlineDate
      ? deadlineDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'No deadline';
    var isPastDeadline = deadlineDate && deadlineDate < now;
    var typeLabel = TASK_TYPE_LABELS[t.task_type] || t.task_type;
    var liveClass = t.is_live ? 'btn-success' : 'btn-ghost';
    var liveText  = t.is_live ? 'Live' : 'Draft';
    var descHtml  = t.description ? '<div style="font-size:12px;color:var(--text2);margin-top:2px">' + t.description + '</div>' : '';
    var penaltyBadge = t.late_submission_penalty
      ? '<span style="font-size:10px;font-weight:700;background:rgba(255,165,0,0.15);color:var(--orange);border:1px solid var(--orange);border-radius:99px;padding:1px 7px;margin-left:6px">⏰ 50% late</span>'
      : '';
    var deadlineHtml = isPastDeadline
      ? '<span style="color:var(--red)">' + dl + ' (expired)</span>'
      : dl;

    html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">';
    html += '<div style="flex:1">';
    html += '<div style="font-size:14px;font-weight:700;color:var(--text)">' + t.title + penaltyBadge + '</div>';
    html += '<div style="font-size:12px;color:var(--text3)">' + typeLabel + ' | ' + t.points + ' pts | ' + deadlineHtml + '</div>';
    html += descHtml;
    html += '</div>';
    html += '<div style="display:flex;align-items:center;gap:8px">';
    html += '<button onclick="toggleTaskLive(' + t.id + ',' + (t.is_live ? 'true' : 'false') + ')" class="btn ' + liveClass + '" style="font-size:12px;padding:4px 10px">' + liveText + '</button>';
    html += '<button onclick="deleteTask(' + t.id + ')" class="btn btn-ghost" style="font-size:12px;padding:4px 10px;color:var(--red)">Delete</button>';
    html += '</div></div>';
  }
  list.innerHTML = html;
}
window.loadAdminTasks = loadAdminTasks;

async function toggleTaskLive(taskId, current) {
  await db.from('tasks').update({ is_live: !current }).eq('id', taskId);
  await loadAdminTasks();
}
window.toggleTaskLive = toggleTaskLive;

async function deleteTask(taskId) {
  if (!confirm('Delete this task? All submissions will also be deleted.')) return;
  await db.from('tasks').delete().eq('id', taskId);
  await loadAdminTasks();
}
window.deleteTask = deleteTask;

async function loadTaskSubmissions() {
  var list = document.getElementById('task-submissions-list');
  if (!list) return;

  var result = await db.from('task_submissions')
    .select('*, tasks(title,task_type,points,deadline,late_submission_penalty), pocs(name,college,city)')
    .order('submitted_at', { ascending: false })
    .limit(50);

  var subs = result.data || [];
  var pendingCount = subs.filter(function(s) { return s.status === 'pending'; }).length;

  var badge = document.getElementById('pending-sub-count');
  if (badge) badge.textContent = pendingCount;

  if (!subs.length) {
    list.innerHTML = '<div style="font-size:13px;color:var(--text3);text-align:center;padding:12px">No submissions yet.</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < subs.length; i++) {
    var s    = subs[i];
    var poc  = s.pocs  || {};
    var task = s.tasks || {};
    var dateStr = new Date(s.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    var mediaBtn = s.media_url ? '<a href="' + s.media_url + '" target="_blank" style="font-size:11px;color:var(--accent)">View Photo</a> ' : '';
    var reelBtn  = s.reel_link ? '<a href="' + s.reel_link  + '" target="_blank" style="font-size:11px;color:var(--accent)">View Reel</a>'  : '';
    var pocName  = poc.name  || s.poc_id   || 'Unknown';
    var taskName = task.title  || 'Task';
    var taskPts  = task.points || 0;

    // Check if submitted after deadline
    var isLate = false;
    if (task.deadline && task.late_submission_penalty) {
      isLate = new Date(s.submitted_at) > new Date(task.deadline);
    }
    var effectivePts = isLate ? Math.round(taskPts * 0.5) : taskPts;
    var lateBadge = isLate
      ? '<span style="font-size:10px;font-weight:700;background:rgba(255,165,0,0.15);color:var(--orange);border:1px solid var(--orange);border-radius:99px;padding:1px 7px;margin-left:6px">⏰ LATE — 50% pts</span>'
      : '';

    var statusColor = s.status === 'approved' ? 'var(--green)' : s.status === 'rejected' ? 'var(--red)' : 'var(--orange)';

    html += '<div style="border-bottom:1px solid var(--border);padding:10px 0">';
    html += '<div style="font-size:13px;font-weight:700;color:var(--text)">' + pocName + ' <span style="font-weight:400;color:var(--text3)">to ' + taskName + ' (+' + effectivePts + ' pts)</span>' + lateBadge + '</div>';
    html += '<div style="font-size:11px;color:var(--text3)">' + (poc.college || '') + ' | ' + (poc.city || '') + ' | ' + dateStr + ' ' + mediaBtn + reelBtn + '</div>';
    if (s.notes) html += '<div style="font-size:11px;color:var(--text2)">Note: ' + s.notes + '</div>';
    html += '<div style="display:flex;gap:6px;margin-top:6px">';
    if (s.status === 'pending') {
      html += '<button onclick="approveSubmission(' + s.id + ',\'' + s.poc_id + '\',' + taskPts + ',' + (isLate ? 'true' : 'false') + ')" class="btn btn-success" style="font-size:11px;padding:3px 10px">Approve (+' + effectivePts + ' pts)</button>';
      html += '<button onclick="rejectSubmission(' + s.id + ')" class="btn btn-ghost" style="font-size:11px;padding:3px 10px;color:var(--red)">Reject</button>';
    } else {
      html += '<span style="font-size:12px;font-weight:700;color:' + statusColor + '">' + s.status.toUpperCase() + '</span>';
    }
    if (s.admin_note) html += '<span style="font-size:11px;color:var(--text3)"> - ' + s.admin_note + '</span>';
    html += '</div></div>';
  }
  list.innerHTML = html;
}
window.loadTaskSubmissions = loadTaskSubmissions;

async function approveSubmission(subId, pocId, points, isLate) {
  var effectivePts = isLate ? Math.round(points * 0.5) : points;
  var lateNote = isLate ? ' (50% — late submission)' : '';
  if (!confirm('Approve? +' + effectivePts + ' pts will be added to this POC.' + lateNote)) return;
  var adminNote = isLate ? 'Late submission — 50% points awarded (' + effectivePts + ' of ' + points + ' pts)' : '';
  await db.from('task_submissions').update({ status: 'approved', admin_note: adminNote || null }).eq('id', subId);
  var pocResult = await db.from('pocs').select('points').eq('id', pocId).single();
  if (pocResult.data) {
    var newPts = (pocResult.data.points || 0) + effectivePts;
    await db.from('pocs').update({ points: newPts }).eq('id', pocId);
  }
  showToast('Approved! +' + effectivePts + ' pts added.' + (isLate ? ' (50% late penalty applied)' : ''), 'success');
  await loadTaskSubmissions();
}
window.approveSubmission = approveSubmission;

async function rejectSubmission(subId) {
  var note = prompt('Reason for rejection (optional):') || '';
  await db.from('task_submissions').update({ status: 'rejected', admin_note: note }).eq('id', subId);
  showToast('Submission rejected.', 'error');
  await loadTaskSubmissions();
}
window.rejectSubmission = rejectSubmission;

// Load tasks + submissions when admin initialises
var _origAdminInit = window.initializeAdminDashboard;
if (typeof _origAdminInit === 'function') {
  window.initializeAdminDashboard = async function() {
    await _origAdminInit();
    await loadAdminTasks();
    await loadTaskSubmissions();
  };
}
