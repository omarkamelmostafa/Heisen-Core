const fs = require('fs');
const path = require('path');

const ROOT = 'D:/DEV CLOUD/PROJECTS/myProjects/LEARNING_APPS/NEW-STARTER';
const BACKEND = path.join(ROOT, 'backend');

const activeFiles = fs.readFileSync('active_files.txt', 'utf8')
    .split('\n')
    .map(f => f.trim())
    .filter(f => f && !f.includes('.history'));

const importsRaw = fs.readFileSync('imports.txt', 'utf8')
    .split('\n');

const referencedFiles = new Set();

// Fixed Entry Points
[
    'app.js',
    'index.js',
    'run-validation-tests.js',
    'verify-endpoints.js',
    'vitest.config.js'
].forEach(f => {
    referencedFiles.add(path.join(BACKEND, f).toLowerCase());
});

const resolveModule = (importerPath, targetPath) => {
    if (!targetPath.startsWith('.')) return null;

    // Normalize importer path (it comes from imports.txt as backend\...)
    const fullImporter = path.resolve(ROOT, importerPath);
    const importerDir = path.dirname(fullImporter);
    
    let resolved = path.resolve(importerDir, targetPath);
    
    // Check for exact file, .js, or /index.js
    const extensions = ['', '.js', '/index.js'];
    for (const ext of extensions) {
        const p = resolved + ext;
        if (fs.existsSync(p) && fs.lstatSync(p).isFile()) {
            return path.normalize(p).toLowerCase();
        }
    }
    return null;
};

importsRaw.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    const file = line.substring(0, colonIndex).trim();
    const content = line.substring(colonIndex + 1);
    
    // Look for import/require paths
    const match = content.match(/from\s+['"](.*)['"]/) || content.match(/require\(['"](.*)['"]\)/);
    if (match) {
        const target = match[1];
        const resolved = resolveModule(file, target);
        if (resolved) {
            referencedFiles.add(resolved);
        }
    }
});

const orphans = activeFiles.filter(f => {
    const norm = path.resolve(ROOT, f).toLowerCase();
    return !referencedFiles.has(norm);
});

fs.writeFileSync('pass1_orphans.txt', orphans.join('\n'));
console.log(`Found ${orphans.length} potential orphans.`);
