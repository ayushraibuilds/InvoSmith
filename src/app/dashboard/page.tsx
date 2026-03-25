"use client";

import Link from "next/link";
import {
  FileText,
  Zap,
  Plus,
  Search,
  TrendingUp,
  Clock,
  IndianRupee,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Mock data for demo
const MOCK_DOCUMENTS = [
  {
    id: "1",
    type: "invoice",
    client_name: "Rohit Sharma",
    document_number: "INV-2026-001",
    amount: 45000,
    status: "sent",
    created_at: "2026-03-24",
  },
  {
    id: "2",
    type: "proposal",
    client_name: "Priya Kapoor",
    document_number: "PROP-2026-001",
    amount: 120000,
    status: "draft",
    created_at: "2026-03-23",
  },
  {
    id: "3",
    type: "invoice",
    client_name: "Ankit Tech Solutions",
    document_number: "INV-2026-002",
    amount: 80000,
    status: "paid",
    created_at: "2026-03-20",
  },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/15 text-gray-400",
  sent: "bg-blue-500/15 text-blue-400",
  paid: "bg-emerald-500/15 text-emerald-400",
  overdue: "bg-red-500/15 text-red-400",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Header */}
      <nav className="border-b border-white/5 bg-dark-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Bill<span className="gradient-text">Craft</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/settings" className="text-sm text-gray-400 hover:text-white transition-colors">
              Settings
            </Link>
            <Link
              href="/generate"
              className="btn-primary flex items-center gap-2 text-sm !py-2.5 !px-4"
            >
              <Plus className="w-4 h-4" />
              New Document
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">Your documents and billing overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Documents This Month", value: "2", icon: FileText, sub: "of 3 free" },
            { label: "Total Billed", value: formatCurrency(245000), icon: IndianRupee, sub: "all time" },
            { label: "Avg. Generation Time", value: "~8s", icon: Clock, sub: "per document" },
            { label: "Conversion Rate", value: "67%", icon: TrendingUp, sub: "proposals → invoices" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-gray-500">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-amber-500/60" />
              </div>
              <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
              <span className="text-xs text-gray-600">{stat.sub}</span>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500/60" />
            Recent Documents
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 w-56 focus:outline-none focus:border-amber-500/30"
            />
          </div>
        </div>

        <div className="space-y-3">
          {MOCK_DOCUMENTS.map((doc) => (
            <div
              key={doc.id}
              className="glass-card glass-card-hover p-5 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white">
                      {doc.client_name}
                    </span>
                    <span className="text-xs text-gray-600">
                      {doc.document_number}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 capitalize">
                      {doc.type}
                    </span>
                    <span className="text-xs text-gray-700">·</span>
                    <span className="text-xs text-gray-500">
                      {doc.created_at}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(doc.amount)}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[doc.status]}`}
                >
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state CTA */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-600 mb-3">
            Create your first real document to see it here
          </p>
          <Link
            href="/generate"
            className="btn-primary inline-flex items-center gap-2 text-sm !py-2.5"
          >
            <Zap className="w-4 h-4" />
            Generate Document
          </Link>
        </div>
      </div>
    </main>
  );
}
