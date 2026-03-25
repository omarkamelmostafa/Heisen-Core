# Legacy Code Archive

Files in this directory were identified as dead code and moved here
for archival. They are preserved in case any reference is needed.

These files are NOT part of the active codebase and are NOT imported
by any production or test code.

## When moved
Phase 3.4+ cleanup — dead code audit

## Contents
- backend/model/ — 7 orphan Mongoose models from a previous sports app
- backend/validators/ — 4 one-time migration scripts (already executed)

### Frontend
- src/services/ui/ — 5 dead service files (notification, toast, UI,
  activity services + barrel export). Superseded by NotificationService
  static class in src/lib/notify.js (Phase 3.4).
- src/services/api/client/How-To-Use.js — Documentation file with
  outdated import patterns. No longer reflects current architecture.

### Redux Store — Dead Notification Slice + UI Thunks
- store/slices/ui/notification/ — 2 files (notification-slice.js,
  notification-selectors.js). Redux-based toast/notification state
  management. Entirely superseded by Sonner via NotificationService
  static class (Phase 3.4). Zero external consumers.
- store/slices/ui/ui-thunks.js — 8 thunks (showTemporaryNotification,
  showSuccessNotification, showErrorNotification, showLoadingWithTimeout,
  confirmAction, showTemporaryToast, trackPageView,
  initializeResponsiveDetection). All 8 had zero external consumers.
  Self-referencing closed loop with notification slice.

## Safe to delete
These files exist in git history. This directory can be safely deleted
after one sprint review cycle.
