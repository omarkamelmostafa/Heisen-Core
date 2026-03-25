const fs = require('fs');

let code = fs.readFileSync('validationRules.js', 'utf8');

// 1. Add import
code = code.replace(
  'import { body, param, query } from "express-validator";',
  'import { body, param, query } from "express-validator";\nimport disposableDomains from "disposable-email-domains" with { type: "json" };'
);

// 2. Remove hardcoded disposableDomains array
code = code.replace(
  /\/\/ Disposable email domains list\s*const disposableDomains = \[\s*(?:"[^"]+",?\s*)*\];/g,
  ''
);

// 3. Insert emailRules helper just before passwordRules
const emailRulesCode = `
const emailRules = ({ checkDisposable = false } = {}) => {
  const chain = body("email")
    .notEmpty()
    .withMessage("Email is required").bail()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage("Email must be no more than 254 characters long");

  if (checkDisposable) {
    chain.custom((email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      if (domain && disposableDomains.includes(domain)) {
        throw new Error(
          "Disposable email addresses are not allowed. Please use a permanent email address."
        );
      }
      return true;
    });
  }

  return chain;
};

const passwordRules`;

code = code.replace('const passwordRules', emailRulesCode);

// 4. Replace in register
code = code.replace(
  /body\("email"\)\s*\.notEmpty\(\)\s*\.withMessage\("Email is required"\)\.bail\(\)\s*\.isEmail\(\)\s*\.withMessage\("Please provide a valid email address"\)\s*\.normalizeEmail\(\)\s*\.isLength\(\{ max: 254 \}\)\s*\.withMessage\("Email must be no more than 254 characters long"\)\s*\.custom\(\(email\) => \{\[\s\S\]*?return true;\s*\}\),/,
  'emailRules({ checkDisposable: true }),'
);

// 5. Replace in updateProfile (essentially identical block to register)
code = code.replace(
  /body\("email"\)\s*\.notEmpty\(\)\s*\.withMessage\("Email is required"\)\.bail\(\)\s*\.isEmail\(\)\s*\.withMessage\("Please provide a valid email address"\)\s*\.normalizeEmail\(\)\s*\.isLength\(\{ max: 254 \}\)\s*\.withMessage\("Email must be no more than 254 characters long"\)\s*\.custom\(\(email\) => \{\[\s\S\]*?return true;\s*\}\),/,
  'emailRules({ checkDisposable: true }),'
);

// 6. Replace in login
code = code.replace(
  /body\("email"\)\s*\.notEmpty\(\)\s*\.withMessage\("Email is required"\)\.bail\(\)\s*\.isEmail\(\)\s*\.withMessage\("Please provide a valid email address"\)\s*\.normalizeEmail\(\)\s*\.isLength\(\{ max: 254 \}\)\s*\.withMessage\("Email must be no more than 254 characters long"\),/,
  'emailRules(),'
);

// 7. Replace in forgotPassword (this one has a comma after it in the array)
code = code.replace(
  /body\("email"\)\s*\.notEmpty\(\)\s*\.withMessage\("Email is required"\)\.bail\(\)\s*\.isEmail\(\)\s*\.withMessage\("Please provide a valid email address"\)\s*\.normalizeEmail\(\)\s*\.isLength\(\{ max: 254 \}\)\s*\.withMessage\("Email must be no more than 254 characters long"\),/,
  'emailRules(),'
);

fs.writeFileSync('validationRules.js', code, 'utf8');
console.log('Successfully completed email rules replacements');
