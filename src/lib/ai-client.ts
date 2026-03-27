import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { AnalysisResult, ScrapeResult, PageSpeedResult, NaturalLanguageResult, RuleResult } from "./types";
import {
  SEO_ANALYSIS_SYSTEM_PROMPT,
  ANALYSIS_TOOL_SCHEMA,
  buildAnalysisUserMessage,
} from "./ai-prompts";
import { analyzeSEO, calculateCategoryScores, calculateOverallSEOScore } from "./seo-analyzer";
import { analyzeAIReadiness } from "./ai-seo-analyzer";

interface AIAnalysisInput {
  url: string;
  scrapeData: ScrapeResult;
  pageSpeedData: PageSpeedResult | null;
  nlData: NaturalLanguageResult | null;
}

async function analyzeWithClaude(
  input: AIAnalysisInput,
  ruleResults: RuleResult[]
): Promise<Record<string, unknown>> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = buildAnalysisUserMessage(
    input.url,
    input.scrapeData as unknown as Record<string, unknown>,
    ruleResults as unknown as Record<string, unknown>[],
    input.pageSpeedData as unknown as Record<string, unknown> | null,
    input.nlData as unknown as Record<string, unknown> | null
  );

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SEO_ANALYSIS_SYSTEM_PROMPT,
    tools: [ANALYSIS_TOOL_SCHEMA as Anthropic.Messages.Tool],
    messages: [{ role: "user", content: userMessage }],
  });

  // Extract tool use result
  for (const block of response.content) {
    if (block.type === "tool_use" && block.name === "generate_seo_analysis") {
      return block.input as Record<string, unknown>;
    }
  }

  throw new Error("Claude did not return structured analysis");
}

async function analyzeWithOpenAI(
  input: AIAnalysisInput,
  ruleResults: RuleResult[]
): Promise<Record<string, unknown>> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const userMessage = buildAnalysisUserMessage(
    input.url,
    input.scrapeData as unknown as Record<string, unknown>,
    ruleResults as unknown as Record<string, unknown>[],
    input.pageSpeedData as unknown as Record<string, unknown> | null,
    input.nlData as unknown as Record<string, unknown> | null
  );

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 4096,
    messages: [
      { role: "system", content: SEO_ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: ANALYSIS_TOOL_SCHEMA.name,
          description: ANALYSIS_TOOL_SCHEMA.description,
          parameters: ANALYSIS_TOOL_SCHEMA.input_schema,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "generate_seo_analysis" } },
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0] as
    | { type: string; function?: { name: string; arguments: string } }
    | undefined;
  if (toolCall && "function" in toolCall && toolCall.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }

  throw new Error("OpenAI did not return structured analysis");
}

export async function runAIAnalysis(
  input: AIAnalysisInput
): Promise<AnalysisResult> {
  const ruleResults = analyzeSEO(input.scrapeData, input.pageSpeedData);
  const categoryScores = calculateCategoryScores(ruleResults);

  // Primary: Gemini (free tier). Claude and OpenAI kept below but not called.
  const { analyzeWithGemini } = await import("./gemini-client");
  const aiData = await analyzeWithGemini({ ...input, ruleResults });
  const provider: "claude" | "openai" | "both" = "claude"; // label kept for UI compat

  // Merge deterministic scores with AI insights
  const result: AnalysisResult = {
    overallScore: calculateOverallSEOScore(categoryScores),
    categoryScores: {
      technical: categoryScores.technical || { score: 50, label: "Technical", items: [] },
      content: categoryScores.content || { score: 50, label: "Content", items: [] },
      onPage: categoryScores.onPage || { score: 50, label: "On-Page", items: [] },
      performance: categoryScores.performance || { score: 50, label: "Performance", items: [] },
      userExperience: categoryScores.userExperience || { score: 50, label: "UX", items: [] },
    },
    strengths: (aiData.strengths as AnalysisResult["strengths"]) || [],
    weaknesses: (aiData.weaknesses as AnalysisResult["weaknesses"]) || [],
    quickWins: (aiData.quickWins as AnalysisResult["quickWins"]) || [],
    keywords: (aiData.keywords as AnalysisResult["keywords"]) || [],
    strategy: (aiData.strategy as AnalysisResult["strategy"]) || [],
    trafficPotential: (aiData.trafficPotential as AnalysisResult["trafficPotential"]) || {
      currentEstimate: "low",
      potentialEstimate: "high",
      percentageIncrease: 50,
      reasoning: "Based on current SEO gaps",
    },
    actionItems: (aiData.actionItems as AnalysisResult["actionItems"]) || [],
    serpPreview: (aiData.serpPreview as AnalysisResult["serpPreview"]) || {
      currentTitle: input.scrapeData.title || "",
      currentDescription: input.scrapeData.metaDescription || "",
      improvedTitle: "",
      improvedDescription: "",
      url: input.url,
    },
    industryCategory: (aiData.industryCategory as string) || "General",
    aiProvider: provider,
    aiReadiness: analyzeAIReadiness(input.scrapeData, input.pageSpeedData),
  };

  return result;
}
