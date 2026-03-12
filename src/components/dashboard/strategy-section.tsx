"use client";

import { motion } from "framer-motion";
import { Compass, Clock, Calendar, CalendarDays } from "lucide-react";
import type { StrategyItem } from "@/lib/types";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";

interface StrategySectionProps {
  strategy: StrategyItem[];
}

const TIMEFRAME_ICON: Record<string, React.ReactNode> = {
  immediate: <Clock className="w-4 h-4" />,
  "short-term": <Calendar className="w-4 h-4" />,
  "long-term": <CalendarDays className="w-4 h-4" />,
};

const TIMEFRAME_LABELS: Record<string, string> = {
  immediate: "Do Now",
  "short-term": "This Month",
  "long-term": "This Quarter",
};

const PRIORITY_VARIANTS: Record<string, "positive" | "warning" | "critical"> = {
  high: "critical",
  medium: "warning",
  low: "neutral" as "positive",
};

export function StrategySection({ strategy }: StrategySectionProps) {
  if (!strategy.length) return null;

  const groups = {
    immediate: strategy.filter((s) => s.timeframe === "immediate"),
    "short-term": strategy.filter((s) => s.timeframe === "short-term"),
    "long-term": strategy.filter((s) => s.timeframe === "long-term"),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title="SEO Strategy Roadmap"
        subtitle="Prioritized recommendations for improving your search rankings"
        icon={<Compass className="w-5 h-5 text-purple-400" />}
      />

      <div className="space-y-6">
        {Object.entries(groups).map(
          ([timeframe, items]) =>
            items.length > 0 && (
              <div key={timeframe}>
                {/* Timeframe header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-primary">
                    {TIMEFRAME_ICON[timeframe]}
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {TIMEFRAME_LABELS[timeframe] || timeframe}
                  </h3>
                  <div className="flex-1 h-px bg-border/30" />
                </div>

                {/* Strategy items */}
                <div className="space-y-2 ml-6 border-l border-border/30 pl-4">
                  {items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="p-3 rounded-lg border border-border/30 bg-card/30 hover:border-border/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm flex-1">
                          {item.title}
                        </h4>
                        <StatusBadge
                          variant={PRIORITY_VARIANTS[item.priority] || "neutral"}
                        >
                          {item.priority}
                        </StatusBadge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    </motion.div>
  );
}
