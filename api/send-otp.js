/**
 * Vercel Serverless Function: POST /api/send-otp
 * Sends OTP via Resend to allowed POC emails only
 */

const ALLOWED_EMAILS = new Set([
  // Vigorlaunchpad team
  'nilesh@vigorlaunchpad.com',
  'marsha@vigorlaunchpad.com',
  'priya@vigorlaunchpad.com',
  'yash@vigorlaunchpad.com',
  'shaikhalshifa220@gmail.com',
  'arch25014@gmail.com',
  'svishwakarma8878@gmail.com',
  'rangolesiddhant@student.sfit.ac.in',
  'melaniefernandes27088@gmail.com',
  'sakshibhoite71@gmail.com',
  'dhruvpathare@gmail.com',
  'darshbhoirdmce@gmail.com',
  'radheywandhekar4321@gmail.com',
  '2015piyushgu@gmail.com',
  'dakshitachawla148@gmail.com',
  'hemani.palak@gmail.com',
  'yajatyadav.36@gmail.com',
  'nityas150694@gmail.com',
  'adityavagare261@gmail.com',
  'aish171105@gmail.com',
  'itssuhani31@gmail.com',
  'nagesh2005gowda@gmail.com',
  'tarunkhatri468@gmail.com',
  'harshgupta5217@gmail.com',
  'vedant30.kanekar@gmail.com',
  'nikhilsharma27062007@gmail.com',
  'architvishwakarma72@gmail.com',
  'dishasonigra95@gmail.com',
  'shivrajshirsikar790@gmail.com',
  'nikitakatolkar2006@gmail.com',
  'dhruvkapoor15@gmail.com',
  'veerbatra1022@gmail.com',
  'hariomsandve80100@gmail.com',
  'lavesh05a@gmail.com',
  'ysumeet2004@gmail.com',
  'yligade77@gmail.com',
  'krishnakadu2004@gmail.com',
  'yashjeetmakhija31@gmail.com',
  'junaidkassar2580@gmail.com',
  'shelkesid309@gmail.com',
  'smitgondole@gmail.com',
  'bhoomis484@gmail.com',
  'showshweta01@gmail.com',
  'samrudhichavan06@gmail.com',
  'ninadofficial184@gmail.com',
  'dhruv.nile07@gmail.com',
  'prajwalghagre04@gmail.com',
  'sarangi20052006@gmail.com',
  'manyajain0806@gmail.com',
  'vedbatra05@gmail.com',
  'ayushkumarmodi973@gmail.com',
  'pranavsonawane2226@gmail.com',
  'edu.bhaktidhage@gmail.com',
  'jairajhuse28@gmail.com',
  'vedt024@gmail.com',
  'dikshabhagat2905@gmail.com',
  'sanchitashelar2607@gmail.com',
  'pritam.tel2071@gmail.com',
]);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const normalizedEmail = email.trim().toLowerCase();

  if (!ALLOWED_EMAILS.has(normalizedEmail)) {
    return res.status(403).json({ error: 'This email is not registered for Bootup India.' });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  // Store OTP in Supabase
  const supabaseRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/login_otps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email: normalizedEmail, otp, expires_at: expiresAt, used: false }),
  });

  if (!supabaseRes.ok) {
    return res.status(500).json({ error: 'Failed to store OTP. Please try again.' });
  }

  // Send OTP email via Resend
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Bootup India <noreply@reliancedigital.vigorspace.co>',
      to: [normalizedEmail],
      subject: `${otp} — Your Bootup India Login Code`,
      html: `
        <div style="font-family:'Inter',sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,48,135,0.1)">
          <div style="background:linear-gradient(90deg,#003087,#E31837);padding:24px;text-align:center">
            <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">⚡ Bootup India</div>
            <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px">Reliance Digital × Vigorlaunchpad</div>
          </div>
          <div style="padding:32px 28px;text-align:center">
            <p style="color:#1A1F36;font-size:16px;margin:0 0 8px">Your login code is:</p>
            <div style="font-size:48px;font-weight:900;letter-spacing:10px;color:#003087;margin:16px 0">${otp}</div>
            <p style="color:#7A8BA8;font-size:13px;margin:0">This code expires in <strong>10 minutes</strong>.</p>
            <p style="color:#7A8BA8;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
  }

  return res.status(200).json({ success: true, message: 'OTP sent to your email.' });
}
