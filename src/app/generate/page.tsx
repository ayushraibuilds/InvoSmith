"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Zap,
  Download,
  Mail,
  ArrowLeft,
  Loader2,
  Sparkles,
  RotateCcw,
  Palette,
  Code,
  Briefcase,
  Camera,
  PenTool,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceOutput, ProposalOutput } from "@/lib/ai/schema";

const CATEGORIES = [
  { value: "designer", label: "Designer", icon: Palette },
  { value: "developer", label: "Developer", icon: Code },
  { value: "consultant", label: "Consultant", icon: Briefcase },
  { value: "photographer", label: "Photographer", icon: Camera },
  { value: "writer", label: "Writer", icon: PenTool },
] as const;

const EXAMPLE_INPUTS = {
  designer:
    'Ananya ke liye brand identity banaya — logo, business card, letterhead, social media kit. 3 revision rounds, final files in AI + PNG. Total 35k, 15k advance paid.',
  developer:
    'Rohit ke liye e-commerce website — 5 pages, payment gateway integration, admin panel, responsive design. React + Node.js. 80k total, 50% advance.',
  consultant:
    'Priya ki company ke liye digital strategy consultation — 2 workshops, competitor analysis, 3-month roadmap. 60k for the entire project.',
  photographer:
    'Raj ki wedding photography — pre-wedding shoot + 2 day wedding coverage, 500 edited photos, album design. 1.2 lakh total, 50k booking advance.',
  writer:
    'SaaS startup ke liye content — 10 blog posts (1500 words each), 5 landing page copies, SEO optimization. 45k total, monthly retainer.',
};

