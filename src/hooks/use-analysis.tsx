"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";
import type { AnalysisResult, NaturalLanguageResult, PageSpeedResult, ScrapeResult } from "@/lib/types";

export type { AnalysisResult };

type AnalysisPhase =
  | "idle"
  | "scraping"
  | "performance"
  | "analyzing"
  | "complete"
  | "error";

interface AnalysisContextType {
  phase: AnalysisPhase;
  error: string | null;
  url: string;
  analysisResult: AnalysisResult | null;
  scrapeResult: ScrapeResult | null;
  pageSpeedResult: PageSpeedResult | null;
  nlResult: NaturalLanguageResult | null;
  startAnalysis: (url: string) => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [pageSpeedResult, setPageSpeedResult] = useState<PageSpeedResult | null>(null);
  const [nlResult, setNlResult] = useState<NaturalLanguageResult | null>(null);
  const { user } = useAuth();

  const startAnalysis = useCallback(
    async (inputUrl: string) => {
      // 1. Check free analysis limit for non-logged-in users
      if (!user) {
        const freeAnalysisDone = sessionStorage.getItem("freeAnalysisDone");
        if (freeAnalysisDone) {
          setError(
            "Free analysis limit reached. Please log in to continue analyzing."
          );
          setPhase("error");
          return;
        }
        sessionStorage.setItem("freeAnalysisDone", "true");
      }
      // Logged-in users: unlimited free analyses (no credit check yet)

      // Normalize URL
      let normalizedUrl = inputUrl.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      try {
        setPhase("scraping");
        setError(null);
        setUrl(normalizedUrl);
        setAnalysisResult(null);
        setScrapeResult(null);
        setPageSpeedResult(null);
        setNlResult(null);

        // 2. Scrape website
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizedUrl }),
        });

        const scrapeData = await scrapeRes.json();
        if (!scrapeRes.ok) {
          throw new Error(scrapeData.error || "Failed to scrape website");
        }
        setScrapeResult(scrapeData);

        // 3. PageSpeed + Natural Language (parallel, both optional)
        setPhase("performance");

        const [psRes, nlRes] = await Promise.all([
          fetch("/api/pagespeed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: normalizedUrl }),
          }).catch(() => null),
          fetch("/api/natural-language", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text:
                (scrapeData.bodyText as string) ||
                (scrapeData.pageContent as string) ||
                "",
            }),
          }).catch(() => null),
        ]);

        const psData = psRes && psRes.ok ? await psRes.json() : null;
        const nlData = nlRes && nlRes.ok ? await nlRes.json() : null;

        if (psData) setPageSpeedResult(psData);
        if (nlData) setNlResult(nlData);

        // 4. AI Analysis
        setPhase("analyzing");

        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: normalizedUrl,
            scrapeData,
            pageSpeedData: psData,
            nlData: nlData,
          }),
        });

        const aiResult = await analyzeRes.json();
        if (!analyzeRes.ok) {
          throw new Error(aiResult.error || "AI analysis failed");
        }

        // 5. Save analysis log (only for logged-in users)
        if (user) {
          try {
            await supabase.from("analysis_logs").insert({
              user_id: user.id,
              url: normalizedUrl,
              overall_score: aiResult.overallScore || 0,
            });
          } catch (logError) {
            console.error("Failed to save analysis log:", logError);
          }
        }

        setAnalysisResult(aiResult as AnalysisResult);
        setPhase("complete");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        setPhase("error");
        console.error("Analysis error:", err);
      }
    },
    [user]
  );

  return (
    <AnalysisContext.Provider
      value={{
        phase,
        error,
        url,
        analysisResult,
        scrapeResult,
        pageSpeedResult,
        nlResult,
        startAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within AnalysisProvider");
  }
  return context;
}
