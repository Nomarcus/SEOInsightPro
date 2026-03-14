"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Info } from "lucide-react";

const categories = [
  {
    name: "Technical SEO",
    weight: 25,
    color: "#6366F1",
    description: "Foundation checks that affect how search engines crawl and index your site.",
    signals: [
      { label: "HTTPS Security", weight: 10, note: "Critical — no HTTPS means Google flags the site as unsafe" },
      { label: "Indexability (meta robots)", weight: 10, note: "A noindex tag blocks the page from search engines entirely" },
      { label: "Canonical URL", weight: 5, note: "Prevents duplicate-content penalties" },
      { label: "XML Sitemap", weight: 5, note: "Helps Google discover all pages" },
      { label: "Robots.txt", weight: 5, note: "Controls crawl budget" },
      { label: "Structured Data (JSON-LD)", weight: 5, note: "Enables rich results in Google" },
      { label: "Language Tag", weight: 3, note: "Required for correct language detection" },
    ],
  },
  {
    name: "Content",
    weight: 25,
    color: "#10B981",
    description: "Quality and completeness of the page content.",
    signals: [
      { label: "Word Count", weight: 8, note: "300+ words minimum; 1 000+ is competitive" },
      { label: "Image Alt Attributes", weight: 5, note: "Missing alts hurt accessibility and image-search rankings" },
      { label: "Internal Linking", weight: 5, note: "10+ internal links show a well-connected site" },
      { label: "External Links", weight: 3, note: "Citing authoritative sources signals trust" },
    ],
  },
  {
    name: "On-Page SEO",
    weight: 20,
    color: "#F59E0B",
    description: "Elements that directly influence how a page ranks for search queries.",
    signals: [
      { label: "Title Tag (exists + length)", weight: 10, note: "Optimal: 50–60 characters. Too short or too long = missed opportunity" },
      { label: "Meta Description (exists + length)", weight: 8, note: "Optimal: 120–155 characters. Influences click-through rate" },
      { label: "Single H1 Heading", weight: 8, note: "Every page should have exactly one H1" },
      { label: "Heading Hierarchy", weight: 4, note: "H1 → H2 → H3, no skips" },
      { label: "Open Graph Tags", weight: 4, note: "Title + description + image for social sharing" },
    ],
  },
  {
    name: "Performance",
    weight: 15,
    color: "#EF4444",
    description: "Speed signals that affect both user experience and Google rankings.",
    signals: [
      { label: "Server Response Time", weight: 5, note: "Under 1 s = pass; 1–3 s = warning; 3 s+ = fail" },
      { label: "Mobile Performance Score (Google)", weight: 8, note: "From Google PageSpeed API — 90+ = pass" },
      { label: "Largest Contentful Paint (LCP)", weight: 7, note: "Under 2.5 s = good; Core Web Vital" },
      { label: "Cumulative Layout Shift (CLS)", weight: 7, note: "Under 0.1 = good; measures visual stability" },
    ],
  },
  {
    name: "User Experience",
    weight: 15,
    color: "#8B5CF6",
    description: "How well the page serves visitors across devices.",
    signals: [
      { label: "Mobile Viewport Meta", weight: 8, note: "Without this tag pages zoom out and are unusable on mobile" },
      { label: "HTTPS (UX perspective)", weight: 6, note: "Browsers show 'Not Secure' warnings for HTTP sites" },
      { label: "Accessibility Score (Google)", weight: 8, note: "From Google Lighthouse — 90+ = pass" },
      { label: "Mobile SEO Score (Google)", weight: 6, note: "Google's own mobile-SEO audit" },
    ],
  },
];

