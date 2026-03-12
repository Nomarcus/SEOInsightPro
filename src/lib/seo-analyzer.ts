import type { ScrapeResult, RuleResult, PageSpeedResult } from "./types";
import {
  TITLE_LENGTH,
  META_DESC_LENGTH,
  MIN_WORD_COUNT,
  STRONG_WORD_COUNT,
  CWV_THRESHOLDS,
} from "./constants";

export function analyzeSEO(
  scrape: ScrapeResult,
  pageSpeed?: PageSpeedResult | null
): RuleResult[] {
  const results: RuleResult[] = [];

  // ---- TECHNICAL ----
  results.push({
    id: "https",
    category: "technical",
    title: "HTTPS Security",
    description: scrape.hasHttps
      ? "Site uses HTTPS encryption"
      : "Site does not use HTTPS — critical for SEO and trust",
    status: scrape.hasHttps ? "pass" : "fail",
    weight: 10,
  });

  results.push({
    id: "sitemap",
    category: "technical",
    title: "XML Sitemap",
    description: scrape.hasSitemap
      ? "sitemap.xml found"
      : "No sitemap.xml found — helps search engines discover pages",
    status: scrape.hasSitemap ? "pass" : "warn",
    weight: 5,
  });

  results.push({
    id: "robots",
    category: "technical",
    title: "Robots.txt",
    description: scrape.hasRobotsTxt
      ? "robots.txt found"
      : "No robots.txt found — controls search engine crawling",
    status: scrape.hasRobotsTxt ? "pass" : "warn",
    weight: 5,
  });

  results.push({
    id: "canonical",
    category: "technical",
    title: "Canonical URL",
    description: scrape.canonicalUrl
      ? `Canonical URL set: ${scrape.canonicalUrl}`
      : "No canonical URL — may cause duplicate content issues",
    status: scrape.canonicalUrl ? "pass" : "warn",
    weight: 5,
  });

  results.push({
    id: "structured-data",
    category: "technical",
    title: "Structured Data",
    description:
      scrape.structuredData.length > 0
        ? `${scrape.structuredData.length} structured data block(s) found`
        : "No structured data (JSON-LD) — missing rich snippet opportunities",
    status: scrape.structuredData.length > 0 ? "pass" : "warn",
    weight: 5,
  });

  results.push({
    id: "language",
    category: "technical",
    title: "Language Tag",
    description: scrape.language
      ? `Language set to: ${scrape.language}`
      : "No language attribute set on HTML tag",
    status: scrape.language ? "pass" : "warn",
    weight: 3,
  });

  const indexable =
    !scrape.metaRobots ||
    (!scrape.metaRobots.includes("noindex") &&
      !scrape.metaRobots.includes("none"));
  results.push({
    id: "indexable",
    category: "technical",
    title: "Indexability",
    description: indexable
      ? "Page is indexable by search engines"
      : `Page is blocked from indexing: ${scrape.metaRobots}`,
    status: indexable ? "pass" : "fail",
    weight: 10,
  });

  // ---- ON-PAGE ----
  if (!scrape.title) {
    results.push({
      id: "title-missing",
      category: "onPage",
      title: "Title Tag",
      description: "Missing title tag — critical for SEO",
      status: "fail",
      weight: 10,
    });
  } else {
    const len = scrape.titleLength;
    const optimal =
      len >= TITLE_LENGTH.optimal_min && len <= TITLE_LENGTH.optimal_max;
    const acceptable = len >= TITLE_LENGTH.min && len <= TITLE_LENGTH.max;
    results.push({
      id: "title-length",
      category: "onPage",
      title: "Title Tag Length",
      description: optimal
        ? `Title is ${len} characters (optimal: ${TITLE_LENGTH.optimal_min}-${TITLE_LENGTH.optimal_max})`
        : `Title is ${len} characters (recommended: ${TITLE_LENGTH.optimal_min}-${TITLE_LENGTH.optimal_max})`,
      status: optimal ? "pass" : acceptable ? "warn" : "fail",
      weight: 8,
      details: scrape.title,
    });
  }

  if (!scrape.metaDescription) {
    results.push({
      id: "meta-desc-missing",
      category: "onPage",
      title: "Meta Description",
      description: "Missing meta description — reduces click-through rate",
      status: "fail",
      weight: 8,
    });
  } else {
    const len = scrape.metaDescriptionLength;
    const optimal =
      len >= META_DESC_LENGTH.optimal_min && len <= META_DESC_LENGTH.optimal_max;
    const acceptable = len >= META_DESC_LENGTH.min && len <= META_DESC_LENGTH.max;
    results.push({
      id: "meta-desc-length",
      category: "onPage",
      title: "Meta Description Length",
      description: optimal
        ? `Meta description is ${len} characters (optimal)`
        : `Meta description is ${len} characters (recommended: ${META_DESC_LENGTH.optimal_min}-${META_DESC_LENGTH.optimal_max})`,
      status: optimal ? "pass" : acceptable ? "warn" : "fail",
      weight: 6,
      details: scrape.metaDescription,
    });
  }

  // H1 check
  const h1s = scrape.headings.filter((h) => h.tag === "h1");
  results.push({
    id: "h1-count",
    category: "onPage",
    title: "H1 Heading",
    description:
      h1s.length === 1
        ? `Single H1 found: "${h1s[0].text.slice(0, 60)}"`
        : h1s.length === 0
          ? "No H1 heading found — every page should have exactly one H1"
          : `${h1s.length} H1 headings found — should have exactly one`,
    status: h1s.length === 1 ? "pass" : "fail",
    weight: 8,
  });

  // Heading hierarchy
  const headingLevels = scrape.headings.map((h) => parseInt(h.tag.charAt(1)));
  let hasSkip = false;
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      hasSkip = true;
      break;
    }
  }
  if (scrape.headings.length > 1) {
    results.push({
      id: "heading-hierarchy",
      category: "onPage",
      title: "Heading Hierarchy",
      description: hasSkip
        ? "Heading levels are skipped (e.g., H1 → H3) — use sequential hierarchy"
        : "Heading hierarchy is properly structured",
      status: hasSkip ? "warn" : "pass",
      weight: 4,
    });
  }

  // Open Graph
  const ogComplete =
    scrape.openGraph.title &&
    scrape.openGraph.description &&
    scrape.openGraph.image;
  results.push({
    id: "open-graph",
    category: "onPage",
    title: "Open Graph Tags",
    description: ogComplete
      ? "Complete Open Graph tags (title, description, image)"
      : "Incomplete Open Graph tags — important for social sharing",
    status: ogComplete ? "pass" : "warn",
    weight: 4,
  });

  // ---- CONTENT ----
  results.push({
    id: "word-count",
    category: "content",
    title: "Content Length",
    description:
      scrape.wordCount >= STRONG_WORD_COUNT
        ? `Strong content length: ${scrape.wordCount} words`
        : scrape.wordCount >= MIN_WORD_COUNT
          ? `Adequate content: ${scrape.wordCount} words (1000+ recommended for competitive rankings)`
          : `Thin content: only ${scrape.wordCount} words (minimum 300 recommended)`,
    status:
      scrape.wordCount >= STRONG_WORD_COUNT
        ? "pass"
        : scrape.wordCount >= MIN_WORD_COUNT
          ? "warn"
          : "fail",
    weight: 8,
  });

  // Image alt texts
  const imagesWithoutAlt = scrape.images.filter((img) => !img.hasAlt);
  const altRatio =
    scrape.images.length > 0
      ? (scrape.images.length - imagesWithoutAlt.length) / scrape.images.length
      : 1;
  results.push({
    id: "image-alts",
    category: "content",
    title: "Image Alt Attributes",
    description:
      imagesWithoutAlt.length === 0
        ? `All ${scrape.images.length} images have alt attributes`
        : `${imagesWithoutAlt.length} of ${scrape.images.length} images missing alt text`,
    status: altRatio >= 0.9 ? "pass" : altRatio >= 0.5 ? "warn" : "fail",
    weight: 5,
  });

  // Internal links
  const internalLinks = scrape.links.filter((l) => l.isInternal);
  results.push({
    id: "internal-links",
    category: "content",
    title: "Internal Linking",
    description: `${internalLinks.length} internal links found`,
    status:
      internalLinks.length >= 10
        ? "pass"
        : internalLinks.length >= 3
          ? "warn"
          : "fail",
    weight: 5,
  });

  // External links
  const externalLinks = scrape.links.filter((l) => !l.isInternal);
  results.push({
    id: "external-links",
    category: "content",
    title: "External Links",
    description: `${externalLinks.length} external links found`,
    status: externalLinks.length >= 1 ? "pass" : "warn",
    weight: 3,
  });

  // ---- PERFORMANCE ----
  results.push({
    id: "load-time",
    category: "performance",
    title: "Server Response Time",
    description: `Page loaded in ${scrape.loadTimeMs}ms`,
    status:
      scrape.loadTimeMs < 1000
        ? "pass"
        : scrape.loadTimeMs < 3000
          ? "warn"
          : "fail",
    weight: 5,
  });

  // PageSpeed-based rules
  if (!pageSpeed) {
    results.push({
      id: "cwv-unavailable",
      category: "performance",
      title: "Core Web Vitals",
      description: "PageSpeed data unavailable — Core Web Vitals (LCP, CLS, INP) could not be measured",
      status: "warn",
      weight: 20,
    });
  } else {
    const mobile = pageSpeed.mobile;
    results.push({
      id: "mobile-perf",
      category: "performance",
      title: "Mobile Performance Score",
      description: `Google PageSpeed mobile score: ${mobile.scores.performance}/100`,
      status:
        mobile.scores.performance >= 90
          ? "pass"
          : mobile.scores.performance >= 50
            ? "warn"
            : "fail",
      weight: 8,
    });

    results.push({
      id: "lcp",
      category: "performance",
      title: "Largest Contentful Paint (LCP)",
      description: `LCP: ${mobile.coreWebVitals.lcp.displayValue} (${mobile.coreWebVitals.lcp.rating})`,
      status:
        mobile.coreWebVitals.lcp.value <= CWV_THRESHOLDS.lcp.good
          ? "pass"
          : mobile.coreWebVitals.lcp.value <= CWV_THRESHOLDS.lcp.poor
            ? "warn"
            : "fail",
      weight: 7,
    });

    results.push({
      id: "cls",
      category: "performance",
      title: "Cumulative Layout Shift (CLS)",
      description: `CLS: ${mobile.coreWebVitals.cls.displayValue} (${mobile.coreWebVitals.cls.rating})`,
      status:
        mobile.coreWebVitals.cls.value <= CWV_THRESHOLDS.cls.good
          ? "pass"
          : mobile.coreWebVitals.cls.value <= CWV_THRESHOLDS.cls.poor
            ? "warn"
            : "fail",
      weight: 7,
    });
  }

  // ---- USER EXPERIENCE ----
  results.push({
    id: "mobile-viewport",
    category: "userExperience",
    title: "Mobile Viewport",
    description: scrape.hasViewport
      ? "Viewport meta tag found — page is mobile-friendly"
      : "No viewport meta tag — page will not render correctly on mobile",
    status: scrape.hasViewport ? "pass" : "fail",
    weight: 8,
  });

  results.push({
    id: "https-ux",
    category: "userExperience",
    title: "Secure Connection (HTTPS)",
    description: scrape.hasHttps
      ? "HTTPS is enabled — required for user trust and browser security indicators"
      : "No HTTPS — browsers will warn users about an insecure connection",
    status: scrape.hasHttps ? "pass" : "fail",
    weight: 6,
  });

  if (pageSpeed) {
    results.push({
      id: "accessibility",
      category: "userExperience",
      title: "Accessibility Score",
      description: `Lighthouse accessibility score: ${pageSpeed.mobile.scores.accessibility}/100`,
      status:
        pageSpeed.mobile.scores.accessibility >= 90
          ? "pass"
          : pageSpeed.mobile.scores.accessibility >= 70
            ? "warn"
            : "fail",
      weight: 8,
    });

    results.push({
      id: "mobile-seo",
      category: "userExperience",
      title: "Mobile SEO (Google)",
      description: `Google's mobile SEO score: ${pageSpeed.mobile.scores.seo}/100`,
      status:
        pageSpeed.mobile.scores.seo >= 90
          ? "pass"
          : pageSpeed.mobile.scores.seo >= 70
            ? "warn"
            : "fail",
      weight: 6,
    });
  }

  return results;
}

