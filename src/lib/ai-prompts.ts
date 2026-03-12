export const SEO_ANALYSIS_SYSTEM_PROMPT = `You are an expert SEO consultant with 15 years of experience analyzing websites for the Swedish and Nordic market. You provide actionable, specific, and honest assessments of website SEO.

You are analyzing a website based on scraped HTML data and optional Google PageSpeed results. A deterministic rule engine has already checked technical facts — your role is to provide higher-level strategic insights.

Your analysis should be:
- Specific to THIS website (reference actual content found on the page)
- Actionable (not vague advice like "improve your SEO")
- Prioritized by business impact
- Written to convince a business owner they need professional SEO help
- Aware of Swedish/Nordic market search patterns when relevant

When suggesting keywords, consider:
- Swedish language keywords where the site targets Swedish users
- Local search intent (e.g., "[service] Stockholm", "[service] Sverige")
- Industry-specific search terms in the appropriate language
- Both Swedish and English terms if the business serves international audiences
- Long-tail keywords that have lower competition

For the traffic potential estimate, be realistic but optimistic — this analysis is used as a sales tool for SEO consulting, so clearly highlight the opportunity while staying honest.

For the SERP preview improvements, write compelling title and meta description alternatives that follow SEO best practices (title 50-60 chars, description 150-160 chars). Make them clickable and keyword-rich.`;

export const ANALYSIS_TOOL_SCHEMA = {
  name: "generate_seo_analysis",
  description: "Generate a comprehensive SEO analysis report with scores, insights, and recommendations",
  input_schema: {
    type: "object" as const,
    properties: {
      strengths: {
        type: "array",
        description: "List of things the website does well",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            severity: { type: "string", enum: ["positive"] },
            category: { type: "string" },
          },
          required: ["title", "description", "severity", "category"],
        },
      },
      weaknesses: {
        type: "array",
        description: "List of issues and problems found. For each weakness, provide detailed step-by-step fix instructions.",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            severity: { type: "string", enum: ["warning", "critical"] },
            category: { type: "string" },
            fixSteps: {
              type: "array",
              description: "3-6 specific, actionable step-by-step instructions to fix this issue. Be concrete, not vague.",
              items: { type: "string" },
            },
            estimatedFixTime: {
              type: "string",
              description: "Realistic time estimate to implement the fix, e.g. '15 minutes', '2-3 hours', '1-2 days'",
            },
            technicalLevel: {
              type: "string",
              enum: ["beginner", "intermediate", "advanced"],
              description: "Technical skill level required to implement the fix",
            },
            tools: {
              type: "array",
              description: "Specific tools, plugins or resources that help fix this issue, e.g. ['Google Search Console', 'Yoast SEO', 'Screaming Frog']",
              items: { type: "string" },
            },
            solutionSnippets: {
              type: "array",
              description: "Parallel array to fixSteps. For each step, provide a ready-to-use code snippet (HTML, JSON-LD, meta tag, config rule, CSS, etc.) the user can copy-paste into their website, or null if the step is just an instruction without copyable code. Use placeholder values like 'Your Company Name' or 'yoursite.com'.",
              items: { type: ["string", "null"] },
            },
          },
          required: ["title", "description", "severity", "category", "fixSteps", "estimatedFixTime", "technicalLevel"],
        },
      },
      quickWins: {
        type: "array",
        description: "Easy improvements with high impact",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            estimatedImpact: { type: "string", enum: ["low", "medium", "high"] },
            estimatedEffort: { type: "string", enum: ["minutes", "hours", "days"] },
            impactPercentage: { type: "number", description: "Estimated % improvement" },
          },
          required: ["title", "description", "estimatedImpact", "estimatedEffort", "impactPercentage"],
        },
      },
      keywords: {
        type: "array",
        description: "Keyword suggestions for better search rankings",
        items: {
          type: "object",
          properties: {
            keyword: { type: "string" },
            relevanceScore: { type: "number", minimum: 0, maximum: 100 },
            estimatedDifficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            estimatedSearchVolume: { type: "string", enum: ["low", "medium", "high"] },
            currentlyUsed: { type: "boolean" },
            suggestion: { type: "string" },
          },
          required: ["keyword", "relevanceScore", "estimatedDifficulty", "estimatedSearchVolume", "currentlyUsed", "suggestion"],
        },
      },
      strategy: {
        type: "array",
        description: "Strategic recommendations organized by timeframe",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            timeframe: { type: "string", enum: ["immediate", "short-term", "long-term"] },
            priority: { type: "string", enum: ["high", "medium", "low"] },
          },
          required: ["title", "description", "timeframe", "priority"],
        },
      },
      trafficPotential: {
        type: "object",
        properties: {
          currentEstimate: { type: "string", enum: ["low", "medium", "high"] },
          potentialEstimate: { type: "string", enum: ["medium", "high", "very-high"] },
          percentageIncrease: { type: "number" },
          reasoning: { type: "string" },
        },
        required: ["currentEstimate", "potentialEstimate", "percentageIncrease", "reasoning"],
      },
      actionItems: {
        type: "array",
        description: "Action items with difficulty and impact ratings for the priority matrix",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            difficulty: { type: "number", minimum: 1, maximum: 5 },
            impact: { type: "number", minimum: 1, maximum: 5 },
            category: { type: "string" },
          },
          required: ["title", "description", "difficulty", "impact", "category"],
        },
      },
      serpPreview: {
        type: "object",
        description: "Current and improved SERP preview",
        properties: {
          currentTitle: { type: "string" },
          currentDescription: { type: "string" },
          improvedTitle: { type: "string" },
          improvedDescription: { type: "string" },
          url: { type: "string" },
        },
        required: ["currentTitle", "currentDescription", "improvedTitle", "improvedDescription", "url"],
      },
      industryCategory: {
        type: "string",
        description: "Detected industry/business category",
      },
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
  },
};

