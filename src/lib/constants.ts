import type { BrandingConfig, SEOCategory } from "./types";

// --- Score thresholds ---
export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
  poor: 0,
} as const;

export const SCORE_LABELS: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Needs Work",
  poor: "Poor",
};

export const SCORE_COLORS: Record<string, string> = {
  excellent: "#10B981",
  good: "#3B82F6",
  fair: "#F59E0B",
  poor: "#EF4444",
};

export function getScoreLabel(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return SCORE_LABELS.excellent;
  if (score >= SCORE_THRESHOLDS.good) return SCORE_LABELS.good;
  if (score >= SCORE_THRESHOLDS.fair) return SCORE_LABELS.fair;
  return SCORE_LABELS.poor;
}

export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return SCORE_COLORS.excellent;
  if (score >= SCORE_THRESHOLDS.good) return SCORE_COLORS.good;
  if (score >= SCORE_THRESHOLDS.fair) return SCORE_COLORS.fair;
  return SCORE_COLORS.poor;
}

// --- Category definitions ---
export const CATEGORY_CONFIG: Record<
  SEOCategory,
  { label: string; icon: string; weight: number }
> = {
  technical: { label: "Technical SEO", icon: "Settings", weight: 0.25 },
  content: { label: "Content Quality", icon: "FileText", weight: 0.25 },
  onPage: { label: "On-Page SEO", icon: "Search", weight: 0.2 },
  performance: { label: "Performance", icon: "Zap", weight: 0.15 },
  userExperience: { label: "User Experience", icon: "Monitor", weight: 0.15 },
};

// --- SEO Rule thresholds ---
export const TITLE_LENGTH = { min: 30, optimal_min: 50, optimal_max: 60, max: 70 };
export const META_DESC_LENGTH = { min: 70, optimal_min: 150, optimal_max: 160, max: 170 };
export const MIN_WORD_COUNT = 300;
export const STRONG_WORD_COUNT = 1000;

// --- Core Web Vitals thresholds ---
export const CWV_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  cls: { good: 0.1, poor: 0.25 },
  inp: { good: 200, poor: 500 },
  fcp: { good: 1800, poor: 3000 },
};

// --- Default branding ---
export const DEFAULT_BRANDING: BrandingConfig = {
  consultantName: "SEO Expert",
  consultantEmail: "marcus.mpai@gmail.com",
  consultantPhone: "",
  companyName: "SEO Insight Pro",
  logoUrl: null,
  accentColor: "#3B82F6",
  ctaText: "Ready to Unlock Your Full Potential?",
  ctaDescription:
    "Let our SEO experts help you climb the search rankings and drive more organic traffic to your business.",
};

// --- Analysis steps for the loading page ---
export const ANALYSIS_STEPS = [
  { id: "scraping", label: "Scanning website structure", icon: "Globe" },
  { id: "meta", label: "Analyzing meta tags & content", icon: "Tag" },
  { id: "performance", label: "Measuring page performance", icon: "Gauge" },
  { id: "mobile", label: "Evaluating mobile experience", icon: "Smartphone" },
  { id: "ai", label: "AI generating insights", icon: "Sparkles" },
  { id: "report", label: "Preparing your report", icon: "FileBarChart" },
] as const;
