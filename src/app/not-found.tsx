import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
        <FileQuestion className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-4">404 - Not Found</h1>
      <p className="text-gray-400 max-w-md mx-auto mb-8">
        The document or page you are looking for does not exist or has been removed.
      </p>
      <Link href="/" className="btn-primary">
        Return Home
      </Link>
    </div>
  );
}
