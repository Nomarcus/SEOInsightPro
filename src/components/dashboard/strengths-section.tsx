"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { InsightItem } from "@/lib/types";
import { SectionHeader } from "@/components/shared/section-header";

interface StrengthsSectionProps {
  strengths: InsightItem[];
}

export function StrengthsSection({ strengths }: StrengthsSectionProps) {
  if (!strengths.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title="What's Working Well"
        subtitle="These aspects of your SEO are performing well"
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        {strengths.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-emerald-300">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
