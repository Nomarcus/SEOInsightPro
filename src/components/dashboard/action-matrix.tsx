"use client";

import { motion } from "framer-motion";
import { Grid3X3 } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ActionItem } from "@/lib/types";
import { SectionHeader } from "@/components/shared/section-header";

interface ActionMatrixProps {
  actionItems: ActionItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  technical: "#3B82F6",
  content: "#10B981",
  onPage: "#F59E0B",
  performance: "#8B5CF6",
  userExperience: "#06B6D4",
};

function getColor(category: string): string {
  return CATEGORY_COLORS[category] || "#6B7280";
}

interface TooltipPayloadItem {
  payload?: ActionItem;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl max-w-xs">
      <p className="font-medium text-sm mb-1">{item.title}</p>
      <p className="text-xs text-muted-foreground">{item.description}</p>
      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
        <span>Difficulty: {item.difficulty}/5</span>
        <span>Impact: {item.impact}/5</span>
      </div>
    </div>
  );
}

export function ActionMatrix({ actionItems }: ActionMatrixProps) {
  if (!actionItems.length) return null;

  const data = actionItems.map((item) => ({
    ...item,
    x: item.difficulty,
    y: item.impact,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title="Priority Action Matrix"
        subtitle="Focus on the top-left quadrant — high impact, low difficulty"
        icon={<Grid3X3 className="w-5 h-5 text-purple-400" />}
      />
      <div className="rounded-xl border border-border/50 bg-card/30 p-4">
        {/* Quadrant labels */}
        <div className="flex justify-between text-xs text-muted-foreground/50 mb-1 px-8">
          <span>Easy + High Impact = Do First</span>
          <span>Hard + High Impact = Plan</span>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 6]}
              tickCount={6}
              name="Difficulty"
              label={{
                value: "Difficulty →",
                position: "bottom",
                offset: 0,
                style: { fill: "rgba(255,255,255,0.4)", fontSize: 12 },
              }}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 6]}
              tickCount={6}
              name="Impact"
              label={{
                value: "Impact →",
                angle: -90,
                position: "insideLeft",
                style: { fill: "rgba(255,255,255,0.4)", fontSize: 12 },
              }}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data} fill="#3B82F6">
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={getColor(entry.category)}
                  fillOpacity={0.8}
                  r={8}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-2 justify-center">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{cat === "onPage" ? "On-Page" : cat === "userExperience" ? "UX" : cat}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
