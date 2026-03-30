# Feature Specification: Authentication and Session Management Starter Kit

**Feature Branch**: `001-auth-session-starter`  
**Created**: 2026-03-10  
**Status**: Draft  
**Input**: User description: "A complete authentication system that supports user registration, email verification, login, logout, forgot password, and reset password with short-lived access tokens in memory, long-lived refresh tokens in HttpOnly cookies, silent refresh via interceptor, route-array-based access control, and multi-device session support."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Core Registration and Email Verification (Priority: P1)

A new user visits the app for the first time. They navigate to the registration page, enter their email and password, and submit the form. The system creates their account, sends a verification email with a unique time-limited link, and displays a message asking the user to check their inbox. The user opens the email, clicks the verification link, and the system marks their account as verified. The verified user can now log in.

**Why this priority**: Registration is the entry point to all other auth features. Without account creation and verification, no other user story is reachable. This is the foundational user journey that unlocks every subsequent interaction.

**Independent Test**: A user can register, receive a verification email, click the link, and be confirmed as verified — without needing login, logout, token refresh, or any other feature to work.

**Acceptance Scenarios**:

1. **Given** no existing account, **When** a user submits a valid email and password, **Then** the system creates the account, marks it as unverified, and sends a verification email within 60 seconds
2. **Given** an existing unverified account, **When** the user clicks the verification link before it expires, **Then** the system marks the account as verified and displays a confirmation message
3. **Given** an existing unverified account, **When** the user clicks the verification link after it has expired, **Then** the system displays an error indicating the link is expired and offers a way to request a new one
4. **Given** a verification token that has already been used, **When** the user clicks the same verification link again, **Then** the system rejects the token and informs the user it has already been consumed
5. **Given** an existing account with the same email, **When** a new user attempts to register with that email, **Then** the system rejects the registration with a clear error message
6. **Given** a password that does not meet strength requirements, **When** the user submits the registration form, **Then** the system rejects the submission and displays specific guidance on what is required

---

### User Story 2 — Login and Authenticated Session (Priority: P1)

A verified user navigates to the login page, enters their email and password, and submits the form. The system validates their credentials, creates a session by issuing a short-lived access token (returned in the response body for the frontend to hold in memory) and a long-lived refresh token (set as an HttpOnly secure cookie by the backend). The user is redirected to the dashboard and can now access protected resources.

**Why this priority**: Login establishes the authenticated session that all protected features depend on. It is co-equal with registration as the most critical user journey.

**Independent Test**: A verified user can log in, receive tokens, and access a protected resource — without needing registration (can be seeded), password reset, or multi-device features.

**Acceptance Scenarios**:

1. **Given** a verified account with valid credentials, **When** the user submits login, **Then** the system returns an access token in the response body, sets a refresh token as an HttpOnly secure cookie (path-restricted to the refresh endpoint), and redirects to the dashboard
2. **Given** a verified account with invalid password, **When** the user submits login, **Then** the system rejects the attempt with a generic error ("Invalid credentials") without revealing whether the email exists
3. **Given** an unverified account with valid credentials, **When** the user submits login, **Then** the system rejects the attempt and instructs the user to verify their email first
4. **Given** an email that does not exist in the system, **When** the user submits login, **Then** the system returns the same generic error as for invalid password (no account enumeration)
5. **Given** a successfully authenticated user, **When** the user accesses a protected resource, **Then** the system permits access based on the valid access token in the request header
6. **Given** an authenticated user, **When** a normal API call is made (not a refresh call), **Then** the refresh token cookie is NOT sent with that request (path restriction enforced)

---

### User Story 3 — Silent Token Refresh and Session Continuity (Priority: P1)

An authenticated user is using the app when their short-lived access token expires. On the next API call, the system receives a 401 response. The interceptor automatically calls the refresh endpoint (the browser sends the HttpOnly cookie), receives a new access token, updates the in-memory state, and retries the failed request — all without the user seeing an error or interruption. On page refresh or new tab, the app calls the refresh endpoint on initialization and restores authenticated state using only the browser cookie, without any client-side persistence library.

**Why this priority**: Without silent refresh, users would be logged out every time the short-lived access token expires, making the app unusable. This is architecturally critical for session continuity.

**Independent Test**: An authenticated user's access token expires, the next API call triggers a transparent refresh, and the user continues uninterrupted — without needing registration pages or password reset.

**Acceptance Scenarios**:

