/**
 * Vercel Serverless Function: POST /api/send-walkin-emails
 *
 * Sends automated emails for the Walk-in campaign:
 *   type = 'reminder'   — Day-of visit reminder to registrants
 *   type = 'followup'   — Next-day reminder if screenshot not submitted
 *   type = 'poc_alert'  — Alert to POC about missing stories
 *
 * Body: { type: string, target?: string }
 *   target is optional — 'all' or a specific email address
 */

// ── All 40 Walk-in POC contact data (for POC alert emails) ──
const WALKIN_POC_CONTACTS = {
  'mum_27': { email: 'abhid12682@gmail.com', phone: '8928320198' },
  'poc_aishwarya_tiwari_1781515693': { email: 'aish171105@gmail.com', phone: '8149941711' },
  'mum_01': { email: 'shaikhalshifa220@gmail.com', phone: '9833200243' },
  'mum_17': { email: 'architvishwakarma72@gmail.com', phone: '9702377355' },
  'mum_13': { email: 'arch25014@gmail.com', phone: '8779672731' },
  'mum_05': { email: 'dakshitachawla148@gmail.com', phone: '9819696572' },
  'mum_03': { email: 'harshgupta5217@gmail.com', phone: '8689835180' },
  'mum_20': { email: 'gaikwad.janvi1005@gmail.com', phone: '8591289049' },
  'poc_melanie_fernandes_1781100673': { email: 'melaniefernandes27088@gmail.com', phone: '9987383033' },
  'poc_nagesh_gowda_1781514794': { email: 'nagesh2005gowda@gmail.com', phone: '9082498367' },
  'poc_nikhil_sharma_1781100670': { email: 'nikhilsharma27062007@gmail.com', phone: '8080967253' },
  'poc_palak_hemani_1781514794': { email: 'hemani.palak@gmail.com', phone: '8828344424' },
  'mum_10': { email: '2015piyushgu@gmail.com', phone: '9702045886' },
  'mum_29': { email: 'ranepradyum@gmail.com', phone: '9372377724' },
  'mum_30': { email: 'sahilmemon9124@gmail.com', phone: '8591421262' },
  'mum_04': { email: 'sakshibhoite71@gmail.com', phone: '9769299197' },
  'mum_28': { email: 'saloniy222@gmail.com', phone: '8856977406' },
  'mum_22': { email: 'satviksingh8080@gmail.com', phone: '8080227873' },
  'mum_23': { email: 'shrirajpatel280604@gmail.com', phone: '9323295059' },
  'mum_02': { email: 'rangolesiddhant@student.sfit.ac.in', phone: '9320056733' },
  'mum_14': { email: 'tarunkhatri468@gmail.com', phone: '8451015565' },
  'mum_31': { email: 'aditisalunke0014@gmail.com', phone: '9930190365' },
  'pun_31': { email: 'arpanaronal07@gmail.com', phone: '9021775922' },
  'pun_32': { email: 'atharv.pednekar358@gmail.com', phone: '9130912373' },
  'pun_19': { email: 'dhruv.nile07@gmail.com', phone: '7498273208' },
  'pun_10': { email: 'krishnakadu2004@gmail.com', phone: '7559266894' },
  'pun_02': { email: 'nikitakatolkar2006@gmail.com', phone: '9503195473' },
  'pun_20': { email: 'prajwalghagre04@gmail.com', phone: '7744041559' },
  'pun_29': { email: 'pranitajadhav2277@gmail.com', phone: '8975905974' },
  'pun_33': { email: 'korog777s@gmail.com', phone: '9325461550' },
  'pun_16': { email: 'showshweta01@gmail.com', phone: '9766611955' },
  'pun_13': { email: 'shelkesid309@gmail.com', phone: '9850110564' },
  'pun_28': { email: 'mantgevaibhav0@gmail.com', phone: '8180004761' },
  'pun_23': { email: 'vedbatra05@gmail.com', phone: '7057949749' },
  'pun_04': { email: 'veerbatra1022@gmail.com', phone: '7219050499' },
  'pun_34': { email: 'patilviru1007@gmail.com', phone: '9226717711' },
  'pun_11': { email: 'yashjeetmakhija31@gmail.com', phone: '7276241519' },
  'aur_04': { email: 'dikshabhagat2905@gmail.com', phone: '8263819131' },
  'aur_02': { email: 'jairajhuse28@gmail.com', phone: '8208250287' },
  'aur_08': { email: 'pawarrahul9550@gmail.com', phone: '9767900458' },
};

