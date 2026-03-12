/**
 * AI-Powered Solve Generator
 *
 * Calls OpenAI gpt-4o to generate personalized, ready-to-use
 * SEO solutions based on the page's actual content.
 */

import OpenAI from "openai";

// ─── Types ──────────────────────────────────────────────

export interface SolveRequest {
  stepText: string;
  issueTitle: string;
  issueCategory: string;
  pageUrl: string;
  pageTitle: string | null;
  metaDescription: string | null;
  bodyTextExcerpt: string;
  headings: { tag: string; text: string }[];
  language: string | null;
  structuredData: object[];
  authorName?: string;
  wordCount: number;
}

export interface SolveResponse {
  solution: string;
  explanation: string;
}

// ─── OpenAI Tool Schema ─────────────────────────────────

const SOLVE_TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "generate_solution",
    description:
      "Generate a ready-to-use SEO solution (code, text, or markup) that the user can copy-paste directly into their website.",
    parameters: {
      type: "object",
      properties: {
        solution: {
          type: "string",
          description:
            "The complete, ready-to-use solution. This could be HTML code, JSON-LD markup, meta tags, text content, heading structures, robots.txt rules, etc. Must use the page's REAL data (title, URL, topic, language). Must be directly copy-pasteable without modifications.",
        },
        explanation: {
          type: "string",
          description:
            "A brief 1-2 sentence explanation of what was generated and why it helps SEO. Written in the same language as the page content.",
        },
      },
      required: ["solution", "explanation"],
    },
  },
};

// ─── System Prompt ──────────────────────────────────────

const SOLVE_SYSTEM_PROMPT = `You are an expert SEO consultant generating ready-to-use solutions for website owners.

Your task: Given a specific SEO fix step and the page's actual data, generate a COMPLETE, COPY-PASTEABLE solution.

Critical rules:
1. Use the page's REAL data — real title, real URL, real topic, real author name. NEVER use placeholder text like "Your Company" or "yoursite.com".
2. If the page is in Swedish, write text content in Swedish. If English, write in English. Match the page's language.
3. Generate ONLY the solution code/text — no surrounding explanations, no markdown formatting, no backticks.
4. For JSON-LD: use the actual page title as headline, actual URL, actual author if available.
5. For FAQ content: generate real questions and answers relevant to the page's actual topic based on the body text.
6. For meta tags: craft them based on the actual page content and SEO best practices.
7. For heading structures: create headings that match the page's topic and use question formats where appropriate.
8. Make the solution comprehensive but focused on the specific step described.
9. The explanation should be brief and in the same language as the page.`;

// ─── Generator ──────────────────────────────────────────

export async function generateSolution(
  req: SolveRequest
): Promise<SolveResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey });

  // Build a concise user message with relevant page data
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

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2048,
    temperature: 0.4,
    messages: [
      { role: "system", content: SOLVE_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    tools: [SOLVE_TOOL_SCHEMA],
    tool_choice: {
      type: "function",
      function: { name: "generate_solution" },
    },
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0] as
    | { type: string; function?: { name: string; arguments: string } }
    | undefined;
  if (!toolCall || !("function" in toolCall) || !toolCall.function?.arguments) {
    throw new Error("OpenAI did not return a valid solution");
  }

  const parsed = JSON.parse(toolCall.function.arguments) as SolveResponse;

  if (!parsed.solution || typeof parsed.solution !== "string") {
    throw new Error("Generated solution is empty or invalid");
  }

  return {
    solution: parsed.solution.trim(),
    explanation: parsed.explanation?.trim() || "",
  };
}
