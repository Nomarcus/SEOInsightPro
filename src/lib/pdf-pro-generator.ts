/**
 * SEO Insight Pro — PRO Report PDF Generator
 *
 * Generates a premium, exhaustive PDF report with step-by-step fix guides.
 * Intended as the paid deliverable given to consulting clients.
 *
 * Layout order (always the same):
 *   1. Cover page:          PRO badge, CONFIDENTIAL, score circle
 *   2. Executive Summary:   3 critical issues + 3 quick wins overview
 *   3. Score Breakdown:     Category bars with context text
 *   4. SERP Preview:        Current vs AI-improved
 *   5. Detailed Fix Guides: Each issue with numbered steps, time, tools
 *   6. Quick Wins:          Full detail table
 *   7. 30/60/90-Day Plan:   Strategy grouped by timeframe
 *   8. Keyword Strategy:    Full keyword table + suggestions
 *   9. Core Web Vitals:     Conditional — only if data available
 *  10. Traffic Potential:   Full reasoning text
 *  11. CTA / Contact page
 */

import jsPDF from "jspdf";
import type {
  AnalysisResult,
  ScrapeResult,
  PageSpeedResult,
  NaturalLanguageResult,
  BrandingConfig,
  WeaknessItem,
  QuickWin,
  KeywordSuggestion,
  StrategyItem,
  AIReadinessResult,
} from "./types";
import { getScoreLabel } from "./constants";

// ─── Colors (same dark theme as standard PDF) ────────────
const C = {
  bg: "#0B1120",
  card: "#111827",
  card2: "#1a2236",
  text: "#E5E7EB",
  textMuted: "#9CA3AF",
  primary: "#3B82F6",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  white: "#FFFFFF",
  border: "#1F2937",
  gold: "#F59E0B",
  goldDark: "#D97706",
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

function drawPageBg(doc: jsPDF) {
  setFill(doc, C.bg);
  doc.rect(0, 0, 210, 297, "F");
}

function newPage(doc: jsPDF): number {
  doc.addPage();
  drawPageBg(doc);
  // Subtle "PRO" watermark top-right on every page
  setColor(doc, "#1a2236");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("PRO REPORT — CONFIDENTIAL", 195, 8, { align: "right" });
  return 20;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 278) {
    return newPage(doc);
  }
  return y;
}

function sectionTitle(doc: jsPDF, y: number, title: string): number {
  y = checkPageBreak(doc, y, 16);
  setColor(doc, C.white);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 15, y);
  setDraw(doc, C.gold);
  doc.setLineWidth(0.5);
  doc.line(15, y + 2, 195, y + 2);
  return y + 10;
}

function drawScoreBar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  score: number,
  color: string
) {
  setFill(doc, C.border);
  doc.roundedRect(x, y, width, 4, 2, 2, "F");
  setFill(doc, color);
  const fillWidth = Math.max(2, (width * score) / 100);
  doc.roundedRect(x, y, fillWidth, 4, 2, 2, "F");
}

function badge(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  bgHex: string,
  textHex: string = C.white
) {
  const w = label.length * 1.6 + 4;
  setFill(doc, bgHex);
  doc.roundedRect(x, y - 3.5, w, 5, 1.5, 1.5, "F");
  setColor(doc, textHex);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text(label, x + w / 2, y, { align: "center" });
}

// ─── Main Export ─────────────────────────────────────────
export interface ProPdfExportData {
  url: string;
  analysisResult: AnalysisResult;
  scrapeResult: ScrapeResult | null;
  pageSpeedResult: PageSpeedResult | null;
  nlResult: NaturalLanguageResult | null;
  branding: BrandingConfig;
}

