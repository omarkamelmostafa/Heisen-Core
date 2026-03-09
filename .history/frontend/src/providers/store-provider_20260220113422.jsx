// frontend/src/providers/store-provider.jsx
<AnimatedLogoLoader
  message="Preparing your fantasy dashboard..."
  showProgress={true}
/>
        }
persistor = { persistor }
  >
  { children }
      </PersistGate >
    </Provider >
  );
}

// During Page Load:

// Timeline:
// 0ms: Page starts loading
// ↓
// 50ms: StoreProvider renders, PersistGate shows AnimatedLogoLoader
// ↓
// 100-500ms: Redux Persist reads from storage (localStorage/sessionStorage)
// ↓
// Once complete: PersistGate renders children, loader disappears

{/* <PersistGate
        loading={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
        persistor={persistor}
      > */}