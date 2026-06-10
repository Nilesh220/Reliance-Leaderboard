/**
 * Bootup India Campaign — Reliance Digital
 * Data Layer: Supabase Integration
 * Managed by Vigorlaunchpad
 */

// ─────────────────────────────────────────────
//  SUPABASE CLIENT
// ─────────────────────────────────────────────
const SUPABASE_URL      = 'https://aebkutavunwlwzswuhbc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYmt1dGF2dW53bHd6c3d1aGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTAyNDksImV4cCI6MjA5NjQ4NjI0OX0.-tnBG6MDWB_WjHDJeeWCpiEwvbMSk9H8e4UneAKDR78';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─────────────────────────────────────────────
//  ICON SYSTEM — Clean SVG icons (replaces emoji)
// ─────────────────────────────────────────────
const ICON_SVG = {
  camera:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  trending:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  message:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  users:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  calendar:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>`,
  phone:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.09 12 19.79 19.79 0 0 1 1 3.18 2 2 0 0 1 2.96 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M14.05 2a9 9 0 0 1 8 7.94"/><path d="M14.05 6A5 5 0 0 1 18 10"/></svg>`,
  cpu:          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="6" height="6"/><path d="M15 9V3h-2v2h-2V3H9v6H3v2h2v2H3v2h6v6h2v-2h2v2h2v-6h6v-2h-2v-2h2V9z"/></svg>`,
  store:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  zap:          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  flag:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  trophy:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 22v-4"/><path d="M14 22v-4"/><rect x="6" y="2" width="12" height="13" rx="2"/></svg>`,
  award:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  'bar-chart':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  video:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  film:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
};

// Icon → brand color mapping
const ICON_COLORS = {
  camera: 'red', trending: 'red', zap: 'red', video: 'red', film: 'red',
  message: 'green',
  users: 'blue', calendar: 'blue', phone: 'blue', cpu: 'blue', store: 'blue', flag: 'blue',
  trophy: 'gold', award: 'gold', 'bar-chart': 'gold',
};

/**
 * Returns branded SVG icon HTML.
 * Gracefully falls back to emoji text for legacy DB entries.
 * @param {string} key    Icon key (e.g. 'camera') or legacy emoji ('📸')
 * @param {string} variant  Size: '' = 36px, 'sm' = 24px, 'xs' = 20px
 */
function getTaskIcon(key, variant) {
  if (!key) return '';
  const svg = ICON_SVG[key];
  if (!svg) return `<span class="t-icon-emoji">${key}</span>`;
  const color = ICON_COLORS[key] || 'blue';
  const cls   = ['t-icon', `t-icon--${color}`, variant ? `t-icon--${variant}` : ''].filter(Boolean).join(' ');
  return `<span class="${cls}">${svg}</span>`;
}
window.getTaskIcon = getTaskIcon;

// ─────────────────────────────────────────────
//  TASK DEFINITIONS
// ─────────────────────────────────────────────
const TASKS = {
  instagram_story: {
    id: 'instagram_story',
    name: 'Instagram Story (campaign creative + tag brand)',
    category: 'Instagram',
    points: 30,
    unit: 'story',
    icon: 'camera',
    multiplier: false,
  },
  reel_poc: {
    id: 'reel_poc',
    name: 'Reel Uploaded by POC',
    category: 'Instagram',
    points: 200,
    unit: 'per reel',
    icon: 'video',
    multiplier: false,
  },
  reel_creator: {
    id: 'reel_creator',
    name: 'Content Reel Uploaded by Creator',
    category: 'Instagram',
    points: 100,
    unit: 'per reel',
    icon: 'film',
    multiplier: false,
  },
  whatsapp_group: {
    id: 'whatsapp_group',
    name: 'WhatsApp Group Broadcast (campaign creative)',
    category: 'WhatsApp',
    points: 10,
    unit: 'per group',
    icon: 'message',
    multiplier: true,
  },
  webinar_attendee: {
    id: 'webinar_attendee',
    name: 'Webinar Participation (students brought in)',
    category: 'Events',
    points: 15,
    unit: 'per student',
    icon: 'users',
    multiplier: true,
  },
  seminar_12june: {
    id: 'seminar_12june',
    name: '12th June Seminar Attended',
    category: 'Events',
    points: 150,
    unit: 'attendance',
    icon: 'calendar',
    multiplier: false,
  },
  orientation_12june: {
    id: 'orientation_12june',
    name: 'Induction / Orientation Call',
    category: 'Events',
    points: 20,
    unit: 'attendance',
    icon: 'phone',
    multiplier: false,
  },
  store_visit_ai_battle: {
    id: 'store_visit_ai_battle',
    name: 'Store Walk-in (AI Prompt Battle)',
    category: 'Store',
    points: 25,
    unit: 'per walk-in',
    icon: 'zap',
    multiplier: false,
  },
  bonus_top_performer_month: {
    id: 'bonus_top_performer_month',
    name: 'Top Performer of the Month',
    category: 'Bonus',
    points: 500,
    unit: 'bonus',
    icon: 'trophy',
    multiplier: false,
  },
};