export function generateProSeoReport(data: ProPdfExportData): jsPDF {
  const { url, analysisResult: r, pageSpeedResult: ps, nlResult: nl, branding: b } = data;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const hostname = (() => {
    try {
      return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    } catch {
      return url;
    }
  })();

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ══════════════════════════════════════════════════════
  // PAGE 1: COVER
  // ══════════════════════════════════════════════════════
  drawPageBg(doc);

  // Gold top banner
  setFill(doc, C.goldDark);
  doc.rect(0, 0, 210, 18, "F");
  setColor(doc, C.bg);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("★  PRO REPORT  ·  CONFIDENTIAL  ·  PREPARED EXCLUSIVELY FOR CLIENT  ★", 105, 11, { align: "center" });

  let cy = 42;

  // Consultant branding
  setColor(doc, C.textMuted);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(b.companyName || "SEO Insight Pro", 105, cy, { align: "center" });
  cy += 14;

  // Main title
  setColor(doc, C.white);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("SEO Pro Analysis Report", 105, cy, { align: "center" });
  cy += 8;

  // Subtitle
  setColor(doc, C.gold);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Step-by-Step Implementation Guide", 105, cy, { align: "center" });
  cy += 14;

  // Website
  setColor(doc, C.primary);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(hostname, 105, cy, { align: "center" });
  cy += 24;

  // Score circle (gold ring)
  const scoreCol = scoreColor(r.overallScore);
  setDraw(doc, C.gold);
  doc.setLineWidth(3);
  doc.circle(105, cy + 15, 22, "S");
  setColor(doc, scoreCol);
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.text(String(r.overallScore), 105, cy + 18, { align: "center" });
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("out of 100", 105, cy + 25, { align: "center" });
  cy += 46;

  // Score label
  setColor(doc, scoreCol);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(getScoreLabel(r.overallScore), 105, cy, { align: "center" });
  cy += 12;

  // Industry
  if (r.industryCategory) {
    setColor(doc, C.textMuted);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Industry: ${r.industryCategory}`, 105, cy, { align: "center" });
    cy += 8;
  }

  // AI badge
  if (r.aiProvider === "both") {
    setColor(doc, C.green);
    doc.setFontSize(8);
    doc.text("✓  Dual AI Verified (Claude + GPT-4o)", 105, cy, { align: "center" });
    cy += 8;
  }

  // Date
  cy = 248;
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.text(`Prepared on ${dateStr}`, 105, cy, { align: "center" });
  cy += 5;
  if (b.consultantName) {
    setColor(doc, C.text);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`Prepared by: ${b.consultantName}`, 105, cy, { align: "center" });
    cy += 5;
  }

  // Gold bottom strip
  setFill(doc, C.goldDark);
  doc.rect(0, 279, 210, 18, "F");
  setColor(doc, C.bg);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Powered by SEO Insight Pro  ·  AI-Powered Analysis", 105, 289, { align: "center" });

  // ══════════════════════════════════════════════════════
  // PAGE 2: EXECUTIVE SUMMARY
  // ══════════════════════════════════════════════════════
  let y = newPage(doc);
  y = sectionTitle(doc, y, "Executive Summary");
  y += 2;

  // Overall score mini block
  y = checkPageBreak(doc, y, 18);
  setFill(doc, C.card);
  doc.roundedRect(15, y - 3, 180, 16, 3, 3, "F");
  setColor(doc, scoreColor(r.overallScore));
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(String(r.overallScore), 30, y + 8);
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Overall SEO Score", 30, y + 13);
  setColor(doc, C.text);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const summaryText = `${hostname} scores ${r.overallScore}/100 in our comprehensive SEO analysis. ` +
    `${r.overallScore < 60 ? "Significant improvements are needed to compete effectively in search results." : r.overallScore < 80 ? "Good foundation exists — targeted improvements will drive meaningful growth." : "Strong SEO performance — refinements can push rankings to the next level."}`;
  const summaryLines = doc.splitTextToSize(summaryText, 130);
  doc.text(summaryLines.slice(0, 2), 60, y + 6);
  y += 22;

  // Critical Issues column
  const criticalIssues = r.weaknesses.filter((w) => w.severity === "critical").slice(0, 3);
  const quickWins = r.quickWins.slice(0, 3);

  y = checkPageBreak(doc, y, 10);
  setColor(doc, C.red);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("★  TOP CRITICAL ISSUES", 15, y);
  setColor(doc, C.gold);
  doc.text("★  FASTEST WINS", 110, y);
  y += 5;

  const maxRows = Math.max(criticalIssues.length, quickWins.length);
  for (let i = 0; i < maxRows; i++) {
    y = checkPageBreak(doc, y, 10);

    // Left: critical issue
    if (criticalIssues[i]) {
      setColor(doc, C.text);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${criticalIssues[i].title.slice(0, 45)}`, 15, y);
      if (criticalIssues[i].estimatedFixTime) {
        setColor(doc, C.textMuted);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(`Fix time: ${criticalIssues[i].estimatedFixTime}`, 15, y + 4);
      }
    }

    // Right: quick win
    if (quickWins[i]) {
      setColor(doc, C.text);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${quickWins[i].title.slice(0, 40)}`, 110, y);
      setColor(doc, C.green);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(`+${quickWins[i].impactPercentage}%`, 190, y, { align: "right" });
    }

    y += 10;
  }

  // ══════════════════════════════════════════════════════
  // SCORE BREAKDOWN
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "Score Breakdown by Category");
  y += 2;

  const categories: [string, string, string][] = [
    ["technical", "Technical SEO", "Site structure, indexability, HTTPS, speed signals"],
    ["content", "Content Quality", "Word count, readability, keyword usage, relevance"],
    ["onPage", "On-Page SEO", "Title tags, meta descriptions, headings, images"],
    ["performance", "Performance", "Page load speed, Core Web Vitals, mobile experience"],
    ["userExperience", "User Experience", "Navigation, mobile usability, accessibility"],
  ];

  for (const [key, label, desc] of categories) {
    const cat = r.categoryScores[key as keyof typeof r.categoryScores];
    if (!cat) continue;
    y = checkPageBreak(doc, y, 16);

    setColor(doc, C.text);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, 15, y);
    setColor(doc, scoreColor(cat.score));
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${cat.score}/100`, 185, y, { align: "right" });
    drawScoreBar(doc, 15, y + 2, 165, cat.score, scoreColor(cat.score));
    setColor(doc, C.textMuted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(desc, 15, y + 9);
    y += 16;
  }

  // ══════════════════════════════════════════════════════
  // CONTENT INTELLIGENCE (NL API — shown if available)
  // ══════════════════════════════════════════════════════
  if (nl) {
    y += 3;
    y = sectionTitle(doc, y, "Content Intelligence — Google NL Analysis");
    y = renderProNLSection(doc, y, nl);
  }

  // ══════════════════════════════════════════════════════
  // SERP PREVIEW
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "Google Search Preview");
  y += 2;

  // Current SERP
  y = checkPageBreak(doc, y, 32);
  setFill(doc, C.card);
  doc.roundedRect(15, y - 2, 180, 28, 2, 2, "F");
  setColor(doc, C.textMuted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("CURRENT", 18, y + 3);
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(r.serpPreview.url.slice(0, 80), 18, y + 8);
  setColor(doc, C.primary);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text((r.serpPreview.currentTitle || "(No title set)").slice(0, 70), 18, y + 14);
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const curDescLines = doc.splitTextToSize(r.serpPreview.currentDescription || "(No meta description)", 165);
  doc.text(curDescLines.slice(0, 2), 18, y + 19);
  // Char count
  const curTitleLen = (r.serpPreview.currentTitle || "").length;
  const curDescLen = (r.serpPreview.currentDescription || "").length;
  setColor(doc, curTitleLen > 60 ? C.red : curTitleLen < 30 ? C.amber : C.green);
  doc.setFontSize(6);
  doc.text(`Title: ${curTitleLen} chars`, 100, y + 3);
  setColor(doc, curDescLen > 160 ? C.red : curDescLen < 100 ? C.amber : C.green);
  doc.text(`Description: ${curDescLen} chars`, 140, y + 3);
  y += 32;

  // Improved SERP
  y = checkPageBreak(doc, y, 32);
  setFill(doc, "#0d1f16");
  doc.roundedRect(15, y - 2, 180, 28, 2, 2, "F");
  setDraw(doc, C.green);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, y - 2, 180, 28, 2, 2, "S");
  setColor(doc, C.green);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("AI IMPROVED", 18, y + 3);
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(r.serpPreview.url.slice(0, 80), 18, y + 8);
  setColor(doc, C.green);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text((r.serpPreview.improvedTitle || "").slice(0, 70), 18, y + 14);
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const impDescLines = doc.splitTextToSize(r.serpPreview.improvedDescription || "", 165);
  doc.text(impDescLines.slice(0, 2), 18, y + 19);
  const impTitleLen = (r.serpPreview.improvedTitle || "").length;
  const impDescLen = (r.serpPreview.improvedDescription || "").length;
  setColor(doc, impTitleLen > 60 ? C.red : impTitleLen < 30 ? C.amber : C.green);
  doc.setFontSize(6);
  doc.text(`Title: ${impTitleLen} chars`, 100, y + 3);
  setColor(doc, impDescLen > 160 ? C.red : impDescLen < 100 ? C.amber : C.green);
  doc.text(`Description: ${impDescLen} chars`, 140, y + 3);
  y += 32;

  // ══════════════════════════════════════════════════════
  // DETAILED ISSUE FIX GUIDES (the pro section)
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "Detailed Issue Fix Guides");
  y += 2;

  y = renderProIssues(doc, y, r.weaknesses);

  // ══════════════════════════════════════════════════════
  // QUICK WINS (full detail)
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "Quick Wins — Implementation Guide");
  y = renderProQuickWins(doc, y, r.quickWins);

  // ══════════════════════════════════════════════════════
  // 30/60/90 DAY PLAN
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "30 / 60 / 90 Day Implementation Plan");
  y = renderProStrategy(doc, y, r.strategy);

  // ══════════════════════════════════════════════════════
  // KEYWORD STRATEGY
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "Keyword Strategy");
  y = renderProKeywords(doc, y, r.keywords);

  // ══════════════════════════════════════════════════════
  // CORE WEB VITALS (if available)
  // ══════════════════════════════════════════════════════
  if (ps) {
    y += 3;
    y = sectionTitle(doc, y, "Core Web Vitals — Technical Performance");
    y = renderProWebVitals(doc, y, ps);
  }

  // ══════════════════════════════════════════════════════
  // TRAFFIC POTENTIAL
  // ══════════════════════════════════════════════════════
  y += 3;
  y = sectionTitle(doc, y, "Traffic Growth Potential");
  y = checkPageBreak(doc, y, 40);

  setFill(doc, C.card);
  doc.roundedRect(15, y - 3, 180, 36, 3, 3, "F");

  setColor(doc, C.green);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(`+${r.trafficPotential.percentageIncrease}%`, 35, y + 13);

  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("estimated growth potential", 35, y + 19);

  setColor(doc, C.text);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Current traffic level: ${r.trafficPotential.currentEstimate.toUpperCase()}`, 100, y + 8);
  setColor(doc, C.green);
  doc.text(`Potential traffic level: ${r.trafficPotential.potentialEstimate.toUpperCase()}`, 100, y + 14);

  y += 40;
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const reasonLines = doc.splitTextToSize(r.trafficPotential.reasoning, 170);
  doc.text(reasonLines, 15, y);
  y += reasonLines.length * 4 + 5;

  // ══════════════════════════════════════════════════════
  // AI SEARCH READINESS
  // ══════════════════════════════════════════════════════
  if (r.aiReadiness) {
    y += 3;
    y = sectionTitle(doc, y, "AI Search Readiness — AI Overview Optimisation");
    y = renderProAIScore(doc, y, r.aiReadiness);
  }

  // ══════════════════════════════════════════════════════
  // CTA / CONTACT PAGE
  // ══════════════════════════════════════════════════════
  y = newPage(doc);

  // Gold top strip on last page
  setFill(doc, C.goldDark);
  doc.rect(0, 0, 210, 18, "F");
  setColor(doc, C.bg);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("★  PRO REPORT  ·  PREPARED EXCLUSIVELY FOR YOU  ★", 105, 11, { align: "center" });

  y = 70;
  setColor(doc, C.white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(b.ctaText || "Ready to Dominate Search Results?", 105, y, { align: "center" });
  y += 10;

  if (b.ctaDescription) {
    setColor(doc, C.textMuted);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const ctaLines = doc.splitTextToSize(b.ctaDescription, 155);
    doc.text(ctaLines.slice(0, 3), 105, y, { align: "center" });
    y += ctaLines.slice(0, 3).length * 5 + 5;
  }

  y += 10;

  // Contact card
  setFill(doc, C.card);
  doc.roundedRect(45, y, 120, 55, 4, 4, "F");
  setDraw(doc, C.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(45, y, 120, 55, 4, 4, "S");

  y += 10;
  setColor(doc, C.gold);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("YOUR SEO CONSULTANT", 105, y, { align: "center" });
  y += 7;

  setColor(doc, C.white);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(b.consultantName || "", 105, y, { align: "center" });
  y += 7;

  if (b.companyName && b.companyName !== "SEO Insight Pro") {
    setColor(doc, C.primary);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(b.companyName, 105, y, { align: "center" });
    y += 7;
  }

  setColor(doc, C.text);
  doc.setFontSize(9);
  if (b.consultantEmail) {
    doc.text(`✉  ${b.consultantEmail}`, 105, y, { align: "center" });
    y += 6;
  }
  if (b.consultantPhone) {
    doc.text(`✆  ${b.consultantPhone}`, 105, y, { align: "center" });
    y += 6;
  }

  // Fix Guide note
  y += 10;
  setColor(doc, "#A78BFA");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.text("An interactive web-based Fix Guide is also available — ask your consultant for access.", 105, y, { align: "center" });

  // Footer
  setColor(doc, C.textMuted);
  doc.setFontSize(7);
  doc.text("Generated by SEO Insight Pro  ·  Pro Edition", 105, 285, { align: "center" });

  return doc;
}

// ─── Pro Section Renderers ───────────────────────────────

function renderProIssues(
  doc: jsPDF,
  startY: number,
  weaknesses: WeaknessItem[]
): number {
  let y = startY;

  for (let idx = 0; idx < weaknesses.length; idx++) {
    const item = weaknesses[idx];
    const isCritical = item.severity === "critical";

    // Estimate block height: header(12) + description(8) + steps(fixSteps.length * 6) + footer(10) + padding(8)
    const stepCount = item.fixSteps?.length ?? 0;
    const blockHeight = 12 + 8 + stepCount * 6 + 12 + 8;
    y = checkPageBreak(doc, y, blockHeight);

    // Card background
    setFill(doc, C.card);
    doc.roundedRect(15, y - 2, 180, blockHeight, 3, 3, "F");

    // Left severity stripe
    setFill(doc, isCritical ? C.red : C.amber);
    doc.rect(15, y - 2, 3, blockHeight, "F");

    // Issue number + title
    setColor(doc, C.white);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${idx + 1}. ${item.title}`, 21, y + 6);

    // Severity badge
    badge(doc, 155, y + 6, isCritical ? "CRITICAL" : "WARNING", isCritical ? C.red : C.amber);

    // Category badge
    badge(doc, 110, y + 6, item.category.toUpperCase(), C.card2);

    // Description (full, not truncated)
    y += 11;
    setColor(doc, C.textMuted);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(item.description, 170);
    doc.text(descLines.slice(0, 3), 21, y);
    y += descLines.slice(0, 3).length * 3.5 + 3;

    // Fix steps
    if (item.fixSteps && item.fixSteps.length > 0) {
      setColor(doc, C.gold);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("HOW TO FIX:", 21, y);
      y += 5;

      for (let s = 0; s < item.fixSteps.length; s++) {
        y = checkPageBreak(doc, y, 7);
        setColor(doc, C.primary);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.text(`${s + 1}.`, 21, y);
        setColor(doc, C.text);
        doc.setFont("helvetica", "normal");
        const stepLines = doc.splitTextToSize(item.fixSteps[s], 162);
        doc.text(stepLines.slice(0, 2), 26, y);
        y += stepLines.slice(0, 2).length * 4 + 1;
      }
    }

    // Footer row: time + level + tools
    y += 2;
    const footerY = y;
    if (item.estimatedFixTime) {
      setColor(doc, C.textMuted);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(`⏱ ${item.estimatedFixTime}`, 21, footerY);
    }
    if (item.technicalLevel) {
      const lvlColors: Record<string, string> = {
        beginner: C.green,
        intermediate: C.amber,
        advanced: C.red,
      };
      setColor(doc, lvlColors[item.technicalLevel] || C.textMuted);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(item.technicalLevel.toUpperCase(), 70, footerY);
    }
    if (item.tools && item.tools.length > 0) {
      setColor(doc, C.textMuted);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(`Tools: ${item.tools.slice(0, 3).join(", ")}`, 100, footerY);
    }

    y += 10;
  }

  return y;
}

