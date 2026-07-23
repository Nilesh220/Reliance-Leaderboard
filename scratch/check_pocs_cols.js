const SUPABASE_URL = 'https://aebkutavunwlwzswuhbc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYmt1dGF2dW53bHd6c3d1aGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTAyNDksImV4cCI6MjA5NjQ4NjI0OX0.-tnBG6MDWB_WjHDJeeWCpiEwvbMSk9H8e4UneAKDR78';

async function main() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/pocs?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const rows = await res.json();
    if (rows && rows.length > 0) {
      console.log('POC columns:', Object.keys(rows[0]));
      console.log('Sample POC:', rows[0]);
    } else {
      console.log('No POC rows found');
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
