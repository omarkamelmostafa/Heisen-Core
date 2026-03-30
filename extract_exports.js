const fs = require('fs');
const path = require('path');

const ROOT = 'D:/DEV CLOUD/PROJECTS/myProjects/LEARNING_APPS/NEW-STARTER';
const activeFiles = fs.readFileSync('active_files.txt', 'utf8')
    .split('\n')
    .map(f => f.trim())
    .filter(f => f && !f.includes('.history'));

const orphans = fs.existsSync('pass1_orphans.txt') 
    ? fs.readFileSync('pass1_orphans.txt', 'utf8').split('\n').map(f => path.resolve(ROOT, f).toLowerCase())
    : [];

const aliveFiles = activeFiles.filter(f => !orphans.includes(path.resolve(ROOT, f).toLowerCase()));

const exportData = [];

// Regex for ESM exports
const esmExportRegex = /^export\s+(?:const|let|var|function|class|async\s+function)\s+([a-zA-Z0-9_$]+)/gm;
const esmDefaultExportRegex = /^export\s+default\s+(?:(?:const|let|var|function|class|async\s+function)\s+)?([a-zA-Z0-9_$]+)?/gm;
const esmNamedExportRegex = /^export\s+\{\s*([^}]+)\s*\}/gm;

// Regex for CJS exports (simplified)
const cjsModuleExportRegex = /module\.exports\s*=\s*(?:\{([^}]*)\}|([a-zA-Z0-9_$]+))/g;

aliveFiles.forEach(file => {
    const fullPath = path.resolve(ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    let match;
    const symbols = [];

    // ESM Named
    while ((match = esmExportRegex.exec(content)) !== null) symbols.push({ name: match[1], file, type: 'named' });
    
    // ESM { a, b as c }
    while ((match = esmNamedExportRegex.exec(content)) !== null) {
        match[1].split(',').forEach(s => {
            const parts = s.trim().split(/\s+as\s+/);
            const name = parts[parts.length - 1].trim();
            if (name) symbols.push({ name, file, type: 're-export' });
        });
    }

    // Default
    while ((match = esmDefaultExportRegex.exec(content)) !== null) {
        const name = match[1] || 'default';
        symbols.push({ name, file, type: 'default' });
    }

    // CJS
    while ((match = cjsModuleExportRegex.exec(content)) !== null) {
        if (match[1]) {
            match[1].split(',').forEach(s => {
                const name = s.split(':')[0].trim();
                if (name) symbols.push({ name, file, type: 'cjs-member' });
            });
        } else if (match[2]) {
             symbols.push({ name: match[2], file, type: 'cjs-default' });
        }
    }

    exportData.push(...symbols);
});

fs.writeFileSync('all_exports.json', JSON.stringify(exportData, null, 2));
console.log(`Extracted ${exportData.length} export symbols from ${aliveFiles.length} files.`);
