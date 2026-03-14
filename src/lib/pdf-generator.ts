/**
 * SEO Insight Pro - PDF Report Generator
 *
 * Generates a consistent, professional PDF report from analysis data.
 * Uses jsPDF for direct PDF construction (no screenshots).
 *
 * Layout order (always the same):
 *   1. Cover page: Logo, company name, website URL, date, overall score
 *   2. Score breakdown: Category scores with bars
 *   3. SERP preview: Current vs improved
 *   4. Strengths: Green check items
 *   5. Issues found: Red/orange items with severity
 *   6. Quick wins: Effort + impact table
 *   7. Keyword opportunities: Full table
 *   8. Strategy roadmap: Grouped by timeframe
 *   9. Core Web Vitals: If available
 *  10. Traffic potential: Summary
 *  11. CTA / Contact page
 */

import jsPDF from "jspdf";
import type {
  AnalysisResult,
  ScrapeResult,
  PageSpeedResult,
  NaturalLanguageResult,
  BrandingConfig,
  InsightItem,
  QuickWin,
  KeywordSuggestion,
  StrategyItem,
  AIReadinessResult,
} from "./types";
import { getScoreLabel } from "./constants";

// ─── Colors ──────────────────────────────────────────────
const C = {
  bg: "#0B1120",
  card: "#111827",
  text: "#E5E7EB",
  textMuted: "#9CA3AF",
  primary: "#3B82F6",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  white: "#FFFFFF",
  border: "#1F2937",
};

// ─── Helpers ─────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function setColor(doc: jsPDF, hex: string) {
  doc.setTextColor(...hexToRgb(hex));
}

function setFill(doc: jsPDF, hex: string) {
  doc.setFillColor(...hexToRgb(hex));
}

function setDraw(doc: jsPDF, hex: string) {
  doc.setDrawColor(...hexToRgb(hex));
}

function scoreColor(score: number): string {
  if (score >= 80) return C.green;
  if (score >= 60) return C.primary;
  if (score >= 40) return C.amber;
  return C.red;
}

function severityColor(severity: string): string {
  if (severity === "critical") return C.red;
  if (severity === "warning") return C.amber;
  return C.green;
}

function newPage(doc: jsPDF): number {
  doc.addPage();
  // Dark background
  setFill(doc, C.bg);
  doc.rect(0, 0, 210, 297, "F");
  return 25; // Starting Y after top margin
}

function drawPageBg(doc: jsPDF) {
  setFill(doc, C.bg);
  doc.rect(0, 0, 210, 297, "F");
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 275) {
    return newPage(doc);
  }
  return y;
}

function sectionTitle(doc: jsPDF, y: number, title: string): number {
  y = checkPageBreak(doc, y, 15);
  setColor(doc, C.white);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 15, y);

  // Underline
  setDraw(doc, C.primary);
  doc.setLineWidth(0.5);
  doc.line(15, y + 2, 195, y + 2);

  return y + 10;
}

/**
 * Sanitise a string so jsPDF (Helvetica/WinAnsi) can render it without
 * producing garbled "&a&b&c" output for characters outside Latin-1.
 */
function sanitizeForPdf(text: string): string {
  if (!text) return "";
  return text
    // Smart / curly quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Dashes
    .replace(/\u2014/g, "--")   // em dash
    .replace(/\u2013/g, "-")    // en dash
    // Ellipsis
    .replace(/\u2026/g, "...")
    // Common symbols used in the PDF
    .replace(/\u2605/g, "*")    // ★
    .replace(/\u00B7/g, "-")    // · (middle dot)
    .replace(/\u2713/g, "+")    // ✓
    .replace(/\u2717/g, "x")    // ✗
    .replace(/\u2709/g, "")     // ✉
    .replace(/\u260E/g, "")     // ✆
    .replace(/\u23F1/g, "")     // ⏱
    .replace(/\u2192/g, "->")   // →
    .replace(/\u00BB/g, ">>")   // »
    .replace(/\u00AB/g, "<<")   // «
    .replace(/\u2022/g, "-")    // •
    .replace(/\u2023/g, "-")    // ‣
    // Strip any remaining character outside WinAnsi (Latin-1 supplement)
    .replace(/[^\x00-\xFF]/g, "");
}

