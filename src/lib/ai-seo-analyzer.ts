/**
 * AI Search Readiness Analyzer
 *
 * Runs 11 deterministic, zero-latency signals to score how well
 * a page is optimised for AI-powered search engines:
 * Google AI Overviews, ChatGPT browsing, Perplexity, Bing Copilot.
 *
 * Identical weighting pattern as seo-analyzer.ts.
 * No API calls — all signals derive from already-scraped data.
 */

import type {
  ScrapeResult,
  PageSpeedResult,
  AISignal,
  AIReadinessResult,
} from "./types";

// ─── Helpers ─────────────────────────────────────────────

function signal(
  id: string,
  label: string,
  description: string,
  status: AISignal["status"],
  score: number,
  weight: number,
  tip: string
): AISignal {
  return { id, label, description, status, score, weight, tip };
}

function flattenSchemas(structuredData: object[]): object[] {
  return structuredData.flatMap((sd) => {
    const graph = (sd as Record<string, unknown>)["@graph"];
    return Array.isArray(graph) ? [sd, ...(graph as object[])] : [sd];
  });
}

function schemaTypes(allSchemas: object[]): string[] {
  const types: string[] = [];
  for (const sd of allSchemas) {
    const t = (sd as Record<string, unknown>)["@type"];
    if (typeof t === "string") types.push(t);
    else if (Array.isArray(t)) types.push(...(t as string[]));
  }
  return types;
}

// Rich schema types that signal topical authority to AI crawlers
const RICH_SCHEMA_TYPES = new Set([
  "Article",
  "NewsArticle",
  "BlogPosting",
  "Product",
  "FAQPage",
  "QAPage",
  "HowTo",
  "Recipe",
  "Event",
  "Review",
  "LocalBusiness",
  "Organization",
  "Person",
  "WebPage",
  "ItemList",
  "VideoObject",
  "ImageObject",
  "Course",
  "JobPosting",
]);

// Entity/brand schema types for Entity Clarity signal
const ENTITY_SCHEMA_TYPES = new Set([
  "Organization",
  "LocalBusiness",
  "Person",
  "Brand",
  "Corporation",
  "EducationalOrganization",
  "GovernmentOrganization",
]);

// ─── 11 Signals ──────────────────────────────────────────

function checkSchema(scrape: ScrapeResult): AISignal {
  const all = flattenSchemas(scrape.structuredData);
  const types = schemaTypes(all);
  const hasRich = types.some((t) => RICH_SCHEMA_TYPES.has(t));
  const hasAny = scrape.structuredData.length > 0;

  if (hasRich) {
    return signal(
      "schema",
      "Schema / Structured Data",
      `Rich JSON-LD detected: ${types.slice(0, 3).join(", ")}`,
      "pass",
      100,
      10,
      "Great — AI systems use structured data to understand and cite your content."
    );
  }
  if (hasAny) {
    return signal(
      "schema",
      "Schema / Structured Data",
      "JSON-LD found but lacks rich content types (Article, FAQ, HowTo, Product…)",
      "warn",
      50,
      10,
      "Add Article, FAQPage or HowTo schema to boost AI citation chances."
    );
  }
  return signal(
    "schema",
    "Schema / Structured Data",
    "No JSON-LD structured data found",
    "fail",
    0,
    10,
    "Implement JSON-LD structured data. AI systems rely heavily on schema to understand content."
  );
}

function checkFaq(scrape: ScrapeResult): AISignal {
  const hasFaqSchema = scrape.hasFaqSchema ?? false;
  const questionHeadings = scrape.questionHeadings ?? 0;

  if (hasFaqSchema) {
    return signal(
      "faq",
      "FAQ / Q&A Content",
      "FAQPage or QAPage schema detected",
      "pass",
      100,
      8,
      "Excellent — FAQ schema is one of the strongest signals for AI Overview inclusion."
    );
  }
  if (questionHeadings >= 3) {
    return signal(
      "faq",
      "FAQ / Q&A Content",
      `${questionHeadings} question-style headings (What/How/Why…) found`,
      "pass",
      100,
      8,
      "Good question structure. Consider adding FAQPage schema to maximise AI citations."
    );
  }
  if (questionHeadings >= 1) {
    return signal(
      "faq",
      "FAQ / Q&A Content",
      `Only ${questionHeadings} question-style heading found`,
      "warn",
      50,
      8,
      "Add at least 3 question headings (What/How/Why) and FAQPage schema to rank in AI Overviews."
    );
  }
  return signal(
    "faq",
    "FAQ / Q&A Content",
    "No FAQ schema or question-style headings detected",
    "fail",
    0,
    8,
    "Add FAQPage JSON-LD and H2/H3 headings starting with What, How, Why, When, Where."
  );
}

