/**
 * POST /api/track/pageview
 *
 * Lightweight page-view beacon — called client-side on navigation.
 * Stores path + country + referrer in Supabase page_views table.
 * No PII stored (no IP addresses).
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, userId } = body as { path?: string; userId?: string };

    if (!path) return NextResponse.json({ ok: true });

    if (!supabaseAdmin) return NextResponse.json({ ok: true });

    const country =
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry") ??
      null;
    const referrer = request.headers.get("referer") ?? null;
    const userAgent = request.headers.get("user-agent") ?? null;

    await supabaseAdmin.from("page_views").insert({
      path,
      user_id: userId ?? null,
      country,
      referrer,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
