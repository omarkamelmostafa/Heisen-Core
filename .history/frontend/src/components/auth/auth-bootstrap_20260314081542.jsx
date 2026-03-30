"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials, setLoading } from "@/store/slices/auth/auth-slice";

// API configs - hardcoded directly to bypass any existing axios intercepts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1";
const BASE_URL = `${API_URL}/api/v${VERSION}`;

export function AuthBootstrap({ children }) {
  const dispatch = useDispatch();

  const hasAttemptedRestore = useRef(false);
  const channelRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('auth_channel');
    
    channelRef.current.onmessage = (event) => {
      if (event.data === 'LOGOUT') {
        dispatch(clearCredentials());
        window.location.href = '/login';
      } 
      // tabs sync
      else if (event.data === 'LOGIN') {
        // Redirect to dashboard with full reload to clear stale state
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
      }
    }

    attemptSessionRestore();
  }, [dispatch]);

  return <>{children}</>;
}
