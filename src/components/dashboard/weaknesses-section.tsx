"use client";

import { motion } from "framer-motion";
import { AlertTriangle, XCircle } from "lucide-react";
import type { InsightItem } from "@/lib/types";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";

interface WeaknessesSectionProps {
  weaknesses: InsightItem[];
}

export function WeaknessesSection({ weaknesses }: WeaknessesSectionProps) {
  if (!weaknesses.length) return null;

  const critical = weaknesses.filter((w) => w.severity === "critical");
  const warnings = weaknesses.filter((w) => w.severity === "warning");
  const sorted = [...critical, ...warnings];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title="Issues Found"
        subtitle="These areas need attention to improve your rankings"
        icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
      />
      <div className="space-y-3">
        {sorted.map((item, i) => {
          const isCritical = item.severity === "critical";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`p-4 rounded-xl border transition-colors ${
                isCritical
                  ? "border-red-500/20 bg-red-500/5 hover:border-red-500/30"
                  : "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                {isCritical ? (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`font-medium text-sm ${
                        isCritical ? "text-red-300" : "text-amber-300"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <StatusBadge variant={isCritical ? "critical" : "warning"}>
                      {isCritical ? "Critical" : "Warning"}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
