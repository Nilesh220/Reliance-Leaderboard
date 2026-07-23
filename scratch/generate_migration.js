import fs from 'fs';

const SUPABASE_URL = 'https://aebkutavunwlwzswuhbc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYmt1dGF2dW53bHd6c3d1aGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTAyNDksImV4cCI6MjA5NjQ4NjI0OX0.-tnBG6MDWB_WjHDJeeWCpiEwvbMSk9H8e4UneAKDR78';

// Allowed emails
const ALLOWED_EMAILS = [
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

// Explicit manual mapping overrides for cases that fuzzy matching missed/got wrong
const MANUAL_MAP = {
  'pun_15': 'bhoomis484@gmail.com', // Bhumikumari Singh
  'aur_03': 'vedt024@gmail.com',    // Ved Thakur
  'mum_13': 'arch25014@gmail.com',   // Archita Dakua
  'mum_17': 'architvishwakarma72@gmail.com', // Archit Santosh Vishwakarma
  'pun_08': 'ysumeet2004@gmail.com', // Sumeet Yadav
  'pun_11': 'yashjeetmakhija31@gmail.com', // Yashjeet K Makhija
  'pun_23': 'vedbatra05@gmail.com',  // Ved Yogesh Batra
  'poc_aishwarya_tiwari_1781515693': 'aish171105@gmail.com', // Aishwarya Tiwari
};

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

  let sql = `-- ===================================================\n`;
  sql += `-- Migration: Add Email Column to POCs and Seed Data\n`;
  sql += `-- ===================================================\n\n`;
  sql += `-- 1. Add email column to pocs table if it doesn't exist\n`;
  sql += `alter table pocs add column if not exists email text;\n\n`;
  sql += `-- 2. Populate email column for existing POCs\n`;

  const matchedIds = new Set();

  for (const poc of pocs) {
    let email = MANUAL_MAP[poc.id] || null;

    if (!email) {
      const pocNameNorm = normalize(poc.name);
      // Try to find matching email
      for (const e of ALLOWED_EMAILS) {
        const emailPrefix = e.split('@')[0];
        const emailPrefixNorm = normalize(emailPrefix);
        if (pocNameNorm.includes(emailPrefixNorm) || emailPrefixNorm.includes(pocNameNorm)) {
          email = e;
          break;
        }
      }
    }

    if (!email) {
      const tokens = poc.name.toLowerCase().split(/\s+/);
      for (const e of ALLOWED_EMAILS) {
        const emailPrefix = e.split('@')[0].toLowerCase();
        const tokenMatch = tokens.some(t => t.length > 3 && (emailPrefix.includes(t) || t.includes(emailPrefix)));
        if (tokenMatch) {
          email = e;
          break;
        }
      }
    }

    if (email) {
      sql += `update pocs set email = '${email}' where id = '${poc.id}';\n`;
      matchedIds.add(poc.id);
    } else {
      sql += `-- WARNING: No email found for POC '${poc.id}': ${poc.name}\n`;
    }
  }

  // 3. Add test POC Nilesh Vigor
  sql += `\n-- 3. Add Nilesh Vigor as a test POC\n`;
  sql += `insert into pocs (id, name, college, city, email, points) \n`;
  sql += `values ('nilesh_test', 'Nilesh Vigor', 'Vigor Launchpad', 'Mumbai', 'nilesh@vigorlaunchpad.com', 0)\n`;
  sql += `on conflict (id) do update set email = 'nilesh@vigorlaunchpad.com';\n`;

  fs.writeFileSync('C:\\Users\\LENOVO\\OneDrive\\Desktop\\Reliance Leaderboard\\supabase_add_emails.sql', sql);
  console.log('SQL migration generated at supabase_add_emails.sql');
}

main();