export function calculateCategoryScores(
  rules: RuleResult[]
): Record<string, { score: number; label: string; items: string[] }> {
  const categories = ["technical", "content", "onPage", "performance", "userExperience"];
  const result: Record<string, { score: number; label: string; items: string[] }> = {};

  for (const cat of categories) {
    const catRules = rules.filter((r) => r.category === cat);
    if (catRules.length === 0) {
      result[cat] = { score: 50, label: cat, items: ["No data available"] };
      continue;
    }

    const totalWeight = catRules.reduce((sum, r) => sum + r.weight, 0);
    const earnedWeight = catRules.reduce((sum, r) => {
      const multiplier = r.status === "pass" ? 1 : r.status === "warn" ? 0.5 : 0;
      return sum + r.weight * multiplier;
    }, 0);

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 50;
    const items = catRules
      .filter((r) => r.status !== "pass")
      .map((r) => r.description)
      .slice(0, 5);

    result[cat] = { score, label: cat, items: items.length > 0 ? items : ["All checks passed"] };
  }

  return result;
}

export function calculateOverallSEOScore(
  categoryScores: Record<string, { score: number }>
): number {
  const weights: Record<string, number> = {
    technical: 0.25,
    onPage: 0.20,
    content: 0.25,
    performance: 0.15,
    userExperience: 0.15,
  };
  let total = 0;
  for (const [category, weight] of Object.entries(weights)) {
    total += (categoryScores[category]?.score ?? 0) * weight;
  }
  return Math.round(total);
}
