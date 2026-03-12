# Export PDF Skill

## Description
Generates professional PDF reports from SEO analysis data. Two variants exist:
- **Standard Report** — clean overview for initial client presentations
- **Pro Report** — exhaustive step-by-step guide for paying clients

Both PDFs always follow the same layout and include all analysis sections with the consultant's branding.

---

## Variant 1: Standard Report

### When to Use
- After an SEO analysis is complete
- For initial client presentations or free reports
- When modifying the standard PDF output

### Trigger
Click "Export PDF" button (blue) in the dashboard header.

### Filename
```
SEO-Report-{hostname}-{YYYY-MM-DD}.pdf
```
Example: `SEO-Report-example.se-2026-03-03.pdf`

### Layout (fixed order, always the same)

**Page 1: Cover Page**
- Company name/branding (from localStorage BrandingConfig)
- "SEO Analysis Report" title
- Website hostname (from analyzed URL)
- Overall SEO score in a circle with color coding:
  - Green (#10B981): 80-100
  - Blue (#3B82F6): 60-79
  - Amber (#F59E0B): 40-59
  - Red (#EF4444): 0-39
- Score label (Excellent/Good/Needs Work/Poor)
- Industry category
- Dual AI badge if both Claude + OpenAI were used
- Report date
- "Powered by SEO Insight Pro" footer

**Page 2+: Score Breakdown**
- Five category bars with scores (Technical SEO, Content Quality, On-Page SEO, Performance, User Experience)

**SERP Preview** — Current vs AI-improved title and description

**Strengths** — Green bullet (+) items with title + brief description

**Issues Found** — Red/amber (!) items with [CRITICAL]/[WARNING] badge + 2-line description

**Quick Wins** — Table: Quick Win | Effort | Impact | Est. %

**Keyword Opportunities** — Table: Keyword | Relevance bar | Difficulty | Volume | On Page

**SEO Strategy Roadmap** — Grouped by DO NOW / THIS MONTH / THIS QUARTER

**Core Web Vitals** — Only rendered if PageSpeed data is available

**Traffic Growth Potential** — Current vs potential estimate + AI reasoning

**Last Page: CTA / Contact** — Branding CTA + contact info box

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/pdf-generator.ts` | Main PDF generation logic (`generateSeoReport()`, `downloadSeoReport()`) |
| `src/components/dashboard/pdf-report-button.tsx` | Blue "Export PDF" button |

### Data Flow
```
PdfReportButton (click)
  → useAnalysis() → { url, analysisResult, scrapeResult, pageSpeedResult }
  → useBranding() → { branding }
  → downloadSeoReport({ ... })
    → generateSeoReport() → jsPDF document
      → doc.save("SEO-Report-{hostname}-{date}.pdf")
```

---

## Variant 2: Pro Report (Paid Deliverable)

### When to Use
- For paying clients who want a detailed implementation guide
- When the consultant wants to show extreme detail on how to fix issues
- Delivered after selling the SEO consulting service

### Trigger
Click "Pro Report" button (gold/amber with ★ star icon) in the dashboard header.

### Filename
```
SEO-Pro-Report-{hostname}-{YYYY-MM-DD}.pdf
```
Example: `SEO-Pro-Report-example.se-2026-03-03.pdf`

### Layout (fixed order, always the same)

**Page 1: Cover Page**
- Gold top/bottom banner with "PRO REPORT · CONFIDENTIAL" text
- Gold ring around score circle (instead of blue)
- "Step-by-Step Implementation Guide" subtitle
- Consultant name + date on cover

**Page 2+: Executive Summary**
- Score block with context sentence
- Two columns: Top Critical Issues (with estimated fix times) + Fastest Quick Wins (with % gain)

**Score Breakdown** — Category bars with one-line context description per category

**SERP Preview** — Current vs AI-improved, with character count indicators (green/amber/red)

**Detailed Issue Fix Guides** (the core Pro feature)
- Each issue rendered as a full card:
  - Severity color stripe (red = critical, amber = warning)
  - Title + CRITICAL/WARNING badge + category badge
  - Full description (not truncated)
  - **"HOW TO FIX:" section** with numbered steps (3-6 specific actions)
  - Footer: ⏱ estimated fix time + technical level badge (BEGINNER/INTERMEDIATE/ADVANCED) + tools list

**Quick Wins — Implementation Guide** — Full detail table

**30/60/90 Day Implementation Plan** — Strategy grouped as:
- DAYS 1-30: immediate actions (red accent)
- DAYS 31-60: short-term work (amber accent)
- DAYS 61-90: long-term positioning (green accent)

**Keyword Strategy** — Full table with PRIORITY column (HIGH/MED/LOW auto-calculated from relevance + difficulty + volume)

**Core Web Vitals** — Only if PageSpeed data available; includes tip text per metric

**Traffic Potential** — Full reasoning text + current vs potential traffic level box

**Last Page: CTA / Contact** — Gold banner, gold-bordered contact card with consultant info

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/pdf-pro-generator.ts` | Pro PDF generation logic (`generateProSeoReport()`, `downloadProSeoReport()`) |
| `src/components/dashboard/pro-pdf-button.tsx` | Gold "Pro Report" button with Star icon |

### Data Flow
```
ProPdfButton (click)
  → useAnalysis() → { url, analysisResult, scrapeResult, pageSpeedResult }
  → useBranding() → { branding }
  → downloadProSeoReport({ ... })
    → generateProSeoReport() → jsPDF document
      → doc.save("SEO-Pro-Report-{hostname}-{date}.pdf")
```

### What Makes the Pro Data Richer
The AI analysis is configured (in `src/lib/ai-prompts.ts`) to return extra fields for each weakness:
- `fixSteps: string[]` — 3-6 numbered step-by-step fix instructions
- `estimatedFixTime: string` — realistic time estimate ("15 minutes", "2-3 hours", etc.)
- `technicalLevel: "beginner" | "intermediate" | "advanced"` — required skill level
- `tools: string[]` — helpful tools/plugins (e.g. "Yoast SEO", "Google Search Console")

These fields are defined in `WeaknessItem` in `src/lib/types.ts`.

---

## Design System (shared)

### Colors
```
Background:  #0B1120
Card:        #111827
Text:        #E5E7EB
Text muted:  #9CA3AF
Primary:     #3B82F6
Green:       #10B981
Amber/Gold:  #F59E0B
Red:         #EF4444
White:       #FFFFFF
Border:      #1F2937
```

### Typography
- Font: Helvetica (built into jsPDF)
- Section titles: 13-14pt, bold, white
- Standard underline: blue (#3B82F6)
- Pro underline: gold (#F59E0B)
- Body text: 8-10pt, normal
- Labels: 7-8pt, muted

### Page Handling
- A4 portrait (210mm x 297mm)
- Dark background on every page
- Automatic page breaks when content approaches 278mm Y
- Consistent 15mm left margin, 15mm right margin
- Pro report: subtle "PRO REPORT — CONFIDENTIAL" watermark in dark color at top-right of every page

---

## Common Shared Files

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | TypeScript interfaces (AnalysisResult, WeaknessItem, BrandingConfig, etc.) |
| `src/lib/constants.ts` | Score thresholds and `getScoreLabel()` function |
| `src/hooks/use-analysis.tsx` | Provides analysisResult, scrapeResult, pageSpeedResult |
| `src/hooks/use-branding.tsx` | Provides branding config (name, email, logo, CTA text) |

---

## How to Modify

### Adding a new section (standard)
1. Add a renderer function in `src/lib/pdf-generator.ts` (e.g. `renderNewSection()`)
2. Call it in `generateSeoReport()` at desired position
3. Use `checkPageBreak(doc, y, needed)` for page breaks
4. Use `sectionTitle(doc, y, "Title")` for consistent headers

### Adding a new section (pro)
Same pattern but in `src/lib/pdf-pro-generator.ts`

### Changing colors
Update the `C` object at the top of the respective generator file.

### Changing branding
Branding is read from `useBranding()` hook (stored in localStorage). Modify via `/settings` page.

### Dependencies
- `jspdf` — Core PDF generation library (no canvas/screenshot dependency)
