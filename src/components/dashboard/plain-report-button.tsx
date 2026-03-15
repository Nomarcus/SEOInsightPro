"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Loader2, Sparkles } from "lucide-react";
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
    if (report) {
      setOpen(true);
      return;
    }
    setOpen(true);
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

  return (
    <>
      {/* Button */}
      <button
        onClick={generate}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          background: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
          color: "#fff",
          boxShadow: "0 0 16px rgba(6, 182, 212, 0.3)",
        }}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Enkel förklaring</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-lg w-full rounded-2xl border border-border/50 p-6"
              style={{ background: "#0F172A" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-white">
                    Vad betyder resultatet?
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              {loading && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  <p className="text-sm text-muted-foreground">
                    Sammanfattar analysen...
                  </p>
                </div>
              )}

              {error && !loading && (
                <p className="text-sm text-red-400 py-4">{error}</p>
              )}

              {report && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#CBD5E1" }}
                  >
                    {report}
                  </p>
                  <div
                    className="mt-4 pt-4 border-t text-xs text-muted-foreground flex items-center gap-1"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Genererad av AI baserat på din analys
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
