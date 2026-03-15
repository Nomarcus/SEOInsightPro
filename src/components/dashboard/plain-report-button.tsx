"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2, Sparkles, MessageCircle } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

interface Props {
  url: string;
  analysisResult: AnalysisResult;
}

export function PlainReportButton({ url, analysisResult }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string>("");
  const [error, setError] = useState<string>("");

  const generate = async () => {
    if (report) return; // already fetched
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/plain-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          overallScore: analysisResult.overallScore,
          categoryScores: analysisResult.categoryScores,
          strengths: analysisResult.strengths,
          weaknesses: analysisResult.weaknesses,
          quickWins: analysisResult.quickWins,
          actionItems: analysisResult.actionItems,
          strategy: analysisResult.strategy,
          industryCategory: analysisResult.industryCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Något gick fel");
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    if (!open && !report && !loading) generate();
    setOpen((v) => !v);
  };

  const score = analysisResult.overallScore;
  const scoreLabel =
    score >= 80 ? "Bra" : score >= 60 ? "Godkänd" : score >= 40 ? "Behöver förbättras" : "Kritisk";
  const scoreColor =
    score >= 80 ? "#10B981" : score >= 60 ? "#3B82F6" : score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "rgba(6,182,212,0.25)", background: "rgba(6,182,212,0.04)" }}
    >
      {/* Header / toggle */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: "rgba(6,182,212,0.12)" }}
          >
            <MessageCircle className="w-4 h-4" style={{ color: "#06B6D4" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Vad betyder detta för dig?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              En enkel förklaring utan tekniska termer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: `${scoreColor}18`, color: scoreColor }}
          >
            {scoreLabel}
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-6 pb-6 pt-2"
              style={{ borderTop: "1px solid rgba(6,182,212,0.1)" }}
            >
              {loading && (
                <div className="flex items-center gap-3 py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Analyserar och sammanfattar resultatet...
                  </p>
                </div>
              )}

              {error && !loading && (
                <p className="text-sm text-red-400 py-2">{error}</p>
              )}

              {report && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-0"
                >
                  {/* Render paragraphs */}
                  {report.split("\n\n").filter(Boolean).map((para, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed mb-3 last:mb-0"
                      style={{ color: "#CBD5E1" }}
                    >
                      {para}
                    </p>
                  ))}
                  <div
                    className="mt-4 pt-3 border-t flex items-center gap-1.5 text-xs text-muted-foreground"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <Sparkles className="w-3 h-3 text-cyan-500" />
                    Genererad av AI baserat på din analys
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
