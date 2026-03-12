import { NextResponse } from "next/server";
import { z } from "zod";
import { scrapeWebsite } from "@/lib/scraper";

const requestSchema = z.object({
  url: z
    .string()
    .min(3)
    .refine(
      (val) => {
        try {
          new URL(val.startsWith("http") ? val : `https://${val}`);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid URL format" }
    ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = requestSchema.parse(body);

    const result = await scrapeWebsite(url);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid URL provided", details: error.issues },
        { status: 400 }
      );
    }
    const message =
      error instanceof Error ? error.message : "Failed to scrape website";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
