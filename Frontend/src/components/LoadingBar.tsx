import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "@/lib/axios";

// ===== GLOBAL TOP LOADING BAR =====
// Activates on:
//   1. Route navigation (react-router location changes)
//   2. API requests (via axios interceptors)
//
// Route changes and API calls are unified — if an API call starts
// shortly after a route change, they merge into a single loading bar.

// --- Shared state (supports concurrent requests) ---
let activeRequests = 0;
let onRequestStart: (() => void) | null = null;
let onRequestEnd: (() => void) | null = null;
let interceptorsRegistered = false;

function registerInterceptors() {
  if (interceptorsRegistered) return;
  interceptorsRegistered = true;

  api.interceptors.request.use(
    (config) => {
      activeRequests++;
      onRequestStart?.();
      return config;
    },
    (error) => {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) onRequestEnd?.();
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) onRequestEnd?.();
      return response;
    },
    (error) => {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) onRequestEnd?.();
      return Promise.reject(error);
    }
  );
}

const LoadingBar = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const crawlTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(false);
  const hasActiveRequestRef = useRef(false);
  const location = useLocation();

  const clearAllTimers = useCallback(() => {
    if (crawlTimerRef.current) {
      clearInterval(crawlTimerRef.current);
      crawlTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (routeChangeTimeoutRef.current) {
      clearTimeout(routeChangeTimeoutRef.current);
      routeChangeTimeoutRef.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    // If already loading, just keep going — don't restart
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    clearAllTimers();
    setProgress(15);
    setVisible(true);

    // Simulate organic progress — fast at first, slowing near 90%
    crawlTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.max(0.5, (90 - prev) * 0.08);
        return Math.min(prev + increment, 90);
      });
    }, 200);
  }, [clearAllTimers]);

  const completeLoading = useCallback(() => {
    if (!isLoadingRef.current) return;
    isLoadingRef.current = false;
    hasActiveRequestRef.current = false;

    clearAllTimers();
    setProgress(100);

    // Brief hold at 100%, then fade out
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setProgress(0), 300);
    }, 400);
  }, [clearAllTimers]);

  // --- Route change trigger ---
  useEffect(() => {
    hasActiveRequestRef.current = false;
    startLoading();

    // Wait 200ms to see if an API request arrives.
    // If not, keep loading anyway (no forced completion).
    routeChangeTimeoutRef.current = setTimeout(() => {
      // Just clear the timeout ref; don't do anything
      routeChangeTimeoutRef.current = null;
    }, 200);

    return () => {
      if (routeChangeTimeoutRef.current) {
        clearTimeout(routeChangeTimeoutRef.current);
        routeChangeTimeoutRef.current = null;
      }
    };
  }, [location.pathname, location.search, startLoading]);

  // --- API request interceptors ---
  useEffect(() => {
    registerInterceptors();

    onRequestStart = () => {
      hasActiveRequestRef.current = true;
      startLoading();
    };

    onRequestEnd = () => {
      // Only complete if no new route change happened during the API call
      if (hasActiveRequestRef.current) {
        completeLoading();
      }
    };

    return () => {
      onRequestStart = null;
      onRequestEnd = null;
    };
  }, [startLoading, completeLoading]);

  if (!visible && progress === 0) return null;

  return (
    <div
      id="global-loading-bar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: "3px",
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* Track background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "hsl(var(--primary) / 0.08)",
        }}
      />

      {/* Progress fill */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, hsl(38 92% 50%), hsl(38 92% 60%), hsl(38 92% 50%))",
          backgroundSize: "200% 100%",
          animation: "loading-bar-shimmer 1.5s ease-in-out infinite",
          borderRadius: "0 2px 2px 0",
          transition:
            progress === 100
              ? "width 0.25s ease-out"
              : progress <= 15
              ? "width 0.1s ease-out"
              : "width 0.4s ease-out",
          boxShadow:
            "0 0 8px hsl(38 92% 50% / 0.5), 0 0 3px hsl(38 92% 50% / 0.3)",
        }}
      />

      {/* Glow tip at end of bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "80px",
          transform: `translateX(${progress < 5 ? "-100%" : "0"})`,
          left: `calc(${progress}% - 80px)`,
          background:
            "linear-gradient(90deg, transparent, hsl(38 92% 50% / 0.4))",
          borderRadius: "0 2px 2px 0",
        }}
      />

      <style>{`
        @keyframes loading-bar-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingBar;
