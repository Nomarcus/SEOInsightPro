"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Users, CreditCard } from "lucide-react";

interface Stats {
  userCount: number;
  totalPayments: number;
  totalRevenueSEK: number;
  totalRevenueEUR: number;
  totalAnalyses: number;
  payingUsers: number;
  conversionRate: string;
  topDomains: Array<{ domain: string; count: number }>;
}

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [authenticated, setAuthenticated] = useState(false);

  // Get admin secret from URL or localStorage
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

  // Fetch stats
  useEffect(() => {
    if (!authenticated || !adminSecret) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/admin/stats?token=${adminSecret}`);
        if (!response.ok) throw new Error("Unauthorized");
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch stats"
        );
      }
    };

    fetchStats();
  }, [authenticated, adminSecret]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
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
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-muted-foreground text-sm">
              Enter the admin token to continue
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
              placeholder="Enter admin token"
              required
              className="w-full px-4 py-2 rounded-lg border border-border/50 bg-slate-900/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 font-medium"
            >
              Verify
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold">Admin Dashboard</h1>
          <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              setAuthenticated(false);
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
            {error}
          </div>
        )}

        {!stats ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl border border-border/60 bg-muted/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold mt-2">{stats.userCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-xl border border-border/60 bg-muted/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Paying Users</p>
                    <p className="text-3xl font-bold mt-2">{stats.payingUsers}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.conversionRate}% conversion
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-xl border border-border/60 bg-muted/20"
              >
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-3xl font-bold mt-2">
                    {stats.totalRevenueSEK.toFixed(0)} SEK
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    €{stats.totalRevenueEUR.toFixed(0)}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-xl border border-border/60 bg-muted/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Analyses</p>
                    <p className="text-3xl font-bold mt-2">
                      {stats.totalAnalyses}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
              </motion.div>
            </div>

            {/* Top Domains */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-xl border border-border/60 bg-muted/20"
            >
              <h2 className="text-lg font-bold mb-4">Top Analysed Domains</h2>
              <div className="space-y-2">
                {stats.topDomains.map((d, i) => (
                  <div
                    key={d.domain}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                  >
                    <span className="text-sm">
                      {i + 1}. {d.domain}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {d.count} analyses
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <AdminPageContent />
    </Suspense>
  );
}
