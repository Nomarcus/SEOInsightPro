"use client";

import { useCallback, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { downloadProSeoReport } from "@/lib/pdf-pro-generator";
import { useAnalysis } from "@/hooks/use-analysis";
import { useBranding } from "@/hooks/use-branding";

export function ProPdfButton() {
  const [generating, setGenerating] = useState(false);
  const { url, analysisResult, scrapeResult, pageSpeedResult, nlResult } = useAnalysis();
  const { branding } = useBranding();

  const handleExport = useCallback(async () => {
    if (!analysisResult || generating) return;

    setGenerating(true);
    try {
      downloadProSeoReport({
        url,
        analysisResult,
        scrapeResult,
        pageSpeedResult,
        nlResult,
        branding,
      });
    } catch (err) {
      console.error("Pro PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }, [url, analysisResult, scrapeResult, pageSpeedResult, nlResult, branding, generating]);

  return (
    <button
      onClick={handleExport}
      disabled={generating || !analysisResult}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
      style={{
        background: generating
          ? "rgba(217, 119, 6, 0.3)"
          : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        color: "#0B1120",
        boxShadow: generating ? "none" : "0 0 16px rgba(245, 158, 11, 0.35)",
      }}
      title="Generate detailed Pro Report with step-by-step fix guides"
    >
      {generating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Star className="w-4 h-4 fill-current" />
      )}
      {generating ? "Generating..." : "Pro Report"}
    </button>
  );
}
