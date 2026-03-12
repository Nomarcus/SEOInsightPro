"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { BrandingConfig } from "@/lib/types";
import { DEFAULT_BRANDING } from "@/lib/constants";

const STORAGE_KEY = "seo-insight-branding";

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (updates: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
}

const BrandingContext = createContext<BrandingContextType | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBranding({ ...DEFAULT_BRANDING, ...JSON.parse(stored) });
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
    }
  }, [branding, loaded]);

  const updateBranding = useCallback(
    (updates: Partial<BrandingConfig>) => {
      setBranding((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const resetBranding = useCallback(() => {
    setBranding(DEFAULT_BRANDING);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within BrandingProvider");
  }
  return context;
}
