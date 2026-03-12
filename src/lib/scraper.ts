import * as cheerio from "cheerio";
import type { ScrapeResult, HeadingItem, LinkItem, ImageItem } from "./types";

const USER_AGENTS = [
  "Mozilla/5.0 (compatible; SEOInsightBot/1.0; +https://seoinsightpro.com)",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

function isInternalLink(href: string, baseUrl: string): boolean {
  try {
    const link = new URL(href, baseUrl);
    const base = new URL(baseUrl);
    return link.hostname === base.hostname;
  } catch {
    return href.startsWith("/") || href.startsWith("#");
  }
}

export async function scrapeWebsite(inputUrl: string): Promise<ScrapeResult> {
  const url = normalizeUrl(inputUrl);
  const startTime = Date.now();

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5,sv;q=0.3",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  const loadTimeMs = Date.now() - startTime;
  const html = await response.text();
  const $ = cheerio.load(html);

  // Title
  const title = $("title").first().text().trim() || null;

  // Meta description
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || null;

  // Meta robots
  const metaRobots =
    $('meta[name="robots"]').attr("content")?.trim() || null;

  // Canonical
  const canonicalUrl = $('link[rel="canonical"]').attr("href")?.trim() || null;

  // Language
  const language =
    $("html").attr("lang")?.trim() ||
    $('meta[http-equiv="content-language"]').attr("content")?.trim() ||
    null;

  // Open Graph
  const openGraph = {
    title: $('meta[property="og:title"]').attr("content")?.trim(),
    description: $('meta[property="og:description"]').attr("content")?.trim(),
    image: $('meta[property="og:image"]').attr("content")?.trim(),
    type: $('meta[property="og:type"]').attr("content")?.trim(),
  };

  // Headings
  const headings: HeadingItem[] = [];
  let headingOrder = 0;
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const tag = ($(el).prop("tagName") || "").toLowerCase() as HeadingItem["tag"];
    const text = $(el).text().trim();
    if (text) {
      headings.push({ tag, text: text.slice(0, 200), order: headingOrder++ });
    }
  });

  // Links
  const links: LinkItem[] = [];
  const seenHrefs = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim() || "";
    if (!href || href === "#" || seenHrefs.has(href)) return;
    seenHrefs.add(href);
    const rel = $(el).attr("rel") || "";
    links.push({
      href,
      text: $(el).text().trim().slice(0, 100),
      isInternal: isInternalLink(href, url),
      hasNofollow: rel.includes("nofollow"),
    });
  });

  // Images
  const images: ImageItem[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    const alt = $(el).attr("alt") ?? null;
    images.push({
      src: src.slice(0, 300),
      alt: alt?.slice(0, 200) ?? null,
      hasAlt: alt !== null && alt.trim().length > 0,
    });
  });

  // Structured data (JSON-LD) — must be extracted BEFORE script tags are removed below
  const structuredData: object[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "");
      structuredData.push(data);
    } catch {
      // ignore invalid JSON-LD
    }
  });

  // ── AI Search Readiness signals (extracted before script/nav removal) ──────

  // Author detection (priority order)
  const authorName: string | undefined =
    $('meta[name="author"]').attr("content")?.trim() ||
    $('meta[property="article:author"]').attr("content")?.trim() ||
    (() => {
      for (const sd of structuredData) {
        const author = (sd as Record<string, unknown>)["author"];
        if (typeof author === "string" && author) return author;
        if (author && typeof author === "object") {
          const n = (author as Record<string, unknown>)["name"];
          if (typeof n === "string" && n) return n;
        }
      }
      return undefined;
    })() ||
    undefined;

  // Date signals
  const publishedDate: string | undefined =
    $('meta[property="article:published_time"]').attr("content") ||
    $('meta[name="date"]').attr("content") ||
    $("time[datetime]").first().attr("datetime") ||
    undefined;

  const modifiedDate: string | undefined =
    $('meta[property="article:modified_time"]').attr("content") ||
    $('meta[name="last-modified"]').attr("content") ||
    undefined;

  // FAQ/QA schema detection — flatten @graph containers if present
  const allSchemas: object[] = structuredData.flatMap((sd) => {
    const graph = (sd as Record<string, unknown>)["@graph"];
    return Array.isArray(graph) ? [sd, ...(graph as object[])] : [sd];
  });
  const hasFaqSchema = allSchemas.some((sd) => {
    const t = (sd as Record<string, unknown>)["@type"];
    if (typeof t === "string") return t === "FAQPage" || t === "QAPage";
    if (Array.isArray(t)) return t.includes("FAQPage") || t.includes("QAPage");
    return false;
  });

  // AI bot blocking detection
  const robotsStr = $('meta[name="robots"]').attr("content")?.toLowerCase() ?? "";
  const googlebotStr = $('meta[name="googlebot"]').attr("content")?.toLowerCase() ?? "";
  const aiBotsBlocked =
    robotsStr.includes("noai") ||
    robotsStr.includes("noimageai") ||
    googlebotStr.includes("noai") ||
    $('meta[name="GPTBot"]').length > 0 ||
    $('meta[name="ChatGPT-User"]').length > 0 ||
    $('meta[name="CCBot"]').length > 0 ||
    $('meta[name="anthropic-ai"]').length > 0 ||
    $('meta[name="ClaudeBot"]').length > 0;

  // Question-style headings (H2/H3 starting with interrogative words)
  const questionHeadings = headings.filter(
    (h) =>
      (h.tag === "h2" || h.tag === "h3") &&
      /^(what|how|why|when|where|who|which|can|is|are|does|do|should|will)\b/i.test(h.text)
  ).length;

  // Word count + body text for NL analysis (visible text, scripts/styles removed below)
  $("script, style, noscript, svg, nav, footer, header").remove();
  const rawBodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = rawBodyText ? rawBodyText.split(/\s+/).length : 0;
  // Expose first 3000 chars for Natural Language API
  const bodyText = rawBodyText.slice(0, 3000) || undefined;

  // Mobile viewport
  const hasViewport = $('meta[name="viewport"]').length > 0;

  // Hreflang
  const hreflangTags: { lang: string; href: string }[] = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const lang = $(el).attr("hreflang") || "";
    const href = $(el).attr("href") || "";
    if (lang && href) hreflangTags.push({ lang, href });
  });

  // Check sitemap and robots.txt
  const baseUrl = new URL(url).origin;
  const [hasSitemap, hasRobotsTxt] = await Promise.all([
    checkUrlExists(`${baseUrl}/sitemap.xml`),
    checkUrlExists(`${baseUrl}/robots.txt`),
  ]);

  return {
    url,
    finalUrl: response.url,
    statusCode: response.status,
    loadTimeMs,
    title,
    titleLength: title?.length || 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length || 0,
    metaRobots,
    canonicalUrl,
    language,
    openGraph,
    headings,
    links: links.slice(0, 200), // limit to avoid huge payloads
    images: images.slice(0, 100),
    wordCount,
    bodyText,
    structuredData: structuredData.slice(0, 5),
    hreflangTags,
    hasHttps: url.startsWith("https://"),
    hasSitemap,
    hasRobotsTxt,
    hasViewport,
    authorName,
    publishedDate,
    modifiedDate,
    hasFaqSchema,
    aiBotsBlocked,
    questionHeadings,
  };
}

async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
