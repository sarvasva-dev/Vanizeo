'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-[100] p-8 text-center">
      <div className="glass p-12 max-w-md border-red-500/20">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">System Anomaly</h2>
        <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed">
          The VaniZero engine encountered an unexpected state. This is likely due to a network or configuration issue.
        </p>
        <button
          onClick={() => reset()}
          className="indic-gradient text-black font-black px-8 py-3 rounded-2xl flex items-center gap-2 mx-auto"
        >
          <RefreshCcw className="w-4 h-4" />
          Reboot System
        </button>
      </div>
    </div>
  );
}
