import fs from 'fs';
import path from 'path';

const activeFiles = fs.readFileSync('active_files.txt', 'utf8')
    .split('\n')
    .map(f => f.trim())
    .filter(f => f && !f.includes('.history'));

const importsRaw = fs.readFileSync('imports.txt', 'utf8')
    .split('\n')
    .filter(line => line.includes(':import') || line.includes(':require'));

const referencedFiles = new Set();

// Entry points are always alive
referencedFiles.add(path.normalize('D:/DEV CLOUD/PROJECTS/myProjects/LEARNING_APPS/NEW-STARTER/backend/index.js').toLowerCase());
referencedFiles.add(path.normalize('D:/DEV CLOUD/PROJECTS/myProjects/LEARNING_APPS/NEW-STARTER/backend/app.js').toLowerCase());
referencedFiles.add(path.normalize('D:/DEV CLOUD/PROJECTS/myProjects/LEARNING_APPS/NEW-STARTER/backend/run-validation-tests.js').toLowerCase());
referencedFiles.add(path.normalize('D:/DEV CLOUD/PROJECTS/myProjects/LEARNING_APPS/NEW-STARTER/backend/verify-endpoints.js').toLowerCase());
referencedFiles.add(path.normalize('D:/DEV CLOUD/PROJECTS/myProjects/LEARNING_APPS/NEW-STARTER/backend/vitest.config.js').toLowerCase());

const resolvePath = (importerPath, targetPath) => {
    if (!targetPath.startsWith('.')) return null; // Likely a node_module
    
    const importerDir = path.dirname(path.join('D:/DEV CLOUD/PROJECTS/myProjects/LEARNING_APPS/NEW-STARTER', importerPath));
    let resolved = path.resolve(importerDir, targetPath);
    
    if (!resolved.endsWith('.js')) {
        // Try .js or /index.js
        if (fs.existsSync(resolved + '.js')) resolved += '.js';
        else if (fs.existsSync(path.join(resolved, 'index.js'))) resolved = path.join(resolved, 'index.js');
    }
    
    return path.normalize(resolved).toLowerCase();
};

importsRaw.forEach(line => {
    const parts = line.split(':');
    if (parts.length < 3) return;
    
    const importer = parts[0].trim();
    const content = parts.slice(2).join(':');
    
    // Regex for import from "..." or require("...")
    const match = content.match(/from\s+['"](.*)['"]/) || content.match(/require\(['"](.*)['"]\)/);
    if (match) {
        const target = match[1];
        const resolved = resolvePath(importer, target);
        if (resolved) {
            referencedFiles.add(resolved);
        }
    }
});

const orphans = activeFiles.filter(f => {
    const norm = path.normalize(f).toLowerCase();
    return !referencedFiles.has(norm);
});

console.log('--- REFRENCED FILES ---');
// referencedFiles.forEach(f => console.log(f));

console.log('\n--- ORPHANED FILES ---');
orphans.forEach(f => console.log(f));
