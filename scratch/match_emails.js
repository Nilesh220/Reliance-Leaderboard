import fs from 'fs';

const SUPABASE_URL = 'https://aebkutavunwlwzswuhbc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYmt1dGF2dW53bHd6c3d1aGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTAyNDksImV4cCI6MjA5NjQ4NjI0OX0.-tnBG6MDWB_WjHDJeeWCpiEwvbMSk9H8e4UneAKDR78';

// List of emails from send-otp.js
const ALLOWED_EMAILS = [
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
];

// Normalize name for matching
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pocs`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  const pocs = await res.json();

  console.log(`Loaded ${pocs.length} POCs from database.`);

  const mappings = [];
  const unmatchedPocs = [];
  const matchedEmails = new Set();

  for (const poc of pocs) {
    const pocNameNorm = normalize(poc.name);
    let matchedEmail = null;

    // First try: exact match of names/initials
    for (const email of ALLOWED_EMAILS) {
      const emailPrefix = email.split('@')[0];
      const emailPrefixNorm = normalize(emailPrefix);
      
      // If email prefix contains parts of the name
      if (pocNameNorm.includes(emailPrefixNorm) || emailPrefixNorm.includes(pocNameNorm)) {
        matchedEmail = email;
        break;
      }
    }

    // Second try: match individual name tokens (e.g. "shaikh" in "shaikhalshifa220")
    if (!matchedEmail) {
      const tokens = poc.name.toLowerCase().split(/\s+/);
      for (const email of ALLOWED_EMAILS) {
        const emailPrefix = email.split('@')[0].toLowerCase();
        // Check if any token of length > 3 matches the email prefix
        const tokenMatch = tokens.some(t => t.length > 3 && (emailPrefix.includes(t) || t.includes(emailPrefix)));
        if (tokenMatch) {
          matchedEmail = email;
          break;
        }
      }
    }

    if (matchedEmail) {
      mappings.push({ id: poc.id, name: poc.name, email: matchedEmail });
      matchedEmails.add(matchedEmail);
    } else {
      unmatchedPocs.push(poc);
    }
  }

  console.log(`Matched ${mappings.length} POCs.`);
  console.log(`Unmatched POCs count: ${unmatchedPocs.length}`);
  
  if (unmatchedPocs.length > 0) {
    console.log('Unmatched POCs list:');
    unmatchedPocs.forEach(p => console.log(`- ${p.id}: ${p.name} (${p.college}, ${p.city})`));
  }

  // List unmatched emails
  const unmatchedEmails = ALLOWED_EMAILS.filter(e => !matchedEmails.has(e) && !e.includes('vigorlaunchpad.com'));
  console.log(`Unmatched emails count: ${unmatchedEmails.length}`);
  if (unmatchedEmails.length > 0) {
    console.log('Unmatched emails list:');
    unmatchedEmails.forEach(e => console.log(`- ${e}`));
  }
}

main();