function renderProQuickWins(doc: jsPDF, startY: number, wins: QuickWin[]): number {
  let y = startY;

  // Table header
  y = checkPageBreak(doc, y, 10);
  setFill(doc, C.card);
  doc.rect(15, y - 3, 180, 8, "F");
  setColor(doc, C.gold);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("QUICK WIN", 18, y);
  doc.text("EFFORT", 115, y);
  doc.text("IMPACT", 143, y);
  doc.text("GAIN", 175, y);
  y += 7;

  for (const win of wins) {
    y = checkPageBreak(doc, y, 16);

    setColor(doc, C.text);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(win.title.slice(0, 58), 18, y);
    doc.setFont("helvetica", "normal");
    setColor(doc, C.textMuted);
    doc.text(win.estimatedEffort, 115, y);
    setColor(
      doc,
      win.estimatedImpact === "high" ? C.green : win.estimatedImpact === "medium" ? C.amber : C.primary
    );
    doc.text(win.estimatedImpact, 143, y);
    setColor(doc, C.green);
    doc.setFont("helvetica", "bold");
    doc.text(`+${win.impactPercentage}%`, 175, y);

    y += 4;
    setColor(doc, C.textMuted);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(win.description, 165);
    doc.text(descLines.slice(0, 2), 18, y);
    y += descLines.slice(0, 2).length * 3.5 + 5;
  }

  return y;
}

