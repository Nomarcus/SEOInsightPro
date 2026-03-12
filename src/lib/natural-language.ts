/**
 * Google Natural Language API v1 client
 *
 * Analyzes page text content and returns:
 * - Entities: what Google recognizes on the page (org, location, person, product...)
 * - Categories: Google's content classification (/Business & Industrial/Marketing...)
 * - Sentiment: positive/neutral/negative tone of the content
 *
 * API costs: First 5,000 units/month free, then ~$1/1,000 units
 * Env var: GOOGLE_NL_API_KEY
 */

import type { NaturalLanguageResult, NLEntity, NLCategory } from "./types";

const NL_BASE = "https://language.googleapis.com/v1/documents";

interface NLDocument {
  type: "PLAIN_TEXT";
  content: string;
}

function buildDoc(text: string): { document: NLDocument; encodingType: "UTF8" } {
  return { document: { type: "PLAIN_TEXT", content: text }, encodingType: "UTF8" };
}

function sentimentLabel(score: number): NaturalLanguageResult["sentiment"]["label"] {
  if (score >= 0.5) return "very positive";
  if (score >= 0.1) return "positive";
  if (score <= -0.5) return "very negative";
  if (score <= -0.1) return "negative";
  return "neutral";
}

export async function analyzeContent(
  text: string,
  apiKey: string
): Promise<NaturalLanguageResult> {
  if (!text || text.trim().length < 20) {
    throw new Error("Text too short for Natural Language analysis");
  }

  const doc = buildDoc(text);

  // Run all three NL calls in parallel (classifyText may fail on short text — handled)
  const [entitiesRes, sentimentRes, categoriesRes] = await Promise.allSettled([
    fetch(`${NL_BASE}:analyzeEntities?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
      signal: AbortSignal.timeout(15000),
    }),
    fetch(`${NL_BASE}:analyzeSentiment?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
      signal: AbortSignal.timeout(15000),
    }),
    fetch(`${NL_BASE}:classifyText?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document: doc.document }), // no encodingType for classifyText
      signal: AbortSignal.timeout(15000),
    }),
  ]);

  // --- Detect total failure (API key invalid, API not enabled, quota exceeded etc.) ---
  // classifyText often fails legitimately on short text — don't count it.
  // Only throw if BOTH entities AND sentiment failed, meaning the API key/project is broken.
  const entitiesFailed =
    entitiesRes.status === "rejected" || !entitiesRes.value.ok;
  const sentimentFailed =
    sentimentRes.status === "rejected" || !sentimentRes.value.ok;

  if (entitiesFailed && sentimentFailed) {
    let errMsg = "Google Natural Language API: all calls failed";
    // Try to extract the actual error message from Google's response
    if (entitiesRes.status === "fulfilled" && !entitiesRes.value.ok) {
      try {
        const errData = await entitiesRes.value.json();
        const googleMsg = errData?.error?.message as string | undefined;
        if (googleMsg) errMsg = `Google NL API: ${googleMsg}`;
      } catch {
        // ignore parse error
      }
    } else if (entitiesRes.status === "rejected") {
      errMsg = `Google NL API: ${String(entitiesRes.reason)}`;
    }
    throw new Error(errMsg);
  }

  // --- Entities ---
  let entities: NLEntity[] = [];
  if (entitiesRes.status === "fulfilled" && entitiesRes.value.ok) {
    const data = await entitiesRes.value.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entities = ((data.entities as any[]) || [])
      .filter((e) => e.salience > 0.01)
      .sort((a, b) => b.salience - a.salience)
      .slice(0, 12)
      .map((e) => ({
        name: e.name as string,
        type: (e.type as string) || "OTHER",
        salience: Math.round((e.salience as number) * 100) / 100,
        wikipediaUrl: e.metadata?.wikipedia_url as string | undefined,
      }));
  }

  // --- Sentiment ---
  let sentiment: NaturalLanguageResult["sentiment"] = {
    score: 0,
    magnitude: 0,
    label: "neutral",
  };
  if (sentimentRes.status === "fulfilled" && sentimentRes.value.ok) {
    const data = await sentimentRes.value.json();
    const s = data.documentSentiment as { score: number; magnitude: number };
    if (s) {
      sentiment = {
        score: Math.round(s.score * 100) / 100,
        magnitude: Math.round(s.magnitude * 100) / 100,
        label: sentimentLabel(s.score),
      };
    }
  }

  // --- Categories (optional, fails on short text) ---
  let categories: NLCategory[] = [];
  if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
    const data = await categoriesRes.value.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categories = ((data.categories as any[]) || [])
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
      .map((c) => ({
        name: c.name as string,
        confidence: Math.round((c.confidence as number) * 100) / 100,
      }));
  }

  // Detect language from entities response if available
  let detectedLanguage = "en";
  if (entitiesRes.status === "fulfilled" && entitiesRes.value.ok) {
    try {
      // The analyzeEntities response includes language in some versions
      // We'll use the document language from sentiment as fallback
    } catch {
      // ignore
    }
  }
  if (sentimentRes.status === "fulfilled" && sentimentRes.value.ok) {
    try {
      const data = await sentimentRes.value.clone().json().catch(() => ({}));
      if (data.language) detectedLanguage = data.language as string;
    } catch {
      // ignore
    }
  }

  return { entities, categories, sentiment, detectedLanguage };
}
