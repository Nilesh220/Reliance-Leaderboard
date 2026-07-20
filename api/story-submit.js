/**
 * Vercel Serverless Function: POST /api/story-submit
 * Creates or updates a story submission record.
 * Image uploads are handled separately via /api/upload (Cloudinary).
 *
 * Body shape:
 *   { email, full_name, mobile?, referral_poc_id?, referral_poc_name?,
 *     type: 'lookup' | 'story' | 'views',
 *     story_url?, story_caption?,
 *     views_url?, views_count? }
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  const { email, full_name, mobile, referral_poc_id, referral_poc_name, type,
          story_url, story_caption, views_url, views_count } = req.body || {};

  if (!email || !type) return res.status(400).json({ error: 'email and type are required' });
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // ─── type: 'lookup' — check if email is known (from registrations) ────
    if (type === 'lookup') {
      // Check registrations table first
      const regRes = await fetch(
        `${SUPABASE_URL}/rest/v1/registrations?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
        { headers }
      );
      const regs = await regRes.json();
      const reg = Array.isArray(regs) ? regs[0] : null;

      // Check if they already have a story submission record
      const subRes = await fetch(
        `${SUPABASE_URL}/rest/v1/story_submissions?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
        { headers }
      );
      const subs = await subRes.json();
      const sub = Array.isArray(subs) ? subs[0] : null;

      return res.status(200).json({
        success: true,
        registered: !!reg,
        full_name:         reg?.full_name        || sub?.full_name        || null,
        mobile:            reg?.mobile           || sub?.mobile           || null,
        poc_id:            reg?.poc_id           || sub?.referral_poc_id  || null,
        poc_name:          reg?.poc_name         || sub?.referral_poc_name|| null,
        existing_submission: sub || null,
      });
    }

    // ─── type: 'story' — Submission 1 ────────────────────────────────────
    if (type === 'story') {
      if (!story_url) return res.status(400).json({ error: 'story_url is required' });
      if (!full_name) return res.status(400).json({ error: 'full_name is required' });

      // Upsert into story_submissions (insert or update if email exists)
      const upsertRes = await fetch(
        `${SUPABASE_URL}/rest/v1/story_submissions?on_conflict=email`,
        {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify({
            email:               normalizedEmail,
            full_name:           full_name.trim(),
            mobile:              mobile?.trim() || null,
            referral_poc_id:     referral_poc_id   || null,
            referral_poc_name:   referral_poc_name || null,
            story_url,
            story_caption:       story_caption?.trim() || null,
            story_submitted_at:  new Date().toISOString(),
            status:              'story_submitted',
          }),
        }
      );

      if (!upsertRes.ok) {
        const err = await upsertRes.json();
        console.error('Upsert story error:', err);
        return res.status(500).json({ error: err?.message || 'Failed to save story submission' });
      }

      const data = await upsertRes.json();
      return res.status(200).json({ success: true, submission: Array.isArray(data) ? data[0] : data });
    }

    // ─── type: 'views' — Submission 2 ────────────────────────────────────
    if (type === 'views') {
      if (!views_url) return res.status(400).json({ error: 'views_url is required' });

      // Find existing submission by email
      const existRes = await fetch(
        `${SUPABASE_URL}/rest/v1/story_submissions?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
        { headers }
      );
      const existing = await existRes.json();
      if (!Array.isArray(existing) || !existing[0]) {
        return res.status(404).json({ error: 'No story submission found for this email. Please submit your story first.' });
      }
      if (!existing[0].story_url) {
        return res.status(400).json({ error: 'Story screenshot must be submitted before views screenshot.' });
      }

      const patchRes = await fetch(
        `${SUPABASE_URL}/rest/v1/story_submissions?email=eq.${encodeURIComponent(normalizedEmail)}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            views_url,
            views_count:        views_count ? parseInt(views_count, 10) : null,
            views_submitted_at: new Date().toISOString(),
            status:             'views_submitted',
          }),
        }
      );

      if (!patchRes.ok) {
        const err = await patchRes.json();
        return res.status(500).json({ error: err?.message || 'Failed to save views submission' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: `Unknown type: ${type}` });

  } catch (err) {
    console.error('story-submit handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
