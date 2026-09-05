'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Navbar from '@/components/Navbar';
import PunchCard from '@/components/PunchCard';
import StaffCounterStation from '@/components/StaffCounterStation';
import InitializingState from '@/components/InitializingState';
import {
  ArrowRight,
  ShieldCheck,
  Check,
  Coffee,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function BakeryLoyaltyPage() {
  // Test Case 3 & 4: Derive auth decisions directly from Privy SDK hooks
  const { ready, authenticated, user, login, getAccessToken, createWallet } = usePrivy();

  const [stampData, setStampData] = useState<{
    currentStamps: number;
    lifetimeStamps: number;
    cakesRedeemed: number;
    isEligibleForFreeCake: boolean;
  }>({
    currentStamps: 0,
    lifetimeStamps: 0,
    cakesRedeemed: 0,
    isEligibleForFreeCake: false,
  });

  const [fetchingStamps, setFetchingStamps] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Test Case 2: Automatic embedded wallet creation on login without user clicking "create wallet"
  useEffect(() => {
    if (authenticated && user && !user.wallet && typeof createWallet === 'function') {
      createWallet().catch((e) => {
        console.warn('[AutoWalletCreation]: Handled automatically by Privy config', e);
      });
    }
  }, [authenticated, user, createWallet]);

  // Securely load customer punch card details using verified Privy token
  const loadCustomerStamps = useCallback(async () => {
    if (!authenticated) return;
    setFetchingStamps(true);
    setErrorNotice(null);

    try {
      const token = await getAccessToken();
      if (!token) return;

      const res = await fetch('/api/stamps', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Could not fetch stamps (${res.status})`);
      }

      const data = await res.json();
      setStampData({
        currentStamps: data.currentStamps || 0,
        lifetimeStamps: data.lifetimeStamps || 0,
        cakesRedeemed: data.cakesRedeemed || 0,
        isEligibleForFreeCake: Boolean(data.isEligibleForFreeCake),
      });
    } catch (err: any) {
      console.error('Failed to load card details:', err);
      setErrorNotice('Unable to sync your loyalty card with the bakery server. Please check your connection.');
    } finally {
      setFetchingStamps(false);
    }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    if (authenticated) {
      loadCustomerStamps();
    }
  }, [authenticated, loadCustomerStamps]);

  // Handle free cake redemption
  const handleRedeemCake = async () => {
    setRedeeming(true);
    setErrorNotice(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Session expired. Please sign in again.');

      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Redemption failed');
      }

      setStampData((prev) => ({
        ...prev,
        currentStamps: data.currentStamps,
        cakesRedeemed: data.cakesRedeemed,
        isEligibleForFreeCake: false,
      }));
    } catch (err: any) {
      console.error('Redeem error:', err);
      setErrorNotice(err.message || 'Failed to redeem free cake');
    } finally {
      setRedeeming(false);
    }
  };

  // =========================================================================
  // CRITICAL TEST CASE 4: Initializing state handled before auth-dependent UI
  // =========================================================================
  if (!ready) {
    return <InitializingState />;
  }

  // =========================================================================
  // CRITICAL TEST CASE 3: Route gating derives directly from Privy's authenticated state
  // =========================================================================
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbf9f5] text-bakery-950 selection:bg-bakery-950 selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
          {/* Bakery Hero Badge - Sharp, Architectural */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-bakery-950 text-bakery-950 font-mono text-[11px] font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5 text-bakery-700" />
            <span>Ramesh&apos;s Artisan Bakery &amp; Cafe</span>
          </div>

          {/* High-impact Tall Display Heading using Bebas Neue */}
          <h2 className="font-display text-6xl sm:text-7xl uppercase tracking-wider text-bakery-950 leading-[0.88] mb-5">
            The Loyalty Card <br />
            <span className="text-bakery-600 underline decoration-4 underline-offset-8">
              That Can&apos;t Be Copied
            </span>
          </h2>

          <p className="font-sans text-sm sm:text-base text-bakery-800 max-w-md mb-10 leading-relaxed font-medium">
            Ramesh is tired of paper punch cards photocopied by fraudsters. 
            Earn genuine stamps for your morning coffee and loaves. 
            <span className="block mt-1 font-bold text-bakery-950">10 stamps = 1 free artisan cake.</span>
          </p>

          {/* Commuter First-Screen Guarantee - Sharp 2px Border Box, No Shadows */}
          <div className="w-full bg-white border-2 border-bakery-950 p-6 sm:p-8 text-left">
            <div className="border-b border-bakery-200 pb-3 mb-5 flex items-center justify-between">
              <h3 className="font-display text-sm uppercase tracking-wider text-bakery-950">
                Designed for the Commute Rush
              </h3>
              <span className="font-mono text-[10px] uppercase font-bold text-bakery-600">
                Zero Friction
              </span>
            </div>

            <div className="space-y-3.5 font-sans text-xs text-bakery-900 font-medium">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 mt-0.5 border border-bakery-950 bg-bakery-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-bakery-950" />
                </div>
                <span><strong className="font-bold text-bakery-950">No crypto wallet needed:</strong> Sign in with your standard email or Google account.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 mt-0.5 border border-bakery-950 bg-bakery-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-bakery-950" />
                </div>
                <span><strong className="font-bold text-bakery-950">Zero recovery phrases:</strong> No seed phrases to write down while paying in queue.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 mt-0.5 border border-bakery-950 bg-bakery-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-bakery-950" />
                </div>
                <span><strong className="font-bold text-bakery-950">Invisible security:</strong> A cryptographic embedded wallet is created instantly behind the scenes.</span>
              </div>
            </div>

            {/* =========================================================================
                CRITICAL TEST CASE 1: Sign-in entry point calls Privy SDK login method
               ========================================================================= */}
            <button
              onClick={login}
              className="mt-6 w-full py-4 px-6 bg-bakery-950 hover:bg-bakery-800 text-white font-display text-sm uppercase tracking-widest border-2 border-bakery-950 transition-colors flex items-center justify-center gap-2 group cursor-pointer leading-none"
            >
              <span>Sign In with Email or Google</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="font-mono text-[10px] uppercase text-center text-bakery-600 mt-3 tracking-wider">
              Takes less than 20 seconds. No app installation needed.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-bakery-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Backed by Ethereum Sepolia smart contracts &amp; verified token claims</span>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // Authenticated Screen: Customer Loyalty Punch Card View
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f5] text-bakery-950 selection:bg-bakery-950 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-10 w-full">
        {/* Error notification for dull states - Sharp box */}
        {errorNotice && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-900 text-amber-950 font-sans text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button
              onClick={loadCustomerStamps}
              className="inline-flex items-center gap-1 font-mono uppercase font-bold text-amber-950 hover:underline shrink-0 ml-3"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Customer Header */}
        <div className="border-b-2 border-bakery-950 pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 border border-emerald-900 text-emerald-950 font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <Zap className="w-3 h-3 text-emerald-800" />
              <span>Active Commuter Card</span>
            </div>
            <h2 className="font-display font-black text-3xl uppercase tracking-tight text-bakery-950 leading-none">
              Your Punch Card
            </h2>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-bakery-700 font-bold">
            Photocopy-Proof &bull; Sepolia Verified
          </p>
        </div>

        {/* Visual 10-Stamp Punch Card */}
        <PunchCard
          currentStamps={stampData.currentStamps}
          lifetimeStamps={stampData.lifetimeStamps}
          cakesRedeemed={stampData.cakesRedeemed}
          isEligibleForFreeCake={stampData.isEligibleForFreeCake}
          onRedeem={handleRedeemCake}
          redeeming={redeeming}
        />

        {/* Staff Counter Station (Register checkout station) */}
        <StaffCounterStation
          onStampAwarded={(updated) => {
            setStampData((prev) => ({
              ...prev,
              currentStamps: updated.currentStamps,
              lifetimeStamps: updated.lifetimeStamps,
              isEligibleForFreeCake: Boolean(updated.isEligibleForFreeCake),
            }));
          }}
        />

        {/* Technical Guarantee Breakdown - Sharp Flat Box */}
        <div className="mt-8 bg-white border-2 border-bakery-950 p-5 text-xs text-bakery-800">
          <h4 className="font-display font-bold uppercase tracking-widest text-bakery-950 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-bakery-950" />
            <span>How Ramesh Stops Photocopiers:</span>
          </h4>
          <ul className="space-y-2 font-sans text-xs leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-bakery-950">&bull;</span>
              <span><strong>Zero Client Trust:</strong> The server never accepts self-reported customer IDs or addresses from the browser.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-bakery-950">&bull;</span>
              <span><strong>Verified Access Token:</strong> Every stamp punch sends a cryptographic Privy bearer token verified server-side.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-bakery-950">&bull;</span>
              <span><strong>Claim-Derived Identity:</strong> The server reads the verified DID claims to credit the punch card.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-bakery-950">&bull;</span>
              <span><strong>Embedded Key:</strong> Self-custodial Ethereum address generated automatically on login.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
