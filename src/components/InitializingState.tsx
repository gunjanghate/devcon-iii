'use client';

import React from 'react';
import { Loader2, UtensilsCrossed } from 'lucide-react';

export default function InitializingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbf9f5] px-6">
      <div className="bg-white p-8 border-2 border-bakery-950 text-center max-w-sm w-full flex flex-col items-center">
        <div className="w-14 h-14 bg-bakery-950 text-white flex items-center justify-center mb-5 border border-bakery-950">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <h2 className="font-display font-black text-xl uppercase tracking-tight text-bakery-950 mb-2">
          Warming the Ovens
        </h2>
        <p className="font-sans text-xs text-bakery-700 mb-6 font-medium">
          Initializing Ramesh&apos;s Bakery secure punch card system...
        </p>
        <div className="flex items-center gap-2 text-bakery-950 font-mono font-bold text-xs uppercase tracking-wider">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Setting up loyalty service...</span>
        </div>
      </div>
    </div>
  );
}
