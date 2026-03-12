import { NextResponse } from "next/server";
import { z } from "zod";
import { runAIAnalysis } from "@/lib/ai-client";

const requestSchema = z.object({
  url: z.string().min(3),
  scrapeData: z.record(z.string(), z.unknown()),
  pageSpeedData: z.record(z.string(), z.unknown()).nullable().optional(),
  nlData: z.record(z.string(), z.unknown()).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);

    const result = await runAIAnalysis({
      url: parsed.url,
      scrapeData: parsed.scrapeData as never,
      pageSpeedData: (parsed.pageSpeedData as never) || null,
      nlData: (parsed.nlData as never) || null,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI analysis failed";
    console.error("Analysis error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
