import { NextRequest, NextResponse } from "next/server";
import { generateDocument } from "@/lib/ai/generate";
import { generateInputSchema } from "@/lib/ai/schema";
import { calculateGST, isInterStateTransaction } from "@/lib/gst";
import { rateLimit } from "@/lib/rate-limit";
import type { InvoiceOutput, ProposalOutput } from "@/lib/ai/schema";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 requests/minute per IP
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

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

    // Generate document via AI
    const { data, provider } = await generateDocument(
      input,
      body.business_name,
      body.gstin
    );

    // Post-process: Apply proper GST calculation if GSTIN info available
    const sellerGstin = body.gstin as string | undefined;
    const buyerGstin = (data as InvoiceOutput).client_email; // placeholder
    const isInterState = isInterStateTransaction(sellerGstin, buyerGstin);
    const gstBreakdown = calculateGST(data.subtotal, isInterState);

    // Override AI's GST with accurate calculation
    const correctedData = {
      ...data,
      gst_rate: gstBreakdown.gstRate,
      gst_amount: gstBreakdown.totalGst,
      total: gstBreakdown.grandTotal,
    };

    // For invoices, recalculate balance_due
    if (input.document_type === "invoice") {
      const invoiceData = correctedData as InvoiceOutput;
      (correctedData as InvoiceOutput).balance_due =
        gstBreakdown.grandTotal - (invoiceData.advance_paid || 0);
      // Add CGST/SGST/IGST breakdown
      (correctedData as InvoiceOutput).cgst_amount = gstBreakdown.cgst;
      (correctedData as InvoiceOutput).sgst_amount = gstBreakdown.sgst;
      (correctedData as InvoiceOutput).igst_amount = gstBreakdown.igst;
    }

    return NextResponse.json({
      success: true,
      data: correctedData,
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
