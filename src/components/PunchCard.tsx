'use client';

import React from 'react';
import { Cake, Check, Gift, Sparkles } from 'lucide-react';

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
    <div className="w-full max-w-lg mx-auto">
      {/* Sleek, Sharp, Zero-Roundness Physical Punch Card Canvas */}
      <div className="bg-white border-2 border-bakery-950 p-6 sm:p-8 relative">
        
        {/* Card Header */}
        <div className="flex justify-between items-start border-b-2 border-bakery-950 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-bakery-100 border border-bakery-950 px-2 py-0.5 text-bakery-950">
                Official Card
              </span>
              {isEligibleForFreeCake && (
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-emerald-700 text-white px-2 py-0.5 flex items-center gap-1">
                  <Gift className="w-3 h-3" /> Reward Ready
                </span>
              )}
            </div>
            <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-bakery-950 leading-none">
              10 Stamps = 1 Free Cake
            </h3>
            <p className="font-sans text-xs text-bakery-700 mt-1 font-medium">
              Buy any sourdough, pastry, or loaf on your commute.
            </p>
          </div>

          <div className="w-12 h-12 border-2 border-bakery-950 bg-bakery-100 flex items-center justify-center text-bakery-950 shrink-0">
            <Cake className="w-6 h-6" />
          </div>
        </div>

        {/* 10 Stamp Punch Slots Grid - Sharp Rectangular Tiles */}
        <div className="grid grid-cols-5 gap-2.5 mb-6">
          {slots.map((slotNum) => {
            const isStamped = slotNum <= currentStamps;
            const isFinalReward = slotNum === totalSlots;

            return (
              <div
                key={slotNum}
                className={`aspect-square flex flex-col items-center justify-center p-1 border-2 transition-colors ${
                  isStamped
                    ? 'bg-bakery-950 border-bakery-950 text-white'
                    : isFinalReward
                    ? 'bg-amber-50 border-amber-900 border-dashed text-amber-950'
                    : 'bg-white border-bakery-300 text-bakery-400'
                }`}
              >
                {isStamped ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-base leading-none">🥐</span>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-tighter mt-1">
                      PUNCH #{slotNum}
                    </span>
                  </div>
                ) : isFinalReward ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Cake className="w-4 h-4 text-amber-900" />
                    <span className="font-display font-black text-[9px] uppercase tracking-wider text-amber-950 mt-1">
                      FREE CAKE
                    </span>
                  </div>
                ) : (
                  <span className="font-mono text-sm font-bold text-bakery-400">
                    {slotNum}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress & Milestone Status - Sharp Clean Grid */}
        <div className="border border-bakery-950 p-4 bg-bakery-50 mb-6">
          <div className="flex justify-between items-center font-display font-bold text-xs uppercase tracking-wider text-bakery-950 mb-2">
            <span>Stamps Progress</span>
            <span className="font-mono">{currentStamps} / 10 STAMPS</span>
          </div>

          {/* Sharp Rectangular Progress Bar */}
          <div className="w-full h-3 border border-bakery-950 bg-white p-[1px]">
            <div
              className="h-full bg-bakery-950 transition-all duration-300 ease-linear"
              style={{ width: `${Math.min(100, (currentStamps / 10) * 100)}%` }}
            />
          </div>

          <div className="mt-3 pt-3 border-t border-bakery-200 flex items-center justify-between font-mono text-[11px] text-bakery-700">
            <span>Lifetime: <strong className="text-bakery-950 font-bold">{lifetimeStamps}</strong></span>
            <span>Redeemed Cakes: <strong className="text-bakery-950 font-bold">{cakesRedeemed}</strong></span>
          </div>
        </div>

        {/* Free Cake Claim Banner - Sharp High-Contrast Container */}
        {isEligibleForFreeCake && (
          <div className="border-2 border-emerald-950 bg-emerald-900 text-white p-5 mb-4 text-center">
            <div className="font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Complimentary Cake Unlocked</span>
            </div>
            <p className="font-sans text-xs text-emerald-100 mb-4 font-medium">
              Present this card at the bakery counter to redeem your free artisan cake.
            </p>
            <button
              onClick={onRedeem}
              disabled={redeeming}
              className="w-full py-3 px-4 bg-white text-emerald-950 font-display font-black text-xs uppercase tracking-widest border border-white hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {redeeming ? 'Redeeming Cake...' : 'Redeem Free Cake Now'}
            </button>
          </div>
        )}

        {/* Cryptographic Guarantee Footer */}
        <div className="border-t border-bakery-200 pt-3 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-wider text-bakery-700 font-semibold">
          <Check className="w-3.5 h-3.5 text-emerald-700" />
          <span>Non-Fungible Stamping &bull; Zero Counterfeits</span>
        </div>
      </div>
    </div>
  );
}
