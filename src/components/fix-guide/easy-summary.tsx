"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { getScoreColor, getScoreLabel } from "@/lib/constants";

interface EasySummaryProps {
  analysisResult: AnalysisResult | null;
  url: string;
}

export function EasySummary({ analysisResult, url }: EasySummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const generateReport = async () => {
    if (!analysisResult) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/easy-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisResult,
          url,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate summary");

      const text = await response.text();
      setReport(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generating summary");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!isOpen && !report && !loading) {
      await generateReport();
    }
    setIsOpen(!isOpen);
  };

  const score = analysisResult?.overallScore ?? 0;
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-xl border border-border/60 bg-muted/10 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Lättläst Sammanfattning
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vad betyder detta för din webbsida?
            </p>
          </div>
        </div>

        {/* Score Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="text-center px-3 py-1.5 rounded-lg text-sm font-bold"
            style={{
              background: `${scoreColor}18`,
              color: scoreColor,
            }}
          >
            {score} poäng
            <br />
            <span className="text-xs font-medium">{scoreLabel}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="px-5 py-4 space-y-4">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-sm">Genererar sammanfattning...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm space-y-2">
                  <p>{error}</p>
                  <button
                    onClick={() => {
                      setError("");
                      generateReport();
                    }}
                    className="text-xs px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                  >
                    Försök igen
                  </button>
                </div>
              )}

              {report && !loading && !error && (
                <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
                  {report.split("\n\n").map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              )}

              {!loading && !error && report && (
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2 border-t border-border/20">
                  <Sparkles className="w-3 h-3" />
                  <span>Genererad av AI</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
