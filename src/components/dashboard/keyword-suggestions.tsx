"use client";

import { motion } from "framer-motion";
import { Target, Check, X } from "lucide-react";
import type { KeywordSuggestion } from "@/lib/types";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";

interface KeywordSuggestionsProps {
  keywords: KeywordSuggestion[];
}

const DIFFICULTY_COLORS = {
  easy: "positive",
  medium: "warning",
  hard: "critical",
} as const;

const VOLUME_BARS = { low: 1, medium: 2, high: 3 };

export function KeywordSuggestionsSection({
  keywords,
}: KeywordSuggestionsProps) {
  if (!keywords.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title="Keyword Opportunities"
        subtitle="AI-suggested keywords to target for better rankings"
        icon={<Target className="w-5 h-5 text-blue-400" />}
      />
      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-card/50">
              <th className="text-left p-3 font-medium text-muted-foreground">
                Keyword
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground">
                Relevance
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground">
                Difficulty
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground">
                Volume
              </th>
              <th className="text-center p-3 font-medium text-muted-foreground">
                On Page
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">
                Suggestion
              </th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((kw, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-border/30 hover:bg-card/30 transition-colors"
              >
                <td className="p-3 font-medium">{kw.keyword}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${kw.relevanceScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {kw.relevanceScore}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <StatusBadge variant={DIFFICULTY_COLORS[kw.estimatedDifficulty]}>
                    {kw.estimatedDifficulty}
                  </StatusBadge>
                </td>
                <td className="p-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={`w-2 rounded-sm ${
                          bar <= VOLUME_BARS[kw.estimatedSearchVolume]
                            ? "bg-blue-400 h-4"
                            : "bg-muted/20 h-4"
                        }`}
                        style={{
                          height: `${8 + bar * 4}px`,
                          alignSelf: "flex-end",
                        }}
                      />
                    ))}
                  </div>
                </td>
                <td className="p-3 text-center">
                  {kw.currentlyUsed ? (
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-red-400 mx-auto" />
                  )}
                </td>
                <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">
                  {kw.suggestion}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
