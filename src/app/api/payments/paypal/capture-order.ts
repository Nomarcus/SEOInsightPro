import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API_BASE = "https://api-m.paypal.com";

export async function POST(request: Request) {
  try {
    const { orderId, userId, currency = "SEK" } = await request.json();

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: "Missing orderId or userId" },
        { status: 400 }
      );
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuration missing" },
        { status: 500 }
      );
    }

    // Get access token
    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error("Failed to get PayPal access token");
    }

    // Capture order
    const captureResponse = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const captureData = await captureResponse.json();

    if (captureData.status !== "COMPLETED") {
      throw new Error(`Payment failed: ${captureData.status}`);
    }

    // Record payment
    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: userId,
        package_name: "5-analyses",
        price_sek: currency === "SEK" ? 199.0 : 19.0,
        price_eur: currency === "EUR" ? 19.0 : 199.0,
        currency,
        payment_method: "paypal",
        transaction_id: captureData.id,
        status: "completed",
        credits_awarded: 5,
        completed_at: new Date().toISOString(),
      });

    if (paymentError) throw paymentError;

    // Add credits to user
    const { data: account, error: fetchError } = await supabaseAdmin
      .from("user_accounts")
      .select("credits")
      .eq("user_id", userId)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabaseAdmin
      .from("user_accounts")
      .update({ credits: (account?.credits || 0) + 5 })
      .eq("user_id", userId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      credits: (account?.credits || 0) + 5,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
