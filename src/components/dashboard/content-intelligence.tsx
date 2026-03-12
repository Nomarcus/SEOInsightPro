"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Tag, LayoutGrid, Smile } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import type { NaturalLanguageResult } from "@/lib/types";

// Entity type → color mapping
const ENTITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  ORGANIZATION:    { bg: "bg-blue-500/15",   text: "text-blue-400",   label: "Org" },
  PERSON:          { bg: "bg-purple-500/15",  text: "text-purple-400", label: "Person" },
  LOCATION:        { bg: "bg-green-500/15",   text: "text-green-400",  label: "Location" },
  CONSUMER_GOOD:   { bg: "bg-orange-500/15",  text: "text-orange-400", label: "Product" },
  EVENT:           { bg: "bg-pink-500/15",    text: "text-pink-400",   label: "Event" },
  WORK_OF_ART:     { bg: "bg-yellow-500/15",  text: "text-yellow-400", label: "Art" },
  OTHER:           { bg: "bg-slate-500/15",   text: "text-slate-400",  label: "Other" },
  UNKNOWN:         { bg: "bg-slate-500/15",   text: "text-slate-400",  label: "Other" },
};

function entityStyle(type: string) {
  return ENTITY_COLORS[type] ?? ENTITY_COLORS.OTHER;
}

function SentimentBar({ score }: { score: number }) {
  // score is -1 to 1, map to 0-100%
  const pct = Math.round(((score + 1) / 2) * 100);
  const color =
    score >= 0.5  ? "#10B981" :
    score >= 0.1  ? "#22c55e" :
    score <= -0.5 ? "#EF4444" :
    score <= -0.1 ? "#f97316" :
                    "#9CA3AF";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Very Negative</span>
        <span>Neutral</span>
        <span>Very Positive</span>
      </div>
      <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
        {/* Tick at center (neutral) */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
        {/* Filled bar from center */}
        <motion.div
          className="absolute top-0 h-full rounded-full"
          style={{ backgroundColor: color, left: "50%", transformOrigin: score >= 0 ? "left" : "right" }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.abs(pct - 50)}%`, left: score >= 0 ? "50%" : `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function ContentIntelligence({ nlResult }: { nlResult: NaturalLanguageResult }) {
  const topEntities = nlResult.entities.slice(0, 10);
  const topCategories = nlResult.categories.slice(0, 4);
  const { sentiment } = nlResult;

  const sentimentColor =
    sentiment.score >= 0.5  ? "text-green-400" :
    sentiment.score >= 0.1  ? "text-green-400" :
    sentiment.score <= -0.5 ? "text-red-400"   :
    sentiment.score <= -0.1 ? "text-orange-400" :
                               "text-muted-foreground";

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title="Content Intelligence"
        subtitle="How Google's AI understands your page content"
        icon={<BrainCircuit className="w-5 h-5 text-violet-400" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">

        {/* Entities */}
        <div className="lg:col-span-2 bg-card/50 border border-border/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-foreground">
              What Google Recognizes on This Page
            </h3>
          </div>

          {topEntities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No significant entities detected.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topEntities.map((entity, i) => {
                const style = entityStyle(entity.type);
                return (
                  <motion.div
                    key={`${entity.name}-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${style.bg} border border-white/5`}
                    title={`${entity.type} — salience: ${Math.round(entity.salience * 100)}%`}
                  >
                    <span className={`text-xs font-bold ${style.text}`}>
                      {style.label}
                    </span>
                    <span className="text-xs text-foreground font-medium">
                      {entity.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {Math.round(entity.salience * 100)}%
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            These are the entities Google&apos;s NL model identifies as most central to your page.
            If these don&apos;t match your target keywords, your content needs better focus.
          </p>
        </div>

        {/* Categories + Sentiment stacked */}
        <div className="flex flex-col gap-4">

          {/* Content Categories */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-5 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Google&apos;s Category
              </h3>
            </div>
            {topCategories.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Not enough content to classify. Add more body text.
              </p>
            ) : (
              <div className="space-y-2">
                {topCategories.map((cat, i) => {
                  // Format path: "/Business & Industrial/Marketing" → highlight last segment
                  const parts = cat.name.split("/").filter(Boolean);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs flex-wrap">
                          {parts.map((p, pi) => (
                            <span key={pi} className="flex items-center gap-1">
                              {pi > 0 && <span className="text-muted-foreground">/</span>}
                              <span className={pi === parts.length - 1 ? "text-emerald-400 font-semibold" : "text-muted-foreground"}>
                                {p}
                              </span>
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {Math.round(cat.confidence * 100)}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-emerald-500"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.round(cat.confidence * 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1, duration: 0.6 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sentiment */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Smile className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Content Sentiment
              </h3>
            </div>
            <div className={`text-lg font-bold capitalize mb-2 ${sentimentColor}`}>
              {sentiment.label}
            </div>
            <SentimentBar score={sentiment.score} />
            <p className="text-[11px] text-muted-foreground mt-2">
              Score: {sentiment.score > 0 ? "+" : ""}{sentiment.score} · Magnitude: {sentiment.magnitude}
            </p>
          </div>
        </div>

      </div>

      {/* Language note */}
      {nlResult.detectedLanguage && nlResult.detectedLanguage !== "en" && (
        <p className="text-xs text-muted-foreground mt-3">
          Detected language: <span className="text-foreground font-medium">{nlResult.detectedLanguage}</span>
        </p>
      )}
    </motion.section>
  );
}