function renderProStrategy(doc: jsPDF, startY: number, strategy: StrategyItem[]): number {
  let y = startY;

  const timeframes: [string, string, string, string][] = [
    ["immediate", "DAYS 1–30", "Start immediately — highest impact actions", C.red],
    ["short-term", "DAYS 31–60", "Build on quick wins — mid-complexity work", C.amber],
    ["long-term", "DAYS 61–90", "Long-term positioning — sustainable growth", C.green],
  ];

  for (const [tf, label, subLabel, color] of timeframes) {
    const items = strategy.filter((s) => s.timeframe === tf);
    if (!items.length) continue;

    y = checkPageBreak(doc, y, 14);

    // Timeframe header block
    setFill(doc, C.card);
    doc.roundedRect(15, y - 3, 180, 10, 2, 2, "F");
    setFill(doc, color);
    doc.roundedRect(15, y - 3, 4, 10, 2, 2, "F");
    setColor(doc, color);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, 22, y + 3);
    setColor(doc, C.textMuted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(subLabel, 65, y + 3);
    y += 12;

    for (const item of items) {
      y = checkPageBreak(doc, y, 16);

      const prioColor = item.priority === "high" ? C.red : item.priority === "medium" ? C.amber : C.green;
      setColor(doc, C.text);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`→  ${item.title.slice(0, 62)}`, 18, y);
      badge(doc, 180, y, item.priority.toUpperCase(), prioColor);
      y += 5;
      setColor(doc, C.textMuted);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(item.description, 165);
      doc.text(lines.slice(0, 3), 21, y);
      y += lines.slice(0, 3).length * 3.5 + 5;
    }

    y += 4;
  }

  return y;
}

