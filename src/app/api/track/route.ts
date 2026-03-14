/**
 * POST /api/track
 *
 * Logs every analysis event — anonymous or authenticated.
 * Uses supabaseAdmin to bypass RLS so anonymous analyses are captured too.
 *
 * Body: { url, score, userId?, scoreBreakdown? }
 * Headers read server-side: x-vercel-ip-country, referer, user-agent
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, score, userId, scoreBreakdown } = body as {
      url: string;
      score: number;
      userId?: string;
      scoreBreakdown?: Record<string, number>;
    };

    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      // Silently skip if admin client not configured (dev without service role)
      return NextResponse.json({ ok: true });
    }

    // Extract Vercel geo / request metadata from headers
    const country =
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry") ??
      null;
    const referrer =
      request.headers.get("referer") ??
      request.headers.get("referrer") ??
      null;
    const userAgent = request.headers.get("user-agent") ?? null;
    const isAnonymous = !userId;

    await supabaseAdmin.from("analysis_logs").insert({
      user_id: userId ?? null,
      url,
      overall_score: score ?? null,
      is_anonymous: isAnonymous,
      country,
      referrer,
      user_agent: userAgent,
      score_breakdown: scoreBreakdown ?? null,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Never block the main flow — just log and return ok
    console.error("[track] error:", error);
    return NextResponse.json({ ok: true });
  }
}
