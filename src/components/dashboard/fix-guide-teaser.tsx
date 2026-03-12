"use client";

import { motion } from "framer-motion";
import { Lock, Wrench, ArrowRight, Mail, Phone } from "lucide-react";
import { useBranding } from "@/hooks/use-branding";

interface FixGuideTeaserProps {
  weaknessCount: number;
}

export function FixGuideTeaser({ weaknessCount }: FixGuideTeaserProps) {
  const { branding } = useBranding();

  if (weaknessCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative rounded-xl border border-border/50 overflow-hidden">
        {/* Blurred mock fix-guide content */}
        <div className="p-6 blur-sm pointer-events-none select-none">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Step-by-Step Fix Guide
          </h3>
          <div className="space-y-4">
            {/* Mock fix cards */}
            {[
              { severity: "critical", title: "Missing meta description" },
              { severity: "warning", title: "Images without alt attributes" },
              { severity: "critical", title: "No structured data found" },
            ].map((mock, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border"
                style={{
                  borderColor:
                    mock.severity === "critical"
                      ? "rgba(239,68,68,0.2)"
                      : "rgba(245,158,11,0.2)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                    style={{
                      background:
                        mock.severity === "critical"
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(245,158,11,0.1)",
                      color:
                        mock.severity === "critical" ? "#EF4444" : "#F59E0B",
                    }}
                  >
                    {mock.severity}
                  </span>
                  <span className="text-sm font-medium">{mock.title}</span>
                </div>
                <div className="space-y-1.5">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-start gap-2">
                      <span className="text-xs text-muted/40 shrink-0 mt-0.5">
                        {step}.
                      </span>
                      <div
                        className="h-2.5 rounded bg-muted/20"
                        style={{ width: `${60 + Math.random() * 30}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-3">
                  <div className="h-2 w-16 rounded bg-muted/15" />
                  <div className="h-2 w-14 rounded bg-muted/15" />
                  <div className="h-2 w-20 rounded bg-muted/15" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px]">
          <div
            className="p-3 rounded-full mb-3"
            style={{ background: "rgba(139,92,246,0.1)" }}
          >
            <Lock className="w-6 h-6" style={{ color: "#8B5CF6" }} />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            Step-by-Step Fix Guide
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-1 px-4">
            Get exact instructions on how and where to fix every issue — written
            so anyone can follow along, even without technical experience.
          </p>
          <p className="text-xs text-muted-foreground/60 mb-4">
            {weaknessCount} issues with detailed fix instructions available
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {branding.consultantEmail && (
              <a
                href={`mailto:${branding.consultantEmail}?subject=Fix Guide — SEO Analysis&body=Hi, I'd like to unlock the Step-by-Step Fix Guide for my website.`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "#8B5CF6", color: "#fff" }}
              >
                <Mail className="w-4 h-4" />
                Unlock Fix Guide
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {branding.consultantPhone && (
              <a
                href={`tel:${branding.consultantPhone}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border
                           hover:border-violet-500/50 text-sm font-medium transition-colors"
              >
                <Phone className="w-4 h-4" />
                {branding.consultantPhone}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
