import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <nav className="border-b border-white/5 bg-dark-900/80 sticky top-0 z-50 h-[73px]"></nav>
      <div className="mx-auto max-w-6xl px-6 py-10 w-full flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-amber-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium">Loading Dashboard...</span>
        </div>
      </div>
    </div>
  );
}