1. **Given** an authenticated user whose access token has expired, **When** an API call returns 401, **Then** the interceptor calls the refresh endpoint, receives a new access token, updates the in-memory state, and retries the original request without user-visible interruption
2. **Given** multiple API calls that fail simultaneously with 401 (concurrent batch), **When** the interceptor detects the first 401, **Then** only one refresh call is made and all pending failed requests are queued and retried after the new access token is available
3. **Given** an authenticated user, **When** the user refreshes the page (F5), **Then** the app calls the refresh endpoint on initialization, receives a new access token (browser sends the cookie automatically), and restores authenticated state without any persistence library
4. **Given** an authenticated user, **When** the user opens a new browser tab, **Then** the same bootstrap flow restores authenticated state using the shared browser cookie
5. **Given** an authenticated user whose refresh token has also expired, **When** the refresh endpoint returns 401, **Then** the user is redirected to the login page and the in-memory state is cleared
6. **Given** a successful refresh, **When** the backend issues a new refresh token (rotation), **Then** the old refresh token is invalidated and a new one is set as an HttpOnly cookie

---

### User Story 4 — Logout and Session Termination (Priority: P2)

An authenticated user clicks the logout button. The system invalidates the refresh token on the server, clears the HttpOnly cookie by setting it with an expired date, and clears the in-memory authentication state on the frontend. The user is redirected to the login page. Optionally, the user can log out of all devices, which invalidates all refresh tokens associated with their account.

**Why this priority**: Logout is essential for security but is not an immediate blocker for the other authentication flows. Users can close the browser as a temporary workaround.

**Independent Test**: An authenticated user can log out, have their server-side session invalidated, and be unable to use the old refresh token — without needing registration or password reset.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** the user clicks logout, **Then** the backend invalidates the refresh token server-side, clears the cookie via a Set-Cookie header with an expired date, the frontend clears all in-memory auth state, and the user is redirected to the login page
2. **Given** a logged-out user, **When** they attempt to use the old refresh token, **Then** the system rejects it as invalid
3. **Given** an authenticated user with sessions on multiple devices, **When** the user selects "log out of all devices," **Then** all refresh tokens for that user are invalidated across every device
4. **Given** a user who has logged out of all devices, **When** another device attempts a silent refresh, **Then** the refresh fails and that device's user is redirected to login

---

### User Story 5 — Forgot Password and Password Reset (Priority: P2)

A user who has forgotten their password navigates to the "forgot password" page and enters their email. The system sends a password reset email with a unique, time-limited, single-use link. The user clicks the link, enters a new password, and submits. The system validates the token, updates the password, and invalidates all existing sessions (refresh tokens) for security.

**Why this priority**: Password reset is a critical recovery mechanism but does not block the primary login and session flows. Users who know their password are unaffected.

**Independent Test**: A user can request a password reset email, click the link, set a new password, and log in with the new credentials — without needing multi-device logout or route protection.

**Acceptance Scenarios**:

1. **Given** a registered email, **When** the user requests a password reset, **Then** the system sends a reset email with a unique, time-limited, single-use link within 60 seconds
2. **Given** an email that does not exist, **When** the user requests a password reset, **Then** the system shows the same success message as for a valid email (no account enumeration)
3. **Given** a valid reset token, **When** the user submits a new password before the token expires, **Then** the system updates the password, invalidates the reset token, and invalidates all refresh tokens for that user
4. **Given** a reset token that has expired, **When** the user attempts to use it, **Then** the system rejects the token and instructs the user to request a new one
5. **Given** a reset token that has already been used, **When** the user attempts to use it again, **Then** the system rejects it as consumed

---

### User Story 6 — Route Protection and Access Control (Priority: P2)

The developer configures two arrays: one for public routes (login, register, forgot-password, reset-password, verify-email) and one for protected routes (dashboard, settings, profile). A route guard component or middleware reads these arrays and enforces access control automatically. Unauthenticated users who navigate to a protected route are redirected to the login page. Authenticated users who navigate to an auth page (login, register) are redirected away to the dashboard.

**Why this priority**: Route protection depends on the authentication state being reliably established (User Stories 1–3). It is a structural concern that the developer configures, not an end-user journey.

