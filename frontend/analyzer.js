// frontend/analyzer.js
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles.filter(f => f.endsWith('.jsx') || f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.tsx'));
}

const files = getAllFiles(srcDir);

const results = [];

files.forEach(file => {
  const relPath = path.relative(__dirname, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf-8');
  
  const hasUseDispatch = /useDispatch|useAppDispatch/.test(content);
  const hasUseSelector = /useSelector|useAppSelector/.test(content);
  const hasApi = /axios|api\.|fetch\(/.test(content);
  const hasUseRouter = /useRouter|usePathname|useSearchParams/.test(content);
  const hasBusinessLogic = /useEffect|useState.*\[.*\]/i.test(content) && (hasUseDispatch || hasUseSelector || hasApi || hasUseRouter);
  
  let classification = 'DUMB';
  if (relPath.startsWith('src/app/') && (relPath.endsWith('page.jsx') || relPath.endsWith('layout.jsx') || relPath.endsWith('loading.jsx') || relPath.endsWith('error.jsx'))) {
    classification = 'PAGE';
  } else if (hasUseDispatch || hasUseSelector || hasApi || hasUseRouter || hasBusinessLogic) {
    classification = 'SMART';
  }

  // If it's pure hook/service/config, we don't classify it as a component
  if (!relPath.endsWith('.jsx') && !relPath.endsWith('.tsx') && !content.includes('from \'react\'') && !content.includes('jsx')) {
     classification = 'NON-COMPONENT';
  }

  results.push({
    file: relPath,
    hasUseDispatch: hasUseDispatch ? 'YES' : 'NO',
    hasUseSelector: hasUseSelector ? 'YES' : 'NO',
    hasApi: hasApi ? 'YES' : 'NO',
    hasUseRouter: hasUseRouter ? 'YES' : 'NO',
    hasBusinessLogic: hasBusinessLogic ? 'YES' : 'NO', // approximated
    classification
  });
});

console.log("### Step 1: Map Current File Tree");
results.forEach(r => console.log(`- ${r.file}`));

console.log("\n### Step 2: Classify Every Component\n");
console.log("| File | Has useDispatch? | Has useSelector? | Has API calls? | Has useRouter? | Has business logic? | Classification |");
console.log("|------|-----------------|-----------------|----------------|---------------|--------------------|---------------|");
results.forEach(r => {
  if (r.classification !== 'NON-COMPONENT') {
    const filename = path.basename(r.file);
    console.log(`| ${filename} (${r.file.split('src/')[1]}) | ${r.hasUseDispatch} | ${r.hasUseSelector} | ${r.hasApi} | ${r.hasUseRouter} | ${r.hasBusinessLogic} | ${r.classification} |`);
  }
});

console.log("\n### Step 3: Identify Violations\n");
console.log("| File | Current Classification | Violation | What Needs To Move |");
console.log("|------|----------------------|-----------|-------------------|");
const violations = [];
results.forEach(r => {
  if (r.classification === 'SMART' && !r.file.includes('hooks/')) {
    const filename = path.basename(r.file);
    let violation = [];
    if (r.hasUseDispatch === 'YES') violation.push('Redux dispatch in component');
    if (r.hasUseSelector === 'YES') violation.push('Redux selector in component');
    if (r.hasApi === 'YES') violation.push('API calls in component');
    if (r.hasUseRouter === 'YES') violation.push('Routing logic in component');
    
    console.log(`| ${filename} | ${r.classification} | ${violation.join(', ')} | Extract to custom hook |`);
    violations.push(r);
  }
});

// Hooks and Move suggestions can be manually written or inferred
fs.writeFileSync('audit-raw.json', JSON.stringify(results, null, 2));
