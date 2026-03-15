import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, overallScore, categoryScores, strengths, weaknesses, quickWins } = body;

    if (!url || overallScore === undefined) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const strengthList = (strengths || [])
      .slice(0, 5)
      .map((s: { title: string }) => `- ${s.title}`)
      .join("\n");

    const weaknessList = (weaknesses || [])
      .slice(0, 5)
      .map((w: { title: string }) => `- ${w.title}`)
      .join("\n");

    const winsList = (quickWins || [])
      .slice(0, 3)
      .map((w: { action: string }) => `- ${w.action}`)
      .join("\n");

    const scores = categoryScores
      ? Object.entries(categoryScores)
          .map(([k, v]) => `${k}: ${(v as { score: number }).score}/100`)
          .join(", ")
      : "";

    const prompt = `Du är en hjälpsam rådgivare som ska förklara resultatet av en SEO-analys för en företagare som inte är teknisk och inte vet vad SEO är.

Webbsida som analyserats: ${url}
Totalt SEO-betyg: ${overallScore}/100
Delpoäng: ${scores}

Styrkor som hittades:
${strengthList || "Inga noterade"}

Problem som hittades:
${weaknessList || "Inga noterade"}

Snabba förbättringar att göra:
${winsList || "Inga noterade"}

Skriv nu en kort, vänlig förklaring på svenska — som om du pratar med en butiksägare som aldrig hört om SEO. Förklara:
1. Om sidan är bra, okej eller behöver förbättras (baserat på poängen)
2. Vad som fungerar bra (1-2 meningar, enkelt språk)
3. Vad som är viktigast att fixa (1-2 konkreta saker, inga tekniska termer)
4. En enkel uppmuntran eller nästa steg

Håll texten kort — max 150 ord. Inga rubriker, inga punktlistor. Bara löpande text som man kan läsa högt. Skriv varmt och personligt, inte som en robot.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ report: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