function checkAuthor(scrape: ScrapeResult): AISignal {
  if (scrape.authorName) {
    return signal(
      "author",
      "Author / E-E-A-T",
      `Author identified: ${scrape.authorName}`,
      "pass",
      100,
      8,
      "Author attribution strengthens E-E-A-T (Experience, Expertise, Authoritativeness, Trust)."
    );
  }
  return signal(
    "author",
    "Author / E-E-A-T",
    "No author information found (meta[name='author'], article:author or Person JSON-LD)",
    "fail",
    0,
    8,
    "Add meta[name='author'] or a Person schema. Google and AI systems prioritise authored content."
  );
}

function checkContentDepth(scrape: ScrapeResult): AISignal {
  const wc = scrape.wordCount;
  if (wc >= 1500) {
    return signal(
      "depth",
      "Content Depth",
      `${wc.toLocaleString()} words — comprehensive content`,
      "pass",
      100,
      8,
      "Deep content gives AI systems more context to cite you as an authoritative source."
    );
  }
  if (wc >= 600) {
    return signal(
      "depth",
      "Content Depth",
      `${wc.toLocaleString()} words — moderate depth`,
      "warn",
      50,
      8,
      "Aim for 1,500+ words to be featured in AI Overviews. Add more detail, examples, or FAQs."
    );
  }
  return signal(
    "depth",
    "Content Depth",
    `Only ${wc.toLocaleString()} words — thin content`,
    "fail",
    0,
    8,
    "Pages with under 600 words are rarely cited by AI systems. Expand with in-depth content."
  );
}

