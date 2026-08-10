const fs = require('fs');
const file = 'walkin_poc_links.csv';
const newFile = 'walkin_poc_links_updated.csv';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/reliance-leaderboard\.vercel\.app/g, 'reliancedigital.vigorspace.co');
fs.writeFileSync(newFile, content);
console.log('Domain updated successfully in ' + newFile);
