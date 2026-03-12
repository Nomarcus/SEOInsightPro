"use client";

import { motion } from "framer-motion";
import { Bot, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import type { AIReadinessResult, AISignal } from "@/lib/types";

// ─── Colours ─────────────────────────────────────────────
const AI_COLORS = {
  pass: "#10B981",   // emerald
  warn: "#F59E0B",   // amber
  fail: "#EF4444",   // red
  violet: "#8B5CF6", // violet-500
  violetLight: "#A78BFA", // violet-400
  cyan: "#06B6D4",   // cyan-500
  bg: "#0d0a1a",
  card: "#130f23",
  border: "#1e1533",
};

function gradeLabel(grade: AIReadinessResult["grade"]): string {
  switch (grade) {
    case "excellent": return "Excellent AI Readiness";
    case "good":      return "Good AI Readiness";
    case "fair":      return "Fair AI Readiness";
    case "poor":      return "Poor AI Readiness";
  }
}

function gradeColor(grade: AIReadinessResult["grade"]): string {
  switch (grade) {
    case "excellent": return AI_COLORS.pass;
    case "good":      return AI_COLORS.cyan;
    case "fair":      return AI_COLORS.warn;
    case "poor":      return AI_COLORS.fail;
  }
}

// ─── SVG Ring Gauge ───────────────────────────────────────
function AIScoreRing({ score, grade }: { score: number; grade: AIReadinessResult["grade"] }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={AI_COLORS.violet} />
            <stop offset="100%" stopColor={AI_COLORS.cyan} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1e1533" strokeWidth="10" />
        {/* Filled arc */}
        <motion.circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke="url(#aiGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - filled}
          transform="rotate(-90 70 70)"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - filled }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Score text */}
        <text x="70" y="64" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="helvetica, sans-serif">
          {score}
        </text>
        <text x="70" y="80" textAnchor="middle" fill="#9CA3AF" fontSize="11" fontFamily="helvetica, sans-serif">
          /100
        </text>
      </svg>

      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: gradeColor(grade) }}>
          {gradeLabel(grade)}
        </p>
      </div>
    </div>
  );
}

// ─── Signal Row ───────────────────────────────────────────
function SignalRow({ sig, index }: { sig: AISignal; index: number }) {
  const icon =
    sig.status === "pass" ? (
      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: AI_COLORS.pass }} />
    ) : sig.status === "warn" ? (
      <AlertCircle className="w-4 h-4 shrink-0" style={{ color: AI_COLORS.warn }} />
    ) : (
      <XCircle className="w-4 h-4 shrink-0" style={{ color: AI_COLORS.fail }} />
    );

  const barColor =
    sig.status === "pass" ? AI_COLORS.pass :
    sig.status === "warn" ? AI_COLORS.warn :
    AI_COLORS.fail;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.05 * index, duration: 0.4 }}
      className="flex items-start gap-3 py-2 border-b last:border-0"
      style={{ borderColor: AI_COLORS.border }}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">{sig.label}</span>
          <span className="text-xs text-muted-foreground shrink-0">{sig.score}/100</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">{sig.description}</p>
        {/* Progress bar */}
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: barColor }}
            initial={{ width: 0 }}
            whileInView={{ width: `${sig.score}%` }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * index + 0.3, duration: 0.6, ease: "easeOut" }}
          />
        </div>
        {/* Tip for warn/fail */}
        {sig.status !== "pass" && (
          <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: barColor + "cc" }}>
            💡 {sig.tip}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────
interface AiSeoScoreProps {
  aiReadiness: AIReadinessResult;
}

export function AiSeoScore({ aiReadiness }: AiSeoScoreProps) {
  const { score, grade, signals } = aiReadiness;

  const passing = signals.filter((s) => s.status === "pass").length;
  const warning = signals.filter((s) => s.status === "warn").length;
  const failing = signals.filter((s) => s.status === "fail").length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
    >
      <SectionHeader
        title="AI Search Readiness Score"
        subtitle="How well optimised your page is for Google AI Overviews, ChatGPT, Perplexity and Bing Copilot"
        icon={<Bot className="w-5 h-5" style={{ color: AI_COLORS.violet }} />}
        badge="NEW"
      />

      <div
        className="rounded-2xl border p-6"
        style={{ background: AI_COLORS.card, borderColor: AI_COLORS.border }}
      >
        {/* Context banner */}
        <div
          className="mb-6 rounded-lg px-4 py-3 text-xs leading-relaxed"
          style={{ background: AI_COLORS.violet + "15", color: "#C4B5FD" }}
        >
          <strong>Why this matters in 2026:</strong> AI-powered search features now drive up to 40% of zero-click searches.
          Pages that are optimised for AI crawlers are more likely to appear as cited sources in Google AI Overviews,
          ChatGPT and Perplexity answers — without users even visiting Google traditional results.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8">
          {/* Left — Score ring + summary */}
          <div className="flex flex-col items-center gap-4">
            <AIScoreRing score={score} grade={grade} />

            {/* Pass/warn/fail summary */}
            <div className="flex gap-3 text-xs">
              <span style={{ color: AI_COLORS.pass }}>
                <strong>{passing}</strong> passing
              </span>
              <span style={{ color: AI_COLORS.warn }}>
                <strong>{warning}</strong> warning
              </span>
              <span style={{ color: AI_COLORS.fail }}>
                <strong>{failing}</strong> failing
              </span>
            </div>

            {/* Decorative accent line */}
            <div
              className="w-full h-px rounded-full"
              style={{ background: `linear-gradient(to right, ${AI_COLORS.violet}, ${AI_COLORS.cyan})` }}
            />

            <p className="text-[11px] text-center leading-relaxed" style={{ color: "#7C6FAD" }}>
              In 2026, AI search features drive significant traffic. Being cited by AI systems requires
              structured data, clear authorship and well-organised content.
            </p>
          </div>

          {/* Right — Signal list */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: AI_COLORS.violetLight }}>
              AI Readiness Signals
            </p>
            <div>
              {signals.map((sig, i) => (
                <SignalRow key={sig.id} sig={sig} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
