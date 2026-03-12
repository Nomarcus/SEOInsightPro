import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const adminSecret = url.searchParams.get("token");

    // Verify admin token
    if (adminSecret !== process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin client not configured" },
        { status: 500 }
      );
    }

    // Get stats
    const [usersData, paymentsData, analysisData] = await Promise.all([
      supabaseAdmin
        .from("user_accounts")
        .select("id", { count: "exact" }),
      supabaseAdmin
        .from("payments")
        .select("*")
        .eq("status", "completed"),
      supabaseAdmin
        .from("analysis_logs")
        .select("*"),
    ]);

    const userCount = usersData.count || 0;
    const payments = paymentsData.data || [];
    const analyses = analysisData.data || [];

    // Calculate revenue
    let totalRevenueSEK = 0;
    let totalRevenueEUR = 0;
    payments.forEach((p) => {
      if (p.currency === "SEK") totalRevenueSEK += p.price_sek;
      else totalRevenueEUR += p.price_eur;
    });

    // Count analyses per domain
    const domainCounts: Record<string, number> = {};
    analyses.forEach((a) => {
      try {
        const domain = new URL(a.url).hostname;
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      } catch {
        // Skip invalid URLs
      }
    });

    const topDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));

    // Conversion rate (users who have paid)
    const payingUsers = new Set(payments.map((p) => p.user_id)).size;
    const conversionRate = userCount > 0 ? (payingUsers / userCount) * 100 : 0;

    return NextResponse.json({
      userCount,
      totalPayments: payments.length,
      totalRevenueSEK,
      totalRevenueEUR,
      totalAnalyses: analyses.length,
      payingUsers,
      conversionRate: conversionRate.toFixed(2),
      topDomains,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
