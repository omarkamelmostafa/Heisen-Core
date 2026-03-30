# Pre-implementation Audit: Settings Profile & TopNav

## Prerequisites Table
| Prerequisite | Status | Details |
|---|---|---|
| Root page structure | Wrapped | `src/app/page.jsx` is the Dashboard, wrapped in `ProtectedGuard`. |
| User data in Redux | Partially Wired | Basic info in `auth` slice; full profile structure in `user` slice (but needs fetching). |
| /user/me fields | Sanitized | Returns `id`, `firstname`, `lastname`, `email`, `profilePicture`, `isVerified`, etc. |
| Avatar component | Missing | Needs installation. |
| Badge component | Missing | Needs installation. |
| DropdownMenu component | Missing | Needs installation. |
| Separator component | Missing | Needs installation. |
| lucide-react | Installed | Version `0.545.0` available. |
| theme-toggle.jsx | Exists | Located in `src/components/shared/theme-toggle.jsx`. |
| (settings) route group | Missing | Directory `src/app/(settings)/` does not exist. |

## User Model Fields
| Field | Type | Required | Default |
|---|---|---|---|
| `firstname` | String | Yes | - |
| `lastname` | String | Yes | - |
| `email` | String | Yes | - |
| `password` | String | Yes | - (select: false) |
| `profilePicture`| ObjectId | No | null (ref: "Photo") |
| `lastLogin` | Date | No | Date.now |
| `isVerified` | Boolean | No | false |
| `isActive` | Boolean | No | true |
| `uuid` | String | Yes | uuidv4 (index: true) |
| `createdAt` | Date | Yes | Timestamps |

> [!WARNING]
> **Naming Mismatch Found**: The backend model and sanitizer use `firstname`/`lastname` (lowercase), but the frontend `useUserProfile` hook (line 44) attempts to access `user.firstName`/`user.lastName` (CamelCase). This causes any initials or full name displays to fail.

## Missing shadcn Components to Install
```bash
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add dropdown-menu
npx shadcn@latest add separator
```

## Recommended Batch Plan
1. **Batch 1: Component & Core Infrastructure**
   - Install missing shadcn components (`avatar`, `badge`, `dropdown-menu`, `separator`).
   - Create `src/app/(settings)/layout.jsx` to define the settings sidebar/layout.
   - Create `src/components/shared/top-nav.jsx`.

2. **Batch 2: TopNav & Desktop Layout**
   - Update root `layout.jsx` to include `TopNav` above `{children}`.
   - Implement User Menu (Dropdown) with Profile link and Logout.
   - **Fix**: Synchronize `firstname` vs `firstName` naming across frontend/backend.

3. **Batch 3: Profile Settings Page**
   - Implement `src/app/(settings)/profile/page.jsx`.
   - Add image upload/preview for `profilePicture` using existing `Photo` model integration.
   - Implement profile update form with `zod` validation.