function renderProKeywords(doc: jsPDF, startY: number, keywords: KeywordSuggestion[]): number {
  let y = startY;

  // Table header
  y = checkPageBreak(doc, y, 10);
  setFill(doc, C.card);
  doc.rect(15, y - 3, 180, 8, "F");
  setColor(doc, C.gold);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("KEYWORD", 18, y);
  doc.text("RELEVANCE", 78, y);
  doc.text("DIFFICULTY", 108, y);
  doc.text("VOLUME", 138, y);
  doc.text("ON PAGE", 163, y);
  doc.text("PRIORITY", 183, y, { align: "right" });
  y += 7;

  for (const kw of keywords) {
    y = checkPageBreak(doc, y, 13);

    setColor(doc, C.text);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(kw.keyword.slice(0, 32), 18, y);

    // Relevance bar
    setFill(doc, C.border);
    doc.roundedRect(78, y - 2, 24, 4, 2, 2, "F");
    setFill(doc, C.primary);
    doc.roundedRect(78, y - 2, Math.max(2, (24 * kw.relevanceScore) / 100), 4, 2, 2, "F");
    setColor(doc, C.textMuted);
    doc.setFontSize(6.5);
    doc.text(String(kw.relevanceScore), 104, y);

    const diffCol =
      kw.estimatedDifficulty === "easy" ? C.green : kw.estimatedDifficulty === "medium" ? C.amber : C.red;
    setColor(doc, diffCol);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(kw.estimatedDifficulty, 108, y);

    const volCol =
      kw.estimatedSearchVolume === "high" ? C.green : kw.estimatedSearchVolume === "medium" ? C.amber : C.textMuted;
    setColor(doc, volCol);
    doc.text(kw.estimatedSearchVolume, 138, y);

    setColor(doc, kw.currentlyUsed ? C.green : C.red);
    doc.text(kw.currentlyUsed ? "✓ Yes" : "✗ No", 163, y);

    // Priority = high relevance + easy + high volume
    const prio =
      kw.relevanceScore >= 70 && kw.estimatedDifficulty === "easy" && kw.estimatedSearchVolume === "high"
        ? "HIGH"
        : kw.relevanceScore >= 50 && kw.estimatedDifficulty !== "hard"
          ? "MED"
          : "LOW";
    const prioCol = prio === "HIGH" ? C.red : prio === "MED" ? C.amber : C.textMuted;
    badge(doc, 176, y, prio, prioCol);

    y += 5;

    if (kw.suggestion) {
      y = checkPageBreak(doc, y, 6);
      setColor(doc, C.textMuted);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "italic");
      const suggLines = doc.splitTextToSize(kw.suggestion, 165);
      doc.text(suggLines.slice(0, 2), 21, y);
      y += suggLines.slice(0, 2).length * 3.5 + 2;
    }
  }

  return y;
}

