"use client";

import { motion } from "framer-motion";
import { Gauge } from "lucide-react";
import type { PageSpeedResult, MetricResult } from "@/lib/types";
import { SectionHeader } from "@/components/shared/section-header";

interface WebVitalsProps {
  pageSpeed: PageSpeedResult | null;
}

const RATING_COLORS = {
  good: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  "needs-improvement": { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  poor: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

function VitalCard({
  label,
  metric,
  description,
}: {
  label: string;
  metric: MetricResult;
  description: string;
}) {
  const colors = RATING_COLORS[metric.rating];
  return (
    <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.text} ${colors.bg}`}
        >
          {metric.rating === "needs-improvement" ? "Needs Work" : metric.rating.charAt(0).toUpperCase() + metric.rating.slice(1)}
        </span>
      </div>
      <p className={`text-2xl font-bold ${colors.text}`}>
        {metric.displayValue}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function ScoreCard({
  label,
  score,
  variant,
}: {
  label: string;
  score: number;
  variant: "mobile" | "desktop";
}) {
  const color =
    score >= 90
      ? "text-emerald-400"
      : score >= 50
        ? "text-amber-400"
        : "text-red-400";
  return (
    <div className="text-center p-3 rounded-lg border border-border/30 bg-card/30">
      <div className="text-xs text-muted-foreground mb-1 capitalize">
        {variant} {label}
      </div>
      <div className={`text-xl font-bold ${color}`}>{score}</div>
    </div>
  );
}

export function WebVitalsSection({ pageSpeed }: WebVitalsProps) {
  if (!pageSpeed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <SectionHeader
          title="Core Web Vitals"
          subtitle="PageSpeed data not available — configure Google PageSpeed API key"
          icon={<Gauge className="w-5 h-5 text-blue-400" />}
        />
        <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center text-muted-foreground">
          <Gauge className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Add your Google PageSpeed API key to see Core Web Vitals
          </p>
        </div>
      </motion.div>
    );
  }

  const mobile = pageSpeed.mobile;
  const desktop = pageSpeed.desktop;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title="Core Web Vitals"
        subtitle="Google's key metrics for page experience"
        icon={<Gauge className="w-5 h-5 text-blue-400" />}
      />

      {/* Vital metrics (mobile) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <VitalCard
          label="LCP"
          metric={mobile.coreWebVitals.lcp}
          description="Largest Contentful Paint"
        />
        <VitalCard
          label="CLS"
          metric={mobile.coreWebVitals.cls}
          description="Cumulative Layout Shift"
        />
        <VitalCard
          label="INP"
          metric={mobile.coreWebVitals.inp}
          description="Interaction to Next Paint"
        />
        <VitalCard
          label="FCP"
          metric={mobile.coreWebVitals.fcp}
          description="First Contentful Paint"
        />
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ScoreCard label="Performance" score={mobile.scores.performance} variant="mobile" />
        <ScoreCard label="Performance" score={desktop.scores.performance} variant="desktop" />
        <ScoreCard label="SEO" score={mobile.scores.seo} variant="mobile" />
        <ScoreCard label="Accessibility" score={mobile.scores.accessibility} variant="mobile" />
      </div>
    </motion.div>
  );
}
