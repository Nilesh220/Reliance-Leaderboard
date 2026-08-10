/**
 * Vercel Serverless Function: POST /api/walkin-story-submit
 * Updates a walk-in registration record with story and views screenshots.
 *
 * Body shape:
 *   { email, type: 'lookup' | 'story' | 'views',
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

  const { email, type, story_url, views_url, views_count } = req.body || {};

  if (!email || !type) return res.status(400).json({ error: 'email and type are required' });
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // ─── type: 'lookup' — check if walkin registration exists ────
    if (type === 'lookup') {
      const regRes = await fetch(
        `${SUPABASE_URL}/rest/v1/walkin_registrations?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
        { headers }
      );
      const regs = await regRes.json();
      const reg = Array.isArray(regs) ? regs[0] : null;

      if (!reg) {
        return res.status(200).json({
          success: true,
          registered: false,
          existing_submission: null
        });
      }

      // Convert the registration into the expected 'submission' shape for the frontend
      const submissionInfo = {
        story_url: reg.story_screenshot_url,
        views_url: reg.views_screenshot_url,
        status: reg.story_status
      };

      return res.status(200).json({
        success: true,
        registered: true,
        full_name: reg.full_name,
        mobile: reg.mobile,
        poc_id: reg.poc_id,
        poc_name: reg.poc_name,
        existing_submission: (reg.story_screenshot_url || reg.views_screenshot_url) ? submissionInfo : null,
      });
    }

    // ─── type: 'story' — Submission 1 ────────────────────────────────────
    if (type === 'story') {
      if (!story_url) return res.status(400).json({ error: 'story_url is required' });

      // Find existing
      const regRes = await fetch(
        `${SUPABASE_URL}/rest/v1/walkin_registrations?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
        { headers }
      );
      const existing = await regRes.json();
      if (!Array.isArray(existing) || !existing[0]) {
        return res.status(404).json({ error: 'No walk-in registration found for this email. Please register first.' });
      }

      const patchRes = await fetch(
        `${SUPABASE_URL}/rest/v1/walkin_registrations?id=eq.${existing[0].id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            story_screenshot_url: story_url,
            story_submitted_at:   new Date().toISOString(),
            story_status:         'story_submitted',
          }),
        }
      );

      if (!patchRes.ok) {
        const err = await patchRes.json();
        return res.status(500).json({ error: err?.message || 'Failed to save story submission' });
      }

      return res.status(200).json({ success: true });
    }

    // ─── type: 'views' — Submission 2 ────────────────────────────────────
    if (type === 'views') {
      if (!views_url) return res.status(400).json({ error: 'views_url is required' });

      const existRes = await fetch(
        `${SUPABASE_URL}/rest/v1/walkin_registrations?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
        { headers }
      );
      const existing = await existRes.json();
      if (!Array.isArray(existing) || !existing[0]) {
        return res.status(404).json({ error: 'No walk-in registration found.' });
      }
      if (!existing[0].story_screenshot_url) {
        return res.status(400).json({ error: 'Story screenshot must be submitted before views screenshot.' });
      }

      const patchRes = await fetch(
        `${SUPABASE_URL}/rest/v1/walkin_registrations?id=eq.${existing[0].id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            views_screenshot_url: views_url,
            views_count:          views_count ? parseInt(views_count, 10) : null,
            views_submitted_at:   new Date().toISOString(),
            story_status:         'views_submitted',
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
    console.error('walkin-story-submit handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
