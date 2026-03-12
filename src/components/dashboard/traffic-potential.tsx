"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TrafficPotential } from "@/lib/types";
import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedCounter } from "@/components/shared/animated-counter";

interface TrafficPotentialProps {
  trafficPotential: TrafficPotential;
}

// Generate projected data points
function generateProjection(percentageIncrease: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const baseValue = 100;
  const targetValue = baseValue * (1 + percentageIncrease / 100);

  return months.map((month, i) => {
    const progress = i / (months.length - 1);
    // Current: flat with slight variation
    const current = baseValue + Math.sin(i * 0.8) * 5;
    // Potential: growing curve
    const potential = baseValue + (targetValue - baseValue) * (1 - Math.pow(1 - progress, 2));
    return {
      month,
      current: Math.round(current),
      potential: Math.round(potential),
    };
  });
}

export function TrafficPotentialSection({
  trafficPotential,
}: TrafficPotentialProps) {
  const data = generateProjection(trafficPotential.percentageIncrease);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title="Traffic Growth Potential"
        subtitle="Estimated organic traffic trajectory with SEO improvements"
        icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
      />

      <div className="rounded-xl border border-border/50 bg-card/30 p-6">
        {/* Key metric */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Current Estimate
            </p>
            <p className="text-lg font-semibold capitalize">
              {trafficPotential.currentEstimate}
            </p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-emerald-400">
              +<AnimatedCounter value={trafficPotential.percentageIncrease} suffix="%" />
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Potential
            </p>
            <p className="text-lg font-semibold capitalize text-emerald-400">
              {trafficPotential.potentialEstimate}
            </p>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="potentialGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              label={{
                value: "Relative Traffic",
                angle: -90,
                position: "insideLeft",
                style: { fill: "rgba(255,255,255,0.3)", fontSize: 11 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="#6B7280"
              fill="url(#currentGradient)"
              strokeWidth={2}
              name="Current Trajectory"
            />
            <Area
              type="monotone"
              dataKey="potential"
              stroke="#10B981"
              fill="url(#potentialGradient)"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="With SEO Improvements"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Reasoning */}
        <p className="text-xs text-muted-foreground mt-4 text-center italic">
          {trafficPotential.reasoning}
        </p>
      </div>
    </motion.div>
  );
}
