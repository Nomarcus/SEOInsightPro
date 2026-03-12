"use client";

import { motion } from "framer-motion";
import { Lock, Users } from "lucide-react";

export function CompetitorTeaser() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative rounded-xl border border-border/50 overflow-hidden">
        {/* Blurred mock content */}
        <div className="p-6 blur-sm pointer-events-none select-none">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Competitor Comparison
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-muted/30" />
                <div className="flex-1">
                  <div className="h-3 w-32 rounded bg-muted/30 mb-1" />
                  <div className="h-2 w-20 rounded bg-muted/20" />
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className="w-4 rounded bg-muted/20"
                      style={{ height: `${10 + Math.random() * 30}px` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {["SEO Score", "Backlinks", "Keywords"].map((label) => (
              <div
                key={label}
                className="p-3 rounded-lg bg-muted/10 text-center"
              >
                <div className="text-xl font-bold text-muted/40">
                  {Math.floor(Math.random() * 50 + 50)}
                </div>
                <div className="text-xs text-muted/30">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px]">
          <div className="p-3 rounded-full bg-primary/10 mb-3">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            Competitor Analysis
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            See how you compare against your top competitors with a
            professional SEO audit
          </p>
          <div className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            Unlock with Professional Analysis
          </div>
        </div>
      </div>
    </motion.div>
  );
}
