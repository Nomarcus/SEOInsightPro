"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { SectionHeader } from "@/components/shared/section-header";

interface SerpPreviewProps {
  serpPreview: AnalysisResult["serpPreview"];
}

function GoogleResult({
  title,
  description,
  url,
  variant,
}: {
  title: string;
  description: string;
  url: string;
  variant: "current" | "improved";
}) {
  const isImproved = variant === "improved";
  return (
    <div
      className={`p-4 rounded-lg border ${
        isImproved
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-border/50 bg-card/50"
      }`}
    >
      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">
        {isImproved ? "Improved" : "Current"}
      </div>
      {/* Google-style result */}
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground truncate">{url}</div>
        <h3
          className={`text-lg font-medium leading-snug ${
            isImproved ? "text-emerald-400" : "text-blue-400"
          }`}
        >
          {title || "No title set"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {description || "No meta description set"}
        </p>
      </div>
      {/* Character counts */}
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground/60">
        <span>Title: {title?.length || 0} chars</span>
        <span>Description: {description?.length || 0} chars</span>
      </div>
    </div>
  );
}

export function SerpPreview({ serpPreview }: SerpPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title="Google Search Preview"
        subtitle="How your page appears in search results — and how it could look"
      />
      <div className="grid md:grid-cols-2 gap-4">
        <GoogleResult
          title={serpPreview.currentTitle}
          description={serpPreview.currentDescription}
          url={serpPreview.url}
          variant="current"
        />
        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
        </div>
        <GoogleResult
          title={serpPreview.improvedTitle}
          description={serpPreview.improvedDescription}
          url={serpPreview.url}
          variant="improved"
        />
      </div>
    </motion.div>
  );
}
