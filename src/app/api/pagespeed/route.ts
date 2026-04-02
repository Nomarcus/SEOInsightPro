import { NextResponse } from "next/server";
import { z } from "zod";
import { getPageSpeed } from "@/lib/pagespeed";

const requestSchema = z.object({
  url: z.string().min(3),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = requestSchema.parse(body);

    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

    // Retry up to 3 times with 2s delay between attempts
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await getPageSpeed(url, apiKey);
        return NextResponse.json(result);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`PageSpeed attempt ${attempt}/3 failed:`, lastError.message);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // All retries failed — return partial empty result so analysis can continue
    console.error("PageSpeed all retries failed:", lastError?.message);
    return NextResponse.json({ error: lastError?.message ?? "PageSpeed failed" }, { status: 500 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PageSpeed analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
