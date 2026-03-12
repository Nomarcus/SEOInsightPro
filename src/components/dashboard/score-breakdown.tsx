"use client";

import { motion } from "framer-motion";
import { Settings, FileText, Search, Zap, Monitor } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { getScoreColor } from "@/lib/constants";
import { AnimatedCounter } from "@/components/shared/animated-counter";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  technical: <Settings className="w-4 h-4" />,
  content: <FileText className="w-4 h-4" />,
  onPage: <Search className="w-4 h-4" />,
  performance: <Zap className="w-4 h-4" />,
  userExperience: <Monitor className="w-4 h-4" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical",
  content: "Content",
  onPage: "On-Page",
  performance: "Performance",
  userExperience: "UX",
};

interface ScoreBreakdownProps {
  categoryScores: AnalysisResult["categoryScores"];
}

export function ScoreBreakdown({ categoryScores }: ScoreBreakdownProps) {
  const categories = Object.entries(categoryScores);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {categories.map(([key, cat], i) => {
        const color = getScoreColor(cat.score);
        const circumference = 2 * Math.PI * 28;
        const strokeDashoffset = circumference - (circumference * cat.score) / 100;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex flex-col items-center p-4 rounded-xl border border-border/50 bg-card/50"
          >
            {/* Ring chart */}
            <div className="relative w-16 h-16 mb-2">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatedCounter
                  value={cat.score}
                  className="text-sm font-bold"
                  duration={1.5}
                />
              </div>
            </div>

            {/* Icon + label */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {CATEGORY_ICONS[key]}
              <span>{CATEGORY_LABELS[key] || key}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
