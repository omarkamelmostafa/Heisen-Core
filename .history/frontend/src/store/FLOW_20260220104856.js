// frontend/src/store/FLOW.js
// services/
// ├── api/
// │   ├── client/                    # HTTP Clients
// │   │   ├── base-client.js         ← All common config
// │   │   ├── public-client.js       ← No auth (login, register)
// │   │   └── private-client.js      ← With auth + auto refresh
// │   ├── endpoints/                 # URL Management
// │   │   ├── auth-endpoints.js      ← Authentication, login, register, password reset
// │   │   ├── user-endpoints.js      ← User profiles, preferences, sessions, security
// │   │   └── admin-endpoints.js     ← Admin dashboard, user management, system settings
// │   └── refresh-queue.js           ← Concurrent request management
// ├── domain/                        # Business Logic
// │   ├── auth-service.js            ← Authentication operations
// │   ├── user-service.js            ← User management
// │   └── notification-service.js    ← Multi-channel notifications
// └── storage/                       # Data Persistence
//     ├── cookie-service.js          ← Secure cookie operations
//     └── storage-constants.js       ← Configuration

// File: src/providers/store-provider.jsx

// App → StoreProvider → Redux Store → PersistGate → Children Components

// 🔄 COMPLETE REDUX DATA FLOW
// text
// COMPONENT → DISPATCH(action) → REDUX STORE → REDUCER → STATE UPDATE → COMPONENT RE-RENDER
//      ↓
//      → THUNK (async) → API SERVICE → HTTP CLIENT → INTERCEPTORS → BACKEND API
//      ↓
//      → SELECTOR → GET STATE → RETURN DATA

// *****************
// **    STEP 1   **
// *****************

// 1. STORE INITIALIZATION FLOW

// store-provider.jsx
//     ↓
// store/index.js
//     ↓
// root-reducer.js → combineReducers({ auth, user, ui, api })
//     ↓
// slices/ (auth, user, ui, api)
//     ↓
// PersistGate (hydration)

// *****************
// **    STEP 2   **
// *****************

// 2. AUTHENTICATION FLOW

// User Action (login) → Component → dispatch(loginUser(credentials))
//     ↓
// auth-thunks.js → loginUser thunk
//     ↓
// auth-service.js → login()
//     ↓
// public-client.js → POST /auth/login
//     ↓
// base-client.js → axios instance
//     ↓
// interceptors/ (logging, auth, error)
//     ↓
// Backend API → Response
//     ↓
// auth-slice.js → loginSuccess action
//     ↓
// Component re-renders with new state

// *****************
// **    STEP 3   **
// *****************

// 3. API REQUEST FLOW (SECURED)
// text
// Component → dispatch(fetchUserProfile())
//     ↓
// user-thunks.js → fetchUserProfile thunk
//     ↓
// user-service.js → getProfile()
//     ↓
// secured-client.js → GET /users/profile
//     ↓
// auth-interceptor.js → adds Bearer token
//     ↓
// error-interceptor.js → handles 401 → refresh-queue.js
//     ↓
// Backend API → Response
//     ↓
// user-slice.js → setProfile action

// *****************
// **    STEP 4   **
// *****************

// 4. TOKEN REFRESH FLOW (Single Orchestrator — RefreshQueue)
// text
// secured-client → 401 Response → handleAuthError()
//     ↓
// refresh-queue.js → handleTokenRefresh()
//     ↓                (queues concurrent requests, single refresh call)
// auth-service.js → refreshToken()
//     ↓
// public-client.js → POST /auth/refresh
//     ↓
// Success → cookieService.setTokens() + dispatch(setTokens()) → retry queued requests
//     ↓
// Failure (maxRetries exceeded) → dispatch(logout()) → clearAuthData → redirect /login?session=expired

// *****************
// **    STEP 5   **
// *****************

// 5. NOTIFICATION FLOW
// text
// Any Service/Thunk → notificationService.success()
//     ↓
// notification-service.js → process notification
//     ↓
// Channels: inApp → dispatch(showNotification())
//     ↓
// ui-slice.js → update notifications state
//     ↓
// Notification Component → display toast
