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
  CheckCircle,
  Zap,
  FileText,
  TrendingUp,
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

  const benefits = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      title: "Results in 30 seconds",
      desc: "Our AI engine scrapes and analyses your entire site in under a minute — no waiting, no guesswork.",
    },
    {
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      title: "Step-by-step fix guides",
      desc: "Every issue comes with a prioritised fix guide tailored to your site. No technical jargon — just clear actions.",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      title: "Track ranking improvements",
      desc: "Save your analyses and monitor how your SEO score improves over time as you implement fixes.",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-purple-400" />,
      title: "AI Search Readiness",
      desc: "See how ready your site is for AI search engines like Google SGE and Bing AI — the future of search.",
    },
  ];

  const faqs = [
    {
      question: "What is SEO Insight Pro?",
      answer:
        "SEO Insight Pro is an AI-powered SEO analysis tool that scans your website and delivers actionable insights to improve your search engine rankings. It analyses on-page SEO, technical SEO, content quality, Core Web Vitals, and keyword strategy.",
    },
    {
      question: "How does AI-powered SEO analysis work?",
      answer:
        "We use dual AI models — Anthropic Claude and OpenAI GPT-4o — to deeply analyse your site content and structure. The AI identifies ranking opportunities, content gaps, and technical issues that traditional tools miss.",
    },
    {
      question: "Is it free to use?",
      answer:
        "Yes! You can run one free analysis without signing up. Create a free account to save your history and purchase credits for additional analyses and premium PDF reports.",
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

      {/* Main Hero */}
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
          AI-powered SEO analysis in 30 seconds. Identify what&apos;s holding
          your search rankings back — and get a step-by-step plan to fix it.
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full mb-24"
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

        {/* Why SEO Matters section */}
        <section className="max-w-4xl w-full mb-24 px-2">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Why SEO Analysis Matters for Your Business
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Over 90% of online experiences begin with a search engine. If your
            website isn&apos;t optimised, you&apos;re invisible to potential customers.
            SEO Insight Pro uses advanced AI to give you a complete picture of
            your site&apos;s strengths and weaknesses — and exactly what to do about
            them.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-5 rounded-xl border border-border/50 bg-card/20"
              >
                <div className="shrink-0 mt-0.5">{b.icon}</div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works section */}
        <section className="max-w-4xl w-full mb-24 px-2">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
            Get your full SEO report in three simple steps — no technical
            knowledge required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              {
                step: "1",
                title: "Enter Your URL",
                desc: "Paste your website address into the search bar above and click Analyze.",
              },
              {
                step: "2",
                title: "AI Scans Your Site",
                desc: "Our dual AI engine analyses 50+ SEO factors including content, technical health, and performance.",
              },
              {
                step: "3",
                title: "Get Your Action Plan",
                desc: "Receive a prioritised fix guide with clear steps to improve your rankings.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="p-6 rounded-xl border border-border/50 bg-card/20"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ section */}
        <section className="max-w-3xl w-full mb-24 px-2">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="p-5 rounded-xl border border-border/50 bg-card/20"
              >
                <h3 className="font-semibold text-sm mb-2">{faq.question}</h3>
                <p className="text-xs text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trusted resources / external links */}
        <section className="max-w-4xl w-full mb-16 px-2 text-center">
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
            Built on industry-leading SEO standards
          </h2>
          <p className="text-xs text-muted-foreground/70 max-w-xl mx-auto mb-6">
            SEO Insight Pro follows best practices defined by Google, including{" "}
            <a
              href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google&apos;s SEO Starter Guide
            </a>
            ,{" "}
            <a
              href="https://web.dev/vitals/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Core Web Vitals
            </a>
            , and{" "}
            <a
              href="https://schema.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Schema.org structured data
            </a>{" "}
            standards.
          </p>
        </section>
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground/40 border-t border-border/20">
        <p>SEO Insight Pro &middot; AI-Powered SEO Analysis</p>
        <p className="mt-1">
          <Link href="/how-it-works" className="hover:text-muted-foreground transition-colors">
            How it works
          </Link>
          {" · "}
          <Link href="/auth/register" className="hover:text-muted-foreground transition-colors">
            Get started free
          </Link>
        </p>
      </footer>
    </div>
  );
}
