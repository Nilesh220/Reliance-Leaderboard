/**
 * Vercel Serverless Function: POST /api/walkin-submit
 * Handles walk-in registration:
 *   1. Duplicate check (mobile + email)
 *   2. Insert into walkin_registrations
 *   3. Send confirmation email via Resend
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { SUPABASE_URL, SUPABASE_ANON_KEY, RESEND_API_KEY } = process.env;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  const {
    poc_id, poc_name, poc_email, poc_phone,
    full_name, mobile, email,
    college_name, college_city,
    preferred_store, store_location, visit_date,
  } = req.body || {};

  // Validate required fields
  if (!poc_id || !full_name || !mobile || !email || !college_name || !college_city || !preferred_store || !visit_date) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // ── Duplicate check: mobile ──
    const mobileCheckRes = await fetch(
      `${SUPABASE_URL}/rest/v1/walkin_registrations?mobile=eq.${encodeURIComponent(mobile.trim())}&limit=1`,
      { headers }
    );
    const mobileRows = await mobileCheckRes.json();
    if (Array.isArray(mobileRows) && mobileRows.length > 0) {
      return res.status(409).json({ error: '⚠️ This mobile number is already registered. Each participant can only register once.' });
    }

    // ── Duplicate check: email ──
    const emailCheckRes = await fetch(
      `${SUPABASE_URL}/rest/v1/walkin_registrations?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
      { headers }
    );
    const emailRows = await emailCheckRes.json();
    if (Array.isArray(emailRows) && emailRows.length > 0) {
      return res.status(409).json({ error: '⚠️ This email address is already registered. Each participant can only register once.' });
    }

    // ── Insert registration ──
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/walkin_registrations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        poc_id,
        poc_name,
        full_name:        full_name.trim(),
        mobile:           mobile.trim(),
        email:            normalizedEmail,
        college_name:     college_name.trim(),
        college_city:     college_city.trim(),
        preferred_store:  preferred_store,
        store_location:   store_location || '',
        visit_date:       visit_date,
        confirmation_sent: true, // We're about to send it
      }),
    });

    if (!insertRes.ok) {
      const errData = await insertRes.json();
      if (errData?.code === '23505') {
        return res.status(409).json({ error: '⚠️ You are already registered (duplicate detected).' });
      }
      return res.status(500).json({ error: errData?.message || 'Failed to save registration.' });
    }

    // ── Format date for email ──
    const visitDateObj = new Date(visit_date + 'T00:00:00');
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const formattedDate = `${days[visitDateObj.getDay()]}, ${visitDateObj.getDate()} ${months[visitDateObj.getMonth()]} ${visitDateObj.getFullYear()}`;

    // ── Send confirmation email via Resend ──
    const emailHtml = `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,48,135,0.1)">
        <!-- Header gradient -->
        <div style="background:linear-gradient(135deg,#003087 0%,#001A4D 50%,#E31837 100%);padding:32px 24px;text-align:center">
          <div style="color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px">🏬 Store Walk-in</div>
          <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px">Bootup India × Reliance Digital × Vigorlaunchpad</div>
        </div>

        <!-- Body -->
        <div style="padding:32px 28px">
          <p style="color:#1A1F36;font-size:18px;font-weight:700;margin:0 0 6px">Hey ${full_name.trim().split(' ')[0]}! 🎉</p>
          <p style="color:#374878;font-size:14px;line-height:1.7;margin:0 0 24px">You're successfully registered for the <strong>Reliance Digital Store Walk-in Experience</strong>. Here are your details:</p>

          <!-- Details card -->
          <div style="background:#EEF4FF;border:1.5px solid rgba(0,48,135,0.1);border-radius:12px;padding:20px;margin-bottom:24px">
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#1A1F36">
              <tr><td style="padding:6px 0;color:#7A8BA8;width:120px">📅 Visit Date</td><td style="padding:6px 0;font-weight:700">${formattedDate}</td></tr>
              <tr><td style="padding:6px 0;color:#7A8BA8">🏬 Store</td><td style="padding:6px 0;font-weight:700">Reliance Digital — ${preferred_store}</td></tr>
              <tr><td style="padding:6px 0;color:#7A8BA8">📍 Location</td><td style="padding:6px 0;font-weight:700">${store_location || ''}</td></tr>
              <tr><td style="padding:6px 0;color:#7A8BA8">🤝 Your POC</td><td style="padding:6px 0;font-weight:700">${poc_name}</td></tr>
            </table>
          </div>

          <!-- Instructions -->
          <div style="background:#FFF0F2;border:1.5px solid rgba(227,24,55,0.15);border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="color:#B5142C;font-size:13px;font-weight:700;margin:0 0 8px">📸 IMPORTANT — What to do at the store:</p>
            <ol style="color:#374878;font-size:13px;line-height:1.8;margin:0;padding-left:16px">
              <li>Visit the store on your chosen date</li>
              <li>Take a photo/video at the store</li>
              <li>Post an <strong>Instagram Story</strong> tagging <strong style="color:#003087">@reliancedigital</strong> and <strong style="color:#E31837">@vigorspace</strong></li>
              <li>Upload your story screenshot when prompted</li>
            </ol>
          </div>

          <!-- Support -->
          <div style="background:#F5F8FF;border:1px solid rgba(0,48,135,0.08);border-radius:10px;padding:16px;font-size:12px;color:#7A8BA8;line-height:1.7">
            <strong style="color:#1A1F36">Need help?</strong><br>
            📧 Email: <a href="mailto:nilesh@vigorlaunchpad.com" style="color:#1A73E8">nilesh@vigorlaunchpad.com</a><br>
            👤 Your POC: ${poc_name} — 📞 ${poc_phone || 'N/A'}
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#F5F8FF;padding:16px 28px;text-align:center;border-top:1px solid rgba(0,48,135,0.08)">
          <div style="color:#7A8BA8;font-size:11px">See you at the store! 🏬</div>
        </div>
      </div>
    `;

    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Bootup India <noreply@reliancedigital.vigorspace.co>',
          to: [normalizedEmail],
          subject: `✅ You're registered! Store Walk-in on ${formattedDate}`,
          html: emailHtml,
        }),
      });

      if (!emailRes.ok) {
        console.error('Resend error:', await emailRes.text());
        // Don't fail registration if email fails — just log it
      }
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
    }

    return res.status(200).json({ success: true, message: 'Registration successful!' });

  } catch (err) {
    console.error('walkin-submit handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