function drawScoreBar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  score: number,
  color: string
) {
  // Background bar
  setFill(doc, C.border);
  doc.roundedRect(x, y, width, 4, 2, 2, "F");
  // Filled bar
  setFill(doc, color);
  const fillWidth = Math.max(2, (width * score) / 100);
  doc.roundedRect(x, y, fillWidth, 4, 2, 2, "F");
}

// ─── Main Export ─────────────────────────────────────────
export interface PdfExportData {
  url: string;
  analysisResult: AnalysisResult;
  scrapeResult: ScrapeResult | null;
  pageSpeedResult: PageSpeedResult | null;
  nlResult: NaturalLanguageResult | null;
  branding: BrandingConfig;
}

export function generateSeoReport(data: PdfExportData): jsPDF {
  const { url, analysisResult: r, scrapeResult: s, pageSpeedResult: ps, nlResult: nl, branding: b } = data;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const hostname = (() => {
    try {
      return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    } catch {
      return url;
    }
  })();

  // ══════════════════════════════════════════════════════
  // PAGE 1: COVER
  // ══════════════════════════════════════════════════════
  drawPageBg(doc);

  // Company name / branding
  let cy = 50;
  setColor(doc, C.textMuted);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(b.companyName || "SEO Insight Pro", 105, cy, { align: "center" });
  cy += 15;

  // Main title
  setColor(doc, C.white);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("SEO Analysis Report", 105, cy, { align: "center" });
  cy += 12;

  // Website URL
  setColor(doc, C.primary);
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(hostname, 105, cy, { align: "center" });
  cy += 25;

  // Score circle
  const scoreCol = scoreColor(r.overallScore);
  setDraw(doc, scoreCol);
  doc.setLineWidth(2);
  doc.circle(105, cy + 15, 22, "S");
  setColor(doc, scoreCol);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(String(r.overallScore), 105, cy + 18, { align: "center" });
  setColor(doc, C.textMuted);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("out of 100", 105, cy + 25, { align: "center" });
  cy += 45;

  // Score label
  setColor(doc, scoreCol);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(getScoreLabel(r.overallScore), 105, cy, { align: "center" });
  cy += 15;

  // Industry
  if (r.industryCategory) {
    setColor(doc, C.textMuted);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Industry: ${r.industryCategory}`, 105, cy, { align: "center" });
    cy += 8;
  }

  // AI provider badge
  if (r.aiProvider === "both") {
    setColor(doc, C.green);
    doc.setFontSize(9);
    doc.text("Multi-Model AI Verified Analysis", 105, cy, { align: "center" });
    cy += 8;
  }

  // Date
  cy = 250;
  setColor(doc, C.textMuted);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Report generated on ${dateStr}`, 105, cy, { align: "center" });
  cy += 6;
  doc.text("Powered by SEO Insight Pro - AI-Powered Analysis", 105, cy, {
    align: "center",
  });

  // ══════════════════════════════════════════════════════
  // PAGE 2: SCORE BREAKDOWN
  // ══════════════════════════════════════════════════════
  let y = newPage(doc);

  y = sectionTitle(doc, y, "Score Breakdown");
  y += 2;

  const categories: [string, string][] = [
    ["technical", "Technical SEO"],
    ["content", "Content Quality"],
    ["onPage", "On-Page SEO"],
    ["performance", "Performance"],
    ["userExperience", "User Experience"],
  ];

  for (const [key, label] of categories) {
    const cat = r.categoryScores[key as keyof typeof r.categoryScores];
    if (!cat) continue;
    y = checkPageBreak(doc, y, 14);

    setColor(doc, C.text);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, 15, y);

    setColor(doc, scoreColor(cat.score));
    doc.text(`${cat.score}/100`, 180, y, { align: "right" });

    drawScoreBar(doc, 15, y + 3, 165, cat.score, scoreColor(cat.score));
    y += 14;
  }

  // ══════════════════════════════════════════════════════
  // CONTENT INTELLIGENCE (NL API — shown if available)
  // ══════════════════════════════════════════════════════
  if (nl) {
    y += 5;
    y = sectionTitle(doc, y, "Content Intelligence");
    y = renderNLSection(doc, y, nl);
  }

  // ══════════════════════════════════════════════════════
  // SERP PREVIEW
  // ══════════════════════════════════════════════════════
  y += 5;
  y = sectionTitle(doc, y, "Google Search Preview");
  y += 2;

  // Current
  y = checkPageBreak(doc, y, 30);
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CURRENT", 15, y);
  y += 5;
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const serpUrlCurrent = r.serpPreview.url.length > 90 ? r.serpPreview.url.slice(0, 87) + "..." : r.serpPreview.url;
  doc.text(serpUrlCurrent, 15, y);
  y += 4;
  setColor(doc, C.primary);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  const currentTitle = sanitizeForPdf(r.serpPreview.currentTitle || "(No title set)");
  doc.text(currentTitle.slice(0, 70), 15, y);
  y += 5;
  setColor(doc, C.textMuted);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const currentDesc = sanitizeForPdf(r.serpPreview.currentDescription || "(No meta description)");
  const currentLines = doc.splitTextToSize(currentDesc, 170);
  doc.text(currentLines.slice(0, 2), 15, y);
  y += currentLines.slice(0, 2).length * 4 + 8;

  // Improved
  y = checkPageBreak(doc, y, 30);
  setColor(doc, C.green);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("IMPROVED (AI SUGGESTION)", 15, y);
  y += 5;
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const serpUrlImproved = r.serpPreview.url.length > 90 ? r.serpPreview.url.slice(0, 87) + "..." : r.serpPreview.url;
  doc.text(serpUrlImproved, 15, y);
  y += 4;
  setColor(doc, C.green);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(sanitizeForPdf((r.serpPreview.improvedTitle || "")).slice(0, 70), 15, y);
  y += 5;
  setColor(doc, C.textMuted);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const impLines = doc.splitTextToSize(sanitizeForPdf(r.serpPreview.improvedDescription || ""), 170);
  doc.text(impLines.slice(0, 2), 15, y);
  y += impLines.slice(0, 2).length * 4 + 8;

  // ══════════════════════════════════════════════════════
  // STRENGTHS
  // ══════════════════════════════════════════════════════
  y = sectionTitle(doc, y, "What's Working Well");
  y = renderInsightList(doc, y, r.strengths, C.green, "+");

  // ══════════════════════════════════════════════════════
  // WEAKNESSES
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "Issues Found");
  y = renderInsightList(doc, y, r.weaknesses, C.red, "!");

  // ══════════════════════════════════════════════════════
  // QUICK WINS
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "Quick Wins");
  y = renderQuickWins(doc, y, r.quickWins);

  // ══════════════════════════════════════════════════════
  // KEYWORDS
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "Keyword Opportunities");
  y = renderKeywords(doc, y, r.keywords);

  // ══════════════════════════════════════════════════════
  // STRATEGY
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "SEO Strategy Roadmap");
  y = renderStrategy(doc, y, r.strategy);

  // ══════════════════════════════════════════════════════
  // CORE WEB VITALS
  // ══════════════════════════════════════════════════════
  if (ps) {
    y += 3;
    y = sectionTitle(doc, y, "Core Web Vitals");
    y = renderWebVitals(doc, y, ps);
  }

  // ══════════════════════════════════════════════════════
  // TRAFFIC POTENTIAL
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "Traffic Growth Potential");
  y = checkPageBreak(doc, y, 30);

  setColor(doc, C.text);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Current estimate: ${r.trafficPotential.currentEstimate}`, 15, y);
  y += 5;
  doc.text(`Potential estimate: ${r.trafficPotential.potentialEstimate}`, 15, y);
  y += 5;
  setColor(doc, C.green);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`+${r.trafficPotential.percentageIncrease}% growth potential`, 15, y);
  y += 7;
  setColor(doc, C.textMuted);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const reasonLines = doc.splitTextToSize(sanitizeForPdf(r.trafficPotential.reasoning), 170);
  doc.text(reasonLines.slice(0, 4), 15, y);
  y += reasonLines.slice(0, 4).length * 4 + 5;

  // ══════════════════════════════════════════════════════
  // AI SEARCH READINESS
  // ══════════════════════════════════════════════════════
  if (r.aiReadiness) {
    y += 5;
    y = sectionTitle(doc, y, "AI Search Readiness Score");
    y = renderAIScore(doc, y, r.aiReadiness);
  }

  // ══════════════════════════════════════════════════════
  // CTA / CONTACT PAGE
  // ══════════════════════════════════════════════════════
  y = newPage(doc);
  y = 80;

  setColor(doc, C.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(b.ctaText || "Ready to Improve?", 105, y, { align: "center" });
  y += 10;

  setColor(doc, C.textMuted);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const ctaLines = doc.splitTextToSize(b.ctaDescription || "", 150);
  doc.text(ctaLines, 105, y, { align: "center" });
  y += ctaLines.length * 5 + 15;

  // Contact info box
  setFill(doc, C.card);
  doc.roundedRect(55, y, 100, 45, 4, 4, "F");
  y += 10;

  setColor(doc, C.white);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(b.consultantName || "", 105, y, { align: "center" });
  y += 6;

  if (b.companyName && b.companyName !== "SEO Insight Pro") {
    setColor(doc, C.primary);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(b.companyName, 105, y, { align: "center" });
    y += 6;
  }

  setColor(doc, C.text);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (b.consultantEmail) {
    doc.text(b.consultantEmail, 105, y, { align: "center" });
    y += 5;
  }
  if (b.consultantPhone) {
    doc.text(b.consultantPhone, 105, y, { align: "center" });
  }

  // Footer on last page
  setColor(doc, C.textMuted);
  doc.setFontSize(7);
  doc.text("Generated by SEO Insight Pro", 105, 285, { align: "center" });

  return doc;
}

// ─── Section renderers ───────────────────────────────────

function renderInsightList(
  doc: jsPDF,
  startY: number,
  items: InsightItem[],
  defaultColor: string,
  bullet: string
): number {
  let y = startY;
  for (const item of items) {
    y = checkPageBreak(doc, y, 14);
    const col = item.severity === "positive" ? C.green : severityColor(item.severity);

    setColor(doc, col);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${bullet} ${sanitizeForPdf(item.title)}`, 15, y);

    if (item.severity !== "positive") {
      const badge = item.severity === "critical" ? "CRITICAL" : "WARNING";
      setColor(doc, severityColor(item.severity));
      doc.setFontSize(7);
      doc.text(`[${badge}]`, 180, y, { align: "right" });
    }

    y += 4;
    setColor(doc, C.textMuted);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(sanitizeForPdf(item.description), 170);
    doc.text(lines.slice(0, 2), 18, y);
    y += lines.slice(0, 2).length * 3.5 + 4;
  }
  return y;
}