function renderProWebVitals(doc: jsPDF, startY: number, ps: PageSpeedResult): number {
  let y = startY;
  y = checkPageBreak(doc, y, 50);

  const vitals: [string, string, string, string, string][] = [
    ["LCP", ps.mobile.coreWebVitals.lcp.displayValue, ps.mobile.coreWebVitals.lcp.rating, "Largest Contentful Paint", "Time until the largest visible element loads. Target: < 2.5s"],
    ["CLS", ps.mobile.coreWebVitals.cls.displayValue, ps.mobile.coreWebVitals.cls.rating, "Cumulative Layout Shift", "Visual stability — how much the page shifts during load. Target: < 0.1"],
    ["INP", ps.mobile.coreWebVitals.inp.displayValue, ps.mobile.coreWebVitals.inp.rating, "Interaction to Next Paint", "Responsiveness to user input. Target: < 200ms"],
    ["FCP", ps.mobile.coreWebVitals.fcp.displayValue, ps.mobile.coreWebVitals.fcp.rating, "First Contentful Paint", "Time until first content appears. Target: < 1.8s"],
  ];

  // Header
  setFill(doc, C.card);
  doc.rect(15, y - 3, 180, 8, "F");
  setColor(doc, C.gold);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("METRIC", 18, y);
  doc.text("VALUE", 50, y);
  doc.text("RATING", 78, y);
  doc.text("DESCRIPTION", 110, y);
  y += 8;

  for (const [label, value, rating, name, tip] of vitals) {
    y = checkPageBreak(doc, y, 14);
    const ratingCol = rating === "good" ? C.green : rating === "needs-improvement" ? C.amber : C.red;

    setColor(doc, C.text);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, 18, y);

    setColor(doc, ratingCol);
    doc.setFontSize(10);
    doc.text(value, 50, y);

    const ratingLabel = rating === "needs-improvement" ? "Needs Work" : rating.charAt(0).toUpperCase() + rating.slice(1);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(ratingLabel, 78, y);

    setColor(doc, C.text);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(name, 110, y);

    y += 4;
    setColor(doc, C.textMuted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    // Use splitTextToSize to prevent tip text from overflowing the right margin
    const tipLines = doc.splitTextToSize(tip, 82) as string[];
    doc.text(tipLines.slice(0, 2), 110, y);
    y += 8;
  }

  // Scores grid
  y += 2;
  y = checkPageBreak(doc, y, 20);
  setFill(doc, C.card);
  doc.roundedRect(15, y - 2, 180, 18, 2, 2, "F");

  const scoreItems = [
    { label: "Mobile Perf", val: ps.mobile.scores.performance },
    { label: "Desktop Perf", val: ps.desktop.scores.performance },
    { label: "Accessibility", val: ps.mobile.scores.accessibility },
    { label: "SEO Score", val: ps.mobile.scores.seo },
  ];

  const colW = 45;
  for (let i = 0; i < scoreItems.length; i++) {
    const item = scoreItems[i];
    const cx = 15 + i * colW + colW / 2;
    setColor(doc, scoreColor(item.val));
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(String(item.val), cx, y + 8, { align: "center" });
    setColor(doc, C.textMuted);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, cx, y + 14, { align: "center" });
  }
  y += 22;

  return y;
}

