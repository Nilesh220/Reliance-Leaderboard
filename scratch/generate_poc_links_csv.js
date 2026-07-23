const fs = require('fs');

const SUPABASE_URL = 'https://aebkutavunwlwzswuhbc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYmt1dGF2dW53bHd6c3d1aGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTAyNDksImV4cCI6MjA5NjQ4NjI0OX0.-tnBG6MDWB_WjHDJeeWCpiEwvbMSk9H8e4UneAKDR78';

// We'll use a placeholder domain (e.g., https://reliance-leaderboard.vercel.app)
// The user can replace this with their actual deployed domain.
const DOMAIN = 'https://reliance-leaderboard.vercel.app';

async function generateCSV() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/pocs?select=id,name,city,college&order=city.asc,name.asc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch POCs: ${response.statusText}`);
    }

    const pocs = await response.json();

    const headers = ['POC ID', 'Name', 'City', 'College', 'Registration Link'];
    const rows = pocs.map(poc => [
      `"${poc.id}"`,
      `"${poc.name.replace(/"/g, '""')}"`,
      `"${poc.city}"`,
      `"${poc.college.replace(/"/g, '""')}"`,
      `"${DOMAIN}/register?poc=${poc.id}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    fs.writeFileSync('pocs_registration_links.csv', csvContent);
    console.log(`Successfully generated pocs_registration_links.csv with ${pocs.length} rows.`);
  } catch (error) {
    console.error('Error generating CSV:', error);
  }
}

generateCSV();
