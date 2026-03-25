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

// ── Mock Data (for when no API keys are configured) ──
function generateMockData(
  input: GenerateInput
): InvoiceOutput | ProposalOutput {
  if (input.document_type === "invoice") {
    return {
      client_name: "Sample Client",
      client_company: "Sample Company Pvt Ltd",
      services: ["Professional Services"],
      line_items: [
        {
          description: "Professional Service Delivery",
          details: "As discussed and agreed upon",
          quantity: 1,
          rate: 25000,
          amount: 25000,
        },
      ],
      subtotal: 25000,
      gst_rate: 18,
      gst_amount: 4500,
      total: 29500,
      advance_paid: 0,
      balance_due: 29500,
      payment_terms: "Due on receipt",
      notes:
        "Thank you for your business. Please connect your AI API key (Gemini or Groq) for real AI-powered generation.",
    } satisfies InvoiceOutput;
  }

  return {
    client_name: "Sample Client",
    client_company: "Sample Company Pvt Ltd",
    project_title: "Professional Project Proposal",
    professional_intro:
      "Thank you for considering our services. We are excited about the opportunity to work together on this project.",
    scope_description:
      "This proposal outlines our approach to delivering a comprehensive solution tailored to your needs. Please connect your AI API key for real AI-powered generation.",
    deliverables: [
      "Complete project delivery",
      "Documentation",
      "Post-delivery support",
    ],
    timeline: [
      {
        phase: "Phase 1",
        duration: "1-2 weeks",
        description: "Planning and initial development",
      },
      {
        phase: "Phase 2",
        duration: "2-3 weeks",
        description: "Core development and delivery",
      },
    ],
    line_items: [
      {
        description: "Project Development",
        quantity: 1,
        rate: 50000,
        amount: 50000,
      },
    ],
    subtotal: 50000,
    gst_rate: 18,
    gst_amount: 9000,
    total: 59000,
    payment_terms: "50% advance, 50% on delivery",
    validity: "15 days",
    terms_and_conditions: [
      "Revision rounds as specified in scope",
      "Additional work billed separately",
      "Payment via bank transfer or UPI",
    ],
  } satisfies ProposalOutput;
}