function renderProNLSection(doc: jsPDF, startY: number, nl: NaturalLanguageResult): number {
  let y = startY;

  const entityTypeColors: Record<string, string> = {
    ORGANIZATION: "#3B82F6",
    PERSON: "#A855F7",
    LOCATION: "#10B981",
    CONSUMER_GOOD: "#F59E0B",
    EVENT: "#EC4899",
    WORK_OF_ART: "#EAB308",
    OTHER: "#9CA3AF",
    UNKNOWN: "#9CA3AF",
  };

  // Entities section
  y = checkPageBreak(doc, y, 14);
  setColor(doc, C.gold);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("ENTITIES GOOGLE DETECTS ON THIS PAGE", 15, y);
  y += 6;

  const topEntities = nl.entities.slice(0, 12);
  if (topEntities.length === 0) {
    setColor(doc, C.textMuted);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("No significant entities detected.", 15, y);
    y += 7;
  } else {
    let ex = 15;
    for (const entity of topEntities) {
      const eColor = entityTypeColors[entity.type] ?? C.textMuted;
      const typeLabel = entity.type.charAt(0) + entity.type.slice(1).toLowerCase();
      const chipText = `${typeLabel}: ${entity.name}  ${Math.round(entity.salience * 100)}%`;
      const chipW = Math.min(chipText.length * 1.55 + 6, 80);

      if (ex + chipW > 192) {
        ex = 15;
        y += 8;
      }
      y = checkPageBreak(doc, y, 9);

      setFill(doc, C.card2);
      doc.roundedRect(ex, y - 3.5, chipW, 6, 1.5, 1.5, "F");
      setColor(doc, eColor);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.text(chipText.slice(0, 42), ex + chipW / 2, y, { align: "center" });
      ex += chipW + 3;
    }
    y += 10;
  }

  // Categories
  if (nl.categories.length > 0) {
    y = checkPageBreak(doc, y, 10 + nl.categories.length * 8);
    setColor(doc, C.gold);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("HOW GOOGLE CLASSIFIES THIS CONTENT", 15, y);
    y += 5;

    for (const cat of nl.categories.slice(0, 3)) {
      y = checkPageBreak(doc, y, 14);
      const parts = cat.name.split("/").filter(Boolean);
      // Wrap long category paths — convert "/Foo/Bar/Baz" → "Foo › Bar › Baz"
      const pathText = parts.join(" › ");
      setColor(doc, C.textMuted);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      const pathLines = doc.splitTextToSize(pathText, 160) as string[];
      doc.text(pathLines.slice(0, 2), 18, y);
      setColor(doc, C.green);
      doc.setFont("helvetica", "bold");
      doc.text(`${Math.round(cat.confidence * 100)}%`, 185, y, { align: "right" });
      // Confidence bar — placed after the (possibly multi-line) path text
      const pathRowH = pathLines.slice(0, 2).length > 1 ? 5 : 3;
      setFill(doc, C.border);
      doc.roundedRect(15, y + pathRowH, 165, 2.5, 1, 1, "F");
      setFill(doc, C.green);
      doc.roundedRect(15, y + pathRowH, Math.max(2, 165 * cat.confidence), 2.5, 1, 1, "F");
      y += pathRowH + 5;
    }
  }

  // Sentiment
  y = checkPageBreak(doc, y, 18);
  setColor(doc, C.gold);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CONTENT SENTIMENT ANALYSIS", 15, y);
  y += 6;

  const sentCol =
    nl.sentiment.score >= 0.5 ? C.green :
    nl.sentiment.score >= 0.1 ? "#22c55e" :
    nl.sentiment.score <= -0.5 ? C.red :
    nl.sentiment.score <= -0.1 ? "#f97316" :
    C.textMuted;

  setColor(doc, sentCol);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(nl.sentiment.label.charAt(0).toUpperCase() + nl.sentiment.label.slice(1), 15, y);

  setColor(doc, C.textMuted);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Score: ${nl.sentiment.score > 0 ? "+" : ""}${nl.sentiment.score}  ·  Magnitude: ${nl.sentiment.magnitude}  ·  Language: ${nl.detectedLanguage || "en"}`,
    15,
    y + 6
  );

  // Visual sentiment bar
  const pct = ((nl.sentiment.score + 1) / 2); // 0 → 1
  setFill(doc, C.border);
  doc.roundedRect(15, y + 9, 165, 3, 1.5, 1.5, "F");
  // bar from center
  const barW = Math.abs(pct - 0.5) * 165;
  const barX = nl.sentiment.score >= 0 ? 15 + 82.5 : 15 + 82.5 - barW;
  setFill(doc, sentCol);
  doc.roundedRect(barX, y + 9, barW, 3, 1.5, 1.5, "F");
  // center tick
  setFill(doc, C.border);
  doc.rect(15 + 82.5, y + 9, 0.5, 3, "F");
  y += 18;

  // Insight note
  const insightText =
    nl.categories.length > 0
      ? `Google's NL model classifies this page as "${nl.categories[0].name.split("/").filter(Boolean).pop()}" with ${Math.round(nl.categories[0].confidence * 100)}% confidence. If this doesn't match your target keywords, your content may need better focus.`
      : "No content category detected. Add more body text to help Google classify your page correctly.";

  y = checkPageBreak(doc, y, 12);
  setColor(doc, C.textMuted);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  const insightLines = doc.splitTextToSize(insightText, 170);
  doc.text(insightLines.slice(0, 3), 15, y);
  y += insightLines.slice(0, 3).length * 3.5 + 5;

  return y;
}

// ─── AI Search Readiness (full table with all 11 signals) ─
function renderProAIScore(doc: jsPDF, startY: number, ai: AIReadinessResult): number {
  let y = startY;
  y = checkPageBreak(doc, y, 40);

  const passing = ai.signals.filter((s) => s.status === "pass").length;
  const failing = ai.signals.filter((s) => s.status === "fail").length;
  const warning = ai.signals.filter((s) => s.status === "warn").length;

  // Header block with gradient-style violet bar
  setFill(doc, "#140d2e");
  doc.roundedRect(15, y - 3, 180, 14, 2, 2, "F");

  // Violet accent left stripe
  setFill(doc, "#8B5CF6");
  doc.roundedRect(15, y - 3, 4, 14, 1, 1, "F");

  setColor(doc, "#A78BFA");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("AI Search Optimization", 24, y + 4);

  // Score circle (drawn manually)
  const gradeCol = ai.grade === "excellent" ? C.green : ai.grade === "good" ? "#06B6D4" : ai.grade === "fair" ? C.amber : C.red;
  setColor(doc, gradeCol);
  doc.setFontSize(14);
  doc.text(`${ai.score}`, 165, y + 5, { align: "right" });
  setColor(doc, C.textMuted);
  doc.setFontSize(8);
  doc.text("/100", 170, y + 5);
  y += 18;

  // Pass/warn/fail summary
  setColor(doc, C.green);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`${passing} passing`, 20, y);
  setColor(doc, C.amber);
  doc.text(`${warning} warning`, 65, y);
  setColor(doc, C.red);
  doc.text(`${failing} failing`, 110, y);
  setColor(doc, C.textMuted);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.text(`Grade: ${ai.grade.toUpperCase()}`, 160, y, { align: "right" });
  y += 8;

  // Separator
  setDraw(doc, "#2a1f5a");
  doc.setLineWidth(0.3);
  doc.line(15, y, 195, y);
  y += 5;

  // Column headers
  setColor(doc, C.textMuted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("SIGNAL", 18, y);
  doc.text("STATUS", 115, y);
  doc.text("SCORE", 140, y);
  doc.text("WEIGHT", 165, y);
  y += 5;

  // All 11 signals
  for (const sig of ai.signals) {
    y = checkPageBreak(doc, y, sig.status !== "pass" ? 18 : 10);

    const col = sig.status === "pass" ? C.green : sig.status === "warn" ? C.amber : C.red;
    const statusLabel = sig.status === "pass" ? "PASS" : sig.status === "warn" ? "WARN" : "FAIL";

    // Row background (alternating subtle)
    setFill(doc, "#110a28");
    doc.rect(15, y - 2, 180, 8, "F");

    // Signal label
    setColor(doc, C.text);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(sig.label.slice(0, 48), 18, y + 3);

    // Status badge
    setFill(doc, col + "33");
    doc.roundedRect(112, y - 0.5, 20, 5, 1, 1, "F");
    setColor(doc, col);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(statusLabel, 122, y + 3, { align: "center" });

    // Score bar
    const barW = Math.round((sig.score / 100) * 20);
    setFill(doc, C.border);
    doc.roundedRect(138, y + 1, 20, 2.5, 1, 1, "F");
    if (barW > 0) {
      setFill(doc, col);
      doc.roundedRect(138, y + 1, barW, 2.5, 1, 1, "F");
    }
    setColor(doc, C.textMuted);
    doc.setFontSize(6.5);
    doc.text(`${sig.score}`, 162, y + 3);

    // Weight
    doc.text(`${sig.weight}`, 178, y + 3);

    y += 9;

    // Tip for non-passing signals
    if (sig.status !== "pass") {
      y = checkPageBreak(doc, y, 10);
      setColor(doc, C.textMuted);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "italic");
      // Description
      const descLines = doc.splitTextToSize(sig.description, 155) as string[];
      doc.text(descLines[0] ?? "", 22, y);
      y += 4;
      // Tip
      setColor(doc, col + "cc");
      const tipLines = doc.splitTextToSize(`💡 ${sig.tip}`, 155) as string[];
      doc.text(tipLines.slice(0, 2), 22, y);
      y += tipLines.slice(0, 2).length * 3.5 + 3;
    }
  }

  return y + 4;
}

// ─── Download helper ─────────────────────────────────────
export function downloadProSeoReport(data: ProPdfExportData) {
  const doc = generateProSeoReport(data);
  const hostname = (() => {
    try {
      return new URL(data.url.startsWith("http") ? data.url : `https://${data.url}`).hostname;
    } catch {
      return "website";
    }
  })();
  doc.save(`SEO-Pro-Report-${hostname}-${new Date().toISOString().split("T")[0]}.pdf`);
}
