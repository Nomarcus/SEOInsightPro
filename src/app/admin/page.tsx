"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Users,
  CreditCard,
  TrendingUp,
  Globe,
  Eye,
  Search,
  UserCheck,
  UserX,
  RefreshCw,
  MapPin,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ─── Types ────────────────────────────────────────────────

interface DailyChartPoint {
  date: string;
  analyses: number;
  pageViews: number;
}

interface RecentAnalysis {
  id: string;
  url: string;
  score: number | null;
  isAnonymous: boolean;
  country: string | null;
  createdAt: string;
}

interface Stats {
  // Counts
  userCount: number;
  totalAnalyses: number;
  todayAnalyses: number;
  weekAnalyses: number;
  todayPageViews: number;
  totalPageViews: number;
  // Money
  totalPayments: number;
  totalRevenueSEK: number;
  totalRevenueEUR: number;
  payingUsers: number;
  conversionRate: string;
  // Chart
  dailyChart: DailyChartPoint[];
  // Lists
  topDomains: Array<{ domain: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
  recentFeed: RecentAnalysis[];
  // Breakdowns
  scoreBuckets: Record<string, number>;
  anonymousCount: number;
  authCount: number;
}

// ─── Helpers ─────────────────────────────────────────────

function scoreColor(score: number | null) {
  if (score === null) return "#6B7280";
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#3B82F6";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function countryFlag(code: string | null): string {
  if (!code || code === "Unknown") return "🌍";
  // Convert 2-letter code to flag emoji
  const offset = 0x1f1e6 - 65;
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => c.charCodeAt(0) + offset)
  );
}