export default function GeneratePage() {
  const [inputText, setInputText] = useState("");
  const [documentType, setDocumentType] = useState<"invoice" | "proposal">("invoice");
  const [serviceCategory, setServiceCategory] = useState<string>("developer");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    data: InvoiceOutput | ProposalOutput;
    provider: string;
    document_type: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please describe your project or service");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_text: inputText,
          document_type: documentType,
          service_category: serviceCategory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const loadExample = () => {
    setInputText(EXAMPLE_INPUTS[serviceCategory as keyof typeof EXAMPLE_INPUTS] || EXAMPLE_INPUTS.developer);
  };

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Header */}
      <nav className="border-b border-white/5 bg-dark-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Bill<span className="gradient-text">Craft</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {!result ? (
          /* ── Input Form ── */
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-3">
                Generate your{" "}
                <span className="gradient-text">
                  {documentType === "invoice" ? "invoice" : "proposal"}
                </span>
              </h1>
              <p className="text-gray-400">
                Describe your project in any language — we&apos;ll handle the rest
              </p>
            </div>

            {/* Document Type Toggle */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {(["invoice", "proposal"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setDocumentType(type)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize",
                    documentType === type
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Service Category */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Service Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setServiceCategory(cat.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all",
                      serviceCategory === cat.value
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10"
                    )}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Description
                </label>
                <button
                  onClick={loadExample}
                  className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Load example →
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setError(null);
                }}
                placeholder={`Describe your project here...\n\nExample: "Rohit ke liye website banaya — 3 pages, design + dev, 2 rounds revisions, 45k total, 50% advance already paid"`}
                className="w-full h-44 bg-dark-700 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-600">
                  {inputText.length}/5000 characters
                </span>
                {error && (
                  <span className="text-xs text-red-400">{error}</span>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
              className={cn(
                "w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 transition-all",
                isGenerating
                  ? "bg-amber-500/20 text-amber-400 cursor-wait"
                  : "btn-primary"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI is generating your {documentType}...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate {documentType === "invoice" ? "Invoice" : "Proposal"}
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-600 mt-4">
              Free tier: 3 documents/month · No signup required for demo
            </p>
          </div>
        ) : (
          /* ── Result Preview ── */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {result.document_type === "invoice"
                    ? "Invoice Preview"
                    : "Proposal Preview"}
                </h2>
                <p className="text-sm text-gray-500">
                  Generated via{" "}
                  <span className="text-amber-400 capitalize">
                    {result.provider}
                  </span>{" "}
                  AI
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="btn-secondary flex items-center gap-2 text-sm !py-2.5 !px-4"
                >
                  <RotateCcw className="w-4 h-4" />
                  New
                </button>
                <button className="btn-secondary flex items-center gap-2 text-sm !py-2.5 !px-4">
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button className="btn-primary flex items-center gap-2 text-sm !py-2.5 !px-4">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Preview Card */}
            <div className="glass-card p-8 max-w-3xl mx-auto">
              {result.document_type === "invoice" ? (
                <InvoicePreview data={result.data as InvoiceOutput} />
              ) : (
                <ProposalPreview data={result.data as ProposalOutput} />
              )}
            </div>

            {result.provider === "mock" && (
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-3xl mx-auto">
                <p className="text-sm text-amber-400 text-center">
                  ⚡ This is demo data. Connect your Gemini or Groq API key in{" "}
                  <code className="bg-amber-500/20 px-1.5 py-0.5 rounded text-xs">.env.local</code>{" "}
                  for real AI-powered generation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

/* ── Invoice Preview Component ── */
function InvoicePreview({ data }: { data: InvoiceOutput }) {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">INVOICE</h3>
          <p className="text-sm text-gray-500">Your Business Name</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-amber-500/15 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-2">
            DRAFT
          </span>
        </div>
      </div>

      {/* Bill To */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Bill To
          </p>
          <p className="text-sm font-semibold text-white">{data.client_name}</p>
          {data.client_company && (
            <p className="text-sm text-gray-400">{data.client_company}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Payment Terms
          </p>
          <p className="text-sm text-gray-300">{data.payment_terms}</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">
                Description
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">
                Qty
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">
                Rate
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {data.line_items.map((item, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-3">
                  <p className="text-sm text-white">{item.description}</p>
                  {item.details && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.details}
                    </p>
                  )}
                </td>
                <td className="text-right text-sm text-gray-400 py-3">
                  {item.quantity}
                </td>
                <td className="text-right text-sm text-gray-400 py-3">
                  {formatCurrency(item.rate)}
                </td>
                <td className="text-right text-sm text-white font-medium py-3">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t border-white/10 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-white">{formatCurrency(data.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">GST ({data.gst_rate}%)</span>
          <span className="text-white">{formatCurrency(data.gst_amount)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-2">
          <span className="text-white">Total</span>
          <span className="text-white">{formatCurrency(data.total)}</span>
        </div>
        {data.advance_paid > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Advance Paid</span>
            <span className="text-emerald-500">
              -{formatCurrency(data.advance_paid)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold bg-amber-500/10 rounded-xl px-4 py-3 mt-2">
          <span className="text-white">Balance Due</span>
          <span className="text-amber-400">
            {formatCurrency(data.balance_due)}
          </span>
        </div>
      </div>

      {data.notes && (
        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Notes
          </p>
          <p className="text-sm text-gray-400">{data.notes}</p>
        </div>
      )}
    </div>
  );
}

/* ── Proposal Preview Component ── */
function ProposalPreview({ data }: { data: ProposalOutput }) {
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b border-white/10">
        <span className="inline-block bg-amber-500/15 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          PROJECT PROPOSAL
        </span>
        <h3 className="text-xl font-bold text-white mb-2">
          {data.project_title}
        </h3>
        <p className="text-sm text-gray-400">
          Prepared for {data.client_name}
          {data.client_company && `, ${data.client_company}`}
        </p>
      </div>

      {/* Intro */}
      <div className="mb-8">
        <p className="text-sm text-gray-300 leading-relaxed">
          {data.professional_intro}
        </p>
      </div>

      {/* Scope */}
      <div className="mb-8">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Scope of Work
        </h4>
        <p className="text-sm text-gray-300 leading-relaxed">
          {data.scope_description}
        </p>
      </div>

      {/* Deliverables */}
      <div className="mb-8">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Deliverables
        </h4>
        <div className="space-y-2">
          {data.deliverables.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {data.timeline.length > 0 && (
        <div className="mb-8">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Timeline
          </h4>
          <div className="space-y-2">
            {data.timeline.map((phase, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white/[0.02] rounded-xl px-4 py-3"
              >
                <span className="text-xs font-medium text-amber-400 min-w-[80px]">
                  {phase.duration}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    {phase.phase}
                  </p>
                  <p className="text-xs text-gray-500">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div className="mb-8">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Investment
        </h4>
        <div className="space-y-2 mb-4">
          {data.line_items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-300">{item.description}</span>
              <span className="text-white font-medium">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">{formatCurrency(data.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">GST ({data.gst_rate}%)</span>
            <span className="text-white">
              {formatCurrency(data.gst_amount)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold bg-amber-500/10 rounded-xl px-4 py-3 mt-2">
            <span className="text-white">Total Investment</span>
            <span className="text-amber-400">{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Payment Terms
        </h4>
        <p className="text-sm text-gray-300">{data.payment_terms}</p>
      </div>

      {/* T&C */}
      {data.terms_and_conditions.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Terms & Conditions
          </h4>
          <ol className="space-y-1.5 list-decimal list-inside">
            {data.terms_and_conditions.map((term, i) => (
              <li key={i} className="text-xs text-gray-500">
                {term}
              </li>
            ))}
          </ol>
          <p className="text-xs text-gray-600 mt-4">
            This proposal is valid for {data.validity}.
          </p>
        </div>
      )}
    </div>
  );
}
