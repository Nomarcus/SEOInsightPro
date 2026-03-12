import { NextResponse } from "next/server";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API_BASE = "https://api-m.paypal.com";

export async function POST(request: Request) {
  try {
    const { currency = "SEK", amount = "199.00" } = await request.json();

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return NextResponse.json(
        { error: "PayPal credentials not configured" },
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

    // Create order
    const orderResponse = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount,
              },
              description: "5 Website Analyses - SEO Insight Pro",
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/buy/success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/buy/cancel`,
              },
            },
          },
        }),
      }
    );

    const orderData = await orderResponse.json();

    if (!orderData.id) {
      throw new Error("Failed to create PayPal order");
    }

    return NextResponse.json({
      orderId: orderData.id,
      approvalUrl: orderData.links.find(
        (link: { rel: string }) => link.rel === "approve"
      )?.href,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
