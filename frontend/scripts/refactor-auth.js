const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const componentsAuthDir = path.join(srcDir, 'components/auth');
const targetAuthDir = path.join(srcDir, 'features/auth/components');

// 1. Move files
const movedFiles = [];

function moveDirectory(src, dest, relativePath = '') {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const relPath = path.posix.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      moveDirectory(srcPath, destPath, relPath);
    } else {
      fs.renameSync(srcPath, destPath);
      movedFiles.push({
        from: `src/components/auth/${relPath}`,
        to: `src/features/auth/components/${relPath}`
      });
    }
  }
}

if (fs.existsSync(componentsAuthDir)) {
  moveDirectory(componentsAuthDir, targetAuthDir);
}

// 2. Update imports
const updatedImports = [];

function updateImportsInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    // Ignore non-src directories just in case
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;

    if (entry.isDirectory()) {
      updateImportsInDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const relPath = fullPath.replace(srcDir, 'src').replace(/\\/g, '/');
      let changed = false;
      const lines = content.split('\n');
      const newLines = lines.map(line => {
        // Only replace exact matches, preserving indentation
        if (line.includes('@/components/auth/')) {
          const newLine = line.replace(/@\/components\/auth\//g, '@/features/auth/components/');
          const oldImportClean = line.trim();
          const newImportClean = newLine.trim();
          // avoid duplicates if multiple per line (though rare for imports)
          if (!updatedImports.find(u => u.file === relPath && u.old === oldImportClean)) {
            updatedImports.push({
              file: relPath,
              old: oldImportClean,
              new: newImportClean
            });
          }
          changed = true;
          return newLine;
        }
        return line;
      });

      if (changed) {
        fs.writeFileSync(fullPath, newLines.join('\n'), 'utf8');
      }
    }
  }
}

updateImportsInDir(srcDir);

// Check if any old imports remain
let remainingCount = 0;
function checkRemaining(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    if (entry.isDirectory()) {
      checkRemaining(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@/components/auth/')) {
        remainingCount++;
      }
    }
  }
}
checkRemaining(srcDir);

// Clean up empty directory
try {
  fs.rmdirSync(componentsAuthDir, { recursive: true });
} catch (e) {
  try {
    fs.rmSync(componentsAuthDir, { recursive: true, force: true });
  } catch (err) {
    // Ignore
  }
}

const isCleaned = !fs.existsSync(componentsAuthDir);

// Check relative imports with '..'. 
// We generally assume they work as we moved the whole tree intact, but we'll flag any issues in build check.

// Generate Report
let md = `## Output

### Files Moved
| # | From | To |
|---|------|-----|
`;

movedFiles.forEach((m, i) => {
  md += `| ${i + 1} | ${m.from} | ${m.to} |\n`;
});

md += `\n### Imports Updated
| # | File Modified | Old Import Path | New Import Path |
|---|--------------|-----------------|-----------------|
`;

updatedImports.forEach((u, i) => {
  md += `| ${i + 1} | ${u.file} | \`${u.old.replace(/`/g, '\\`')}\` | \`${u.new.replace(/`/g, '\\`')}\` |\n`;
});

md += `\n### Remaining References Check
- References to @/components/auth/ found: ${remainingCount} (expected 0)

### Cleanup
- src/components/auth/ directory removed: ${isCleaned ? 'YES' : 'NO'}
`;

fs.writeFileSync('C:\\Users\\Walter White\\.gemini\\antigravity\\brain\\0200bff9-3fbd-4c2b-84a5-9a4f6791b6b0\\refactor-results.md', md);
console.log('Refactoring complete.');
