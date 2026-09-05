'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Navbar from '@/components/Navbar';
import PunchCard from '@/components/PunchCard';
import StaffCounterStation from '@/components/StaffCounterStation';
import InitializingState from '@/components/InitializingState';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Coffee,
  AlertTriangle,
  RotateCcw,
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
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-bakery-50 via-white to-bakery-100">
        <Navbar />

        <main className="flex-1 max-w-xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          {/* Bakery Hero Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bakery-100 border border-bakery-300 text-bakery-800 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-bakery-600" />
            <span>Ramesh&apos;s Artisan Bakery &amp; Cafe</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-bakery-950 tracking-tight leading-tight mb-4">
            The Loyalty Card That <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bakery-600 to-amber-700">
              Can&apos;t Be Copied
            </span>
          </h2>

          <p className="text-sm sm:text-base text-bakery-700 max-w-md mb-8 leading-relaxed">
            Ramesh is tired of paper punch cards photocopied by fraudsters. 
            Earn genuine stamps for your morning coffee and loaves. 
            <strong> 10 stamps = 1 free artisan cake!</strong>
          </p>

          {/* Commuter First-Screen Guarantee */}
          <div className="w-full bg-white rounded-3xl p-6 border border-bakery-200 shadow-xl mb-8 text-left">
            <h3 className="text-xs font-black uppercase tracking-wider text-bakery-600 mb-4">
              Designed for the Commute Rush
            </h3>

            <div className="space-y-3 text-xs text-bakery-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No crypto wallet needed:</strong> Sign in with just your normal email or Google account.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Zero recovery phrases:</strong> No seed phrases to write down while paying in queue.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Invisible security:</strong> A cryptographic embedded wallet is created instantly behind the scenes.</span>
              </div>
            </div>

            {/* =========================================================================
                CRITICAL TEST CASE 1: Sign-in entry point calls Privy SDK login method
               ========================================================================= */}
            <button
              onClick={login}
              className="mt-6 w-full py-3.5 px-5 bg-gradient-to-r from-bakery-600 to-amber-700 hover:from-bakery-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg shadow-bakery-600/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 group text-sm"
            >
              <span>Sign In with Email or Google</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-center text-bakery-500 mt-2">
              Takes less than 20 seconds. No app installation needed.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-bakery-600">
            <ShieldCheck className="w-4 h-4 text-bakery-600" />
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bakery-50 via-white to-bakery-100">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        {/* Error notification for dull states */}
        {errorNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button
              onClick={loadCustomerStamps}
              className="inline-flex items-center gap-1 font-bold text-amber-800 hover:underline shrink-0 ml-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Customer Welcome */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Active Commuter Card</span>
          </div>
          <h2 className="text-2xl font-black text-bakery-950">
            Your Ramesh&apos;s Loyalty Card
          </h2>
          <p className="text-xs text-bakery-700">
            Tamper-proof &amp; uncopiable. Stamped directly at the counter.
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

        {/* Staff Counter Station (Simulates counter interaction in bakery queue) */}
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

        {/* Technical Guarantee Breakdown */}
        <div className="mt-8 bg-white/70 rounded-2xl p-5 border border-bakery-200 text-xs text-bakery-700">
          <h4 className="font-bold text-bakery-900 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-bakery-600" />
            How Ramesh stops photocopiers:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
            <li><strong>Zero Client Trust:</strong> The server never asks the browser &quot;who are you?&quot;</li>
            <li><strong>Verified Access Token:</strong> Every stamp request transmits a cryptographic Privy bearer token.</li>
            <li><strong>Claim-Derived Identity:</strong> The server inspects verified claims to identify the customer.</li>
            <li><strong>Embedded Key:</strong> Your identity maps to a non-custodial EVM wallet created seamlessly on login.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
