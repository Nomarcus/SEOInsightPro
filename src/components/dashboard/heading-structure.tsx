"use client";

import { motion } from "framer-motion";
import { ListTree } from "lucide-react";
import type { HeadingItem } from "@/lib/types";
import { SectionHeader } from "@/components/shared/section-header";

interface HeadingStructureProps {
  headings: HeadingItem[];
}

const INDENT: Record<string, number> = {
  h1: 0,
  h2: 1,
  h3: 2,
  h4: 3,
  h5: 4,
  h6: 5,
};

const TAG_COLORS: Record<string, string> = {
  h1: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  h2: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  h3: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  h4: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  h5: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  h6: "text-red-400 bg-red-500/10 border-red-500/20",
};

export function HeadingStructure({ headings }: HeadingStructureProps) {
  if (!headings.length) return null;

  // Check for issues
  const h1Count = headings.filter((h) => h.tag === "h1").length;
  const hasIssue = h1Count !== 1;

  // Check for skipped levels
  let hasSkip = false;
  for (let i = 1; i < headings.length; i++) {
    const curr = parseInt(headings[i].tag[1]);
    const prev = parseInt(headings[i - 1].tag[1]);
    if (curr - prev > 1) {
      hasSkip = true;
      break;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title="Heading Structure"
        subtitle="Visual hierarchy of H1-H6 tags on your page"
        icon={<ListTree className="w-5 h-5 text-cyan-400" />}
      />

      {/* Issues alert */}
      {(hasIssue || hasSkip) && (
        <div className="mb-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400">
          {h1Count === 0 && "Missing H1 heading — every page needs one. "}
          {h1Count > 1 && `Found ${h1Count} H1 headings — should have exactly one. `}
          {hasSkip && "Heading levels are skipped — use sequential hierarchy."}
        </div>
      )}

      <div className="rounded-xl border border-border/50 bg-card/30 p-4 space-y-1 max-h-96 overflow-y-auto">
        {headings.slice(0, 30).map((heading, i) => {
          const indent = INDENT[heading.tag] || 0;
          const colors = TAG_COLORS[heading.tag] || "";
          const isH1 = heading.tag === "h1";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-2"
              style={{ paddingLeft: `${indent * 24}px` }}
            >
              {indent > 0 && (
                <div className="w-3 border-l border-b border-border/30 h-3 shrink-0" />
              )}
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 uppercase ${colors}`}
              >
                {heading.tag}
              </span>
              <span
                className={`text-sm truncate ${
                  isH1 ? "font-semibold" : "text-muted-foreground"
                }`}
              >
                {heading.text}
              </span>
            </motion.div>
          );
        })}
        {headings.length > 30 && (
          <p className="text-xs text-muted-foreground pt-2">
            ... and {headings.length - 30} more headings
          </p>
        )}
      </div>
    </motion.div>
  );
}
