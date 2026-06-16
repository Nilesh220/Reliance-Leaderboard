/**
 * Vercel Serverless Function: POST /api/verify-otp
 * Verifies OTP and returns POC session data
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, otp } = req.body || {};
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp   = otp.trim();

  // Find the latest valid OTP for this email
  const otpRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/login_otps?email=eq.${encodeURIComponent(normalizedEmail)}&otp=eq.${normalizedOtp}&used=eq.false&expires_at=gte.${new Date().toISOString()}&order=created_at.desc&limit=1`,
    {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    }
  );

  const otpRows = await otpRes.json();

  if (!Array.isArray(otpRows) || otpRows.length === 0) {
    return res.status(401).json({ error: 'Invalid or expired OTP. Please try again.' });
  }

  const otpRow = otpRows[0];

  // Mark OTP as used
  await fetch(`${process.env.SUPABASE_URL}/rest/v1/login_otps?id=eq.${otpRow.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ used: true }),
  });

  // Fetch POC data from pocs table
  const pocRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/pocs?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
    {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    }
  );

  const pocRows = await pocRes.json();
  const poc = pocRows?.[0] || null;

  return res.status(200).json({
    success: true,
    email: normalizedEmail,
    poc_id:   poc?.id   || null,
    poc_name: poc?.name || normalizedEmail.split('@')[0],
    points:   poc?.points || 0,
    city:     poc?.city || null,
    college:  poc?.college || null,
  });
}
