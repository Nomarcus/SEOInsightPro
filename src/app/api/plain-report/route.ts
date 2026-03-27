import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk"; // kept but not used — Gemini is primary

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      url,
      overallScore,
      categoryScores,
      strengths,
      weaknesses,
      quickWins,
      actionItems,
      strategy,
      industryCategory,
    } = body;

    if (!url || overallScore === undefined) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { generatePlainReportWithGemini } = await import("../../../lib/gemini-client");
    void new Anthropic; // reference kept to avoid unused-import tree-shaking

    const strengthList = (strengths || [])
      .map((s: { title: string; description?: string }) =>
        s.description ? `- ${s.title}: ${s.description}` : `- ${s.title}`
      )
      .join("\n");

    const weaknessList = (weaknesses || [])
      .map((w: { title: string; description?: string; impact?: string }) =>
        `- ${w.title}${w.description ? ": " + w.description : ""}${w.impact ? " (påverkan: " + w.impact + ")" : ""}`
      )
      .join("\n");

    const winsList = (quickWins || [])
      .map((w: { action: string; impact?: string }) =>
        `- ${w.action}${w.impact ? " → " + w.impact : ""}`
      )
      .join("\n");

    const actionList = (actionItems || [])
      .slice(0, 5)
      .map((a: { task: string; priority?: string }) =>
        `- ${a.task}${a.priority ? " [${a.priority}]" : ""}`
      )
      .join("\n");

    const strategyList = (strategy || [])
      .slice(0, 3)
      .map((s: { recommendation: string }) => `- ${s.recommendation}`)
      .join("\n");

    const scores = categoryScores
      ? Object.entries(categoryScores)
          .map(([k, v]) => {
            const label: Record<string, string> = {
              technical: "Teknik",
              content: "Innehåll",
              onPage: "On-Page",
              performance: "Hastighet",
              userExperience: "Användarupplevelse",
            };
            return `${label[k] || k}: ${(v as { score: number }).score}/100`;
          })
          .join(", ")
      : "";

    const hostname = (() => {
      try {
        return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
      } catch {
        return url;
      }
    })();

    const prompt = `Du är en vänlig och kunnig rådgivare som hjälper småföretagare att förstå hur deras hemsida presterar på Google. Du ska nu skriva en utförlig men lättläst analys av hemsidan ${hostname} på svenska. Personen du skriver till är inte teknisk — de driver kanske en restaurang, en frisersalong eller en webbutik, och vill bara veta om deras hemsida syns bra på Google och vad de kan göra åt det.

ANALYSDATA FÖR ${hostname.toUpperCase()}:
- Totalt SEO-betyg: ${overallScore}/100
- Bransch: ${industryCategory || "Okänd"}
- Delpoäng: ${scores}

Styrkor som hittades:
${strengthList || "Inga noterade"}

Problem som hittades:
${weaknessList || "Inga noterade"}

Snabbaste förbättringarna:
${winsList || "Inga noterade"}

Prioriterade åtgärder:
${actionList || "Inga noterade"}

Strategi:
${strategyList || "Ingen noterad"}

SKRIVINSTRUKTIONER:
Skriv en utförlig men lättläst rapport på svenska i löpande text — inga rubriker, inga punktlistor, inga tekniska termer. Dela upp texten i 3–4 stycken med radbrytning mellan dem.

Stycke 1: Börja med att berätta vad totalbetyget ${overallScore}/100 betyder i praktiken för just ${hostname} — är det bra, okej eller behöver det förbättras? Jämför gärna med en liknelse som alla förstår.

Stycke 2: Förklara konkret vad som redan fungerar bra på sidan. Använd enkel svenska och koppla det till verkliga konsekvenser — t.ex. "det betyder att folk som söker efter dig på mobilen hittar dig enkelt".

Stycke 3: Förklara de viktigaste problemen och vad de innebär i praktiken. Säg t.ex. inte "du saknar meta description" — säg istället "din sida saknar den korta texten som syns under länken i Google, och det gör att färre klickar på den". Var specifik och ärlig men inte skrämmande.

Stycke 4: Ge 2–3 konkreta saker att börja med, i prioritetsordning. Förklara varför just dessa är viktigast och vad effekten kan bli. Avsluta varmt och uppmuntrande.

Skriv som en människa som bryr sig, inte som en rapport. Max 300 ord totalt.`;

    const text = await generatePlainReportWithGemini(prompt);
    return NextResponse.json({ report: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
