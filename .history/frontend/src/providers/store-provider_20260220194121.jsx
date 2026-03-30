// frontend/src/providers/store-provider.jsx
"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import dynamic from "next/dynamic";
import { injectStore } from "@/store/store-accessor";

const AnimatedLogoLoader = dynamic(
  () => import("@/components/ui/animated-logo").then((mod) => mod.AnimatedLogoLoader),
  { ssr: false }
);

export function StoreProvider({ children }) {
  // Use ref to prevent re-creation on re-renders
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = store;
    // Inject store into singleton accessor for services
    injectStore(store);
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate
        loading={
          <AnimatedLogoLoader
            message="Preparing your fantasy dashboard..."
            showProgress={true}
          />
        }
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}