**Independent Test**: Manually set auth state to authenticated/unauthenticated and verify that navigation to protected/public routes redirects correctly — without needing email or password reset.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they navigate to any route in the protected routes array, **Then** the system redirects them to the login page
2. **Given** an authenticated user, **When** they navigate to any route in the public routes array (e.g., login, register), **Then** the system redirects them to the dashboard
3. **Given** a new page path added to the protected routes array, **When** an unauthenticated user navigates to it, **Then** the route guard automatically enforces the redirect without any additional code
4. **Given** a new page path added to the public routes array, **When** an authenticated user navigates to it, **Then** the route guard automatically redirects them to the dashboard
5. **Given** an authenticated user whose session expires mid-navigation, **When** the refresh fails, **Then** the route guard detects the unauthenticated state and redirects to login

---

### User Story 7 — Multi-Device Session Management (Priority: P3)

A user logs in from multiple devices (laptop, phone, tablet). Each device receives its own independent refresh token. The user can be authenticated on all devices simultaneously. If the user logs out on one device, the other devices remain authenticated. If the user chooses "log out of all devices," all sessions are terminated. If a previously-used refresh token is reused (potential theft), all tokens for that user are invalidated as a security measure.

**Why this priority**: Multi-device support is architecturally present in the token design from the start, but explicit management and theft detection are polish-layer features that build on top of the working auth system.

**Independent Test**: A user logs in on two simulated devices, logs out on one, and confirms the other remains authenticated — without needing registration pages or password reset.

**Acceptance Scenarios**:

1. **Given** a user logged in on device A, **When** they log in on device B, **Then** both devices have independent, valid refresh tokens and both can access protected resources
2. **Given** a user logged in on devices A and B, **When** the user logs out on device A, **Then** device A's refresh token is invalidated but device B remains authenticated
3. **Given** a user with multiple active sessions, **When** they select "log out of all devices," **Then** all refresh tokens for that user are invalidated and all devices must re-authenticate
4. **Given** refresh token X has been rotated to token Y, **When** an attacker replays token X, **Then** the system detects the reuse, invalidates ALL tokens for that user (including token Y), and forces re-authentication on every device

---

### Edge Cases

- What happens when the user submits the registration form with an email that has different casing (e.g., "User@Email.com" vs "user@email.com")? The system must treat emails as case-insensitive.
- What happens when the user submits an extremely long password? The system must enforce a maximum password length to prevent hash-based denial of service.
- What happens when the user submits the forgot-password form multiple times in quick succession? The system must rate-limit this endpoint to prevent abuse.
- What happens when the verification email is not received? The system should provide a "resend verification email" mechanism.
- What happens when the user's browser does not support cookies? The system should display a meaningful error explaining that cookies are required.
- What happens when the API server is unreachable during a refresh attempt? The interceptor should handle network errors gracefully and redirect to login or retry with backoff.
- What happens when two refresh calls race concurrently on the same device? Only one should execute; the other should wait for the result.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with an email address and password
- **FR-002**: System MUST validate email format and password strength during registration (minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one special character)
- **FR-003**: System MUST send a verification email within 60 seconds of successful registration
- **FR-004**: System MUST mark accounts as unverified until the verification link is used
- **FR-005**: System MUST reject login attempts from unverified accounts with a clear instruction to verify email
- **FR-006**: System MUST prevent unverified users from accessing protected resources
- **FR-007**: Verification tokens MUST be single-use and expire after 24 hours
- **FR-008**: System MUST provide a "resend verification email" mechanism for unverified accounts
- **FR-009**: System MUST authenticate users via email and password, returning an access token in the response body and a refresh token as an HttpOnly secure cookie
- **FR-010**: Access tokens MUST have a short lifetime (15 minutes) and be held in application memory only — never in browser storage
- **FR-011**: Refresh tokens MUST have a finite lifetime (7 days) and be stored exclusively as HttpOnly, Secure, SameSite cookies with path restricted to the refresh endpoint
- **FR-012**: System MUST support silent token refresh: when an API call returns 401, the client automatically calls the refresh endpoint, receives a new access token, and retries the failed request
- **FR-013**: System MUST queue concurrent 401 failures so that only one refresh call is made and all pending requests are retried after the new token is available
- **FR-014**: System MUST restore authenticated state on page refresh or new tab by calling the refresh endpoint during app initialization (browser sends the cookie automatically)
- **FR-015**: System MUST implement refresh token rotation — every successful refresh invalidates the old token and issues a new one
- **FR-016**: System MUST detect refresh token reuse (a previously-rotated token is replayed) and invalidate ALL tokens for that user
- **FR-017**: System MUST support logout by invalidating the refresh token server-side, clearing the cookie via Set-Cookie with an expired date, and clearing the client-side auth state
- **FR-018**: System MUST support "log out of all devices" by invalidating all refresh tokens for the user
- **FR-019**: System MUST support forgot-password by sending a reset email with a unique, time-limited, single-use link
- **FR-020**: Forgot-password requests for non-existent emails MUST return the same response as for valid emails (no account enumeration)
- **FR-021**: Password reset tokens MUST be single-use and expire after 1 hour
- **FR-022**: Successful password reset MUST invalidate all refresh tokens for the user (force re-authentication on all devices)
- **FR-023**: System MUST enforce route protection via two configurable route arrays: one for public routes and one for protected routes
- **FR-024**: Unauthenticated users navigating to protected routes MUST be redirected to the login page
- **FR-025**: Authenticated users navigating to public auth routes (login, register) MUST be redirected to the dashboard
- **FR-026**: Adding a page path to the correct route array MUST automatically enforce access control without additional code
- **FR-027**: Each device login MUST create an independent refresh token, allowing concurrent multi-device sessions
- **FR-028**: Login MUST NOT use generic error messages that reveal whether an email is registered
- **FR-029**: Passwords MUST be hashed before storage; plaintext passwords MUST never be persisted
- **FR-030**: System MUST enforce rate limiting on login, registration, forgot-password, and refresh endpoints to prevent brute force and abuse
- **FR-031**: System MUST treat email addresses as case-insensitive
- **FR-032**: System MUST enforce a maximum password length (128 characters) to prevent hash-based denial of service
- **FR-033**: Refresh token cookie MUST use `Domain` scoped to include subdomains (e.g., `.example.com`) and MUST require explicit CORS origin (no wildcard) with credentials support

