const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../audit-imports.json'), 'utf8'));

const uniqueFiles = new Set(data.map(d => d.file));
const totalFilesWithImports = uniqueFiles.size;
const totalImportsToUpdate = data.length;

let md = `## Output

### Summary
- Total files to move: 63
- Total files with imports to update: ${totalFilesWithImports}
- Total imports to update: ${totalImportsToUpdate}

### Import Change List
| File | Current Import | New Import |
|------|----------------|------------|
`;

data.forEach(item => {
  // Extract just the import line content and create the new one
  const currentImport = item.content.replace(/^\/\/\s*/, ''); // Remove leading comment slashes if any for the table cleanly, or keep them? The prompt asks for Current Import, it's better to just show the line.
  const newImport = currentImport.replace('@/components/auth/', '@/features/auth/components/');
  md += `| ${item.file} | \`${currentImport}\` | \`${newImport}\` |\n`;
});

fs.writeFileSync('C:\\Users\\Walter White\\.gemini\\antigravity\\brain\\0200bff9-3fbd-4c2b-84a5-9a4f6791b6b0\\import-audit.md', md);
console.log('Markdown generated.');
