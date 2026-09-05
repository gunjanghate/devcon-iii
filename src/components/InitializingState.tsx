'use client';

import React from 'react';
import { Loader2, UtensilsCrossed } from 'lucide-react';

export default function InitializingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bakery-50 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-bakery-200 text-center max-w-sm w-full flex flex-col items-center">
        <div className="w-16 h-16 bg-bakery-100 rounded-full flex items-center justify-center text-bakery-600 mb-4 animate-bounce">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-bakery-900 mb-2">
          Warming the Ovens...
        </h2>
        <p className="text-sm text-bakery-700 mb-6">
          Initializing Ramesh&apos;s Bakery secure punch card system
        </p>
        <div className="flex items-center gap-2 text-bakery-600 font-medium text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Setting up loyalty service...</span>
        </div>
      </div>
    </div>
  );
}
