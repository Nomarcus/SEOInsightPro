import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const requestSchema = z.object({
  text: z.string().min(20),
});

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyze the following webpage text and return a JSON object with this exact structure:
{
  "entities": [{ "name": string, "type": string, "salience": number (0-1), "wikipediaUrl": string|null }],
  "categories": [{ "name": string, "confidence": number (0-1) }],
  "sentiment": { "score": number (-1 to 1), "magnitude": number (0-∞), "label": "very positive"|"positive"|"neutral"|"negative"|"very negative" },
  "detectedLanguage": string (ISO 639-1 code, e.g. "sv", "en")
}

Rules:
- entities: up to 12 most relevant entities (people, orgs, locations, products, topics). salience = how central they are.
- categories: up to 5 content categories (e.g. "/Business & Industrial/Marketing", "/Sports/Soccer")
- sentiment: score (-1=very negative, 0=neutral, 1=very positive), magnitude = overall emotion strength
- detectedLanguage: detect the actual language of the text

Return ONLY valid JSON, no markdown, no explanation.

Text to analyze:
${parsed.text.slice(0, 8000)}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Natural Language analysis failed";
    console.error("NL API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
