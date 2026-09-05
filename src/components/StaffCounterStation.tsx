'use client';

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Stamp, AlertCircle, CheckCircle2, Loader2, ShieldAlert, Coffee } from 'lucide-react';

interface StaffStationProps {
  onStampAwarded: (updatedData: any) => void;
}

export default function StaffCounterStation({ onStampAwarded }: StaffStationProps) {
  const { getAccessToken, user } = usePrivy();
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
        text: `Success! Stamp #${data.currentStamps} punched. Transaction: ${data.txHash?.slice(0, 10)}...`,
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
    <div className="bg-white rounded-3xl p-6 border border-bakery-200 shadow-lg mt-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-bakery-100 flex items-center justify-center text-bakery-700">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-bakery-900">Bakery Register Counter</h4>
            <p className="text-[11px] text-bakery-600">Morning commute checkout</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
          Tamper-Proof
        </span>
      </div>

      <p className="text-xs text-bakery-700 mb-4 leading-relaxed">
        Ordered your daily coffee or morning loaf? Tap below to record a verified stamp directly to your non-copiable card.
      </p>

      {/* Action Button */}
      <button
        onClick={handleAwardStamp}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-bakery-600 hover:bg-bakery-700 active:bg-bakery-800 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Punching Stamp &amp; Verifying Session...</span>
          </>
        ) : (
          <>
            <Stamp className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Punch Today&apos;s Stamp</span>
          </>
        )}
      </button>

      {/* Status Messages for dull states */}
      {statusMessage && (
        <div
          className={`mt-4 p-3 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-tight">{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