// ─────────────────────────────────────────────
//  INITIALIZE — verify connection
// ─────────────────────────────────────────────
async function initializeData() {
  const { error } = await db.from('pocs').select('id').limit(1);
  if (error) console.error('Supabase connection error:', error.message);
}

// ─────────────────────────────────────────────
//  GET LIVE DATA
// ─────────────────────────────────────────────
async function getLiveData() {
  const { data, error } = await db
    .from('pocs')
    .select('*')
    .order('points', { ascending: false });
  if (error) { console.error('getLiveData:', error.message); return []; }
  return data;
}

// ─────────────────────────────────────────────
//  GET PENDING QUEUE
// ─────────────────────────────────────────────
async function getPendingQueue() {
  const { data, error } = await db
    .from('pending_queue')
    .select('*')
    .order('added_at', { ascending: true });
  if (error) { console.error('getPendingQueue:', error.message); return []; }
  return data;
}

// ─────────────────────────────────────────────
//  GET AUDIT LOG
// ─────────────────────────────────────────────
async function getAuditLog() {
  const { data, error } = await db
    .from('audit_log')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(100);
  if (error) { console.error('getAuditLog:', error.message); return []; }
  return data;
}

// ─────────────────────────────────────────────
//  GET LAST PUBLISHED TIMESTAMP
// ─────────────────────────────────────────────
async function getLastPublished() {
  const { data, error } = await db
    .from('campaign_meta')
    .select('value')
    .eq('key', 'last_published')
    .single();
  if (error) return null;
  return data?.value || null;
}

