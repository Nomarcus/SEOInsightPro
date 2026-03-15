import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeContent } from "@/lib/natural-language";

const requestSchema = z.object({
  text: z.string().min(20),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);

    const apiKey = process.env.GOOGLE_NL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_NL_API_KEY not configured" },
        { status: 400 }
      );
    }

    const result = await analyzeContent(parsed.text, apiKey);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Natural Language analysis failed";
    console.error("NL API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
