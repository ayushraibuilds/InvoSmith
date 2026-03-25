"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, ArrowLeft } from "lucide-react";

export default function GenerateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Generate error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-3">
          Generation failed
        </h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          {error.message ||
            "Something went wrong with the AI generation. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-primary flex items-center gap-2 text-sm !py-2.5 !px-5"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="btn-secondary flex items-center gap-2 text-sm !py-2.5 !px-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
