'use client';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 1. Report to Sentry
    Sentry.captureException(error);

    // 2. Report to backend client logs API
    const reportCrash = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        await fetch(`${apiUrl}/logs/client`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'error',
            message: `Next.js client crash: ${error.message}`,
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            stack: error.stack,
          }),
        });
      } catch (err) {
        console.warn('Failed to send crash logs to backend', err);
      }
    };
    reportCrash();
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-32 px-4 bg-background text-foreground min-h-[70vh]">
      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-700 mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-serif tracking-widest text-gold-primary mb-4 uppercase">
        Something went wrong
      </h1>
      
      <p className="text-zinc-500 text-xs mb-8 max-w-sm text-center leading-relaxed">
        An unexpected error occurred. The system has automatically logged the crash report for review.
      </p>

      <div className="flex space-x-4">
        <button
          onClick={reset}
          className="inline-flex items-center space-x-2 border border-gold-primary/30 hover:border-gold-primary text-cream hover:text-gold-primary px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        <a
          href="/"
          className="inline-flex items-center space-x-2 gold-gradient text-black px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest transition-all hover:scale-105"
        >
          <span>Return Home</span>
        </a>
      </div>
    </div>
  );
}
