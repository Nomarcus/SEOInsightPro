"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  BarChart3,
  Target,
  ArrowRight,
  Settings,
  LogIn,
  LogOut,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, credits, signOut } = useAuth();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a website URL");
      return;
    }

    let testUrl = trimmed;
    if (!/^https?:\/\//i.test(testUrl)) {
      testUrl = `https://${testUrl}`;
    }
    try {
      new URL(testUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setError("");
    router.push(`/analyze?url=${encodeURIComponent(trimmed)}`);
  };

  const features = [
    {
      icon: <Search className="w-5 h-5" />,
      title: "Deep SEO Scan",
      desc: "Meta tags, headings, links, images & more",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI-Powered Insights",
      desc: "Dual AI analysis with Claude & GPT-4o",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Performance Metrics",
      desc: "Core Web Vitals & PageSpeed scores",
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Keyword Strategy",
      desc: "Targeted keyword & phrase suggestions",
    },
  ];

  return (
    <div className="min-h-screen animated-gradient-bg flex flex-col">
      {/* Top-right nav */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <Link
          href="/how-it-works"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          How it works
        </Link>
        {user ? (
          <>
            <Link
              href="/buy"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <CreditCard className="w-3.5 h-3.5" />
              {credits}
            </Link>
            <button
              onClick={() => signOut()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-3 py-1 rounded text-xs font-medium bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            >
              Register
            </Link>
          </>
        )}
        <Link
          href="/settings"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4 justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Powered SEO Analysis
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold text-center max-w-3xl mb-4 leading-tight"
        >
          Discover Your Website&apos;s{" "}
          <span className="gradient-text">Hidden SEO Potential</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-muted-foreground text-center max-w-xl mb-12"
        >
          AI-powered analysis in 30 seconds. See exactly what&apos;s holding
          your search rankings back.
        </motion.p>

        {/* URL Input */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleAnalyze}
          className="w-full max-w-2xl mb-4"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl opacity-30 group-hover:opacity-50 group-focus-within:opacity-60 blur transition-opacity duration-300" />
            <div className="relative flex items-center bg-background rounded-xl">
              <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                placeholder="Enter your website URL..."
                className="flex-1 bg-transparent px-4 py-4 text-lg outline-none placeholder:text-muted-foreground/60"
              />
              <button
                type="submit"
                className="shrink-0 mr-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all hover:gap-3"
              >
                Analyze
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
          )}
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground/60 mb-16"
        >
          Free analysis &middot; No signup required &middot; Powered by AI
        </motion.p>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-colors"
            >
              <div className="text-primary mb-2">{feature.icon}</div>
              <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground/40">
        SEO Insight Pro &middot; AI-Powered SEO Analysis
      </footer>
    </div>
  );
}