function checkFreshness(scrape: ScrapeResult): AISignal {
  const hasBoth = !!(scrape.publishedDate && scrape.modifiedDate);
  const hasOne = !!(scrape.publishedDate || scrape.modifiedDate);

  if (hasBoth) {
    const mod = new Date(scrape.modifiedDate!);
    const now = new Date();
    const monthsOld = (now.getTime() - mod.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const desc = `Published: ${scrape.publishedDate?.slice(0, 10)}, Modified: ${scrape.modifiedDate?.slice(0, 10)}`;
    if (monthsOld <= 6) {
      return signal("freshness", "Freshness Signals", desc, "pass", 100, 7,
        "Recent modification date signals to AI crawlers that your content is up to date.");
    }
    return signal("freshness", "Freshness Signals", `${desc} (modified ${Math.round(monthsOld)}+ months ago)`, "warn", 50, 7,
      "Update your content and refresh the modified date to maintain AI search prominence.");
  }
  if (hasOne) {
    return signal(
      "freshness",
      "Freshness Signals",
      `Only ${scrape.publishedDate ? "published" : "modified"} date found`,
      "warn",
      50,
      7,
      "Add both article:published_time and article:modified_time meta tags."
    );
  }
  return signal(
    "freshness",
    "Freshness Signals",
    "No publish or modification dates detected",
    "fail",
    0,
    7,
    "Add article:published_time and article:modified_time. AI systems favour fresh, dated content."
  );
}

function checkHeadingStructure(scrape: ScrapeResult): AISignal {
  const h2h3count = scrape.headings.filter(
    (h) => h.tag === "h2" || h.tag === "h3"
  ).length;

  if (h2h3count >= 5) {
    return signal(
      "structure",
      "Direct Answer Structure",
      `${h2h3count} H2/H3 subheadings — well-structured for AI parsing`,
      "pass",
      100,
      7,
      "Clear heading hierarchy helps AI systems extract and summarise your content accurately."
    );
  }
  if (h2h3count >= 2) {
    return signal(
      "structure",
      "Direct Answer Structure",
      `Only ${h2h3count} H2/H3 subheadings found`,
      "warn",
      50,
      7,
      "Add more H2/H3 headings to improve content scanability for both AI and human readers."
    );
  }
  return signal(
    "structure",
    "Direct Answer Structure",
    "Insufficient heading structure (fewer than 2 H2/H3 headings)",
    "fail",
    0,
    7,
    "Use descriptive H2 and H3 headings to break content into scannable sections AI can reference."
  );
}

function checkAICrawlerAccess(scrape: ScrapeResult): AISignal {
  if (scrape.aiBotsBlocked) {
    return signal(
      "crawler",
      "AI Crawler Access",
      "AI bots are blocked (GPTBot, ClaudeBot, CCBot or noai directive detected)",
      "fail",
      0,
      7,
      "Remove AI bot blocking directives to allow ChatGPT, Claude and Perplexity to index your content."
    );
  }
  return signal(
    "crawler",
    "AI Crawler Access",
    "No AI crawler blocking detected — open to AI indexing",
    "pass",
    100,
    7,
    "AI crawlers can access your content. Ensure robots.txt also allows GPTBot and ClaudeBot."
  );
}

function checkEntityClarity(scrape: ScrapeResult): AISignal {
  const all = flattenSchemas(scrape.structuredData);
  const types = schemaTypes(all);
  const hasEntitySchema = types.some((t) => ENTITY_SCHEMA_TYPES.has(t));

  if (hasEntitySchema) {
    const found = types.find((t) => ENTITY_SCHEMA_TYPES.has(t));
    return signal(
      "entity",
      "Entity Clarity",
      `Entity schema found: ${found}`,
      "pass",
      100,
      6,
      "Entity schema helps AI systems identify and trust your brand as a knowledge-graph entity."
    );
  }
  // Partial credit if there's any org-like mention
  if (scrape.structuredData.length > 0) {
    return signal(
      "entity",
      "Entity Clarity",
      "Structured data present but no Organisation/Brand/Person entity schema",
      "warn",
      50,
      6,
      "Add Organization or LocalBusiness JSON-LD to establish your entity in Google's knowledge graph."
    );
  }
  return signal(
    "entity",
    "Entity Clarity",
    "No entity schema detected — AI systems may not recognise your brand",
    "fail",
    0,
    6,
    "Implement Organization JSON-LD with name, url, logo and sameAs (Wikipedia, social profiles)."
  );
}

function checkHTTPS(scrape: ScrapeResult): AISignal {
  if (scrape.hasHttps) {
    return signal(
      "https",
      "HTTPS Trust Signal",
      "Site served over HTTPS",
      "pass",
      100,
      5,
      "HTTPS is a basic trust requirement for AI systems and search engines alike."
    );
  }
  return signal(
    "https",
    "HTTPS Trust Signal",
    "Site is not served over HTTPS",
    "fail",
    0,
    5,
    "Migrate to HTTPS immediately. AI systems and Google deprioritise insecure sites."
  );
}

function checkLanguage(scrape: ScrapeResult): AISignal {
  if (scrape.language) {
    return signal(
      "language",
      "Language Declaration",
      `lang="${scrape.language}" declared on <html>`,
      "pass",
      100,
      4,
      "Language declaration helps AI systems serve your content to the right audience."
    );
  }
  return signal(
    "language",
    "Language Declaration",
    "No lang attribute found on <html> element",
    "warn",
    50,
    4,
    "Add lang='en' (or your language code) to the <html> tag for correct AI and accessibility targeting."
  );
}

function checkExternalRefs(scrape: ScrapeResult): AISignal {
  const externalCount = scrape.links.filter((l) => !l.isInternal).length;

  if (externalCount >= 3) {
    return signal(
      "refs",
      "External References",
      `${externalCount} external links — signals research and authority`,
      "pass",
      100,
      4,
      "Citing authoritative external sources improves E-E-A-T and AI citation likelihood."
    );
  }
  if (externalCount >= 1) {
    return signal(
      "refs",
      "External References",
      `Only ${externalCount} external link${externalCount === 1 ? "" : "s"} found`,
      "warn",
      50,
      4,
      "Add links to authoritative sources (Wikipedia, gov, academic). AI values well-referenced content."
    );
  }
  return signal(
    "refs",
    "External References",
    "No external links detected",
    "fail",
    0,
    4,
    "Link out to authoritative sources. Isolated pages are less trusted by AI search systems."
  );
}

// ─── Main Export ─────────────────────────────────────────

export function analyzeAIReadiness(
  scrape: ScrapeResult,
  _pageSpeed: PageSpeedResult | null
): AIReadinessResult {
  const signals: AISignal[] = [
    checkSchema(scrape),
    checkFaq(scrape),
    checkAuthor(scrape),
    checkContentDepth(scrape),
    checkFreshness(scrape),
    checkHeadingStructure(scrape),
    checkAICrawlerAccess(scrape),
    checkEntityClarity(scrape),
    checkHTTPS(scrape),
    checkLanguage(scrape),
    checkExternalRefs(scrape),
  ];

  const totalWeight = signals.reduce((s, sig) => s + sig.weight, 0);
  const earnedWeight = signals.reduce(
    (s, sig) => s + (sig.score / 100) * sig.weight,
    0
  );
  const score = Math.round((earnedWeight / totalWeight) * 100);

  let grade: AIReadinessResult["grade"];
  if (score >= 80) grade = "excellent";
  else if (score >= 60) grade = "good";
  else if (score >= 40) grade = "fair";
  else grade = "poor";

  return { score, grade, signals };
}