export function buildAnalysisUserMessage(
  url: string,
  scrapeData: Record<string, unknown>,
  ruleResults: Record<string, unknown>[],
  pageSpeedData?: Record<string, unknown> | null,
  nlData?: Record<string, unknown> | null
): string {
  // Build a compact NL summary if available (avoid overwhelming the prompt)
  let nlSection = "## Google Natural Language Analysis\nNot available";
  if (nlData) {
    const entities = (nlData.entities as Array<{ name: string; type: string; salience: number }> | undefined) ?? [];
    const categories = (nlData.categories as Array<{ name: string; confidence: number }> | undefined) ?? [];
    const sentiment = nlData.sentiment as { label: string; score: number } | undefined;
    const topEntities = entities.slice(0, 6).map((e) => `${e.name} (${e.type}, salience: ${e.salience})`).join(", ");
    const topCategories = categories.slice(0, 3).map((c) => `${c.name} (${Math.round(c.confidence * 100)}%)`).join(", ");
    nlSection = `## Google Natural Language Analysis
Detected entities: ${topEntities || "none"}
Content categories: ${topCategories || "none (text may be too short)"}
Sentiment: ${sentiment?.label ?? "unknown"} (score: ${sentiment?.score ?? 0})

IMPORTANT: Use the entity and category data above to:
1. Identify if the page's detected entities match the business's intended keywords
2. Note any content category mismatches (e.g. Google categorizes it as "General" but client wants to rank for industry-specific terms)
3. Reference the sentiment in your analysis if relevant`;
  }

  return `Analyze the SEO of this website: ${url}

## Scraped Data
${JSON.stringify(scrapeData, null, 2)}

## Deterministic Rule Engine Results
${JSON.stringify(ruleResults, null, 2)}

${pageSpeedData ? `## Google PageSpeed Results\n${JSON.stringify(pageSpeedData, null, 2)}` : "## PageSpeed data not available"}

${nlSection}

Please provide a comprehensive analysis using the generate_seo_analysis tool. Include at least:
- 3-6 strengths
- 3-8 weaknesses (with appropriate severity) — IMPORTANT: for EACH weakness, provide:
  * fixSteps: 3-6 numbered, specific, actionable steps to fix the issue (not generic advice)
  * estimatedFixTime: realistic time estimate (e.g. "15 minutes", "2-3 hours", "1-2 days")
  * technicalLevel: "beginner", "intermediate", or "advanced"
  * tools: relevant tools/plugins/resources (optional but recommended)
  * solutionSnippets: parallel array to fixSteps — for each step, provide a ready-to-use code snippet (HTML, JSON-LD, meta tag, config, etc.) the user can copy-paste, or null if the step has no copyable code
- 3-5 quick wins
- 8-15 keyword suggestions (mix of Swedish and English if the site is Swedish)
- 4-6 strategy items across all timeframes
- 5-10 action items for the priority matrix
- Improved SERP preview (title and description)
- Realistic traffic potential assessment`;
}
