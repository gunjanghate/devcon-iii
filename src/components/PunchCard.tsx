'use client';

import React from 'react';
import { Cake, Sparkles, CheckCircle2, Award, Gift, PartyPopper } from 'lucide-react';

interface PunchCardProps {
  currentStamps: number;
  lifetimeStamps: number;
  cakesRedeemed: number;
  isEligibleForFreeCake: boolean;
  onRedeem: () => void;
  redeeming: boolean;
}

export default function PunchCard({
  currentStamps,
  lifetimeStamps,
  cakesRedeemed,
  isEligibleForFreeCake,
  onRedeem,
  redeeming,
}: PunchCardProps) {
  const totalSlots = 10;
  const slots = Array.from({ length: totalSlots }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Physical-style Bakery Punch Card Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fdfbf7] to-[#f4ebe1] border-2 border-dashed border-bakery-400 p-6 shadow-2xl transition-all duration-300">
        
        {/* Subtle Watermark Stamp */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border-4 border-bakery-300/30 flex items-center justify-center rotate-12 pointer-events-none">
          <span className="text-bakery-400/20 font-black text-2xl uppercase tracking-widest text-center">
            Ramesh&apos;s<br/>Artisan<br/>Verified
          </span>
        </div>

        {/* Card Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-bakery-700 bg-bakery-100 px-2.5 py-1 rounded-md">
                Official Punch Card
              </span>
              {isEligibleForFreeCake && (
                <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md animate-pulse">
                  <Gift className="w-3.5 h-3.5" /> Cake Ready!
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-bakery-950 mt-2 tracking-tight">
              10 Stamps = 1 Free Cake
            </h3>
            <p className="text-xs text-bakery-700 font-medium">
              Buy any sourdough, pastry or loaf on your commute.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-inner">
            <Cake className="w-7 h-7" />
          </div>
        </div>

        {/* 10 Stamp Punch Slots Grid */}
        <div className="grid grid-cols-5 gap-3 mb-6 relative z-10">
          {slots.map((slotNum) => {
            const isStamped = slotNum <= currentStamps;
            const isFinalReward = slotNum === totalSlots;

            return (
              <div
                key={slotNum}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                  isStamped
                    ? 'bg-gradient-to-br from-amber-600 to-bakery-700 text-white shadow-md transform scale-100 ring-2 ring-bakery-400 ring-offset-2'
                    : isFinalReward
                    ? 'bg-amber-100/70 border-2 border-dashed border-amber-500 text-amber-800'
                    : 'bg-white/70 border-2 border-dashed border-bakery-300 text-bakery-400'
                }`}
              >
                {isStamped ? (
                  <div className="flex flex-col items-center justify-center animate-in zoom-in duration-200">
                    <span className="text-lg">🥐</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-90">
                      Stamped
                    </span>
                  </div>
                ) : isFinalReward ? (
                  <div className="flex flex-col items-center justify-center text-center p-1">
                    <Cake className="w-4 h-4 text-amber-600 animate-bounce" />
                    <span className="text-[9px] font-black uppercase text-amber-700 leading-tight mt-0.5">
                      FREE
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-bakery-500">
                    {slotNum}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress & Milestone Status */}
        <div className="bg-white/90 rounded-2xl p-4 border border-bakery-200 shadow-sm mb-4">
          <div className="flex justify-between items-center text-xs font-bold text-bakery-800 mb-1.5">
            <span>Progress to Free Cake</span>
            <span>{currentStamps} / 10 Stamps</span>
          </div>
          <div className="w-full h-3 bg-bakery-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-bakery-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, (currentStamps / 10) * 100)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-bakery-700 font-medium">
            <span>Lifetime stamps: <strong className="text-bakery-900">{lifetimeStamps}</strong></span>
            <span>Cakes enjoyed: <strong className="text-bakery-900">{cakesRedeemed}</strong></span>
          </div>
        </div>

        {/* Free Cake Claim Banner */}
        {isEligibleForFreeCake && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 text-white text-center shadow-lg shadow-emerald-500/20 mb-2 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-center gap-2 font-black text-base mb-1">
              <PartyPopper className="w-5 h-5" />
              <span>You Earned a Free Cake!</span>
            </div>
            <p className="text-xs text-emerald-100 mb-3">
              Present this to the counter staff to redeem your complimentary artisan cake.
            </p>
            <button
              onClick={onRedeem}
              disabled={redeeming}
              className="w-full py-2.5 px-4 bg-white text-emerald-800 font-bold rounded-xl shadow-md hover:bg-emerald-50 active:scale-95 transition disabled:opacity-50 text-sm"
            >
              {redeeming ? 'Redeeming Reward...' : 'Claim Free Cake Now'}
            </button>
          </div>
        )}

        {/* Anti-Counterfeit Guarantee Tag */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-bakery-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cryptographically signed &amp; verified. Photocopy-proof.</span>
        </div>
      </div>
    </div>
  );
}
