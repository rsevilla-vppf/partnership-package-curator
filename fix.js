const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\${/g, '${');
fs.writeFileSync('src/app/page.tsx', content);
