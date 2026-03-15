"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Globe,
  Wrench,
  Info,
} from "lucide-react";
import { useAnalysis } from "@/hooks/use-analysis";
import { ScoreGauge } from "@/components/dashboard/score-gauge";
import { ScoreBreakdown } from "@/components/dashboard/score-breakdown";
import { SerpPreview } from "@/components/dashboard/serp-preview";
import { StrengthsSection } from "@/components/dashboard/strengths-section";
import { WeaknessesSection } from "@/components/dashboard/weaknesses-section";
import { QuickWinsSection } from "@/components/dashboard/quick-wins";
import { KeywordSuggestionsSection } from "@/components/dashboard/keyword-suggestions";
import { ActionMatrix } from "@/components/dashboard/action-matrix";
import { WebVitalsSection } from "@/components/dashboard/web-vitals";
import { HeadingStructure } from "@/components/dashboard/heading-structure";
import { StrategySection } from "@/components/dashboard/strategy-section";
import { TrafficPotentialSection } from "@/components/dashboard/traffic-potential";
import { CompetitorTeaser } from "@/components/dashboard/competitor-teaser";
import { CTASection } from "@/components/dashboard/cta-section";
import { PdfReportButton } from "@/components/dashboard/pdf-report-button";
import { ProPdfButton } from "@/components/dashboard/pro-pdf-button";
import { ContentIntelligence } from "@/components/dashboard/content-intelligence";
import { AiSeoScore } from "@/components/dashboard/ai-seo-score";
import { FixGuideTeaser } from "@/components/dashboard/fix-guide-teaser";
import { PlainReportButton } from "@/components/dashboard/plain-report-button";

export default function DashboardPage() {
  const router = useRouter();
  const {
    url,
    analysisResult,
    scrapeResult,
    pageSpeedResult,
    nlResult,
    phase,
  } = useAnalysis();

  // If no data, redirect to home
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

  const result = analysisResult;
  const hostname = (() => {
    try {
      return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/")}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium truncate">{hostname}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    result.overallScore >= 80
                      ? "#10B981"
                      : result.overallScore >= 60
                        ? "#3B82F6"
                        : result.overallScore >= 40
                          ? "#F59E0B"
                          : "#EF4444",
                }}
              />
              <span className="text-sm font-bold">{result.overallScore}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/how-it-works"
              className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="How scoring works"
            >
              <Info className="w-3.5 h-3.5" />
              How it works
            </Link>
            {result.aiProvider === "both" && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                Dual AI Verified
              </span>
            )}
            <Link
              href="/fix-guide"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                color: "#fff",
                boxShadow: "0 0 16px rgba(139, 92, 246, 0.35)",
              }}
            >
              <Wrench className="w-4 h-4" />
              Fix Guide
            </Link>
            <ProPdfButton />
            <PdfReportButton />
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div>
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
          {/* A. URL info banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <p className="text-sm text-muted-foreground mb-1">
              SEO Analysis Report for
            </p>
            <a
              href={url.startsWith("http") ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              {hostname}
              <ExternalLink className="w-4 h-4" />
            </a>
            {result.industryCategory && (
              <p className="text-xs text-muted-foreground mt-1">
                Industry: {result.industryCategory}
              </p>
            )}
          </motion.div>

          {/* B. Score Gauge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <ScoreGauge score={result.overallScore} />
          </motion.div>

          {/* Category Breakdown */}
          <ScoreBreakdown categoryScores={result.categoryScores} />

          {/* Plain language report */}
          <PlainReportButton url={url} analysisResult={result} />

          {/* Content Intelligence - Google NL API (shown when available) */}
          {nlResult && <ContentIntelligence nlResult={nlResult} />}

          {/* AI Search Readiness Score */}
          {result.aiReadiness && (
            <AiSeoScore aiReadiness={result.aiReadiness} />
          )}

          {/* C. SERP Preview */}
          <SerpPreview serpPreview={result.serpPreview} />

          {/* D. Strengths */}
          <StrengthsSection strengths={result.strengths} />

          {/* E. Weaknesses */}
          <WeaknessesSection weaknesses={result.weaknesses} />

          {/* Fix Guide Teaser (premium upsell) */}
          <FixGuideTeaser weaknessCount={result.weaknesses.length} />

          {/* F. Quick Wins */}
          <QuickWinsSection quickWins={result.quickWins} />

          {/* G. Keywords */}
          <KeywordSuggestionsSection keywords={result.keywords} />

          {/* H. Priority Matrix */}
          <ActionMatrix actionItems={result.actionItems} />

          {/* I. Core Web Vitals - only shown when PageSpeed data is available */}
          {pageSpeedResult && (
            <WebVitalsSection pageSpeed={pageSpeedResult} />
          )}

          {/* J. Heading Structure */}
          {scrapeResult && (
            <HeadingStructure headings={scrapeResult.headings} />
          )}

          {/* K. Strategy */}
          <StrategySection strategy={result.strategy} />

          {/* L. Traffic Potential */}
          <TrafficPotentialSection
            trafficPotential={result.trafficPotential}
          />

          {/* Competitor Teaser */}
          <CompetitorTeaser />

          {/* M. CTA */}
          <CTASection />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground/40 pt-8 pb-4">
            <p>Report generated by SEO Insight Pro &middot; AI-Powered Analysis</p>
            <p className="mt-1">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
