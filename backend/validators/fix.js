const fs = require('fs');

let content = fs.readFileSync('validationRules.js', 'utf8');
const originalContent = content;

// Fix 1
content = content.replace(
  /passwordRules\("newPassword"\)\s*\.custom\(\(password, \{ req \}\) => \{[\s\S]*?return true;\s*\}\),/,
  'passwordRules("newPassword"),'
);
console.log('Fix 1 replaces:', content !== originalContent);

// Fix 3
const sequentialReplacement = `.custom((password) => {
      const str = password.toLowerCase();
      for (let i = 0; i <= str.length - 4; i++) {
        const c1 = str.charCodeAt(i);
        const c2 = str.charCodeAt(i + 1);
        const c3 = str.charCodeAt(i + 2);
        const c4 = str.charCodeAt(i + 3);
        if (c2 - c1 === 1 && c3 - c2 === 1 && c4 - c3 === 1) {
          throw new Error(
            "Password contains sequential characters that are easy to guess"
          );
        }
      }
      return true;
    })`;
const content2 = content.replace(/\.custom\(\(password\) => \{\s*const sequential = \/\(abc.*?return true;\s*\}\)/s, sequentialReplacement);
console.log('Fix 3 replaces:', content2 !== content);
content = content2;

// Fix 4
const content3 = content.replace(
  /body\("confirmPassword"\)\s*\.notEmpty\(\)\s*\.withMessage\("Confirm password is required"\)\s*\.isString\(\)\s*\.withMessage\("Confirm password must be a string"\)\s*\.custom\(\(value, \{ req \}\) => \{\s*if \(value !== req\.body\.newPassword\) throw new Error\("New Passwords must match"\);\s*return true;\s*\}\),/s,
  `body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("New passwords must match");
      }
      return true;
    }),`
);

console.log('Fix 4 replaces:', content3 !== content);
content = content3;

const content4 = content.replace(/(\.notEmpty\(\)[\s]*\.withMessage\("[^"]+"\))(\s*\.)(is|matches|custom|normalizeEmail|toArray|customSanitizer)/g, '$1.bail()$2$3');
console.log('Fix 2a replaces:', content4 !== content);
content = content4;

const content5 = content.replace(/(\.isString\(\)[\s]*\.withMessage\("[^"]+"\))(\s*\.)(isLength|matches)/g, '$1.bail()$2$3');
console.log('Fix 2b replaces:', content5 !== content);
content = content5;

fs.writeFileSync('validationRules.js', content);
console.log('All completed');
