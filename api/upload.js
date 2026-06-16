/**
 * Vercel Serverless Function: POST /api/upload
 * Signs a Cloudinary upload and returns the media URL
 * Accepts multipart form with a 'file' field
 */

import crypto from 'crypto';

export const config = { api: { bodyParser: false } };

// Parse multipart body (minimal, for small images)
async function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const cloudName  = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey     = process.env.CLOUDINARY_API_KEY;
    const apiSecret  = process.env.CLOUDINARY_API_SECRET;

    const timestamp  = Math.round(Date.now() / 1000).toString();
    const folder     = 'bootup_india_submissions';

    // Generate signature
    const sigStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(sigStr).digest('hex');

    // Read raw body (multipart)
    const rawBody = await parseMultipart(req);
    const contentType = req.headers['content-type'] || '';

    // Forward to Cloudinary as signed upload
    const formData = new FormData();
    const boundary = contentType.split('boundary=')[1];

    // Re-forward raw body to Cloudinary with signature params appended
    // Use Cloudinary's upload endpoint
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    // We need to parse the incoming multipart to extract the file
    // Use a boundary-based parse
    const boundaryBuf = Buffer.from(`--${boundary}`);
    const parts = splitBuffer(rawBody, boundaryBuf);

    let fileBuffer = null;
    let fileName   = 'upload';
    let mimeType   = 'application/octet-stream';

    for (const part of parts) {
      const str = part.toString('utf8', 0, Math.min(500, part.length));
      const cdMatch = str.match(/Content-Disposition:[^\r\n]*filename="([^"]+)"/i);
      const ctMatch = str.match(/Content-Type:\s*([^\r\n]+)/i);
      if (cdMatch) {
        fileName = cdMatch[1];
        if (ctMatch) mimeType = ctMatch[1].trim();
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          fileBuffer = part.slice(headerEnd + 4, part.length - 2); // strip trailing \r\n
        }
      }
    }

    if (!fileBuffer) return res.status(400).json({ error: 'No file found in request' });

    // Build form for Cloudinary (uses native global FormData and Blob)
    const cldForm = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    cldForm.append('file', blob, fileName);
    cldForm.append('api_key',   apiKey);
    cldForm.append('timestamp', timestamp);
    cldForm.append('signature', signature);
    cldForm.append('folder',    folder);

    const cldRes = await fetch(uploadUrl, { method: 'POST', body: cldForm });
    const cldData = await cldRes.json();

    if (!cldRes.ok) {
      console.error('Cloudinary error:', cldData);
      return res.status(500).json({ error: 'Upload failed', detail: cldData.error?.message });
    }

    return res.status(200).json({
      success:    true,
      url:        cldData.secure_url,
      public_id:  cldData.public_id,
    });

  } catch (err) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}

function splitBuffer(buf, delimiter) {
  const parts = [];
  let start = 0;
  let pos;
  while ((pos = buf.indexOf(delimiter, start)) !== -1) {
    if (pos > start) parts.push(buf.slice(start, pos));
    start = pos + delimiter.length;
  }
  if (start < buf.length) parts.push(buf.slice(start));
  return parts.filter(p => p.length > 4);
}
