"use client";

import { useCallback, useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { downloadSeoReport } from "@/lib/pdf-generator";
import { useAnalysis } from "@/hooks/use-analysis";
import { useBranding } from "@/hooks/use-branding";

export function PdfReportButton() {
  const [generating, setGenerating] = useState(false);
  const { url, analysisResult, scrapeResult, pageSpeedResult, nlResult } = useAnalysis();
  const { branding } = useBranding();

  const handleExport = useCallback(async () => {
    if (!analysisResult || generating) return;

    setGenerating(true);
    try {
      downloadSeoReport({
        url,
        analysisResult,
        scrapeResult,
        pageSpeedResult,
        nlResult,
        branding,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }, [url, analysisResult, scrapeResult, pageSpeedResult, nlResult, branding, generating]);

  return (
    <button
      onClick={handleExport}
      disabled={generating || !analysisResult}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {generating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {generating ? "Generating..." : "Export PDF"}
    </button>
  );
}
