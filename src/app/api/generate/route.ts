import { NextRequest, NextResponse } from "next/server";
import { generateDocument } from "@/lib/ai/generate";
import { generateInputSchema } from "@/lib/ai/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = generateInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // TODO: Check subscription limits when Supabase is connected
    // For now, generate without limits

    // Generate document
    const { data, provider } = await generateDocument(
      input,
      body.business_name,
      body.gstin
    );

    return NextResponse.json({
      success: true,
      data,
      provider,
      document_type: input.document_type,
      service_category: input.service_category,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate document. Please try again." },
      { status: 500 }
    );
  }
}
