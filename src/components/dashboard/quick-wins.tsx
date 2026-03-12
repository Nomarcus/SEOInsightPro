"use client";

import { motion } from "framer-motion";
import { Zap, Clock, TrendingUp } from "lucide-react";
import type { QuickWin } from "@/lib/types";
import { SectionHeader } from "@/components/shared/section-header";

interface QuickWinsProps {
  quickWins: QuickWin[];
}

const EFFORT_LABELS = { minutes: "Minutes", hours: "Hours", days: "Days" };
const IMPACT_COLORS = {
  low: "text-blue-400 bg-blue-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  high: "text-emerald-400 bg-emerald-500/10",
};

export function QuickWinsSection({ quickWins }: QuickWinsProps) {
  if (!quickWins.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title="Quick Wins"
        subtitle="Low-effort changes that can make a big difference"
        icon={<Zap className="w-5 h-5 text-amber-400" />}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickWins.map((win, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent hover:border-amber-500/30 transition-all group"
          >
            {/* Impact badge */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  IMPACT_COLORS[win.estimatedImpact]
                }`}
              >
                {win.estimatedImpact.charAt(0).toUpperCase() +
                  win.estimatedImpact.slice(1)}{" "}
                Impact
              </span>
              <div className="flex items-center gap-1 text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-sm font-bold">
                  +{win.impactPercentage}%
                </span>
              </div>
            </div>

            {/* Title and description */}
            <h4 className="font-medium text-sm mb-2">{win.title}</h4>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {win.description}
            </p>

            {/* Effort indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Clock className="w-3.5 h-3.5" />
              <span>~{EFFORT_LABELS[win.estimatedEffort]}</span>
            </div>

            {/* Impact bar */}
            <div className="mt-3 h-1.5 rounded-full bg-muted/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(win.impactPercentage * 3, 100)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
