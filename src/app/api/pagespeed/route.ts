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
    const result = await getPageSpeed(url, apiKey);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PageSpeed analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