function formatDate(dateStr) {
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { SUPABASE_URL, SUPABASE_ANON_KEY, RESEND_API_KEY } = process.env;
  const sbHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  const { type, target } = req.body || {};

  if (!type) return res.status(400).json({ error: 'type is required' });

  try {
    // ──────────────────────────────────────────
    // TYPE: REMINDER — Day-of visit reminder
    // ──────────────────────────────────────────
    if (type === 'reminder') {
      // Get today's date in IST (UTC+5:30)
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(now.getTime() + istOffset);
      const today = istNow.toISOString().split('T')[0]; // YYYY-MM-DD

      let query = `${SUPABASE_URL}/rest/v1/walkin_registrations?visit_date=eq.${today}&reminder_sent=eq.false&select=*`;
      if (target && target !== 'all') {
        query = `${SUPABASE_URL}/rest/v1/walkin_registrations?email=eq.${encodeURIComponent(target)}&reminder_sent=eq.false&select=*`;
      }

      const fetchRes = await fetch(query, { headers: sbHeaders });
      const registrations = await fetchRes.json();

      if (!Array.isArray(registrations) || registrations.length === 0) {
        return res.status(200).json({ success: true, sent: 0, message: 'No reminders to send.' });
      }

      let sentCount = 0;
      for (const reg of registrations) {
        const html = `
          <div style="font-family:'Inter',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,48,135,0.1)">
            <div style="background:linear-gradient(135deg,#003087,#1A73E8);padding:28px 24px;text-align:center">
              <div style="font-size:40px;margin-bottom:8px">🏬</div>
              <div style="color:#fff;font-size:22px;font-weight:800">Today's the Day!</div>
              <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px">Your store walk-in is today</div>
            </div>
            <div style="padding:28px">
              <p style="color:#1A1F36;font-size:16px;font-weight:600;margin:0 0 16px">Hey ${reg.full_name.split(' ')[0]}! 👋</p>
              <p style="color:#374878;font-size:14px;line-height:1.7;margin:0 0 20px">Quick reminder — your <strong>Reliance Digital Store Walk-in</strong> is scheduled for <strong>today</strong>!</p>
              <div style="background:#EEF4FF;border-radius:12px;padding:16px;margin-bottom:20px;border:1px solid rgba(0,48,135,0.1)">
                <p style="margin:0;font-size:14px;color:#1A1F36"><strong>🏬</strong> ${reg.preferred_store}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#7A8BA8">📍 ${reg.store_location}</p>
              </div>
              <div style="background:#FFF0F2;border-radius:12px;padding:16px;border:1px solid rgba(227,24,55,0.15)">
                <p style="margin:0;font-size:13px;color:#B5142C;font-weight:700">📸 Don't forget to post a story!</p>
                <p style="margin:6px 0 0;font-size:13px;color:#374878;line-height:1.7">Tag <strong style="color:#003087">@reliancedigital</strong> and <strong style="color:#E31837">@vigorspace</strong> on Instagram.</p>
              </div>
            </div>
          </div>`;

        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: 'Bootup India <noreply@reliancedigital.vigorspace.co>',
              to: [reg.email],
              subject: `🏬 Reminder: Your store visit is TODAY! — ${reg.preferred_store}`,
              html,
            }),
          });

          // Mark reminder_sent = true
          await fetch(`${SUPABASE_URL}/rest/v1/walkin_registrations?id=eq.${reg.id}`, {
            method: 'PATCH',
            headers: sbHeaders,
            body: JSON.stringify({ reminder_sent: true }),
          });
          sentCount++;
        } catch (emailErr) {
          console.error(`Failed to send reminder to ${reg.email}:`, emailErr);
        }
      }

      return res.status(200).json({ success: true, sent: sentCount, total: registrations.length });
    }

    // ──────────────────────────────────────────
    // TYPE: FOLLOWUP — Next day if no screenshot
    // ──────────────────────────────────────────
    if (type === 'followup') {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(now.getTime() + istOffset);
      const yesterday = new Date(istNow.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let query = `${SUPABASE_URL}/rest/v1/walkin_registrations?visit_date=lte.${yesterday}&story_screenshot_url=is.null&followup_sent=eq.false&select=*`;
      if (target && target !== 'all') {
        query = `${SUPABASE_URL}/rest/v1/walkin_registrations?email=eq.${encodeURIComponent(target)}&story_screenshot_url=is.null&followup_sent=eq.false&select=*`;
      }

      const fetchRes = await fetch(query, { headers: sbHeaders });
      const registrations = await fetchRes.json();

      if (!Array.isArray(registrations) || registrations.length === 0) {
        return res.status(200).json({ success: true, sent: 0, message: 'No follow-ups to send.' });
      }

      const storySubmitUrl = 'https://reliance-leaderboard.vercel.app/walkin-story';
      let sentCount = 0;

      for (const reg of registrations) {
        const html = `
          <div style="font-family:'Inter',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(227,24,55,0.1)">
            <div style="background:linear-gradient(135deg,#E31837,#B5142C);padding:28px 24px;text-align:center">
              <div style="font-size:40px;margin-bottom:8px">📸</div>
              <div style="color:#fff;font-size:22px;font-weight:800">Screenshot Missing!</div>
              <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px">We haven't received your story screenshot</div>
            </div>
            <div style="padding:28px">
              <p style="color:#1A1F36;font-size:16px;font-weight:600;margin:0 0 16px">Hey ${reg.full_name.split(' ')[0]}! 👋</p>
              <p style="color:#374878;font-size:14px;line-height:1.7;margin:0 0 20px">We noticed you visited <strong>${reg.preferred_store}</strong> but haven't uploaded your Instagram story screenshot yet.</p>
              <p style="color:#374878;font-size:14px;line-height:1.7;margin:0 0 20px">Please post a story tagging <strong style="color:#003087">@reliancedigital</strong> & <strong style="color:#E31837">@vigorspace</strong>, then submit your screenshot:</p>
              <div style="text-align:center;margin:24px 0">
                <a href="${storySubmitUrl}?email=${encodeURIComponent(reg.email)}" style="display:inline-block;background:linear-gradient(135deg,#003087,#0052CC);color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 16px rgba(0,48,135,0.3)">📤 Upload Screenshot Now</a>
              </div>
              <p style="color:#7A8BA8;font-size:12px;text-align:center;margin:0">This is a friendly reminder. If you've already submitted, please ignore this email.</p>
            </div>
          </div>`;

        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: 'Bootup India <noreply@reliancedigital.vigorspace.co>',
              to: [reg.email],
              subject: `📸 Reminder: Upload your story screenshot — ${reg.preferred_store}`,
              html,
            }),
          });

          await fetch(`${SUPABASE_URL}/rest/v1/walkin_registrations?id=eq.${reg.id}`, {
            method: 'PATCH',
            headers: sbHeaders,
            body: JSON.stringify({ followup_sent: true }),
          });
          sentCount++;
        } catch (emailErr) {
          console.error(`Failed to send followup to ${reg.email}:`, emailErr);
        }
      }

      return res.status(200).json({ success: true, sent: sentCount, total: registrations.length });
    }

    // ──────────────────────────────────────────
    // TYPE: POC_ALERT — Alert POC about missing stories
    // ──────────────────────────────────────────
    if (type === 'poc_alert') {
      // Get all registrations where followup was sent but still no screenshot
      let query = `${SUPABASE_URL}/rest/v1/walkin_registrations?followup_sent=eq.true&story_screenshot_url=is.null&poc_alert_sent=eq.false&select=*`;
      if (target && target !== 'all') {
        query = `${SUPABASE_URL}/rest/v1/walkin_registrations?poc_id=eq.${encodeURIComponent(target)}&story_screenshot_url=is.null&poc_alert_sent=eq.false&select=*`;
      }

      const fetchRes = await fetch(query, { headers: sbHeaders });
      const registrations = await fetchRes.json();

      if (!Array.isArray(registrations) || registrations.length === 0) {
        return res.status(200).json({ success: true, sent: 0, message: 'No POC alerts to send.' });
      }

      // Group by POC
      const byPoc = {};
      for (const reg of registrations) {
        if (!byPoc[reg.poc_id]) byPoc[reg.poc_id] = { poc_name: reg.poc_name, registrations: [] };
        byPoc[reg.poc_id].registrations.push(reg);
      }

      let sentCount = 0;
      for (const [pocId, data] of Object.entries(byPoc)) {
        const pocContact = WALKIN_POC_CONTACTS[pocId];
        if (!pocContact?.email) continue;

        const studentList = data.registrations.map(r =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${r.full_name}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${r.email}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${r.preferred_store}</td></tr>`
        ).join('');

        const html = `
          <div style="font-family:'Inter',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,48,135,0.1)">
            <div style="background:linear-gradient(135deg,#E07C00,#FF6B35);padding:28px 24px;text-align:center">
              <div style="font-size:40px;margin-bottom:8px">⚠️</div>
              <div style="color:#fff;font-size:22px;font-weight:800">Story Alert!</div>
              <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:4px">${data.registrations.length} referral(s) haven't posted their story</div>
            </div>
            <div style="padding:28px">
              <p style="color:#1A1F36;font-size:16px;font-weight:600;margin:0 0 16px">Hey ${data.poc_name.split(' ')[0]}! 👋</p>
              <p style="color:#374878;font-size:14px;line-height:1.7;margin:0 0 20px">The following student(s) registered through your link but <strong>haven't posted their Instagram story</strong> yet. Please follow up with them:</p>
              <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden">
                <thead>
                  <tr style="background:#EEF4FF">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#7A8BA8;letter-spacing:0.5px">Name</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#7A8BA8;letter-spacing:0.5px">Email</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#7A8BA8;letter-spacing:0.5px">Store</th>
                  </tr>
                </thead>
                <tbody>${studentList}</tbody>
              </table>
              <p style="color:#7A8BA8;font-size:12px;margin-top:16px;line-height:1.6">Please reach out to them and remind them to post an Instagram story tagging <strong>@reliancedigital</strong> & <strong>@vigorspace</strong>, then upload the screenshot.</p>
            </div>
          </div>`;

        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: 'Bootup India <noreply@reliancedigital.vigorspace.co>',
              to: [pocContact.email],
              subject: `⚠️ ${data.registrations.length} referral(s) haven't posted their story — Action needed`,
              html,
            }),
          });

          // Mark poc_alert_sent for all these registrations
          for (const reg of data.registrations) {
            await fetch(`${SUPABASE_URL}/rest/v1/walkin_registrations?id=eq.${reg.id}`, {
              method: 'PATCH',
              headers: sbHeaders,
              body: JSON.stringify({ poc_alert_sent: true }),
            });
          }
          sentCount++;
        } catch (emailErr) {
          console.error(`Failed to send POC alert to ${pocContact.email}:`, emailErr);
        }
      }

      return res.status(200).json({ success: true, sent: sentCount, pocs_alerted: Object.keys(byPoc).length });
    }

    return res.status(400).json({ error: `Unknown type: ${type}` });

  } catch (err) {
    console.error('send-walkin-emails handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
