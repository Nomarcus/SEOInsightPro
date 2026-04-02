"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  Sparkles,
  Mail,
  Phone,
  ArrowRight,
  Filter,
  Copy,
  Check,
  Lightbulb,
  Loader2,
  Cpu,
  X,
} from "lucide-react";
import { useAnalysis } from "@/hooks/use-analysis";
import { useBranding } from "@/hooks/use-branding";
import { getAIFixGuide } from "@/lib/ai-fix-guides";
import { EasySummary } from "@/components/fix-guide/easy-summary";
import type { WeaknessItem, AISignal, ScrapeResult, AnalysisResult } from "@/lib/types";

// ─── AI Agent Prompt Builder ─────────────────────────────

function buildAgentPrompt(
  url: string,
  analysisResult: AnalysisResult,
  allIssues: WeaknessItem[],
  aiIssues: WeaknessItem[]
): string {
  const r = analysisResult;
  const hostname = (() => {
    try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname; }
    catch { return url; }
  })();

  const lines: string[] = [];

  lines.push("# SEO Fix Agent — Full Implementation Prompt");
  lines.push(`# Website: ${url}`);
  lines.push(`# Generated: ${new Date().toLocaleDateString("sv-SE")}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Your Role");
  lines.push(
    "You are an expert SEO engineer. Your task is to implement every SEO fix listed below for the website " +
    `**${hostname}**. Work through each issue in order, make the changes to the codebase, and confirm each fix.`
  );
  lines.push("");
  lines.push("## How to Use This Prompt");
  lines.push(
    "1. **Claude Code / Codex**: Paste this entire prompt into your AI coding assistant. It will read your codebase and implement all fixes."
  );
  lines.push(
    "2. **ChatGPT / Claude.ai**: Paste this prompt and attach or describe your relevant files (e.g. `index.html`, CMS templates, `next.config.js`)."
  );
  lines.push(
    "3. **GitHub Copilot**: Open your project, paste this as a comment block at the top of your main SEO file, and use Copilot to generate the fixes inline."
  );
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Site Overview");
  lines.push(`- **URL:** ${url}`);
  lines.push(`- **SEO Score:** ${r.overallScore}/100`);
  lines.push(`- **Industry:** ${r.industryCategory || "Not specified"}`);
  lines.push(`- **Technical SEO:** ${r.categoryScores.technical?.score ?? "N/A"}/100`);
  lines.push(`- **Content Quality:** ${r.categoryScores.content?.score ?? "N/A"}/100`);
  lines.push(`- **On-Page SEO:** ${r.categoryScores.onPage?.score ?? "N/A"}/100`);
  lines.push(`- **Performance:** ${r.categoryScores.performance?.score ?? "N/A"}/100`);
  lines.push(`- **User Experience:** ${r.categoryScores.userExperience?.score ?? "N/A"}/100`);
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## Current SERP State (What Google Sees Now)");
  lines.push(`- **Current Title:** ${r.serpPreview.currentTitle || "(none)"}`);
  lines.push(`- **Current Meta Description:** ${r.serpPreview.currentDescription || "(none)"}`);
  lines.push("");
  lines.push("## Improved SERP Target (AI Suggestion — Implement This)");
  lines.push(`- **New Title:** ${r.serpPreview.improvedTitle || "(see below)"}`);
  lines.push(`- **New Meta Description:** ${r.serpPreview.improvedDescription || "(see below)"}`);
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## SEO Issues to Fix");
  lines.push(
    "Implement ALL of the following fixes. Start with CRITICAL issues, then WARNING issues."
  );
  lines.push("");

  const critical = allIssues.filter((w) => w.severity === "critical");
  const warnings = allIssues.filter((w) => w.severity === "warning");

  if (critical.length > 0) {
    lines.push("### CRITICAL Issues (Fix First)");
    lines.push("");
    critical.forEach((item, i) => {
      lines.push(`#### ${i + 1}. ${item.title} [CRITICAL]`);
      lines.push(`**Category:** ${item.category}`);
      lines.push(`**Problem:** ${item.description}`);
      if (item.estimatedFixTime) lines.push(`**Estimated time:** ${item.estimatedFixTime}`);
      if (item.technicalLevel) lines.push(`**Difficulty:** ${item.technicalLevel}`);
      if (item.fixSteps && item.fixSteps.length > 0) {
        lines.push("**Steps to implement:**");
        item.fixSteps.forEach((step, s) => lines.push(`${s + 1}. ${step}`));
      }
      if (item.tools && item.tools.length > 0) {
        lines.push(`**Tools:** ${item.tools.join(", ")}`);
      }
      lines.push("");
    });
  }

  if (warnings.length > 0) {
    lines.push("### WARNING Issues (Fix After Critical)");
    lines.push("");
    warnings.forEach((item, i) => {
      lines.push(`#### ${i + 1}. ${item.title} [WARNING]`);
      lines.push(`**Category:** ${item.category}`);
      lines.push(`**Problem:** ${item.description}`);
      if (item.estimatedFixTime) lines.push(`**Estimated time:** ${item.estimatedFixTime}`);
      if (item.fixSteps && item.fixSteps.length > 0) {
        lines.push("**Steps to implement:**");
        item.fixSteps.forEach((step, s) => lines.push(`${s + 1}. ${step}`));
      }
      lines.push("");
    });
  }

  if (aiIssues.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## AI Search Readiness Fixes");
    lines.push(
      "These fixes improve how AI-powered search engines (ChatGPT, Perplexity, Google AI Overviews) understand your site."
    );
    lines.push("");
    aiIssues.forEach((item, i) => {
      lines.push(`#### ${i + 1}. ${item.title} [${item.severity.toUpperCase()}]`);
      lines.push(`**Problem:** ${item.description}`);
      if (item.fixSteps && item.fixSteps.length > 0) {
        lines.push("**Steps to implement:**");
        item.fixSteps.forEach((step, s) => lines.push(`${s + 1}. ${step}`));
      }
      lines.push("");
    });
  }

  lines.push("---");
  lines.push("");
  lines.push("## Keyword Strategy (Target These Keywords)");
  lines.push("");
  r.keywords.slice(0, 10).forEach((kw) => {
    lines.push(
      `- **${kw.keyword}** — Relevance: ${kw.relevanceScore}/100, Difficulty: ${kw.estimatedDifficulty}, Currently used: ${kw.currentlyUsed ? "Yes" : "No"}`
    );
    if (kw.suggestion) lines.push(`  - ${kw.suggestion}`);
  });
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## 30/60/90 Day Strategy");
  lines.push("");
  const byPhase: Record<string, typeof r.strategy> = {
    immediate: r.strategy.filter((s) => s.timeframe === "immediate"),
    "short-term": r.strategy.filter((s) => s.timeframe === "short-term"),
    "long-term": r.strategy.filter((s) => s.timeframe === "long-term"),
  };
  const phaseLabels: Record<string, string> = {
    immediate: "Days 1-30 (Do Now)",
    "short-term": "Days 31-60 (This Month)",
    "long-term": "Days 61-90 (This Quarter)",
  };
  for (const [phase, items] of Object.entries(byPhase)) {
    if (!items.length) continue;
    lines.push(`### ${phaseLabels[phase]}`);
    items.forEach((item) => {
      lines.push(`- **${item.title}** [${item.priority.toUpperCase()}]: ${item.description}`);
    });
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## Quick Wins (High Impact, Low Effort — Do These First)");
  lines.push("");
  r.quickWins.forEach((win) => {
    lines.push(
      `- **${win.title}** (+${win.impactPercentage}% estimated impact, effort: ${win.estimatedEffort})`
    );
    lines.push(`  ${win.description}`);
  });
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## Completion Checklist");
  lines.push("After implementing all fixes:");
  lines.push("- [ ] Re-run SEO analysis to verify score improvement");
  lines.push("- [ ] Submit updated sitemap to Google Search Console");
  lines.push("- [ ] Request re-indexing for changed pages");
  lines.push("- [ ] Monitor Core Web Vitals in PageSpeed Insights");
  lines.push("- [ ] Check rankings after 2-4 weeks");
  lines.push("");
  lines.push("---");
  lines.push(`*Prompt generated by SEO Insight Pro — ${new Date().toLocaleDateString("sv-SE")}*`);

  return lines.join("\n");
}

