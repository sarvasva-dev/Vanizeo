'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-[100]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-indic-gold animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indic-gold">Booting VaniZero...</p>
      </div>
    </div>
  );
}
