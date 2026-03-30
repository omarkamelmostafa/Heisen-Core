const fs = require('fs');
const path = require('path');

const ROOT = 'D:/DEV CLOUD/PROJECTS/myProjects/LEARNING_APPS/NEW-STARTER';
const BACKEND = path.join(ROOT, 'backend');

const activeFiles = fs.readFileSync('active_files.txt', 'utf8')
    .split('\n')
    .map(f => f.trim())
    .filter(f => f && !f.includes('.history'));

const importsRaw = fs.readFileSync('imports.txt', 'utf8');

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

// Regex to find all import/require paths in the entire file
// We'll search for patterns that looks like from "..." or require("...")
// and we'll collect ALL matches and their corresponding files.

const lines = importsRaw.split('\n');
let currentFile = '';

lines.forEach(line => {
    const colonMatch = line.match(/^([^:]+):(\d+):(.*)$/);
    if (colonMatch) {
        currentFile = colonMatch[1].trim();
        const content = colonMatch[3];
        processContent(currentFile, content);
    } else if (currentFile) {
        // Multi-line content
        processContent(currentFile, line);
    }
});

function processContent(importerPath, content) {
    const matches = content.matchAll(/(?:from|import|require)\s*\(?\s*['"]([^'"]+)['"]/g);
    for (const match of matches) {
        const target = match[1];
        if (target.startsWith('.')) {
            const resolved = resolveModule(importerPath, target);
            if (resolved) {
                referencedFiles.add(resolved);
            }
        }
    }
}

function resolveModule(importerPath, targetPath) {
    const fullImporter = path.resolve(ROOT, importerPath);
    const importerDir = path.dirname(fullImporter);
    let resolved = path.resolve(importerDir, targetPath);
    
    const candidates = [
        resolved,
        resolved + '.js',
        path.join(resolved, 'index.js')
    ];
    
    for (const p of candidates) {
        if (fs.existsSync(p) && fs.lstatSync(p).isFile()) {
            return path.normalize(p).toLowerCase();
        }
    }
    return null;
}

const orphans = activeFiles.filter(f => {
    const norm = path.resolve(ROOT, f).toLowerCase();
    return !referencedFiles.has(norm);
});

fs.writeFileSync('pass1_orphans.txt', orphans.join('\n'));
console.log(`Found ${referencedFiles.size} referenced files.`);
console.log(`Found ${orphans.length} potential orphans.`);