// ─── Stat Card ────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  color = "#3B82F6",
  delay = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-xl border border-border/60 bg-muted/10 flex items-start justify-between"
    >
      <div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-bold" style={{ color }}>
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div
        className="p-2.5 rounded-lg"
        style={{ background: `${color}18` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
    </motion.div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────

function ChartTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!(active as boolean) || !(payload as unknown[])?.[0]) return null;
  const p = payload as Array<{ value: number; dataKey: string; color: string }>;
  return (
    <div className="px-3 py-2 rounded-lg border text-xs" style={{ background: "#111827", borderColor: "#1F2937" }}>
      <p className="font-medium mb-1 text-white">{label as string}</p>
      {p.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.dataKey === "analyses" ? "Analyser" : "Sidvisningar"}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// ─── SQL Setup Banner ─────────────────────────────────────

const SETUP_SQL = `-- Run this in Supabase SQL Editor once to enable full analytics:

-- 1. Add new columns to analysis_logs
ALTER TABLE analysis_logs
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS referrer TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB;

-- 2. Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  user_id TEXT,
  country TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Disable RLS on page_views (server-side only writes)
ALTER TABLE page_views DISABLE ROW LEVEL SECURITY;

-- 4. Index for fast queries
CREATE INDEX IF NOT EXISTS idx_analysis_logs_created_at ON analysis_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);`;

// ─── Main admin content ───────────────────────────────────

function AdminPageContent() {
  const searchParams = useSearchParams();
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string>("");
  const [authenticated, setAuthenticated] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setAdminSecret(token);
      localStorage.setItem("admin_token", token);
      setAuthenticated(true);
    } else {
      const stored = localStorage.getItem("admin_token");
      if (stored) {
        setAdminSecret(stored);
        setAuthenticated(true);
      }
    }
    setLoading(false);
  }, [searchParams]);

  const fetchStats = async (secret: string) => {
    setFetching(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/stats?token=${secret}`);
      if (!response.ok) throw new Error("Unauthorized or server error");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!authenticated || !adminSecret) return;
    fetchStats(adminSecret);
  }, [authenticated, adminSecret]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Enter your admin token
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (
                e.currentTarget.elements.namedItem("token") as HTMLInputElement
              ).value;
              setAdminSecret(input);
              localStorage.setItem("admin_token", input);
              setAuthenticated(true);
            }}
            className="space-y-4"
          >
            <input
              name="token"
              type="password"
              placeholder="Admin token"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-slate-900/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 font-medium transition-colors"
            >
              Enter
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => adminSecret && fetchStats(adminSecret)}
              disabled={fetching}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetching ? "animate-spin" : ""}`} />
              {fetching ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("admin_token");
                setAuthenticated(false);
                setStats(null);
              }}
              className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* SQL Setup Banner */}
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.04)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#F59E0B" }}>
                📋 First-time setup
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Run the SQL below in Supabase to enable full analytics (country tracking, page views, anonymous logging).
              </p>
            </div>
            <button
              onClick={() => setShowSql((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}
            >
              {showSql ? "Hide SQL" : "Show SQL"}
            </button>
          </div>
          {showSql && (
            <div className="mt-3">
              <div className="flex justify-end mb-1">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(SETUP_SQL);
                    setSqlCopied(true);
                    setTimeout(() => setSqlCopied(false), 2000);
                  }}
                  className="text-xs px-2 py-1 rounded"
                  style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}
                >
                  {sqlCopied ? "✓ Copied" : "Copy SQL"}
                </button>
              </div>
              <pre className="text-[11px] font-mono p-3 rounded-lg overflow-x-auto"
                style={{ background: "rgba(0,0,0,0.3)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.05)" }}>
                {SETUP_SQL}
              </pre>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!stats ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground animate-pulse">Loading statistics...</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* ── Row 1: Key metrics ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Analyser idag"
                value={stats.todayAnalyses}
                sub={`${stats.weekAnalyses} denna vecka`}
                icon={<Search className="w-5 h-5" />}
                color="#3B82F6"
                delay={0}
              />
              <StatCard
                label="Totalt analyser"
                value={stats.totalAnalyses}
                sub={`${stats.anonymousCount} anonyma`}
                icon={<BarChart3 className="w-5 h-5" />}
                color="#8B5CF6"
                delay={0.05}
              />
              <StatCard
                label="Sidvisningar idag"
                value={stats.todayPageViews}
                sub={`${stats.totalPageViews} senaste 14 dagarna`}
                icon={<Eye className="w-5 h-5" />}
                color="#06B6D4"
                delay={0.1}
              />
              <StatCard
                label="Registrerade users"
                value={stats.userCount}
                sub={`${stats.payingUsers} betalande (${stats.conversionRate}%)`}
                icon={<Users className="w-5 h-5" />}
                color="#10B981"
                delay={0.15}
              />
            </div>

            {/* ── Row 2: Revenue ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Intäkter (SEK)"
                value={`${stats.totalRevenueSEK.toFixed(0)} kr`}
                icon={<CreditCard className="w-5 h-5" />}
                color="#F59E0B"
                delay={0.2}
              />
              <StatCard
                label="Intäkter (EUR)"
                value={`€${stats.totalRevenueEUR.toFixed(0)}`}
                icon={<CreditCard className="w-5 h-5" />}
                color="#F59E0B"
                delay={0.25}
              />
              <StatCard
                label="Betalningar totalt"
                value={stats.totalPayments}
                icon={<TrendingUp className="w-5 h-5" />}
                color="#EF4444"
                delay={0.3}
              />
              <div className="p-5 rounded-xl border border-border/60 bg-muted/10">
                <p className="text-xs text-muted-foreground mb-3">Anon vs inloggade</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-center">
                    <UserX className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xl font-bold" style={{ color: "#9CA3AF" }}>{stats.anonymousCount}</p>
                    <p className="text-[10px] text-muted-foreground">Anonyma</p>
                  </div>
                  <div className="w-px h-10 bg-border/50" />
                  <div className="flex-1 text-center">
                    <UserCheck className="w-4 h-4 mx-auto mb-1" style={{ color: "#10B981" }} />
                    <p className="text-xl font-bold" style={{ color: "#10B981" }}>{stats.authCount}</p>
                    <p className="text-[10px] text-muted-foreground">Inloggade</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Activity chart ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-6 rounded-xl border border-border/60 bg-muted/10"
            >
              <h2 className="text-sm font-semibold mb-4">
                Aktivitet — senaste 14 dagarna
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.dailyChart} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="analyses"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pageViews"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: "#8B5CF6", r: 3 }}
                    activeDot={{ r: 5 }}
                    strokeDasharray="4 2"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-5 mt-2 justify-center">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-3 h-0.5 bg-blue-500 inline-block" />
                  Analyser
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-3 h-0.5 bg-violet-500 inline-block" style={{ borderTop: "2px dashed" }} />
                  Sidvisningar
                </span>
              </div>
            </motion.div>

            {/* ── Three columns: Recent feed + Domains + Countries ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Recent analyses feed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 rounded-xl border border-border/60 bg-muted/10 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Senaste analyser</h2>
                  <span className="text-xs text-muted-foreground">{stats.recentFeed.length} senaste</span>
                </div>
                <div className="divide-y divide-border/30 max-h-[480px] overflow-y-auto">
                  {stats.recentFeed.length === 0 ? (
                    <p className="text-center py-8 text-sm text-muted-foreground">
                      Inga analyser ännu
                    </p>
                  ) : (
                    stats.recentFeed.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Score badge */}
                        <div
                          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                          style={{
                            background: `${scoreColor(item.score)}18`,
                            color: scoreColor(item.score),
                          }}
                        >
                          {item.score ?? "?"}
                        </div>

                        {/* URL */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {(() => {
                              try {
                                return new URL(
                                  item.url.startsWith("http") ? item.url : `https://${item.url}`
                                ).hostname;
                              } catch {
                                return item.url;
                              }
                            })()}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {timeAgo(item.createdAt)}
                            {item.country && ` · ${countryFlag(item.country)} ${item.country}`}
                          </p>
                        </div>

                        {/* Anon/auth pill */}
                        <span
                          className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                          style={
                            item.isAnonymous
                              ? { background: "rgba(156,163,175,0.15)", color: "#6B7280" }
                              : { background: "rgba(16,185,129,0.15)", color: "#10B981" }
                          }
                        >
                          {item.isAnonymous ? "anon" : "auth"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Right column: Domains + Countries */}
              <div className="space-y-6">
                {/* Top domains */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border/40">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      Topp domäner
                    </h2>
                  </div>
                  <div className="divide-y divide-border/20">
                    {stats.topDomains.slice(0, 8).map((d, i) => (
                      <div key={d.domain} className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] text-muted-foreground w-3">{i + 1}</span>
                          <span className="text-xs truncate">{d.domain}</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground shrink-0 ml-2">
                          {d.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Top countries */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border/40">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Länder
                    </h2>
                  </div>
                  <div className="divide-y divide-border/20">
                    {stats.topCountries.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-4 py-3">
                        Kör SQL-setup för att aktivera
                      </p>
                    ) : (
                      stats.topCountries.map((c) => (
                        <div key={c.country} className="flex items-center justify-between px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span>{countryFlag(c.country)}</span>
                            <span className="text-xs">{c.country}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{c.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* ── Score distribution + Page paths ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Score distribution bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="p-5 rounded-xl border border-border/60 bg-muted/10"
              >
                <h2 className="text-sm font-semibold mb-4">SEO-poäng fördelning</h2>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={[
                      { range: "0-39", count: stats.scoreBuckets["0-39"], fill: "#EF4444" },
                      { range: "40-59", count: stats.scoreBuckets["40-59"], fill: "#F59E0B" },
                      { range: "60-79", count: stats.scoreBuckets["60-79"], fill: "#3B82F6" },
                      { range: "80-100", count: stats.scoreBuckets["80-100"], fill: "#10B981" },
                    ]}
                    margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="range" tick={{ fill: "#6B7280", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "#111827", border: "1px solid #1F2937", fontSize: 11 }}
                      labelStyle={{ color: "#E5E7EB" }}
                    />
                    <Bar dataKey="count" name="Analyser" radius={[3, 3, 0, 0]}>
                      {[
                        { fill: "#EF4444" },
                        { fill: "#F59E0B" },
                        { fill: "#3B82F6" },
                        { fill: "#10B981" },
                      ].map((entry, index) => (
                        <rect key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Top pages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-border/40">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    Mest besökta sidor
                  </h2>
                </div>
                <div className="divide-y divide-border/20">
                  {stats.topPaths.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-5 py-4">
                      Aktivera sidvisningar via SQL-setup ovan
                    </p>
                  ) : (
                    stats.topPaths.map((p) => (
                      <div key={p.path} className="flex items-center justify-between px-5 py-2.5">
                        <span className="text-xs font-mono text-muted-foreground truncate">{p.path}</span>
                        <span className="text-xs font-medium ml-2 shrink-0">{p.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
