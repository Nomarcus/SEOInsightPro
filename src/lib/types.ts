// ============================================================
// SEO Insight Pro - Core TypeScript Interfaces
// ============================================================

// --- Input ---
export interface AnalysisRequest {
  url: string;
}

// --- Scraping ---
export interface ScrapeResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  loadTimeMs: number;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  metaRobots: string | null;
  canonicalUrl: string | null;
  language: string | null;
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  };
  headings: HeadingItem[];
  links: LinkItem[];
  images: ImageItem[];
  wordCount: number;
  bodyText?: string;
  structuredData: object[];
  hreflangTags: { lang: string; href: string }[];
  hasHttps: boolean;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  hasViewport: boolean;       // meta[name="viewport"] present
  // AI Search Readiness signals (extracted by scraper)
  authorName?: string;        // meta[name="author"] / article:author / JSON-LD Person
  publishedDate?: string;     // article:published_time / time[datetime]
  modifiedDate?: string;      // article:modified_time
  hasFaqSchema?: boolean;     // JSON-LD @type: FAQPage | QAPage
  aiBotsBlocked?: boolean;    // noai / GPTBot / ClaudeBot blocking meta tags
  questionHeadings?: number;  // count of H2/H3 starting with What/How/Why/When/Where
}

export interface HeadingItem {
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  text: string;
  order: number;
}

export interface LinkItem {
  href: string;
  text: string;
  isInternal: boolean;
  hasNofollow: boolean;
}

export interface ImageItem {
  src: string;
  alt: string | null;
  hasAlt: boolean;
}

// --- PageSpeed ---
export interface PageSpeedResult {
  mobile: LighthouseData;
  desktop: LighthouseData;
}

export interface LighthouseData {
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals: {
    lcp: MetricResult;
    cls: MetricResult;
    inp: MetricResult;
    fcp: MetricResult;
  };
  opportunities: Opportunity[];
}

export interface MetricResult {
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  displayValue: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  savingsMs?: number;
  savingsBytes?: number;
}

// --- SEO Rule Engine ---
export type RuleStatus = "pass" | "warn" | "fail";

export interface RuleResult {
  id: string;
  category: SEOCategory;
  title: string;
  description: string;
  status: RuleStatus;
  weight: number;
  details?: string;
}

export type SEOCategory =
  | "technical"
  | "content"
  | "onPage"
  | "performance"
  | "userExperience";

// --- AI Analysis ---
export interface AnalysisResult {
  overallScore: number;
  categoryScores: Record<SEOCategory, CategoryScore>;
  strengths: InsightItem[];
  weaknesses: WeaknessItem[];
  quickWins: QuickWin[];
  keywords: KeywordSuggestion[];
  strategy: StrategyItem[];
  trafficPotential: TrafficPotential;
  actionItems: ActionItem[];
  serpPreview: {
    currentTitle: string;
    currentDescription: string;
    improvedTitle: string;
    improvedDescription: string;
    url: string;
  };
  industryCategory: string;
  aiProvider: "claude" | "openai" | "both";
  aiReadiness?: AIReadinessResult;
}

export interface CategoryScore {
  score: number;
  label: string;
  items: string[];
}

export interface InsightItem {
  title: string;
  description: string;
  severity: "positive" | "warning" | "critical";
  category: string;
}

/** Extended weakness item — includes step-by-step fix guide for Pro Report */
export interface WeaknessItem extends InsightItem {
  severity: "warning" | "critical";
  fixSteps?: string[];
  solutionSnippets?: (string | null)[];
  estimatedFixTime?: string;
  technicalLevel?: "beginner" | "intermediate" | "advanced";
  tools?: string[];
}

export interface QuickWin {
  title: string;
  description: string;
  estimatedImpact: "low" | "medium" | "high";
  estimatedEffort: "minutes" | "hours" | "days";
  impactPercentage: number;
}

export interface KeywordSuggestion {
  keyword: string;
  relevanceScore: number;
  estimatedDifficulty: "easy" | "medium" | "hard";
  estimatedSearchVolume: "low" | "medium" | "high";
  currentlyUsed: boolean;
  suggestion: string;
}

export interface StrategyItem {
  title: string;
  description: string;
  timeframe: "immediate" | "short-term" | "long-term";
  priority: "high" | "medium" | "low";
}

export interface TrafficPotential {
  currentEstimate: "low" | "medium" | "high";
  potentialEstimate: "medium" | "high" | "very-high";
  percentageIncrease: number;
  reasoning: string;
}

export interface ActionItem {
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  category: string;
}

// --- Branding ---
export interface BrandingConfig {
  consultantName: string;
  consultantEmail: string;
  consultantPhone: string;
  companyName: string;
  logoUrl: string | null;
  accentColor: string;
  ctaText: string;
  ctaDescription: string;
}

// --- Google Natural Language API ---
export interface NLEntity {
  name: string;
  type: string; // PERSON, ORGANIZATION, LOCATION, EVENT, WORK_OF_ART, CONSUMER_GOOD, OTHER
  salience: number; // 0-1, centrality to document
  wikipediaUrl?: string;
}

export interface NLCategory {
  name: string;     // e.g. "/Business & Industrial/Advertising & Marketing"
  confidence: number; // 0-1
}

export interface NaturalLanguageResult {
  entities: NLEntity[];
  categories: NLCategory[];
  sentiment: {
    score: number;      // -1.0 (negative) to 1.0 (positive)
    magnitude: number;  // 0+ strength of sentiment
    label: "very positive" | "positive" | "neutral" | "negative" | "very negative";
  };
  detectedLanguage: string;
}

// --- AI Search Readiness ---
export interface AISignal {
  id: string;
  label: string;
  description: string;
  status: "pass" | "warn" | "fail";
  score: number;    // 0–100
  weight: number;
  tip: string;
}

export interface AIReadinessResult {
  score: number;
  grade: "excellent" | "good" | "fair" | "poor";
  signals: AISignal[];
}

// --- Analysis State ---
export type AnalysisPhase =
  | "idle"
  | "scraping"
  | "performance"
  | "analyzing"
  | "complete"
  | "error";

export interface AnalysisState {
  phase: AnalysisPhase;
  url: string;
  scrapeResult: ScrapeResult | null;
  pageSpeedResult: PageSpeedResult | null;
  nlResult: NaturalLanguageResult | null;
  analysisResult: AnalysisResult | null;
  error: string | null;
}
