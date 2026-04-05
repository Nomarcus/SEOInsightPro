import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const adminSecret = url.searchParams.get("token");

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin client not configured" },
        { status: 500 }
      );
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setDate(now.getDate() - 30);
    const day14Start = new Date(now);
    day14Start.setDate(now.getDate() - 13);

    // Fetch all data in parallel
    const [
      usersData,
      userAccountsData,
      paymentsData,
      allAnalysesData,
      recentAnalysesData,
      todayAnalysesData,
      weekAnalysesData,
      pageViewsData,
      todayPageViewsData,
    ] = await Promise.all([
      // Total users count
      supabaseAdmin.from("user_accounts").select("id, created_at", { count: "exact" }),

      // All user accounts with full details
      supabaseAdmin
        .from("user_accounts")
        .select("id, user_id, email, credits, created_at, updated_at")
        .order("created_at", { ascending: false }),

      // Completed payments
      supabaseAdmin.from("payments").select("*").eq("status", "completed"),

      // All analyses (last 14 days for chart)
      supabaseAdmin
        .from("analysis_logs")
        .select("id, url, overall_score, is_anonymous, country, created_at, user_id")
        .gte("created_at", day14Start.toISOString())
        .order("created_at", { ascending: true }),

      // Recent 50 analyses for feed
      supabaseAdmin
        .from("analysis_logs")
        .select("id, url, overall_score, is_anonymous, country, referrer, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(50),

      // Today's count
      supabaseAdmin
        .from("analysis_logs")
        .select("id", { count: "exact" })
        .gte("created_at", todayStart.toISOString()),

      // This week's count
      supabaseAdmin
        .from("analysis_logs")
        .select("id", { count: "exact" })
        .gte("created_at", weekStart.toISOString()),

      // Page views (last 14 days) — graceful fallback if table doesn't exist
      supabaseAdmin
        .from("page_views")
        .select("id, path, country, created_at")
        .gte("created_at", day14Start.toISOString())
        .order("created_at", { ascending: true })
        .limit(5000),

      // Today's page views
      supabaseAdmin
        .from("page_views")
        .select("id", { count: "exact" })
        .gte("created_at", todayStart.toISOString()),
    ]);

    const userCount = usersData.count || 0;
    const userAccounts = userAccountsData.data || [];
    const payments = paymentsData.data || [];
    const analyses14Days = allAnalysesData.data || [];
    const recentAnalyses = recentAnalysesData.data || [];
    const todayCount = todayAnalysesData.count || 0;
    const weekCount = weekAnalysesData.count || 0;
    const pageViews14Days = pageViewsData.data || [];
    const todayPageViews = todayPageViewsData.count || 0;

    // ── Revenue ──────────────────────────────────────────
    let totalRevenueSEK = 0;
    let totalRevenueEUR = 0;
    payments.forEach((p) => {
      if (p.currency === "SEK") totalRevenueSEK += p.price_sek || 0;
      else totalRevenueEUR += p.price_eur || 0;
    });

    // ── Daily chart data (last 14 days) ──────────────────
    const dailyMap: Record<string, { analyses: number; pageViews: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = { analyses: 0, pageViews: 0 };
    }
    analyses14Days.forEach((a) => {
      const key = new Date(a.created_at).toISOString().split("T")[0];
      if (dailyMap[key]) dailyMap[key].analyses++;
    });
    pageViews14Days.forEach((p) => {
      const key = new Date(p.created_at).toISOString().split("T")[0];
      if (dailyMap[key]) dailyMap[key].pageViews++;
    });
    const dailyChart = Object.entries(dailyMap).map(([date, counts]) => ({
      date: date.slice(5), // "MM-DD"
      analyses: counts.analyses,
      pageViews: counts.pageViews,
    }));

    // ── Top domains (all time) ────────────────────────────
    const domainCounts: Record<string, number> = {};
    recentAnalyses.forEach((a) => {
      try {
        const domain = new URL(
          a.url.startsWith("http") ? a.url : `https://${a.url}`
        ).hostname;
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      } catch {
        // skip
      }
    });
    const topDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));

    // ── Country breakdown ─────────────────────────────────
    const countryCounts: Record<string, number> = {};
    recentAnalyses.forEach((a) => {
      const c = a.country || "Unknown";
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([country, count]) => ({ country, count }));

    // ── Score distribution (buckets) ──────────────────────
    const scoreBuckets = { "0-39": 0, "40-59": 0, "60-79": 0, "80-100": 0 };
    recentAnalyses.forEach((a) => {
      const s = a.overall_score ?? 0;
      if (s < 40) scoreBuckets["0-39"]++;
      else if (s < 60) scoreBuckets["40-59"]++;
      else if (s < 80) scoreBuckets["60-79"]++;
      else scoreBuckets["80-100"]++;
    });

    // ── Page view top paths ───────────────────────────────
    const pathCounts: Record<string, number> = {};
    pageViews14Days.forEach((p) => {
      pathCounts[p.path] = (pathCounts[p.path] || 0) + 1;
    });
    const topPaths = Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({ path, count }));

    // ── Anonymous vs auth ─────────────────────────────────
    const anonymousCount = recentAnalyses.filter(
      (a) => a.is_anonymous === true || !a.user_id
    ).length;
    const authCount = recentAnalyses.length - anonymousCount;

    // ── Paying users ──────────────────────────────────────
    const payingUsers = new Set(payments.map((p) => p.user_id)).size;
    const conversionRate =
      userCount > 0 ? ((payingUsers / userCount) * 100).toFixed(2) : "0.00";

    // ── User list with last activity ──────────────────────
    // Build map of last analysis per user
    const lastAnalysisByUser: Record<string, { date: string; score: number | null }> = {};
    recentAnalyses.forEach((a) => {
      if (a.user_id && !lastAnalysisByUser[a.user_id]) {
        lastAnalysisByUser[a.user_id] = {
          date: a.created_at,
          score: a.overall_score,
        };
      }
    });

    // Build map of payments by user
    const paymentsByUser: Record<string, { date: string; amount: number }> = {};
    payments.forEach((p) => {
      if (p.user_id && !paymentsByUser[p.user_id]) {
        const amount = p.currency === "SEK" ? p.price_sek : p.price_eur;
        paymentsByUser[p.user_id] = {
          date: p.completed_at || p.created_at,
          amount,
        };
      }
    });

    // Format users data
    const usersList = userAccounts.map((ua) => ({
      id: ua.id,
      email: ua.email,
      credits: ua.credits,
      createdAt: ua.created_at,
      lastActivity: lastAnalysisByUser[ua.user_id]?.date || null,
      isPaid: !!paymentsByUser[ua.user_id],
      lastPayment: paymentsByUser[ua.user_id] || null,
    }));

    // ── Recent analyses feed (formatted) ──────────────────
    const recentFeed = recentAnalyses.slice(0, 50).map((a) => ({
      id: a.id,
      url: a.url,
      score: a.overall_score,
      isAnonymous: a.is_anonymous !== false ? !a.user_id : a.is_anonymous,
      country: a.country || null,
      createdAt: a.created_at,
    }));

    return NextResponse.json({
      // Counts
      userCount,
      totalAnalyses: (recentAnalysesData.data?.length || 0),
      todayAnalyses: todayCount,
      weekAnalyses: weekCount,
      todayPageViews,
      totalPageViews: pageViews14Days.length,

      // Money
      totalPayments: payments.length,
      totalRevenueSEK,
      totalRevenueEUR,
      payingUsers,
      conversionRate,

      // Chart
      dailyChart,

      // Lists
      topDomains,
      topCountries,
      topPaths,
      recentFeed,
      users: usersList,

      // Breakdowns
      scoreBuckets,
      anonymousCount,
      authCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
