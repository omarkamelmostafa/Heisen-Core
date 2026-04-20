---
name: debugging
description: '**WORKFLOW SKILL** — Debug runtime errors or failures in heisen-core. Produces root cause analysis, minimal fix, verification steps, and risk assessment. USE FOR: fixing bugs in backend (Node.js/Express), frontend (Next.js), database (MongoDB), auth, cloudinary. INVOKES: file reading, error logs, test running, subagents for analysis.'
---

# Debugging Skill for Heisen-Core

## Workflow Steps

1. **Reproduce the Issue**
   - Gather error details from logs in backend/logs/, frontend console, or MongoDB.
   - Reproduce in development environment using vitest or manual testing.

2. **Root Cause Analysis**
   - Inspect relevant code: backend routes, services, models; frontend components, hooks.
   - Map the flow: auth flow, user registration, file uploads.
   - Identify exact failure point, check assumptions in database queries, API calls, state management.

3. **Minimal Fix Design**
   - Determine smallest safe fix for Node.js backend or Next.js frontend.
   - Ensure correctness, scalability, maintainability.

4. **Implementation**
   - Apply the fix cleanly, preserving heisen-core conventions.

5. **Testing and Verification**
   - Add/update tests in backend/__tests__/ or frontend vitest.
   - Verify against edge cases, regressions in auth or database.

6. **Risk Assessment**
   - Call out remaining risks in multi-user system or cloud integrations.

## Output Format

**Debug Report for Heisen-Core**

- **Issue Summary**: [Description, e.g., login failure]
- **Root Cause**: [Analysis, e.g., JWT validation bug in backend]
- **Fix Applied**: [Code changes in specific files]
- **Tests Added**: [Details, e.g., integration test for auth]
- **Verification**: [Steps taken, e.g., ran tests, manual login]
- **Risks**: [Any remaining concerns, e.g., edge case in password reset]

## Usage Examples

- "/debugging this backend auth error"
- "/debugging frontend login component failure"
- "/debugging MongoDB connection issue"