import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import {
  invoiceOutputSchema,
  proposalOutputSchema,
  type InvoiceOutput,
  type ProposalOutput,
  type GenerateInput,
} from "./schema";

// ── Gemini Client ──
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "placeholder") return null;
  return new GoogleGenerativeAI(apiKey);
}

// ── Groq Client ──
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "placeholder") return null;
  return new Groq({ apiKey });
}

// ── Generate with Gemini ──
async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const client = getGeminiClient();
  if (!client) throw new Error("GEMINI_NOT_CONFIGURED");

  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-preview-05-20",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "model", parts: [{ text: systemPrompt }] },
  });

  const text = result.response.text();
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

// ── Generate with Groq ──
async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const client = getGroqClient();
  if (!client) throw new Error("GROQ_NOT_CONFIGURED");

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");
  return text;
}

// ── Main Generate Function (with auto-fallback) ──
export async function generateDocument(
  input: GenerateInput,
  businessName?: string,
  gstin?: string
): Promise<{
  data: InvoiceOutput | ProposalOutput;
  provider: "gemini" | "groq" | "mock";
}> {
  const systemPrompt = buildSystemPrompt(
    input.service_category,
    input.document_type,
    businessName,
    gstin
  );
  const userPrompt = buildUserPrompt(input.input_text);

  // Try Gemini first, then Groq
  const providers = [
    { name: "gemini" as const, fn: () => generateWithGemini(systemPrompt, userPrompt) },
    { name: "groq" as const, fn: () => generateWithGroq(systemPrompt, userPrompt) },
  ];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const rawJson = await provider.fn();
      const parsed = JSON.parse(rawJson);

      // Validate with Zod
      const schema =
        input.document_type === "invoice"
          ? invoiceOutputSchema
          : proposalOutputSchema;

      const validated = schema.parse(parsed);
      return { data: validated, provider: provider.name };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // If not a config error, log and try next provider
      if (
        lastError.message !== "GEMINI_NOT_CONFIGURED" &&
        lastError.message !== "GROQ_NOT_CONFIGURED"
      ) {
        console.error(`${provider.name} failed:`, lastError.message);
      }
      continue;
    }
  }

  // If all providers fail, use mock data for demo
  console.warn("All AI providers failed, using mock data");
  return {
    data: generateMockData(input),
    provider: "mock",
  };
}

// ── Extract basic info from user input for smarter mock ──
function parseInputBasics(text: string) {
  // Extract client name: "Rohit ke liye" or "for Rohit" or "Priya ki company"
  const namePatterns = [
    /(\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+ke?\s+liye/i,
    /for\s+(\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
    /(\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+ki?\s+/i,
  ];
  let clientName = "Your Client";
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match?.[1] && match[1].length > 2) {
      clientName = match[1];
      break;
    }
  }

  // Extract amounts: "45k", "45000", "1.2 lakh", "₹80,000"
  const amounts: number[] = [];
  const amountPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:lakh|lac)/gi,
    /(\d+(?:\.\d+)?)\s*k\b/gi,
    /₹?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/g,
  ];
  const multipliers = [100000, 1000, 1];
  amountPatterns.forEach((pattern, idx) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const num = parseFloat(match[1].replace(/,/g, "")) * multipliers[idx];
      if (num >= 100 && num <= 100000000) amounts.push(num);
    }
  });

  const total = amounts.length > 0 ? Math.max(...amounts) : 25000;

  // Extract advance: "advance paid", "booking advance"
  let advancePaid = 0;
  const advanceMatch = text.match(/(\d+)\s*%\s*advance/i);
  if (advanceMatch) {
    advancePaid = Math.round(total * parseInt(advanceMatch[1]) / 100);
  } else if (amounts.length > 1) {
    // Second amount might be advance
    const possibleAdvance = Math.min(...amounts);
    if (possibleAdvance < total) advancePaid = possibleAdvance;
  }

  return { clientName, total, advancePaid };
}

// ── Mock Data (for when no API keys are configured) ──
function generateMockData(
  input: GenerateInput
): InvoiceOutput | ProposalOutput {
  const { clientName, total, advancePaid } = parseInputBasics(input.input_text);
  const gstAmount = Math.round(total * 0.18);
  const grandTotal = total + gstAmount;
  const balanceDue = grandTotal - advancePaid;

  const categoryLabels: Record<string, string> = {
    designer: "Design Services",
    developer: "Development Services",
    consultant: "Consulting Services",
    photographer: "Photography Services",
    writer: "Content Writing Services",
  };
  const serviceLabel = categoryLabels[input.service_category] || "Professional Services";

  if (input.document_type === "invoice") {
    return {
      client_name: clientName,
      client_company: "",
      services: [serviceLabel],
      line_items: [
        {
          description: serviceLabel,
          details: "As per project scope discussed",
          quantity: 1,
          rate: total,
          amount: total,
        },
      ],
      subtotal: total,
      gst_rate: 18,
      gst_amount: gstAmount,
      total: grandTotal,
      advance_paid: advancePaid,
      balance_due: balanceDue,
      payment_terms: "Due on receipt",
      notes:
        "⚡ This is demo data — connect your Gemini or Groq API key for AI-powered generation that structures your actual project details.",
    } satisfies InvoiceOutput;
  }

  return {
    client_name: clientName,
    client_company: "",
    project_title: `${serviceLabel} Proposal`,
    professional_intro:
      `Thank you for considering our ${serviceLabel.toLowerCase()}. We look forward to delivering a solution tailored to your needs.`,
    scope_description:
      "This proposal covers the full project scope as discussed. Connect your AI API key for a detailed scope breakdown from your project description.",
    deliverables: [
      "Complete project delivery as specified",
      "All source files and documentation",
      "Post-delivery support (1 round of revisions)",
    ],
    timeline: [
      { phase: "Phase 1 — Planning", duration: "1 week", description: "Requirements finalization and planning" },
      { phase: "Phase 2 — Execution", duration: "2-3 weeks", description: "Core work and delivery" },
    ],
    line_items: [
      { description: serviceLabel, quantity: 1, rate: total, amount: total },
    ],
    subtotal: total,
    gst_rate: 18,
    gst_amount: gstAmount,
    total: grandTotal,
    payment_terms: "50% advance, 50% on delivery",
    validity: "15 days",
    terms_and_conditions: [
      "Revision rounds as specified in scope",
      "Additional work billed separately",
      "Payment via bank transfer or UPI",
    ],
  } satisfies ProposalOutput;
}
