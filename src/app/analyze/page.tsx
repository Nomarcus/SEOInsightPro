"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Tag,
  Gauge,
  Smartphone,
  Sparkles,
  FileBarChart,
  Check,
  Loader2,
} from "lucide-react";
import { useAnalysis } from "@/hooks/use-analysis";

const STEPS = [
  { id: "scraping", label: "Scanning website structure", icon: Globe },
  { id: "meta", label: "Analyzing meta tags & content", icon: Tag },
  { id: "performance", label: "Measuring page performance", icon: Gauge },
  { id: "mobile", label: "Evaluating mobile experience", icon: Smartphone },
  { id: "ai", label: "AI generating insights", icon: Sparkles },
  { id: "report", label: "Preparing your report", icon: FileBarChart },
];

function getActiveStep(phase: string): number {
  switch (phase) {
    case "scraping":
      return 0;
    case "performance":
      return 2;
    case "analyzing":
      return 4;
    case "complete":
      return 6;
    default:
      return 0;
  }
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { phase, startAnalysis, error } = useAnalysis();
  const [started, setStarted] = useState(false);
  const url = searchParams.get("url");

  const activeStep = getActiveStep(phase);

  useEffect(() => {
    if (url && !started) {
      setStarted(true);
      startAnalysis(url);
    }
  }, [url, started, startAnalysis]);

  useEffect(() => {
    if (phase === "complete") {
      const timer = setTimeout(() => router.push("/dashboard"), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, router]);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No URL provided. Please go back and enter a URL.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* URL being analyzed */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-sm text-muted-foreground mb-2">Analyzing</p>
          <p className="text-lg font-medium truncate">{url}</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isComplete = i < activeStep;
            const isActive = i >= activeStep && i < activeStep + 2 && phase !== "complete" && phase !== "error";
            const isPending = i >= activeStep + 2;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                    isComplete
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/50 text-muted-foreground/40"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isComplete ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        key="loading"
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                      >
                        <Loader2 className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </AnimatePresence>
                </div>
                <div
                  className={`transition-colors duration-300 ${
                    isComplete
                      ? "text-emerald-400"
                      : isActive
                        ? "text-foreground"
                        : "text-muted-foreground/40"
                  }`}
                >
                  <p className="text-sm font-medium">{step.label}</p>
                </div>
                {isActive && (
                  <motion.div
                    className="ml-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Error state */}
        {phase === "error" && error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center"
          >
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-primary hover:underline"
            >
              Try another URL
            </button>
          </motion.div>
        )}

        {/* Footer hint */}
        {phase !== "error" && phase !== "complete" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-xs text-muted-foreground/40 mt-12"
          >
            This usually takes 15-30 seconds
          </motion.p>
        )}

        {/* Complete state */}
        {phase === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <p className="text-emerald-400 font-medium">
              Analysis complete! Redirecting to your report...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
