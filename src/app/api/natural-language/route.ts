import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeContent } from "@/lib/natural-language";
import Anthropic from "@anthropic-ai/sdk";

const requestSchema = z.object({
  text: z.string().min(20),
});

async function analyzeWithClaude(text: string) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze the following webpage text and return a JSON object with this exact structure:
{
  "entities": [{ "name": string, "type": string, "salience": number (0-1), "wikipediaUrl": null }],
  "categories": [{ "name": string, "confidence": number (0-1) }],
  "sentiment": { "score": number (-1 to 1), "magnitude": number (0-10), "label": "very positive"|"positive"|"neutral"|"negative"|"very negative" },
  "detectedLanguage": string
}

Rules:
- entities: up to 12 most relevant (people, orgs, locations, products, topics). salience = how central.
- categories: up to 5 content categories (e.g. "/Business & Industrial/Marketing")
- sentiment: score (-1=very negative, 0=neutral, 1=very positive)
- detectedLanguage: ISO 639-1 code e.g. "sv", "en"

Return ONLY valid JSON, no markdown.

Text:
${text.slice(0, 8000)}`,
      },
    ],
  });
  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  return JSON.parse(raw);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);

    const apiKey = process.env.GOOGLE_NL_API_KEY;

    // Primary: Google NL API
    if (apiKey) {
      try {
        const result = await analyzeContent(parsed.text, apiKey);
        return NextResponse.json(result);
      } catch (googleErr) {
        console.warn("Google NL API failed, falling back to Claude:", googleErr);
        // Fall through to Claude fallback
      }
    }

    // Fallback: Claude Haiku
    const result = await analyzeWithClaude(parsed.text);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Natural Language analysis failed";
    console.error("NL API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
