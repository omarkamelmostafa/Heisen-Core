"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials, setLoading, setBootstrapComplete } from "@/store/slices/auth/auth-slice";
import { notify } from "@/lib/notify";

// API configs - hardcoded directly to bypass any existing axios intercepts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1";
const BASE_URL = `${API_URL}/api/v${VERSION}`;

export function AuthBootstrap({ children }) {
  const dispatch = useDispatch();

  const hasAttemptedRestore = useRef(false);
  const channelRef = useRef(null);

  useEffect(() => {
    sessionStorage.removeItem('logout_source');

    // CRITICAL: Cross-tab logout enforcement. Do not add LOGIN handling here — session discovery is handled by middleware and cookie.
    channelRef.current = new BroadcastChannel('auth_channel');

    channelRef.current.onmessage = (event) => {
      if (event.data === 'LOGOUT') {
        const isLocalLogout = sessionStorage.getItem('logout_source') === 'local';
        sessionStorage.removeItem('logout_source');
        
        if (isLocalLogout) {
          return;
        }
        
        dispatch(clearCredentials());
        notify.info("You were signed out from another tab", {
          id: "cross-tab-logout",
        });
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 1500);
      }
      if (event.data === 'LOGIN') {
        window.location.href = '/dashboard';
      }
    };

    return () => {
      channelRef.current?.close();
    };
  }, [dispatch]);

  useEffect(() => {
    if (hasAttemptedRestore.current) return;
    hasAttemptedRestore.current = true;

    async function attemptSessionRestore() {
      dispatch(setLoading(true));

      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!refreshResponse.ok) {
          dispatch(clearCredentials());
          dispatch(setLoading(false));
          return;
        }

        const refreshData = await refreshResponse.json();
        const accessToken = refreshData?.data?.accessToken;

        if (!accessToken) {
          dispatch(clearCredentials());
          dispatch(setLoading(false));
          return;
        }

        const meResponse = await fetch(`${BASE_URL}/user/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!meResponse.ok) {
          dispatch(clearCredentials());
          dispatch(setLoading(false));
          return;
        }

        const meData = await meResponse.json();
        const user = meData?.data?.user || meData?.data;

        dispatch(setCredentials({ user, accessToken }));
      } catch (error) {
        dispatch(clearCredentials());
        dispatch(setLoading(false));
      } finally {
        dispatch(setBootstrapComplete(true));
      }
    }

    attemptSessionRestore();
  }, [dispatch]);

  return <>{children}</>;
}
