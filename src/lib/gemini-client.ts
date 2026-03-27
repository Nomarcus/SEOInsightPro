/**
 * Gemini AI Client
 *
 * Primary AI provider using Google Gemini 2.0 Flash (free tier).
 * Claude and OpenAI clients remain intact in ai-client.ts but are not called.
 */

import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { SEO_ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserMessage } from "./ai-prompts";
import { SOLVE_SYSTEM_PROMPT } from "./solve-generator";
import type {
  ScrapeResult,
  PageSpeedResult,
  NaturalLanguageResult,
  RuleResult,
  AnalysisResult,
} from "./types";
import type { SolveRequest, SolveResponse } from "./solve-generator";

// ─── Schema ───────────────────────────────────────────────

const GEMINI_ANALYSIS_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    strengths: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
        },
        required: ["title", "description", "severity", "category"],
      },
    },
    weaknesses: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          fixSteps: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          estimatedFixTime: { type: SchemaType.STRING },
          technicalLevel: { type: SchemaType.STRING },
          tools: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          solutionSnippets: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ["title", "description", "severity", "category", "fixSteps", "estimatedFixTime", "technicalLevel"],
      },
    },
    quickWins: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          estimatedImpact: { type: SchemaType.STRING },
          estimatedEffort: { type: SchemaType.STRING },
          impactPercentage: { type: SchemaType.NUMBER },
        },
        required: ["title", "description", "estimatedImpact", "estimatedEffort", "impactPercentage"],
      },
    },
    keywords: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          keyword: { type: SchemaType.STRING },
          relevanceScore: { type: SchemaType.NUMBER },
          estimatedDifficulty: { type: SchemaType.STRING },
          estimatedSearchVolume: { type: SchemaType.STRING },
          currentlyUsed: { type: SchemaType.BOOLEAN },
          suggestion: { type: SchemaType.STRING },
        },
        required: ["keyword", "relevanceScore", "estimatedDifficulty", "estimatedSearchVolume", "currentlyUsed", "suggestion"],
      },
    },
    strategy: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          timeframe: { type: SchemaType.STRING },
          priority: { type: SchemaType.STRING },
        },
        required: ["title", "description", "timeframe", "priority"],
      },
    },
    trafficPotential: {
      type: SchemaType.OBJECT,
      properties: {
        currentEstimate: { type: SchemaType.STRING },
        potentialEstimate: { type: SchemaType.STRING },
        percentageIncrease: { type: SchemaType.NUMBER },
        reasoning: { type: SchemaType.STRING },
      },
      required: ["currentEstimate", "potentialEstimate", "percentageIncrease", "reasoning"],
    },
    actionItems: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          difficulty: { type: SchemaType.NUMBER },
          impact: { type: SchemaType.NUMBER },
          category: { type: SchemaType.STRING },
        },
        required: ["title", "description", "difficulty", "impact", "category"],
      },
    },
    serpPreview: {
      type: SchemaType.OBJECT,
      properties: {
        currentTitle: { type: SchemaType.STRING },
        currentDescription: { type: SchemaType.STRING },
        improvedTitle: { type: SchemaType.STRING },
        improvedDescription: { type: SchemaType.STRING },
        url: { type: SchemaType.STRING },
      },
      required: ["currentTitle", "currentDescription", "improvedTitle", "improvedDescription", "url"],
    },
    industryCategory: { type: SchemaType.STRING },
  },
  required: [
    "strengths",
    "weaknesses",
    "quickWins",
    "keywords",
    "strategy",
    "trafficPotential",
    "actionItems",
    "serpPreview",
    "industryCategory",
  ],
};

const GEMINI_SOLVE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    solution: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
  },
  required: ["solution", "explanation"],
};

// ─── Helpers ──────────────────────────────────────────────

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenerativeAI(apiKey);
}

// ─── Main SEO Analysis ────────────────────────────────────

export async function analyzeWithGemini(input: {
  url: string;
  scrapeData: ScrapeResult;
  pageSpeedData: PageSpeedResult | null;
  nlData: NaturalLanguageResult | null;
  ruleResults: RuleResult[];
}): Promise<Record<string, unknown>> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SEO_ANALYSIS_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_ANALYSIS_SCHEMA,
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });

  const userMessage = buildAnalysisUserMessage(
    input.url,
    input.scrapeData as unknown as Record<string, unknown>,
    input.ruleResults as unknown as Record<string, unknown>[],
    input.pageSpeedData as unknown as Record<string, unknown> | null,
    input.nlData as unknown as Record<string, unknown> | null
  );

  const result = await model.generateContent(userMessage);
  const text = result.response.text();
  return JSON.parse(text) as Record<string, unknown>;
}

// ─── Solve Generator ─────────────────────────────────────

export async function generateSolutionWithGemini(req: SolveRequest): Promise<SolveResponse> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SOLVE_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_SOLVE_SCHEMA,
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  });

  const headingsText = req.headings
    .slice(0, 20)
    .map((h) => `${h.tag}: ${h.text}`)
    .join("\n");

  const structuredDataText =
    req.structuredData.length > 0
      ? JSON.stringify(req.structuredData.slice(0, 3), null, 2)
      : "None found";

  const userMessage = `## Fix Step to Solve
"${req.stepText}"

## Issue Context
- Issue: ${req.issueTitle}
- Category: ${req.issueCategory}

## Page Data
- URL: ${req.pageUrl}
- Title: ${req.pageTitle || "(no title)"}
- Meta Description: ${req.metaDescription || "(none)"}
- Language: ${req.language || "unknown"}
- Author: ${req.authorName || "(not specified)"}
- Word Count: ${req.wordCount}

## Current Headings
${headingsText || "(no headings found)"}

## Existing Structured Data
${structuredDataText}

## Page Content Excerpt
${req.bodyTextExcerpt || "(no body text available)"}

---
Generate a ready-to-use solution for this specific fix step. Use the REAL page data above — do not use placeholder values.`;

  const result = await model.generateContent(userMessage);
  const parsed = JSON.parse(result.response.text()) as SolveResponse;

  if (!parsed.solution || typeof parsed.solution !== "string") {
    throw new Error("Gemini did not return a valid solution");
  }

  return {
    solution: parsed.solution.trim(),
    explanation: parsed.explanation?.trim() || "",
  };
}

// ─── Plain Report ─────────────────────────────────────────

export async function generatePlainReportWithGemini(prompt: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
