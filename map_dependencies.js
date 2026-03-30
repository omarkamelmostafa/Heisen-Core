const fs = require('fs');
const path = require('path');

const ROOT = 'D:/DEV CLOUD/PROJECTS/myProjects/LEARNING_APPS/NEW-STARTER';
const BACKEND = path.join(ROOT, 'backend');

const activeFiles = fs.readFileSync('active_files.txt', 'utf8')
    .split('\n')
    .map(f => f.trim())
    .filter(f => f && !f.includes('.history'));

const dependencyMap = {};
const referencedFiles = new Set();

// 1. Add Entry Points & Config
[
    'backend/app.js',
    'backend/index.js',
    'backend/run-validation-tests.js',
    'backend/verify-endpoints.js',
    'backend/vitest.config.js'
].forEach(f => referencedFiles.add(path.resolve(ROOT, f).toLowerCase()));

// 2. Add Test Files (Implicitly alive)
activeFiles.forEach(f => {
    const lower = f.toLowerCase();
    if (lower.includes('__tests__') || lower.endsWith('.test.js') || lower.endsWith('setup.js')) {
        referencedFiles.add(path.resolve(ROOT, f).toLowerCase());
    }
});

// 3. Add Swagger Path Files (Globbed in swagger/index.js)
activeFiles.forEach(f => {
    if (f.toLowerCase().includes('docs/swagger/paths')) {
        referencedFiles.add(path.resolve(ROOT, f).toLowerCase());
    }
});

// 4. Map Explicit Imports
activeFiles.forEach(file => {
    const fullPath = path.resolve(ROOT, file);
    if (!fs.existsSync(fullPath)) return;
    const content = fs.readFileSync(fullPath, 'utf8');
    const imports = [];
    const importRegex = /import\s+(?:(?:\*|[\w\s{},]*)\s+from\s+)?['"]([^'"]+)['"]/g;
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    const exportFromRegex = /export\s+.*\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) imports.push(match[1]);
    while ((match = requireRegex.exec(content)) !== null) imports.push(match[1]);
    while ((match = exportFromRegex.exec(content)) !== null) imports.push(match[1]);
    
    imports.forEach(target => {
        const resolved = resolveModule(file, target);
        if (resolved) referencedFiles.add(resolved);
    });
});

function resolveModule(importerPath, targetPath) {
    if (!targetPath.startsWith('.')) return null;
    const fullImporter = path.resolve(ROOT, importerPath);
    const importerDir = path.dirname(fullImporter);
    let resolved = path.resolve(importerDir, targetPath);
    const candidates = [resolved, resolved + '.js', path.join(resolved, 'index.js')];
    for (const p of candidates) {
        if (fs.existsSync(p) && fs.lstatSync(p).isFile()) {
            return path.resolve(ROOT, p).toLowerCase();
        }
    }
    return null;
}

const orphans = activeFiles.filter(f => {
    const full = path.resolve(ROOT, f).toLowerCase();
    return !referencedFiles.has(full);
});

fs.writeFileSync('pass1_orphans.txt', orphans.join('\n'));
console.log(`Scanned ${activeFiles.length} files.`);
console.log(`Found ${referencedFiles.size} reachable files.`);
console.log(`Found ${orphans.length} potential orphans.`);
if (orphans.length > 0) {
    console.log(`Orphans:\n${orphans.join('\n')}`);
}
