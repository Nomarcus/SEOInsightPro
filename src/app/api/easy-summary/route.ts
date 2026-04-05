import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult } from "@/lib/types";

const requestSchema = z.object({
  analysisResult: z.object({
    overallScore: z.number(),
    categoryScores: z.record(z.string(), z.object({ score: z.number() })),
    strengths: z.array(z.object({ title: z.string() })).optional(),
    weaknesses: z.array(z.object({ title: z.string() })).optional(),
    quickWins: z.array(z.object({ title: z.string() })).optional(),
    strategy: z.array(z.object({ title: z.string() })).optional(),
  }),
  url: z.string(),
});

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { analysisResult, url } = requestSchema.parse(body);

    const strengths = analysisResult.strengths?.map((s) => s.title).slice(0, 3) || [];
    const weaknesses = analysisResult.weaknesses?.map((w) => w.title).slice(0, 3) || [];
    const quickWins = analysisResult.quickWins?.map((w) => w.title).slice(0, 2) || [];

    const hostname = new URL(url).hostname;
    const score = analysisResult.overallScore;

    const scoreInterpretation =
      score >= 80
        ? "mycket bra"
        : score >= 60
          ? "godkänd"
          : score >= 40
            ? "behöver förbättras"
            : "kritisk";

    const message = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `Du är en vänlig SEO-rådgivare som förklarar webbsidor för vanliga företagare. Skriv en kort, lätt förståelig sammanfattning på SVENSKA om denna webbsidas SEO-status.

URL: ${hostname}
SEO-poäng: ${score}/100 (${scoreInterpretation})

DET SOM FUNGERAR BRA:
${strengths.map((s) => `- ${s}`).join("\n") || "- Webbsidan har en solid grund"}

DET SOM BEHÖVER FÖRBÄTTRAS:
${weaknesses.map((w) => `- ${w}`).join("\n") || "- Några förbättringsmöjligheter"}

SNABBA ÅTGÄRDER:
${quickWins.map((w) => `- ${w}`).join("\n") || "- Implementera rekommendationer"}

SKRIV EXAKT 4 STYCKEN (separera med \\n\\n):

1. FÖRSTA STYCKE: Förklara vad ${score} poäng betyder i enkla termer. Använd en vardaglig metafor (t.ex. "som ett butiksfönster" eller "som en restaurangs telefon"). Var positiv men ärlig.

2. ANDRA STYCKE: Förklara vad som fungerar bra och varför det är viktigt för hans kunder/affär. Använd konkreta exempel från hans webbsida.

3. TREDJE STYCKE: Förklara vad som behöver förbättras och vilken påverkan det har på hans kunder/försäljning. Var inte skrämmande, bara ärlig.

4. FJÄRDE STYCKE: Ge 2-3 konkreta, specifika nästa steg han kan göra DENNA VECKA utan att höra av sig till någon kodare. Förklara kort varför varje steg spelar roll.

REGLER:
- INGEN tekniska termer (keine SEO, meta description, schema, robots.txt, etc.)
- INGA punktlistor eller siffror - bara flytande text
- Naturligt språk för småföretagare (frisörsalong, restaurang, butik-ägare)
- Max 400 ord totalt
- Uppmuntrande och oroande ton
- Fokusera på HANS affär och HANS kunder, inte teknik
- Skriv på svenska, naturligt och enkelt`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ report: raw });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate summary";
    console.error("Easy summary error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
