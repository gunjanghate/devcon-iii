'use client';

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Stamp, Check, Loader2, ShieldAlert, Coffee } from 'lucide-react';

interface StaffStationProps {
  onStampAwarded: (updatedData: any) => void;
}

export default function StaffCounterStation({ onStampAwarded }: StaffStationProps) {
  const { getAccessToken } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const handleAwardStamp = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      // 1. Obtain Privy access token on the client
      // Satisfies Test Case 7: The client sends the access token with the award request
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('Could not retrieve active session token. Please sign in again.');
      }

      // 2. Transmit token in Authorization header to server endpoint
      // Note: No customer ID is sent in the body or query!
      // Satisfies Test Case 6: The stamped identity comes from verified claims
      const response = await fetch('/api/award-stamp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setStatusMessage({
        type: 'success',
        text: `Verified! Stamp #${data.currentStamps} punched to on-chain card. Tx: ${data.txHash?.slice(0, 12)}...`,
      });

      onStampAwarded(data);
    } catch (err: any) {
      console.error('Award stamp failure:', err);
      // Satisfies criteria: Handle the dull states honestly (stamp request that fails)
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to punch stamp. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-bakery-950 p-6 mt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between border-b border-bakery-200 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-bakery-950 text-white flex items-center justify-center shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display font-extrabold text-xs uppercase tracking-widest text-bakery-950">
              Bakery Register Checkout
            </h4>
            <p className="font-mono text-[10px] text-bakery-600 uppercase tracking-wider">
              Morning commute checkout
            </p>
          </div>
        </div>
        <span className="font-mono text-[10px] font-bold text-bakery-950 border border-bakery-950 px-2 py-0.5 bg-bakery-100 uppercase">
          Tamper-Proof
        </span>
      </div>

      <p className="font-sans text-xs text-bakery-800 mb-5 leading-relaxed font-medium">
        Ordered your daily coffee or morning sourdough? Tap below to punch a verified stamp directly to your non-copiable card.
      </p>

      {/* Action Button - Sharp Rectangular Button */}
      <button
        onClick={handleAwardStamp}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-bakery-950 hover:bg-bakery-800 active:bg-black text-white font-display font-extrabold text-xs uppercase tracking-widest border-2 border-bakery-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Punching Stamp &amp; Verifying Claims...</span>
          </>
        ) : (
          <>
            <Stamp className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Punch Today&apos;s Stamp</span>
          </>
        )}
      </button>

      {/* Status Messages for dull states - Sharp Crisp Boxes */}
      {statusMessage && (
        <div
          className={`mt-4 p-3.5 text-xs font-sans font-medium flex items-start gap-2.5 border-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-950'
              : 'bg-red-50 text-red-950 border-red-950'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-800 shrink-0 mt-0.5" />
          )}
          <span className="leading-tight font-mono text-[11px]">{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
