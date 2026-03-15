const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync('audit-raw.json', 'utf8'));

let out = '# Frontend Architecture Validation Audit\n\n';

out += '## Step 1: Map Current File Tree\n\n';
raw.forEach(r => out += `- ${r.file}\n`);
out += '\n';

out += '## Step 2: Classify Every Component\n\n';
out += '| File | Has useDispatch? | Has useSelector? | Has API calls? | Has useRouter? | Has business logic? | Classification |\n';
out += '|------|-----------------|-----------------|----------------|---------------|--------------------|---------------|\n';

let totalComponents = 0;
let currentlyDumb = 0;
let currentlySmart = 0;
let filesToMoveCtr = 0;
let hooksToCreateCtr = 0;
let filesToCreateCtr = 0;

const components = raw.filter(r => r.classification !== 'NON-COMPONENT');
totalComponents = components.length;

const violations = [];
const missingHooks = [];
const fileMoves = [];

components.forEach(r => {
  const filename = path.basename(r.file);
  
  // Re-evaluating pages with Redux/API as SMART/Violations
  let cls = r.classification;
  let isViolation = false;
  let moveNeeds = "Extract logic to hook";
  let hookName = "useCustomHook";

  if (cls === 'PAGE') {
     if (r.hasUseDispatch === 'YES' || r.hasUseSelector === 'YES' || r.hasApi === 'YES' || r.hasUseRouter === 'YES' || r.hasBusinessLogic === 'YES') {
       isViolation = true;
       // Infer hook name
       if (r.file.includes('forgot-password')) hookName = 'useForgotPassword';
       else if (r.file.includes('reset-password')) hookName = 'useResetPassword';
       else if (r.file.includes('verify-email')) hookName = 'useVerifyEmail';
       else if (r.file.includes('login')) hookName = 'useLogin';
       else if (r.file.includes('signup')) hookName = 'useSignup';
       else if (r.file.includes('dashboard')) hookName = 'useDashboard';
     }
  } else if (cls === 'SMART') {
     isViolation = true;
     if (r.file.includes('auth-bootstrap')) hookName = 'useAuthBootstrap';
     else if (r.file.includes('auth-error-alert')) { hookName = null; moveNeeds = 'Pass error via props'; }
     else if (r.file.includes('protected-guard')) hookName = 'useAuthGuard';
     else if (r.file.includes('public-guard')) hookName = 'useAuthGuard';
     else if (r.file.includes('auth-layout-wrapper')) hookName = 'useAuthRouting';
  } else {
     currentlyDumb++;
  }

  if (isViolation) {
     currentlySmart++;
     let violationReasons = [];
     if (r.hasUseDispatch === 'YES') violationReasons.push('Redux dispatch in component');
     if (r.hasUseSelector === 'YES') violationReasons.push('Redux selector in component');
     if (r.hasApi === 'YES') violationReasons.push('API calls in component');
     if (r.hasUseRouter === 'YES') violationReasons.push('Routing logic in component');
     if (r.hasBusinessLogic === 'YES') violationReasons.push('Business logic in component');

     violations.push(`| ${filename} (${r.file}) | ${cls} | ${violationReasons.join(', ')} | ${moveNeeds} |`);

     if (hookName && !missingHooks.find(h => h.name === hookName)) {
        missingHooks.push({ name: hookName, from: [filename], logic: violationReasons.join(', ') });
     } else if (hookName) {
        let existing = missingHooks.find(h => h.name === hookName);
        if (!existing.from.includes(filename)) existing.from.push(filename);
     }
  }

  out += `| ${filename} | ${r.hasUseDispatch} | ${r.hasUseSelector} | ${r.hasApi} | ${r.hasUseRouter} | ${r.hasBusinessLogic} | ${cls} |\n`;
});

out += '\n## Step 3: Identify Violations\n\n';
out += '| File | Current Classification | Violation | What Needs To Move |\n';
out += '|------|----------------------|-----------|-------------------|\n';
violations.forEach(v => out += v + '\n');

out += '\n## Step 4: Identify Missing Hooks\n\n';
out += '| Hook Name | Logic To Extract From | What It Will Contain |\n';
out += '|-----------|----------------------|---------------------|\n';
missingHooks.forEach(h => {
  out += `| ${h.name} | ${h.from.join(', ')} | ${h.logic} |\n`;
  hooksToCreateCtr++;
});

out += '\n## Step 5: Propose File Moves\n\n';
out += '| Current Path | Target Path | Action |\n';
out += '|-------------|------------|--------|\n';

// Propose feature folder moves
raw.forEach(r => {
  let action = 'Move';
  let targetPath = r.file;
  let fileMovesLog = false;

  if (r.file.includes('components/auth/')) {
    targetPath = r.file.replace('components/auth/', 'features/auth/components/');
    fileMovesLog = true;
  }
  
  if (fileMovesLog) {
     out += `| ${r.file} | ${targetPath} | ${action} |\n`;
     filesToMoveCtr++;
  }
});

missingHooks.forEach(h => {
  let targetPath = `src/features/auth/hooks/${h.name}.js`;
  if (h.name.includes('Dashboard')) targetPath = `src/features/dashboard/hooks/${h.name}.js`;
  
  out += `| (new file) | ${targetPath} | Create |\n`;
  filesToCreateCtr++;
});

out += '\n### Summary\n';
out += `- Total components: ${totalComponents}\n`;
out += `- Currently DUMB: ${currentlyDumb}\n`;
out += `- Currently SMART (need refactoring): ${currentlySmart}\n`;
out += `- Hooks to create: ${hooksToCreateCtr}\n`;
out += `- Files to move: ${filesToMoveCtr}\n`;
out += `- Files to create: ${filesToCreateCtr}\n`;

fs.writeFileSync('audit-report.md', out);
