---
description: Create a custom validation report for the current feature based on spec.md, plan.md, tasks.md, and the project constitution.
---

# Validation Report: [FEATURE NAME]

**Date**: [ISO 8601 timestamp]
**QA Run**: [N] (1st | 2nd | 3rd+)
**Verdict**: PASS | REJECT
**Constitution Version**: [from constitution.md version line]
**Test Framework**: NONE — manual scenario verification only

<!-- 
  ============================================================================
  IMPORTANT: This template is filled by the /speckit.validate command.
  
  The QA Validator fills this from:
  - User story acceptance scenarios from spec.md
  - Functional requirements from spec.md
  - Constitution compliance rules from constitution.md
  - Checkpoint records from checkpoint-log.md
  
  DO NOT keep these placeholder rows in the generated report.
  ============================================================================
-->

## Story Verification

| Story | Scenarios | Passed | Failed | Notes |
|-------|-----------|--------|--------|-------|
| [US1 — Title] | [N] | [N] | [N] | [Details] |
| [US2 — Title] | [N] | [N] | [N] | [Details] |

## Functional Requirements Coverage

| FR-ID | Description | Status | Evidence |
|-------|-------------|--------|---------|
| FR-001 | [Requirement text] | PASS \| FAIL | [What was checked] |

## Constitution Compliance

| Rule | Section | Status | Evidence |
|------|---------|--------|---------|
| Tokens in HttpOnly cookies only | §VIII.5 | PASS \| FAIL | [File/line checked] |
| JWT claims (iss, aud, exp) | §VIII.4 | PASS \| FAIL | [File/line checked] |
| Passwords hashed with bcrypt | §VIII.3 | PASS \| FAIL | [File/line checked] |
| XSS sanitization applied globally | §VIII.2 | PASS \| FAIL | [File/line checked] |
| API routes prefixed /api/v1/ | §VI.1 | PASS \| FAIL | [File/line checked] |
| Centralized error handler used | §VI.5 | PASS \| FAIL | [File/line checked] |
| emitLogMessage() used, no console.log | §XI.1 | PASS \| FAIL | [File/line checked] |
| No CSS-in-JS | §III.8 | PASS \| FAIL | [File/line checked] |
| ESM imports on backend | §III.3 | PASS \| FAIL | [File/line checked] |
| Redux Toolkit only for global state | §V.1 | PASS \| FAIL | [File/line checked] |

## Defect Summary

| DEF-ID | Type | Severity | Target Agent | Description |
|--------|------|----------|-------------|-------------|
| DEF-001 | [IMPL\|PLANNING_GAP\|COVERAGE_GAP\|REQUIREMENTS\|CONSTITUTION\|SECURITY\|INFRA] | CRITICAL\|HIGH\|MEDIUM\|LOW | [Agent] | [Description] |

## Routing Table

| Defect | Route To | Required Action |
|--------|----------|----------------|
| DEF-001 | [Agent] | [What the agent must produce] |

## Retry Status

| Defect Type | Prior Rejections | Escalated? |
|-------------|-----------------|------------|
| [Type] | [0\|1\|2] | YES\|NO |

## Verdict Rationale

[Brief explanation of PASS or REJECT decision. Reference specific stories, FR items, or constitution rules that drove the decision.]

## Next Action

<!-- Fill exactly one of the two lines below -->
- **If PASS**: Proceed to `/speckit.document`
- **If REJECT**: Route defects per Routing Table above before re-running `/speckit.implement` on affected phases
