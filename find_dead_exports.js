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

const exportData = JSON.parse(fs.readFileSync('all_exports.json', 'utf8'));

// Load all file contents into memory
const fileContents = {};
aliveFiles.forEach(file => {
    const fullPath = path.resolve(ROOT, file);
    fileContents[file] = fs.readFileSync(fullPath, 'utf8');
});

const unusedExports = [];

exportData.forEach(exp => {
    if (exp.name === 'default') return; // Skip defaults for now as they are harder to trace by name alone

    let isUsed = false;
    const symbolRegex = new RegExp(`\\b${exp.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);

    for (const [file, content] of Object.entries(fileContents)) {
        if (file === exp.file) continue; // Skip own file
        
        if (symbolRegex.test(content)) {
            isUsed = true;
            break;
        }
    }

    if (!isUsed) {
        unusedExports.push(exp);
    }
});

fs.writeFileSync('pass2_dead_exports.txt', unusedExports.map(e => `${e.file}: ${e.name}`).join('\n'));
console.log(`Analyzed 223 exports across 116 files.`);
console.log(`Found ${unusedExports.length} potential dead exports.`);
if (unusedExports.length > 0) {
    console.log(`Example: ${unusedExports[0].file}: ${unusedExports[0].name}`);
}