const aiSignals = [
  { label: "Author Attribution", note: "Named author in meta or JSON-LD schema" },
  { label: "Published Date", note: "article:published_time or <time datetime>" },
  { label: "Modified Date", note: "Freshness signal for AI training data" },
  { label: "FAQ / QA Schema", note: "JSON-LD FAQPage or QAPage markup" },
  { label: "Question-Style Headings", note: "H2/H3s starting with What, How, Why…" },
  { label: "Structured Data (JSON-LD)", note: "Any Schema.org markup present" },
  { label: "Hreflang Tags", note: "Language and region targeting" },
  { label: "HTTPS", note: "Required for AI citation trust" },
  { label: "Canonical URL", note: "Avoids AI crawlers indexing duplicates" },
  { label: "AI Bots NOT Blocked", note: "robots.txt / meta robots not blocking GPTBot, ClaudeBot…" },
  { label: "Indexable by Search Engines", note: "No noindex directive" },
];

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-medium">How the Analysis Works</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Intro */}
        <motion.section {...fadeIn} className="text-center space-y-4">
          <h1 className="text-3xl font-bold">How SEO Insight Pro Scores Your Site</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every score is calculated from deterministic rules — no black-box AI guessing.
            Below you can see exactly which signals are checked, how they are weighted,
            and why each one matters.
          </p>
        </motion.section>

        {/* Overall score formula */}
        <motion.section {...fadeIn} transition={{ delay: 0.1 }} className="space-y-6">
          <h2 className="text-xl font-semibold">Overall SEO Score Formula</h2>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 text-sm font-mono text-muted-foreground">
              SEO Score = Technical×0.25 + Content×0.25 + On-Page×0.20 + Performance×0.15 + UX×0.15
            </div>
            <div className="grid grid-cols-5 divide-x divide-border/40">
              {categories.map((cat) => (
                <div key={cat.name} className="p-4 text-center space-y-1">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: cat.color }}
                  >
                    {cat.weight}%
                  </div>
                  <div className="text-xs text-muted-foreground leading-tight">{cat.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg px-4 py-3">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Each category score is a weighted average of its individual signals.
              A <strong>pass</strong> earns 100 % of the weight, a <strong>warning</strong> earns 50 %,
              and a <strong>fail</strong> earns 0 %. The overall score targets alignment
              with Google PageSpeed Insights&apos; SEO category score.
            </span>
          </div>
        </motion.section>

        {/* Category detail */}
        <div className="space-y-10">
          {categories.map((cat, i) => (
            <motion.section
              key={cat.name}
              {...fadeIn}
              transition={{ delay: 0.1 * (i + 2) }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-1 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <h2 className="text-lg font-semibold">
                    {cat.name}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({cat.weight} % of overall score)
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 divide-y divide-border/40">
                <div className="grid grid-cols-[1fr_auto] px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span>Signal</span>
                  <span className="text-right">Weight</span>
                </div>
                {cat.signals.map((sig) => (
                  <div key={sig.label} className="px-4 py-3 space-y-0.5">
                    <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                      <span className="text-sm font-medium">{sig.label}</span>
                      <span
                        className="text-sm font-mono font-bold shrink-0"
                        style={{ color: cat.color }}
                      >
                        {sig.weight}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{sig.note}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* AI Readiness */}
        <motion.section {...fadeIn} transition={{ delay: 0.8 }} className="space-y-4">
          <h2 className="text-xl font-semibold">AI Search Readiness Score</h2>
          <p className="text-sm text-muted-foreground">
            Separate from the SEO score, this measures how well your content is optimised
            for AI-powered search engines (ChatGPT, Perplexity, Google AI Overviews).
            It checks {aiSignals.length} signals with equal weighting.
          </p>
          <div className="rounded-xl border border-border/60 divide-y divide-border/40">
            {aiSignals.map((sig) => (
              <div key={sig.label} className="px-4 py-3 space-y-0.5">
                <span className="text-sm font-medium">{sig.label}</span>
                <p className="text-xs text-muted-foreground">{sig.note}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Data sources */}
        <motion.section {...fadeIn} transition={{ delay: 0.9 }} className="space-y-4">
          <h2 className="text-xl font-semibold">Data Sources</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: "HTML Scraper",
                desc: "Fetches raw HTML with Cheerio. Extracts title, meta, headings, links, images, structured data, and viewport meta. This is the primary data source.",
              },
              {
                title: "Google PageSpeed API",
                desc: "When available, provides Core Web Vitals (LCP, CLS), Lighthouse performance score, and accessibility score. Without it, those rules default to 'warn'.",
              },
              {
                title: "AI Insights (Multiple AI Models)",
                desc: "Generates strengths, weaknesses, keywords, and strategy text using various AI models. The AI does NOT set any numerical scores — all numbers come from the rule engine.",
              },
            ].map((source) => (
              <div
                key={source.title}
                className="rounded-xl border border-border/60 p-5 space-y-2"
              >
                <h3 className="font-semibold text-sm">{source.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{source.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Limitations */}
        <motion.section {...fadeIn} transition={{ delay: 1.0 }} className="space-y-4">
          <h2 className="text-xl font-semibold">Known Limitations</h2>
          <ul className="space-y-3 text-sm text-muted-foreground list-none">
            {[
              "JavaScript-rendered content is not evaluated — the scraper reads static HTML only.",
              "PageSpeed API has rate limits; when unavailable, Performance and UX scores are partial.",
              "Homepage scores differ from inner pages — we analyse only the URL you enter.",
              "Google&apos;s ranking algorithm uses 200+ factors; this tool covers the most impactful technical signals.",
              "Word count is measured after removing nav, header, footer, and scripts — on portal sites (Wikipedia homepage) this can be very low.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">⚠</span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Back link */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Analyse a website
          </Link>
        </div>
      </div>
    </div>
  );
}
