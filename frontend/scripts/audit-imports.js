const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const results = [];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.includes('@/components/auth/')) {
          results.push({
            file: filePath.replace(srcDir, 'src').replace(/\\/g, '/'),
            line: i + 1,
            content: line.trim()
          });
        }
      });
    }
  }
}

walk(srcDir);
fs.writeFileSync(path.join(__dirname, '../audit-imports.json'), JSON.stringify(results, null, 2));
console.log(`Found ${results.length} imports.`);
