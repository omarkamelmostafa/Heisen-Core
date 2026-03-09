# Database Index Guide

This document catalogs all indexes across the database models to ensure query performance and data integrity.

## User Model (`User.js`)

| Index Fields | Type | Purpose |
|--------------|------|---------|
| `_id` | Default / Primary | Unique document identifier. |
| `email` | Unique | Primary identifier for auth; prevents duplicate accounts. |
| `uuid` | Unique | Stable public identifier for API resources. |
| `refreshToken` | Sparse | Used for session refresh; sparse to allow nulls. |
| `resetPasswordToken` | Sparse | Used for password reset flow. |
| `verificationToken` | Sparse | Used for email verification flow. |
| `email`, `isActive` | Compound | Optimizes auth lookups for active users. |
| `verificationToken`, `isVerified` | **Compound (NEW)** | Optimizes verification code lookups. |
| `resetPasswordToken`, `isActive` | **Compound (NEW)** | Optimizes password reset token lookups. |

## Role Model (`Role.js`)

| Index Fields | Type | Purpose |
|--------------|------|---------|
| `_id` | Default / Primary | Unique document identifier. |
| `name` | Unique | Prevents duplicate role names. |
| `key` | Unique | Machine-readable identifier for internal logic. |

## Permission Model (`Permission.js`)

| Index Fields | Type | Purpose |
|--------------|------|---------|
| `_id` | Default / Primary | Unique document identifier. |
| `name` | Unique | Prevents duplicate permission names. |
| `key` | Unique | Machine-readable identifier for authorization checks. |

---

## Maintenance Guidelines

1. **Verify Before Adding**: Always use `explain()` on query patterns to verify if a new index is actually needed.
2. **Monitor Write Impact**: Every index adds overhead to `insert`, `update`, and `delete` operations.
3. **Keep Docs Sync'd**: Update this file whenever a model's indexing strategy changes.
