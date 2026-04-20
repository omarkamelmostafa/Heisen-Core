---
name: refactoring
description: '**WORKFLOW SKILL** — Plan and execute safe refactors in heisen-core. Produces refactor plan with before/after diffs, impact analysis, and implementation steps. USE FOR: improving code structure in backend services, frontend components, database models, auth logic. INVOKES: code analysis tools, diff generation, test validation.'
---

# Refactoring Skill for Heisen-Core

## Workflow Steps

1. **Identify Refactor Opportunity**
   - Analyze code for duplication in backend utilities, frontend hooks; complexity in auth flows or database schemas.

2. **Plan the Refactor**
   - Design safe changes, e.g., extracting services, normalizing database.
   - Assess impact on tests, APIs, users in the full-stack app.

3. **Implement Safely**
   - Apply changes incrementally in backend/ or frontend/.
   - Run vitest at each step.

4. **Verify and Document**
   - Ensure no regressions in auth or user management.
   - Update docs/ if needed.

## Output Format

**Refactor Report for Heisen-Core**

- **Opportunity**: [Why refactor, e.g., duplicate validation in auth]
- **Plan**: [Steps, e.g., extract to shared validator]
- **Changes**: [Diffs in specific files]
- **Impact**: [Risks, benefits, e.g., improves maintainability]
- **Verification**: [Tests passed, e.g., all integration tests]

## Usage Examples

- "/refactoring duplicate code in backend auth"
- "/refactoring complex frontend component"
- "/refactoring database schema normalization"