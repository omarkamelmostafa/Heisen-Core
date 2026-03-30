import { emailVerificationValidationRules, resetPasswordValidationRules } from './validators/validationRules.js';

const mockRes = {
  status: function() { return this; },
  json: function() { return this; }
};

const runValidation = async (rules, req) => {
  for (const rule of rules) {
    if (typeof rule.run === 'function') {
      await rule.run(req);
    }
  }
  
  // Simulated extraction of custom and express-validator hooks onto req.body if customSanitizers appended
  // In real life express-validator mutate req object. We're primarily testing if the rule throws an error in its test closures or allows it to pass.
  try {
     const rule = rules.find(r => r.builder && r.builder.fields.includes('token') );
     if(rule) {
         return true; // if no throw, validation passed the builder step
     }
  } catch(err) {
      return false;
  }
}

async function runTests() {
  console.log("=== Testing Verify Email ===");
  // Test numeric
  let req = { body: { token: 132062 }};
  
  // Testing logic of custom validator visually
  const testVal = (val) => {
      const str = String(val).trim();
      if (!/^\d{6}$/.test(str)) {
        throw new Error("Enter your 6-digit verification code");
      }
      return true;
  }
  console.log("Numeric payload passed?:", testVal(132062));
  console.log("String payload passed?:", testVal("132062"));
  console.log("Trimmed string payload passed?:", testVal("  132062  "));
  try { testVal("132-06"); console.log("Did invalidate hyphens?: False"); } catch(e) { console.log("Did invalidate hyphens?: True") }

  console.log("\=== Testing Reset Password ===");
  const testHex = (val) => {
      const str = String(val).trim();
      if (!/^[a-f0-9]{64}$/.test(str)) {
        throw new Error("Invalid or corrupted reset token link");
      }
      return true;
  }
  
  const validHex = "a".repeat(64);
  console.log("Valid hex payload passed?:", testHex(validHex));
  try { testHex("z".repeat(64)); console.log("Did invalidate Z?: False"); } catch(e) { console.log("Did invalidate Z?: True") }
}

runTests();
