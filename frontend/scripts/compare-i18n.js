// d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\frontend\scripts\compare-i18n.js
// Script to compare en.json and ar.json for missing keys

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const en = JSON.parse(readFileSync(join(__dirname, '../messages/en.json'), 'utf8'));
const ar = JSON.parse(readFileSync(join(__dirname, '../messages/ar.json'), 'utf8'));

function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey));
    }
  }
  return keys;
}

const enKeys = new Set(getAllKeys(en));
const arKeys = new Set(getAllKeys(ar));

const missingInAr = [...enKeys].filter(k => !arKeys.has(k)).sort();
const missingInEn = [...arKeys].filter(k => !enKeys.has(k)).sort();

console.log('=== Keys missing in ar.json (present in en.json) ===');
if (missingInAr.length === 0) {
  console.log('None - all keys present!');
} else {
  missingInAr.forEach(k => console.log(`  - ${k}`));
  console.log(`\nTotal: ${missingInAr.length} keys missing`);
}

console.log('\n=== Keys missing in en.json (present in ar.json) ===');
if (missingInEn.length === 0) {
  console.log('None - all keys present!');
} else {
  missingInEn.forEach(k => console.log(`  - ${k}`));
  console.log(`\nTotal: ${missingInEn.length} keys missing`);
}

console.log('\n=== Summary ===');
console.log(`en.json has ${enKeys.size} keys`);
console.log(`ar.json has ${arKeys.size} keys`);
console.log(`Missing in ar.json: ${missingInAr.length}`);
console.log(`Missing in en.json: ${missingInEn.length}`);
