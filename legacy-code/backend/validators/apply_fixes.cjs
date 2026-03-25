const fs = require('fs');
let code = fs.readFileSync('validationRules.js', 'utf8');

// Fix 1: Remove Personal Info Check from updatePasswordValidationRules
code = code.replace(
  /passwordRules\("newPassword"\)\s*\.custom\(\(password, \{ req \}\) => \{\[\s\S\]*?return true;\s*\}\),/,
  'passwordRules("newPassword"),'
);

// Fix 3: Reduce Sequential Character Check Aggressiveness
code = code.replace(
  /\.custom\(\(password\) => \{\s*const sequential = \/\(abc\|bcd[\s\S]*?return true;\s*\}\)/,
  `.custom((password) => {
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
    })`
);

// Fix 4: Normalize confirmPassword Validators in updatePasswordValidationRules
code = code.replace(
  /body\("confirmPassword"\)\s*\.notEmpty\(\)\s*\.withMessage\("Confirm password is required"\)\s*\.isString\(\)\s*\.withMessage\("Confirm password must be a string"\)\s*\.custom\(\(value, \{ req \}\) => \{\s*if \(value !== req\.body\.newPassword\) throw new Error\("New Passwords must match"\);\s*return true;\s*\}\),/,
  `body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required").bail()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("New passwords must match");
      }
      return true;
    }),`
);

// Fix 2: Add .bail() After Existence Checks
code = code.replace(/(\.notEmpty\(\)\s*\.withMessage\(("[^"]+"|'[^']+'|`[^`]+`)\))(?=\s*\.)/g, '$1.bail()');
code = code.replace(/(\.isString\(\)\s*\.withMessage\(("[^"]+"|'[^']+'|`[^`]+`)\))(?=\s*\.(?:isLength|matches))/g, '$1.bail()');

fs.writeFileSync('validationRules.js', code, 'utf8');
console.log('Fixes applied successfully');
