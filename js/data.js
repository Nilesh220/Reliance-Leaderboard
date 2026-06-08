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
//  TASK DEFINITIONS
// ─────────────────────────────────────────────
const TASKS = {
  instagram_story: {
    id: 'instagram_story',
    name: 'Instagram Story (campaign creative + tag brand)',
    category: 'Instagram',
    points: 10,
    unit: 'story',
    icon: '📸',
    multiplier: false,
  },
  instagram_engagement_bonus: {
    id: 'instagram_engagement_bonus',
    name: 'Highest Engagement Bonus (Story/Post)',
    category: 'Instagram',
    points: 20,
    unit: 'bonus',
    icon: '🔥',
    multiplier: false,
  },
  whatsapp_group: {
    id: 'whatsapp_group',
    name: 'WhatsApp Group Share (campaign creative)',
    category: 'WhatsApp',
    points: 5,
    unit: 'per group',
    icon: '💬',
    multiplier: true,
  },
  webinar_attendee: {
    id: 'webinar_attendee',
    name: 'Webinar Attendee Brought In',
    category: 'Events',
    points: 15,
    unit: 'per attendee',
    icon: '🎯',
    multiplier: true,
  },
  seminar_12june: {
    id: 'seminar_12june',
    name: '12th June Seminar Attended',
    category: 'Events',
    points: 10,
    unit: 'attendance',
    icon: '🎓',
    multiplier: false,
  },
  orientation_12june: {
    id: 'orientation_12june',
    name: 'Introductory Call / Orientation (12th June)',
    category: 'Events',
    points: 10,
    unit: 'attendance',
    icon: '📢',
    multiplier: false,
  },
  ai_webinar: {
    id: 'ai_webinar',
    name: 'AI Webinar — Students Brought In',
    category: 'Events',
    points: 3,
    unit: 'per student',
    icon: '🤖',
    multiplier: true,
  },
  store_visit: {
    id: 'store_visit',
    name: 'Store Visit',
    category: 'Store',
    points: 3,
    unit: 'per visit',
    icon: '🏪',
    multiplier: false,
  },
  store_visit_ai_battle: {
    id: 'store_visit_ai_battle',
    name: 'Store Visit (AI Prompt Battle)',
    category: 'Store',
    points: 3,
    unit: 'per visit',
    icon: '⚡',
    multiplier: false,
  },
  store_visit_15aug: {
    id: 'store_visit_15aug',
    name: 'Store Visit (Independence Day — 15th Aug)',
    category: 'Store',
    points: 5,
    unit: 'per visit',
    icon: '🇮🇳',
    multiplier: false,
  },
  bonus_weekly_top: {
    id: 'bonus_weekly_top',
    name: 'Weekly Top Performer Bonus',
    category: 'Bonus',
    points: 50,
    unit: 'bonus',
    icon: '🏆',
    multiplier: false,
  },
  bonus_top_college_month: {
    id: 'bonus_top_college_month',
    name: 'Top College of the Month Bonus',
    category: 'Bonus',
    points: 100,
    unit: 'bonus',
    icon: '🥇',
    multiplier: false,
  },
  bonus_weekly_consistency: {
    id: 'bonus_weekly_consistency',
    name: 'Weekly Activity Consistency Bonus',
    category: 'Bonus',
    points: 25,
    unit: 'bonus',
    icon: '⭐',
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