### Key Entities

- **User**: Represents a registered individual. Key attributes: unique email (case-insensitive), hashed password, email verification status, account creation timestamp, password last changed timestamp.
- **Refresh Token**: Represents an active device session. Key attributes: token value (opaque or hashed), associated user, device/session identifier, issued-at timestamp, expiration timestamp, replaced-by reference (for rotation chain tracking), revocation status.
- **Verification Token**: Represents a pending email verification. Key attributes: token value, associated user, expiration timestamp, used status.
- **Password Reset Token**: Represents a pending password reset request. Key attributes: token value, associated user, expiration timestamp, used status.

### Assumptions

- **Access token lifetime**: 15 minutes. This balances security (short exposure window) with usability (infrequent refresh calls during active use). Configurable via environment variable.
- **Refresh token lifetime**: 7 days. Standard for web applications where users expect to remain logged in for a week. Configurable via environment variable.
- **Verification email expiry**: 24 hours. Generous enough for most workflows but short enough to limit abuse.
- **Password reset link expiry**: 1 hour. Industry standard for sensitive operations.
- **Password requirements**: Minimum 8 characters, at least one uppercase, one lowercase, one digit, one special character. Maximum 128 characters.
- **Rate limiting**: Applied to login (5 attempts per 15 minutes per IP), registration (3 per hour per IP), forgot-password (3 per hour per IP), and refresh (30 per minute per IP).
- **No account lockout**: After rate limiting, the account itself is not locked. Rate limiting is IP-based, not account-based. Account lockout is a separate concern deferred to a future feature.
- **No max device limit**: There is no cap on simultaneous device sessions per user. Managing device count is deferred to a future feature.
- **Email service**: Uses the project's existing transactional email infrastructure (as defined in the project constitution).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full registration-to-first-login flow (register → verify email → log in → see dashboard) in under 3 minutes, excluding email delivery time
- **SC-002**: Silent token refresh is transparent to the user — zero user-visible errors or redirects occur when only the access token (not the refresh token) has expired
- **SC-003**: Page refresh (F5) or new tab restores authenticated state in under 2 seconds without any prompt for re-login
- **SC-004**: After logout, a user's previous refresh token is rejected within 1 second (server-side invalidation is immediate, not eventually consistent)
- **SC-005**: Password reset email is delivered within 60 seconds of the user's request for supported email providers
- **SC-006**: Refresh token reuse detection triggers full session invalidation for the affected user within 1 second
- **SC-007**: Adding a new protected route requires only adding the path to the protected routes array — no additional guard code, middleware registration, or configuration
- **SC-008**: Concurrent 401s from multiple API calls on the same page produce exactly 1 refresh request, not N
- **SC-009**: A user can log in on 3 or more devices simultaneously without any session being prematurely terminated
- **SC-010**: After "log out of all devices," every previously-active device session is terminated and cannot be refreshed
