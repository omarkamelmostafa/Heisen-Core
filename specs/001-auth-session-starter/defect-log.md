
## Defect Record  DEF-001
Date: 2026-03-10T07:00:00Z
QA Run: 1
Type: CONSTITUTION
Severity: CRITICAL
Route To: Requirements Analyst
Phase: Phase 1  Technical Design / Spec Analysis
Description: FR-010 mandates returning access tokens in the response body for Redux memory, which directly violates Constitution I.5 (Tokens must never be placed in... response bodies accessible to JavaScript).
Evidence: spec.md defines FR-010. Implementation faithfully returns access tokens in JSON responses (apiResponseManager). Constitution I.5 forbids this.
Acceptance Criterion: FR-010
Resolution Required: Requirements Analyst must either amend Constitution I.5 to allow access tokens in response bodies for JS memory storage, OR alter FR-010 to use purely HttpOnly cookies for both tokens.
Status: OPEN
