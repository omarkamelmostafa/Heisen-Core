---
name: code-review
description: '**WORKFLOW SKILL** — Perform a staff-level code review on heisen-core codebase sections. Produces a structured report with issues, risks, improvements, and actionable recommendations. USE FOR: reviewing PRs in backend (Node.js/Express/MongoDB), frontend (Next.js/React), auth, database, APIs. INVOKES: file reading tools, semantic search, grep for patterns, subagents for deep analysis.'
---

# Code Review Skill for Heisen-Core

## Workflow Steps

1. **Deep Codebase Understanding**
   - Read the provided code sections and map the flow end-to-end in the full-stack context (backend API, frontend UI, database interactions).
   - Inspect relevant files: controllers, services, models, components, hooks, validators, tests.
   - Understand the architecture: auth system, database schema, API contracts, frontend state management.

2. **Issue Identification**
   - Identify bugs, edge cases, hidden risks in Node.js backend, MongoDB queries, Next.js frontend.
   - Check for correctness, scalability, maintainability, clarity.
   - Evaluate separation of concerns: business logic isolated from UI/transport, database indexes, query efficiency.
   - Look for coupling, leaks, duplication, overly complex flows in auth, user management, cloudinary integration.

3. **Quality Assessment**
   - Assess code modularity, readability, reusability across backend services and frontend components.
   - Verify error handling, input validation, security (e.g., JWT auth, CORS).
   - Review naming conventions, folder structure, documentation in docs/ and API audits.
   - Check test coverage in vitest configs, integration tests.

4. **Improvement Recommendations**
   - Suggest clean, minimal changes for production-grade backend/frontend.
   - Propose refactors to reduce risk in database operations or API design.
   - Recommend adding/updating tests for changed behavior.
   - Consider performance optimizations in MongoDB queries or frontend rendering.

5. **Risk and Tradeoff Analysis**
   - Call out assumptions, risks in multi-tenant auth or cloud storage.
   - State tradeoffs clearly and pick the best option.
   - Ensure backward compatibility unless change is intended.

6. **Structured Report Generation**
   - Produce a report with:
     - Summary of findings
     - Critical issues (blockers)
     - Major improvements
     - Minor suggestions
     - Actionable next steps
   - Include code examples for fixes where helpful.

## Output Format

**Code Review Report for Heisen-Core**

- **Overall Assessment**: [High-level summary]
- **Critical Issues**: [List with severity, location (e.g., backend/controllers/auth/), description, fix suggestion]
- **Architecture Concerns**: [System-level issues, e.g., database normalization, API versioning]
- **Code Quality**: [Readability, maintainability notes]
- **Security/Performance**: [Findings in auth, MongoDB, frontend]
- **Testing Gaps**: [Missing unit/integration tests]
- **Recommendations**: [Prioritized action items]

## Usage Examples

- "/code-review on this backend auth controller"
- "/code-review the frontend login component"
- "/code-review database schema changes"