// ─────────────────────────────────────────────
//  ADD TO PENDING QUEUE (Admin action)
// ─────────────────────────────────────────────
async function addToPendingQueue(pocId, taskId, quantity, note) {
  const task = TASKS[taskId];
  const { data: pocData, error: pocErr } = await db
    .from('pocs')
    .select('*')
    .eq('id', pocId)
    .single();

  if (pocErr) { console.error('addToPendingQueue - fetch poc:', pocErr.message); return null; }

  const pointsEarned = task.multiplier ? task.points * quantity : task.points;

  const entry = {
    id:            `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    poc_id:        pocId,
    poc_name:      pocData.name,
    college:       pocData.college,
    city:          pocData.city,
    task_id:       taskId,
    task_name:     task.name,
    task_icon:     task.icon,
    quantity:      quantity,
    points_earned: pointsEarned,
    note:          note || '',
  };

  const { error } = await db.from('pending_queue').insert(entry);
  if (error) { console.error('addToPendingQueue - insert:', error.message); return null; }
  return entry;
}

// ─────────────────────────────────────────────
//  REMOVE ONE ITEM FROM PENDING QUEUE
// ─────────────────────────────────────────────
async function removeFromPendingQueue(entryId) {
  const { error } = await db.from('pending_queue').delete().eq('id', entryId);
  if (error) console.error('removeFromPendingQueue:', error.message);
}

// ─────────────────────────────────────────────
//  PUBLISH PENDING QUEUE → LIVE DATA
// ─────────────────────────────────────────────
async function publishPendingQueue() {
  const queue = await getPendingQueue();
  if (queue.length === 0) return { published: 0 };

  const now = new Date().toISOString();

  // Group queue items by poc_id
  const pocGroups = {};
  queue.forEach(entry => {
    if (!pocGroups[entry.poc_id]) pocGroups[entry.poc_id] = [];
    pocGroups[entry.poc_id].push(entry);
  });

  // Fetch all affected POCs
  const pocIds = Object.keys(pocGroups);
  const { data: pocsData, error: fetchErr } = await db
    .from('pocs')
    .select('*')
    .in('id', pocIds);

  if (fetchErr) { console.error('publishPendingQueue - fetch pocs:', fetchErr.message); return { published: 0 }; }

  // Update each POC's points + task_log
  await Promise.all(pocsData.map(async poc => {
    const entries      = pocGroups[poc.id];
    const addedPoints  = entries.reduce((sum, e) => sum + e.points_earned, 0);
    const newTaskLog   = [
      ...(poc.task_log || []),
      ...entries.map(e => ({
        taskId:       e.task_id,
        taskName:     e.task_name,
        taskIcon:     e.task_icon,
        quantity:     e.quantity,
        pointsEarned: e.points_earned,
        note:         e.note,
        publishedAt:  now,
      })),
    ];

    const { error } = await db
      .from('pocs')
      .update({ points: poc.points + addedPoints, task_log: newTaskLog })
      .eq('id', poc.id);

    if (error) console.error(`publishPendingQueue - update poc ${poc.id}:`, error.message);
  }));

  // Insert into audit log
  const auditEntries = queue.map(e => ({
    id:            `al_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    poc_id:        e.poc_id,
    poc_name:      e.poc_name,
    college:       e.college,
    city:          e.city,
    task_id:       e.task_id,
    task_name:     e.task_name,
    task_icon:     e.task_icon,
    quantity:      e.quantity,
    points_earned: e.points_earned,
    note:          e.note,
    status:        'published',
    added_at:      e.added_at,
    published_at:  now,
  }));
  await db.from('audit_log').insert(auditEntries);

  // Clear pending queue (delete only the items we just published)
  const queueIds = queue.map(e => e.id);
  await db.from('pending_queue').delete().in('id', queueIds);

  // Update campaign meta timestamps
  await db.from('campaign_meta').update({ value: now }).eq('key', 'last_published');
  await db.from('campaign_meta').update({ value: now }).eq('key', 'last_updated');

  return { published: queue.length };
}

// ─────────────────────────────────────────────
//  MANUAL POINT OVERRIDE
// ─────────────────────────────────────────────
async function overridePoints(pocId, newPoints, reason) {
  const { data: poc, error: fetchErr } = await db
    .from('pocs')
    .select('*')
    .eq('id', pocId)
    .single();
  if (fetchErr) return null;

  const diff = newPoints - poc.points;
  const now  = new Date().toISOString();

  const { error } = await db
    .from('pocs')
    .update({ points: newPoints })
    .eq('id', pocId);

  if (error) { console.error('overridePoints:', error.message); return null; }

  await db.from('audit_log').insert({
    id:            `ovr_${Date.now()}`,
    poc_id:        pocId,
    poc_name:      poc.name,
    college:       poc.college,
    city:          poc.city,
    task_name:     `Manual Override — ${reason}`,
    task_icon:     '✏️',
    points_earned: diff,
    status:        'override',
    added_at:      now,
    published_at:  now,
  });

  await db.from('campaign_meta').update({ value: now }).eq('key', 'last_updated');
  return { ...poc, points: newPoints };
}

// ─────────────────────────────────────────────
//  COLLEGE LEADERBOARD (computed from live data)
// ─────────────────────────────────────────────
function getCollegeLeaderboard(data, city) {
  const filtered = city && city !== 'All' ? data.filter(p => p.city === city) : data;
  const map = {};
  filtered.forEach(poc => {
    if (!map[poc.college]) {
      map[poc.college] = { college: poc.college, city: poc.city, totalPoints: 0, pocCount: 0 };
    }
    map[poc.college].totalPoints += poc.points;
    map[poc.college].pocCount++;
  });
  return Object.values(map).sort((a, b) => b.totalPoints - a.totalPoints);
}

// ─────────────────────────────────────────────
//  CAMPAIGN STATS (computed from live data)
// ─────────────────────────────────────────────
function getCampaignStats(data) {
  const totalPoints = data.reduce((sum, p) => sum + p.points, 0);
  const activePocs  = data.filter(p => p.points > 0).length;
  return { totalPoints, activePocs, totalPocs: data.length };
}
