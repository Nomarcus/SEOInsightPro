import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { userId, url } = await request.json();

    if (!userId || !url) {
      return NextResponse.json(
        { error: "Missing userId or url" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin client not configured" },
        { status: 500 }
      );
    }

    // Get current credits
    const { data: account, error: fetchError } = await supabaseAdmin
      .from("user_accounts")
      .select("credits")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (!account || account.credits <= 0) {
      return NextResponse.json(
        { error: "No credits available" },
        { status: 402 }
      );
    }

    // Deduct 1 credit
    const { error: updateError } = await supabaseAdmin
      .from("user_accounts")
      .update({ credits: account.credits - 1 })
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Log the analysis
    await supabaseAdmin.from("analysis_logs").insert({
      user_id: userId,
      url,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      credits_remaining: account.credits - 1,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
