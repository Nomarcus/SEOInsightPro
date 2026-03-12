import type { PageSpeedResult, LighthouseData, MetricResult, Opportunity } from "./types";

const PAGESPEED_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

function getRating(value: number, good: number, poor: number): MetricResult["rating"] {
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

async function fetchLighthouse(
  url: string,
  strategy: "mobile" | "desktop",
  apiKey?: string
): Promise<LighthouseData> {
  const params = new URLSearchParams({
    url,
    strategy,
    category: "performance",
    ...(apiKey ? { key: apiKey } : {}),
  });

  // Add additional categories
  ["accessibility", "best-practices", "seo"].forEach((cat) => {
    params.append("category", cat);
  });

  const response = await fetch(`${PAGESPEED_API_URL}?${params}`, {
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    throw new Error(`PageSpeed API error: ${response.status}`);
  }

  const data = await response.json();
  const lighthouse = data.lighthouseResult;

  if (!lighthouse) {
    throw new Error("No lighthouse result in response");
  }

  const categories = lighthouse.categories || {};
  const audits = lighthouse.audits || {};

  // Extract Core Web Vitals
  const lcpValue = audits["largest-contentful-paint"]?.numericValue || 0;
  const clsValue = audits["cumulative-layout-shift"]?.numericValue || 0;
  const inpValue = audits["interaction-to-next-paint"]?.numericValue ||
                   audits["total-blocking-time"]?.numericValue || 0;
  const fcpValue = audits["first-contentful-paint"]?.numericValue || 0;

  const coreWebVitals = {
    lcp: {
      value: lcpValue,
      rating: getRating(lcpValue, 2500, 4000),
      displayValue: audits["largest-contentful-paint"]?.displayValue || `${(lcpValue / 1000).toFixed(1)}s`,
    } as MetricResult,
    cls: {
      value: clsValue,
      rating: getRating(clsValue, 0.1, 0.25),
      displayValue: audits["cumulative-layout-shift"]?.displayValue || clsValue.toFixed(3),
    } as MetricResult,
    inp: {
      value: inpValue,
      rating: getRating(inpValue, 200, 500),
      displayValue: audits["interaction-to-next-paint"]?.displayValue ||
                     audits["total-blocking-time"]?.displayValue || `${Math.round(inpValue)}ms`,
    } as MetricResult,
    fcp: {
      value: fcpValue,
      rating: getRating(fcpValue, 1800, 3000),
      displayValue: audits["first-contentful-paint"]?.displayValue || `${(fcpValue / 1000).toFixed(1)}s`,
    } as MetricResult,
  };

  // Extract opportunities
  const opportunities: Opportunity[] = [];
  const performanceAudits = lighthouse.categories?.performance?.auditRefs || [];
  for (const ref of performanceAudits) {
    const audit = audits[ref.id];
    if (audit && audit.score !== null && audit.score < 1 && audit.details?.overallSavingsMs) {
      opportunities.push({
        id: ref.id,
        title: audit.title || ref.id,
        description: audit.description || "",
        savingsMs: audit.details.overallSavingsMs,
        savingsBytes: audit.details.overallSavingsBytes,
      });
    }
  }

  return {
    scores: {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories["best-practices"]?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
    },
    coreWebVitals,
    opportunities: opportunities.sort((a, b) => (b.savingsMs || 0) - (a.savingsMs || 0)).slice(0, 10),
  };
}

export async function getPageSpeed(
  url: string,
  apiKey?: string
): Promise<PageSpeedResult> {
  const [mobile, desktop] = await Promise.all([
    fetchLighthouse(url, "mobile", apiKey),
    fetchLighthouse(url, "desktop", apiKey),
  ]);

  return { mobile, desktop };
}