// ─── Helpers ─────────────────────────────────────────────

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

function difficultyColor(level: string): string {
  switch (level) {
    case "beginner":
      return "#10B981";
    case "intermediate":
      return "#F59E0B";
    case "advanced":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

function difficultyLabel(level: string): string {
  switch (level) {
    case "beginner":
      return "Beginner Friendly";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
    default:
      return level;
  }
}

/** Detect if a fix step contains code (HTML tags, backtick blocks, etc.) */
function containsCode(text: string): boolean {
  return /[<>]|```|`[^`]+`|<\/?\w+/.test(text);
}

/** Extract inline code and render with monospace styling */
function renderStepText(text: string) {
  // Split on backtick-wrapped code: `code here`
  const parts = text.split(/(`[^`]+`)/g);

  if (parts.length === 1 && !containsCode(text)) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded text-[12px] font-mono"
              style={{ background: "rgba(139,92,246,0.15)", color: "#C4B5FD" }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

/** Copy text to clipboard, returning true on success */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

// ─── Fix Card Component ──────────────────────────────────

interface FixCardPageData {
  pageUrl: string;
  pageTitle: string | null;
  metaDescription: string | null;
  bodyTextExcerpt: string;
  headings: { tag: string; text: string }[];
  language: string | null;
  structuredData: object[];
  authorName?: string;
  wordCount: number;
}

function FixCard({
  item,
  index,
  isOpen,
  onToggle,
  pageData,
}: {
  item: WeaknessItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  pageData: FixCardPageData;
}) {
  const [openSolutions, setOpenSolutions] = useState<Set<number>>(new Set());
  const [aiSolutions, setAiSolutions] = useState<Map<number, string>>(
    new Map()
  );
  const [loadingSteps, setLoadingSteps] = useState<Set<number>>(new Set());
  const [errorSteps, setErrorSteps] = useState<Map<number, string>>(
    new Map()
  );
  const [copiedSteps, setCopiedSteps] = useState<Set<number>>(new Set());

  const handleSolve = async (stepIndex: number) => {
    // If already cached, just toggle visibility
    if (aiSolutions.has(stepIndex)) {
      setOpenSolutions((prev) => {
        const next = new Set(prev);
        if (next.has(stepIndex)) next.delete(stepIndex);
        else next.add(stepIndex);
        return next;
      });
      return;
    }

    // If already loading, ignore
    if (loadingSteps.has(stepIndex)) return;

    // Start loading
    setLoadingSteps((prev) => new Set(prev).add(stepIndex));
    setErrorSteps((prev) => {
      const next = new Map(prev);
      next.delete(stepIndex);
      return next;
    });

    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepText: item.fixSteps?.[stepIndex] ?? "",
          issueTitle: item.title,
          issueCategory: item.category,
          ...pageData,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setAiSolutions((prev) => new Map(prev).set(stepIndex, data.solution));
      setOpenSolutions((prev) => new Set(prev).add(stepIndex));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setErrorSteps((prev) => new Map(prev).set(stepIndex, msg));

      // Fallback to static snippet if available
      const fallback = item.solutionSnippets?.[stepIndex];
      if (fallback) {
        setAiSolutions((prev) => new Map(prev).set(stepIndex, fallback));
        setOpenSolutions((prev) => new Set(prev).add(stepIndex));
      }
    } finally {
      setLoadingSteps((prev) => {
        const next = new Set(prev);
        next.delete(stepIndex);
        return next;
      });
    }
  };

  const handleCopy = async (text: string, stepIndex: number) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedSteps((prev) => new Set(prev).add(stepIndex));
      setTimeout(() => {
        setCopiedSteps((prev) => {
          const next = new Set(prev);
          next.delete(stepIndex);
          return next;
        });
      }, 2000);
    }
  };

  const isCritical = item.severity === "critical";
  const accentColor = isCritical ? "#EF4444" : "#F59E0B";
  const bgTint = isCritical ? "rgba(239,68,68,0.03)" : "rgba(245,158,11,0.03)";
  const borderColor = isCritical
    ? "rgba(239,68,68,0.2)"
    : "rgba(245,158,11,0.2)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <div
        className="rounded-xl border overflow-hidden transition-colors"
        style={{
          borderColor: isOpen ? accentColor : borderColor,
          background: bgTint,
        }}
      >
        {/* Header — always visible, clickable */}
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
        >
          {/* Severity icon */}
          {isCritical ? (
            <XCircle className="w-5 h-5 shrink-0" style={{ color: "#EF4444" }} />
          ) : (
            <AlertTriangle
              className="w-5 h-5 shrink-0"
              style={{ color: "#F59E0B" }}
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              {/* Severity badge */}
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{
                  background: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                {item.severity}
              </span>
              {/* Category badge */}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">
                {item.category}
              </span>
              {/* Difficulty badge */}
              {item.technicalLevel && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    background: `${difficultyColor(item.technicalLevel)}15`,
                    color: difficultyColor(item.technicalLevel),
                  }}
                >
                  {difficultyLabel(item.technicalLevel)}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm">{item.title}</h3>
          </div>

          {/* Expand/collapse icon */}
          <div className="shrink-0 text-muted-foreground">
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {/* Expandable body */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-5 border-t" style={{ borderColor }}>
                {/* Description */}
                <p className="text-sm text-muted-foreground mt-4 mb-5 leading-relaxed">
                  {item.description}
                </p>

                {/* HOW TO FIX section */}
                {item.fixSteps && item.fixSteps.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-full h-px"
                        style={{
                          background:
                            "linear-gradient(to right, #8B5CF6, transparent)",
                        }}
                      />
                      <span
                        className="text-xs font-bold uppercase tracking-wider shrink-0 px-2"
                        style={{ color: "#A78BFA" }}
                      >
                        How to Fix
                      </span>
                      <div
                        className="w-full h-px"
                        style={{
                          background:
                            "linear-gradient(to left, #8B5CF6, transparent)",
                        }}
                      />
                    </div>

                    <div className="space-y-3">
                      {item.fixSteps.map((step, i) => {
                        const isCodeStep = containsCode(step);
                        const isLoading = loadingSteps.has(i);
                        const isSolutionOpen = openSolutions.has(i);
                        const hasCached = aiSolutions.has(i);
                        const solution = aiSolutions.get(i);
                        const error = errorSteps.get(i);
                        const isCopied = copiedSteps.has(i);

                        // Determine button label
                        let solveLabel = "Solve";
                        if (isLoading) solveLabel = "Generating...";
                        else if (hasCached && isSolutionOpen) solveLabel = "Hide";
                        else if (hasCached) solveLabel = "Show";

                        return (
                          <div key={i} className="space-y-2">
                            <motion.div
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="flex items-start gap-3"
                            >
                              {/* Step number circle */}
                              <div
                                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                                style={{
                                  background: "rgba(139,92,246,0.15)",
                                  color: "#A78BFA",
                                }}
                              >
                                {i + 1}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    {isCodeStep ? (
                                      <div className="text-sm leading-relaxed">
                                        {renderStepText(step)}
                                      </div>
                                    ) : (
                                      <p className="text-sm leading-relaxed">
                                        {step}
                                      </p>
                                    )}
                                  </div>

                                  {/* Solve button — always shown */}
                                  <button
                                    onClick={() => handleSolve(i)}
                                    disabled={isLoading}
                                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:scale-105 mt-0.5 disabled:opacity-60 disabled:hover:scale-100"
                                    style={{
                                      background:
                                        hasCached && isSolutionOpen
                                          ? "rgba(16,185,129,0.15)"
                                          : "rgba(139,92,246,0.12)",
                                      color:
                                        hasCached && isSolutionOpen
                                          ? "#10B981"
                                          : "#A78BFA",
                                      border: `1px solid ${
                                        hasCached && isSolutionOpen
                                          ? "rgba(16,185,129,0.3)"
                                          : "rgba(139,92,246,0.2)"
                                      }`,
                                    }}
                                  >
                                    {isLoading ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Lightbulb className="w-3 h-3" />
                                    )}
                                    {solveLabel}
                                  </button>
                                </div>
                              </div>
                            </motion.div>

                            {/* Error message */}
                            {error && !hasCached && (
                              <div className="ml-9 text-xs text-red-400 flex items-center gap-1">
                                <span>Failed: {error}</span>
                                <button
                                  onClick={() => handleSolve(i)}
                                  className="underline hover:text-red-300"
                                >
                                  Retry
                                </button>
                              </div>
                            )}

                            {/* Solution panel */}
                            <AnimatePresence>
                              {solution && isSolutionOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.25,
                                    ease: "easeInOut",
                                  }}
                                  className="overflow-hidden ml-9"
                                >
                                  <div
                                    className="rounded-lg border p-3"
                                    style={{
                                      background: "rgba(16,185,129,0.04)",
                                      borderColor: "rgba(16,185,129,0.15)",
                                    }}
                                  >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-2">
                                      <span
                                        className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                                        style={{ color: "#10B981" }}
                                      >
                                        <Sparkles className="w-3 h-3" />
                                        AI-Generated Solution
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleCopy(solution, i)
                                        }
                                        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors"
                                        style={{
                                          background: isCopied
                                            ? "rgba(16,185,129,0.2)"
                                            : "rgba(255,255,255,0.05)",
                                          color: isCopied
                                            ? "#10B981"
                                            : "#9CA3AF",
                                        }}
                                      >
                                        {isCopied ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            Copied!
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            Copy
                                          </>
                                        )}
                                      </button>
                                    </div>

                                    {/* Code block */}
                                    <pre
                                      className="text-[12px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-words p-3 rounded"
                                      style={{
                                        background: "rgba(0,0,0,0.3)",
                                        color: "#E2E8F0",
                                      }}
                                    >
                                      {solution}
                                    </pre>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Metadata footer */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/30">
                  {/* Time estimate */}
                  {item.estimatedFixTime && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.estimatedFixTime}</span>
                    </div>
                  )}

                  {/* Difficulty */}
                  {item.technicalLevel && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: difficultyColor(
                            item.technicalLevel
                          ),
                        }}
                      />
                      <span
                        style={{
                          color: difficultyColor(item.technicalLevel),
                        }}
                      >
                        {difficultyLabel(item.technicalLevel)}
                      </span>
                    </div>
                  )}

                  {/* Tools */}
                  {item.tools && item.tools.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                      {item.tools.map((tool) => (
                        <span
                          key={tool}
                          className="text-[11px] px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────

// ─── AI Agent Modal ──────────────────────────────────────

function AIAgentModal({
  prompt,
  onClose,
}: {
  prompt: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(prompt);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl rounded-2xl border overflow-hidden flex flex-col"
        style={{
          background: "#0B1120",
          borderColor: "rgba(139,92,246,0.3)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b shrink-0"
          style={{ borderColor: "rgba(139,92,246,0.2)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: "rgba(139,92,246,0.15)" }}
            >
              <Cpu className="w-5 h-5" style={{ color: "#A78BFA" }} />
            </div>
            <div>
              <h2 className="font-bold text-base">AI Agent Prompt</h2>
              <p className="text-xs text-muted-foreground">
                Copy and paste into Claude Code, Codex, ChatGPT or any AI model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions banner */}
        <div
          className="px-5 py-3 shrink-0"
          style={{ background: "rgba(139,92,246,0.06)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span style={{ color: "#A78BFA" }} className="font-semibold">How to use:</span>{" "}
            Copy the full prompt below and paste it into{" "}
            <span className="text-foreground">Claude Code</span>,{" "}
            <span className="text-foreground">OpenAI Codex</span>, or any AI coding assistant.
            It contains every SEO issue, fix step, keyword strategy and 90-day plan — ready for an AI agent to implement directly in your codebase.
          </p>
        </div>

        {/* Prompt content */}
        <div className="flex-1 overflow-auto p-5">
          <pre
            className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-words p-4 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", color: "#CBD5E1", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {prompt}
          </pre>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-4 border-t shrink-0"
          style={{ borderColor: "rgba(139,92,246,0.2)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider"
              style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}
            >
              Premium Feature
            </span>
            <span className="text-xs text-muted-foreground">
              {prompt.split("\n").length} lines · {(prompt.length / 1024).toFixed(1)} KB
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-105"
            style={{
              background: copied ? "rgba(16,185,129,0.2)" : "rgba(139,92,246,0.9)",
              color: copied ? "#10B981" : "#fff",
              border: copied ? "1px solid rgba(16,185,129,0.4)" : "1px solid transparent",
            }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied to clipboard!" : "Copy full prompt"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────

export default function FixGuidePage() {
  const router = useRouter();
  const { analysisResult, url, phase, scrapeResult } = useAnalysis();
  const { branding } = useBranding();

  const [openCards, setOpenCards] = useState<Set<number>>(new Set([0]));
  const [filter, setFilter] = useState<DifficultyFilter>("all");
  const [showAgentModal, setShowAgentModal] = useState(false);

  if (phase !== "complete" || !analysisResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No analysis data available.</p>
        <button
          onClick={() => router.push("/")}
          className="text-primary hover:underline text-sm flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back and analyze a website
        </button>
      </div>
    );
  }

  const weaknesses = analysisResult.weaknesses || [];
  const critical = weaknesses.filter((w) => w.severity === "critical");
  const warnings = weaknesses.filter((w) => w.severity === "warning");
  const sorted = [...critical, ...warnings];

  // AI signals → WeaknessItem conversion
  const aiSignals = (analysisResult.aiReadiness?.signals ?? []).filter(
    (s) => s.status !== "pass"
  );
  const aiAsWeaknesses: WeaknessItem[] = aiSignals.map((sig) => {
    const guide = getAIFixGuide(sig.id);
    return {
      title: sig.label,
      description: `${sig.description} — ${sig.tip}`,
      severity: sig.status === "fail" ? "critical" : "warning",
      category: "AI Readiness",
      fixSteps: guide?.fixSteps ?? [sig.tip],
      solutionSnippets: guide?.solutionSnippets ?? [],
      estimatedFixTime: guide?.estimatedFixTime ?? "15 minutes",
      technicalLevel: guide?.technicalLevel ?? "intermediate",
      tools: guide?.tools ?? [],
    };
  });

  const filtered =
    filter === "all"
      ? sorted
      : sorted.filter((w) => w.technicalLevel === filter);

  const aiFiltered =
    filter === "all"
      ? aiAsWeaknesses
      : aiAsWeaknesses.filter((w) => w.technicalLevel === filter);

  // Separate open-state sets for SEO (seo-0, seo-1...) and AI (ai-0, ai-1...)
  const [openAICards, setOpenAICards] = useState<Set<number>>(new Set());

  const toggleCard = (idx: number) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAICard = (idx: number) => {
    setOpenAICards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const expandAll = () => {
    setOpenCards(new Set(filtered.map((_, i) => i)));
    setOpenAICards(new Set(aiFiltered.map((_, i) => i)));
  };
  const collapseAll = () => {
    setOpenCards(new Set());
    setOpenAICards(new Set());
  };

  const hostname = (() => {
    try {
      return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    } catch {
      return url;
    }
  })();

  // Page data for AI Solve requests — trimmed to essentials
  const pageData: FixCardPageData = {
    pageUrl: url,
    pageTitle: scrapeResult?.title ?? null,
    metaDescription: scrapeResult?.metaDescription ?? null,
    bodyTextExcerpt: (scrapeResult?.bodyText ?? "").slice(0, 2000),
    headings: (scrapeResult?.headings ?? [])
      .slice(0, 20)
      .map((h) => ({ tag: h.tag, text: h.text })),
    language: scrapeResult?.language ?? null,
    structuredData: (scrapeResult?.structuredData ?? []).slice(0, 3),
    authorName: scrapeResult?.authorName,
    wordCount: scrapeResult?.wordCount ?? 0,
  };

  // Build agent prompt lazily (only when modal opens)
  const agentPrompt = showAgentModal
    ? buildAgentPrompt(url, analysisResult, sorted, aiAsWeaknesses)
    : "";

  return (
    <div className="min-h-screen bg-background">
      {/* AI Agent Modal */}
      <AnimatePresence>
        {showAgentModal && (
          <AIAgentModal
            prompt={agentPrompt}
            onClose={() => setShowAgentModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold">Fix Guide</h1>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{
                    background: "rgba(139,92,246,0.2)",
                    color: "#A78BFA",
                  }}
                >
                  Premium
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{hostname}</p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3">
            {/* AI Agent button */}
            <button
              onClick={() => setShowAgentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
              style={{
                background: "rgba(139,92,246,0.15)",
                color: "#A78BFA",
                border: "1px solid rgba(139,92,246,0.3)",
              }}
            >
              <Cpu className="w-3.5 h-3.5" />
              Sammanställ ALLT till en AI agent
            </button>

            <span className="text-muted-foreground/30 hidden sm:inline">|</span>

            {/* Expand/collapse */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={expandAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Expand all
              </button>
              <span className="text-muted-foreground/30">|</span>
              <button
                onClick={collapseAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Collapse all
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Easy summary */}
        <EasySummary analysisResult={analysisResult} url={url} />

        {/* Summary banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/50 p-5"
          style={{ background: "rgba(139,92,246,0.04)" }}
        >
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="w-5 h-5 shrink-0" style={{ color: "#8B5CF6" }} />
            <div>
              <h2 className="font-semibold mb-1">
                Step-by-Step Implementation Guide
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This guide contains exact instructions for fixing every SEO
                issue found on your website. Each fix includes what to do, where
                to do it, estimated time, and the tools you need — written so
                anyone can follow along.
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-lg border border-border/30 bg-background/50 p-3 text-center">
              <div className="text-lg font-bold">{weaknesses.length}</div>
              <div className="text-[11px] text-muted-foreground">
                SEO Issues
              </div>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center">
              <div className="text-lg font-bold" style={{ color: "#EF4444" }}>
                {critical.length}
              </div>
              <div className="text-[11px] text-muted-foreground">Critical</div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
              <div className="text-lg font-bold" style={{ color: "#F59E0B" }}>
                {warnings.length}
              </div>
              <div className="text-[11px] text-muted-foreground">Warnings</div>
            </div>
            <div className="rounded-lg border border-border/30 bg-background/50 p-3 text-center">
              <div className="text-lg font-bold" style={{ color: "#10B981" }}>
                {weaknesses.filter((w) => w.technicalLevel === "beginner").length}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Beginner Fixes
              </div>
            </div>
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 text-center">
              <div className="text-lg font-bold" style={{ color: "#8B5CF6" }}>
                {aiSignals.length}
              </div>
              <div className="text-[11px] text-muted-foreground">AI Issues</div>
            </div>
          </div>
        </motion.div>

        {/* Difficulty filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 flex-wrap"
        >
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-1">Filter:</span>
          {(
            [
              { key: "all", label: "All Issues" },
              { key: "beginner", label: "Beginner" },
              { key: "intermediate", label: "Intermediate" },
              { key: "advanced", label: "Advanced" },
            ] as { key: DifficultyFilter; label: string }[]
          ).map(({ key, label }) => {
            const isActive = filter === key;
            const color =
              key === "all" ? "#A78BFA" : difficultyColor(key);

            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
                style={{
                  borderColor: isActive ? color : "rgba(255,255,255,0.1)",
                  background: isActive ? `${color}15` : "transparent",
                  color: isActive ? color : "#9CA3AF",
                }}
              >
                {label}
                {key !== "all" && (
                  <span className="ml-1 opacity-60">
                    (
                    {sorted.filter((w) => w.technicalLevel === key).length +
                      aiAsWeaknesses.filter((w) => w.technicalLevel === key)
                        .length}
                    )
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Fix cards */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">
                No issues found matching this difficulty level.
              </p>
            </div>
          ) : (
            filtered.map((item, i) => (
              <FixCard
                key={`${item.title}-${i}`}
                item={item}
                index={i}
                isOpen={openCards.has(i)}
                onToggle={() => toggleCard(i)}
                pageData={pageData}
              />
            ))
          )}
        </div>

        {/* AI Search Readiness Fixes */}
        {aiFiltered.length > 0 && (
          <div className="space-y-3">
            {/* AI section header */}
            <div className="flex items-center gap-3 pt-4">
              <Bot className="w-5 h-5" style={{ color: "#8B5CF6" }} />
              <h2 className="font-semibold text-base">
                AI Search Readiness Fixes
              </h2>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{
                  background: "rgba(139,92,246,0.2)",
                  color: "#A78BFA",
                }}
              >
                AI Readiness
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These fixes improve how AI-powered search engines (ChatGPT,
              Perplexity, Google AI Overviews) understand, cite, and recommend
              your content.
            </p>

            {/* AI Fix cards */}
            {aiFiltered.map((item, i) => (
              <FixCard
                key={`ai-${item.title}-${i}`}
                item={item}
                index={i}
                isOpen={openAICards.has(i)}
                onToggle={() => toggleAICard(i)}
                pageData={pageData}
              />
            ))}
          </div>
        )}

        {/* Completion checklist */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5" style={{ color: "#10B981" }} />
              <h3 className="font-semibold text-sm">
                After Implementing Fixes
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">1.</span>
                Re-run the SEO analysis to verify improvements
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">2.</span>
                Submit updated pages to Google Search Console for re-indexing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">3.</span>
                Monitor your rankings over the next 2-4 weeks
              </li>
            </ul>
          </motion.div>
        )}

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "rgba(139,92,246,0.2)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.08))",
            }}
          />
          <div className="relative p-8 text-center">
            <h2 className="text-xl font-bold mb-2">
              Need Help Implementing These Fixes?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Don&apos;t have the time or technical knowledge to implement these
              changes yourself? Let a professional handle it for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {branding.consultantEmail && (
                <a
                  href={`mailto:${branding.consultantEmail}?subject=Help implementing SEO fixes for ${hostname}&body=Hi, I've reviewed the Fix Guide for ${hostname} and would like help implementing the recommended changes.`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: "#8B5CF6", color: "#fff" }}
                >
                  <Mail className="w-4 h-4" />
                  Get Professional Help
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
              {branding.consultantPhone && (
                <a
                  href={`tel:${branding.consultantPhone}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border
                             hover:border-violet-500/50 text-sm font-medium transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {branding.consultantPhone}
                </a>
              )}
            </div>

            {branding.consultantName && (
              <p className="text-xs text-muted-foreground mt-4">
                {branding.consultantName}
                {branding.companyName &&
                branding.companyName !== "SEO Insight Pro"
                  ? ` — ${branding.companyName}`
                  : ""}
              </p>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground/40 pt-4 pb-8">
          <p>
            Fix Guide generated by SEO Insight Pro &middot; AI-Powered Analysis
          </p>
        </div>
      </div>
    </div>
  );
}
