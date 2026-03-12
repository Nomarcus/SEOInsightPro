import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSolution } from "@/lib/solve-generator";

const requestSchema = z.object({
  stepText: z.string().min(1),
  issueTitle: z.string().min(1),
  issueCategory: z.string().min(1),
  pageUrl: z.string().min(1),
  pageTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  bodyTextExcerpt: z.string(),
  headings: z.array(
    z.object({
      tag: z.string(),
      text: z.string(),
    })
  ),
  language: z.string().nullable(),
  structuredData: z.array(z.unknown()),
  authorName: z.string().optional(),
  wordCount: z.number(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);

    const result = await generateSolution({
      ...parsed,
      structuredData: parsed.structuredData as object[],
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Solution generation failed";
    console.error("Solve error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