function renderQuickWins(doc: jsPDF, startY: number, wins: QuickWin[]): number {
  let y = startY;

  // Table header
  y = checkPageBreak(doc, y, 10);
  setFill(doc, C.card);
  doc.rect(15, y - 3, 180, 7, "F");
  setColor(doc, C.textMuted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("QUICK WIN", 17, y);
  doc.text("EFFORT", 120, y);
  doc.text("IMPACT", 150, y);
  doc.text("EST. %", 175, y);
  y += 6;

  for (const win of wins) {
    y = checkPageBreak(doc, y, 12);

    setColor(doc, C.text);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(sanitizeForPdf(win.title).slice(0, 55), 17, y);

    doc.setFont("helvetica", "normal");
    setColor(doc, C.textMuted);
    doc.text(sanitizeForPdf(win.estimatedEffort), 120, y);

    setColor(doc, win.estimatedImpact === "high" ? C.green : win.estimatedImpact === "medium" ? C.amber : C.primary);
    doc.text(sanitizeForPdf(win.estimatedImpact), 150, y);

    setColor(doc, C.green);
    doc.setFont("helvetica", "bold");
    doc.text(`+${win.impactPercentage}%`, 175, y);

    y += 4;
    setColor(doc, C.textMuted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(sanitizeForPdf(win.description), 160);
    doc.text(descLines.slice(0, 2), 17, y);
    y += descLines.slice(0, 2).length * 3 + 4;
  }
  return y;
}

function renderKeywords(
  doc: jsPDF,
  startY: number,
  keywords: KeywordSuggestion[]
): number {
  let y = startY;

  // Table header
  y = checkPageBreak(doc, y, 10);
  setFill(doc, C.card);
  doc.rect(15, y - 3, 180, 7, "F");
  setColor(doc, C.textMuted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("KEYWORD", 17, y);
  doc.text("RELEVANCE", 85, y);
  doc.text("DIFFICULTY", 115, y);
  doc.text("VOLUME", 145, y);
  doc.text("ON PAGE", 170, y);
  y += 6;

  for (const kw of keywords) {
    y = checkPageBreak(doc, y, 10);

    setColor(doc, C.text);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(sanitizeForPdf(kw.keyword).slice(0, 35), 17, y);

    // Relevance bar
    drawScoreBar(doc, 85, y - 2, 22, kw.relevanceScore, C.primary);
    setColor(doc, C.textMuted);
    doc.setFontSize(7);
    doc.text(String(kw.relevanceScore), 109, y);

    // Difficulty
    const diffCol = kw.estimatedDifficulty === "easy" ? C.green : kw.estimatedDifficulty === "medium" ? C.amber : C.red;
    setColor(doc, diffCol);
    doc.setFontSize(7);
    doc.text(kw.estimatedDifficulty, 115, y);

    // Volume
    setColor(doc, C.textMuted);
    doc.text(kw.estimatedSearchVolume, 145, y);

    // On page
    setColor(doc, kw.currentlyUsed ? C.green : C.red);
    doc.text(kw.currentlyUsed ? "Yes" : "No", 173, y);

    y += 5;

    // Suggestion on next line
    if (kw.suggestion) {
      y = checkPageBreak(doc, y, 6);
      setColor(doc, C.textMuted);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "italic");
      doc.text(sanitizeForPdf(kw.suggestion).slice(0, 90), 20, y);
      y += 4;
    }
  }
  return y;
}

function renderStrategy(
  doc: jsPDF,
  startY: number,
  strategy: StrategyItem[]
): number {
  let y = startY;

  const timeframes: [string, string][] = [
    ["immediate", "DO NOW"],
    ["short-term", "THIS MONTH"],
    ["long-term", "THIS QUARTER"],
  ];

  for (const [tf, label] of timeframes) {
    const items = strategy.filter((s) => s.timeframe === tf);
    if (!items.length) continue;

    y = checkPageBreak(doc, y, 12);

    // Timeframe header
    setColor(doc, C.primary);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label, 15, y);
    setDraw(doc, C.border);
    doc.setLineWidth(0.3);
    doc.line(45, y - 1, 195, y - 1);
    y += 5;

    for (const item of items) {
      y = checkPageBreak(doc, y, 14);

      const prioCol = item.priority === "high" ? C.red : item.priority === "medium" ? C.amber : C.green;

      setColor(doc, C.text);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(sanitizeForPdf(item.title).slice(0, 60), 18, y);

      setColor(doc, prioCol);
      doc.setFontSize(7);
      doc.text(`[${item.priority.toUpperCase()}]`, 180, y, { align: "right" });

      y += 4;
      setColor(doc, C.textMuted);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(sanitizeForPdf(item.description), 165);
      doc.text(lines.slice(0, 3), 18, y);
      y += lines.slice(0, 3).length * 3.5 + 4;
    }
    y += 3;
  }
  return y;
}

function renderWebVitals(
  doc: jsPDF,
  startY: number,
  ps: PageSpeedResult
): number {
  let y = startY;
  y = checkPageBreak(doc, y, 40);

  const vitals: [string, string, string, string][] = [
    ["LCP", ps.mobile.coreWebVitals.lcp.displayValue, ps.mobile.coreWebVitals.lcp.rating, "Largest Contentful Paint"],
    ["CLS", ps.mobile.coreWebVitals.cls.displayValue, ps.mobile.coreWebVitals.cls.rating, "Cumulative Layout Shift"],
    ["INP", ps.mobile.coreWebVitals.inp.displayValue, ps.mobile.coreWebVitals.inp.rating, "Interaction to Next Paint"],
    ["FCP", ps.mobile.coreWebVitals.fcp.displayValue, ps.mobile.coreWebVitals.fcp.rating, "First Contentful Paint"],
  ];

  // Header
  setFill(doc, C.card);
  doc.rect(15, y - 3, 180, 7, "F");
  setColor(doc, C.textMuted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("METRIC", 17, y);
  doc.text("VALUE", 70, y);
  doc.text("RATING", 110, y);
  doc.text("DESCRIPTION", 140, y);
  y += 7;

  for (const [label, value, rating, desc] of vitals) {
    const ratingCol = rating === "good" ? C.green : rating === "needs-improvement" ? C.amber : C.red;

    setColor(doc, C.text);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label, 17, y);

    setColor(doc, ratingCol);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(value, 70, y);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(rating === "needs-improvement" ? "Needs Work" : rating.charAt(0).toUpperCase() + rating.slice(1), 110, y);

    setColor(doc, C.textMuted);
    doc.setFontSize(7);
    const wvDescLines = doc.splitTextToSize(desc, 52);
    doc.text(wvDescLines.slice(0, 2), 140, y);

    y += 7;
  }

  // Scores
  y += 3;
  setColor(doc, C.text);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Mobile Performance: ${ps.mobile.scores.performance}/100`, 15, y);
  doc.text(`Desktop Performance: ${ps.desktop.scores.performance}/100`, 105, y);
  y += 5;
  doc.text(`Accessibility: ${ps.mobile.scores.accessibility}/100`, 15, y);
  doc.text(`Google SEO Score: ${ps.mobile.scores.seo}/100`, 105, y);
  y += 5;

  return y;
}

function renderNLSection(doc: jsPDF, startY: number, nl: NaturalLanguageResult): number {
  let y = startY;

  // Top entities
  const topEntities = nl.entities.slice(0, 8);
  if (topEntities.length > 0) {
    y = checkPageBreak(doc, y, 10);
    setColor(doc, C.textMuted);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("WHAT GOOGLE RECOGNIZES ON THIS PAGE", 15, y);
    y += 5;

    const entityTypeColors: Record<string, string> = {
      ORGANIZATION: C.primary,
      PERSON: "#A855F7",
      LOCATION: C.green,
      CONSUMER_GOOD: C.amber,
      EVENT: "#EC4899",
      WORK_OF_ART: "#EAB308",
    };

    let ex = 15;
    for (const entity of topEntities) {
      const entityColor = entityTypeColors[entity.type] || C.textMuted;
      const chipText = `${sanitizeForPdf(entity.name)} (${Math.round(entity.salience * 100)}%)`;
      // Cap chip width to prevent overflow — mirrors pro-report approach
      const chipW = Math.min(chipText.length * 1.5 + 6, 72);
      // Truncate display text to fit inside the capped chip width
      const displayText = (doc.splitTextToSize(chipText, chipW - 4) as string[])[0] ?? chipText;

      if (ex + chipW > 190) {
        ex = 15;
        y += 7;
      }
      y = checkPageBreak(doc, y, 8);

      setFill(doc, C.card);
      doc.roundedRect(ex, y - 3, chipW, 5.5, 1.5, 1.5, "F");
      setColor(doc, entityColor);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.text(displayText, ex + chipW / 2, y, { align: "center" });
      ex += chipW + 3;
    }
    y += 8;
  }

  // Top category
  if (nl.categories.length > 0) {
    y = checkPageBreak(doc, y, 18);
    const cat = nl.categories[0];
    setColor(doc, C.textMuted);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("GOOGLE'S CATEGORY:", 15, y);
    y += 5;
    setColor(doc, C.green);
    doc.setFont("helvetica", "normal");
    // Convert raw path "/Foo/Bar/Baz" → "Foo > Bar > Baz" and wrap to full width
    const catDisplay = sanitizeForPdf(cat.name.split("/").filter(Boolean).join(" > "));
    const catText = `${catDisplay}  (${Math.round(cat.confidence * 100)}% confidence)`;
    const catLines = doc.splitTextToSize(catText, 175) as string[];
    doc.text(catLines.slice(0, 2), 15, y);
    y += catLines.slice(0, 2).length * 4.5 + 3;
  }

  // Sentiment
  y = checkPageBreak(doc, y, 10);
  const sentCol =
    nl.sentiment.score >= 0.1 ? C.green :
    nl.sentiment.score <= -0.1 ? C.red : C.textMuted;
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CONTENT SENTIMENT:", 15, y);
  setColor(doc, sentCol);
  doc.setFont("helvetica", "bold");
  doc.text(`${nl.sentiment.label.toUpperCase()}  (score: ${nl.sentiment.score > 0 ? "+" : ""}${nl.sentiment.score})`, 63, y);
  y += 6;

  return y;
}

// ─── AI Search Readiness (compact 2-column layout) ───────
function renderAIScore(doc: jsPDF, startY: number, ai: AIReadinessResult): number {
  let y = startY;
  y = checkPageBreak(doc, y, 30);

  const passing = ai.signals.filter((s) => s.status === "pass").length;
  const failing = ai.signals.filter((s) => s.status === "fail").length;
  const warning = ai.signals.filter((s) => s.status === "warn").length;

  // Header bar
  setFill(doc, "#1a1040");
  doc.roundedRect(15, y - 3, 180, 12, 2, 2, "F");
  setColor(doc, "#A78BFA");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("AI Search Readiness", 20, y + 4);
  // Grade badge
  const gradeCol = ai.grade === "excellent" ? C.green : ai.grade === "good" ? "#06B6D4" : ai.grade === "fair" ? C.amber : C.red;
  setColor(doc, gradeCol);
  doc.text(`${ai.score}/100 - ${ai.grade.toUpperCase()}`, 145, y + 4);
  y += 14;

  // Summary row
  setColor(doc, C.textMuted);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  setColor(doc, C.green);
  doc.text(`(+) ${passing} passing`, 20, y);
  setColor(doc, C.amber);
  doc.text(`(~) ${warning} warning`, 65, y);
  setColor(doc, C.red);
  doc.text(`(x) ${failing} failing`, 110, y);
  y += 6;

  // Top-5 weakest signals (warn + fail first)
  const sorted = [...ai.signals].sort((a, b) => a.score - b.score).slice(0, 5);
  for (const sig of sorted) {
    y = checkPageBreak(doc, y, 10);
    const col = sig.status === "pass" ? C.green : sig.status === "warn" ? C.amber : C.red;
    const bullet = sig.status === "pass" ? "+" : sig.status === "warn" ? "~" : "x";
    setColor(doc, col);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(`[${bullet}]`, 18, y);
    setColor(doc, C.text);
    doc.setFont("helvetica", "normal");
    doc.text(sanitizeForPdf(sig.label), 27, y);
    setColor(doc, C.textMuted);
    const descLines = doc.splitTextToSize(sanitizeForPdf(sig.description), 130) as string[];
    doc.text(descLines[0] ?? "", 27, y + 3.5);
    y += 10;
  }

  return y + 3;
}

// ─── Download helper ─────────────────────────────────────
export function downloadSeoReport(data: PdfExportData) {
  const doc = generateSeoReport(data);
  const hostname = (() => {
    try {
      return new URL(data.url.startsWith("http") ? data.url : `https://${data.url}`).hostname;
    } catch {
      return "website";
    }
  })();
  doc.save(`SEO-Report-${hostname}-${new Date().toISOString().split("T")[0]}.pdf`);
}
