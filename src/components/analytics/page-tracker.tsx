"use client";

import { usePageTracking } from "@/hooks/use-page-tracking";

/**
 * Drop this component anywhere in the layout tree.
 * It tracks every client-side page navigation silently.
 */
export function PageTracker({ userId }: { userId?: string }) {
  usePageTracking(userId);
  return null; // renders nothing
}
