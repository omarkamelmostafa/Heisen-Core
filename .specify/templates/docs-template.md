---
description: Documentation template for the Documentation Writer — produces final user-facing and developer-facing docs artifacts.
---

<!--
  ============================================================================
  IMPORTANT: This template is used by the /speckit.document command.
  
  The Documentation Writer uses this to structure output in:
  - specs/NNN/docs/README.md
  - specs/NNN/docs/api-reference.md
  - specs/NNN/docs/data-model.md
  - specs/NNN/quickstart.md (final version)
  
  DO NOT reproduce Spec Kit governance artifacts (spec.md, plan.md, tasks.md)
  as user-facing documentation. These are internal only.
  ============================================================================
-->

# [FEATURE NAME] — Feature Documentation

**Version**: [Feature branch NNN]  
**Validated**: [ISO date from validation-report.md]  
**Status**: Complete

---

## README (User-Facing)

<!-- specs/NNN/docs/README.md -->

# [Feature Name]

[1–2 sentence description of what this feature does for the user. Source from spec.md user stories summary.]

## What This Feature Does

[Summarize the primary user value from the user stories. Written for non-technical readers.]

## Getting Started

[Setup steps needed to use this feature. Source from quickstart.md validated scenarios.]

### Prerequisites

- [Prerequisite 1]
- [Prerequisite 2]

### Usage

[Step-by-step usage instructions based on User Story 1 (P1) acceptance criteria.]

---

## Quickstart (Developer Integration)

<!-- specs/NNN/quickstart.md — final version -->

# Quickstart: [Feature Name]

**Validated**: [ISO date] — all scenarios verified in QA validation run [N]

## Integration Scenarios

### Scenario 1: [Description from User Story 1 acceptance scenario]

**Setup**:
```
[Setup steps]
```

**Action**:
```
[What to do]
```

**Expected Outcome**:
```
[What should happen — verbatim from checkpoint-log.md Independent Test result]
```

**Verified**: ✅ PASS — [date]

<!-- Add one block per acceptance scenario verified in checkpoint-log.md -->

---

## API Reference (if contracts/ exist)

<!-- specs/NNN/docs/api-reference.md -->

# API Reference: [Feature Name]

**Base path**: `/api/v1/[feature-path]`  
**Authentication**: HttpOnly cookie (JWT) required unless marked public

## Endpoints

| Method | Path | Auth Required | Description |
|--------|------|--------------|-------------|
| [GET\|POST\|PUT\|DELETE\|PATCH] | `/api/v1/[path]` | YES\|NO | [Description] |

### [Method] /api/v1/[path]

**Request**

```json
{
  "[field]": "[type] — [description]"
}
```

**Response — 200**

```json
{
  "[field]": "[type] — [description]"
}
```

**Error Responses**

| Status | Code | Message | When |
|--------|------|---------|------|
| 400 | VALIDATION_ERROR | [message] | [condition] |
| 401 | UNAUTHORIZED | [message] | [condition] |
| 404 | NOT_FOUND | [message] | [condition] |

---

## Data Model (if data-model.md exists)

<!-- specs/NNN/docs/data-model.md -->

# Data Model: [Feature Name]

[Overview of data entities introduced or modified by this feature.]

## [Entity Name]

[Plain-language description of what this entity represents and why it exists.]

**Fields**

| Field | Type | Description | Required |
|-------|------|-------------|---------|
| [field] | [type] | [user-facing description] | YES\|NO |

**Relationships**

- [Entity] belongs to [Other Entity] — [plain-language explanation]
- [Entity] has many [Other Entity] — [plain-language explanation]

**Notes**

- [Any important constraints or business rules in plain language]
