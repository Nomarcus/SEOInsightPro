"use client";

/**
 * usePageTracking — fires a lightweight beacon to /api/track/pageview
 * on every client-side navigation. Called once from the root layout.
 * No PII is collected — only path and derived country (from Vercel headers, server-side).
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function usePageTracking(userId?: string) {
  const pathname = usePathname();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Fire-and-forget — never block rendering
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, userId }),
      // keepalive so it completes even if the page navigates away
      keepalive: true,
    }).catch(() => {});
  }, [pathname, userId]);
}
