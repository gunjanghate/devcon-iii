'use client';

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Cake, ShieldCheck, LogOut, LogIn, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return null;
  }

  const primaryEmail = user?.email?.address;
  const embeddedWallet = user?.wallet?.address || user?.linkedAccounts?.find(
    (acc: any) => acc.type === 'wallet' && acc.walletClientType === 'privy'
  )?.address;

  const truncateAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-bakery-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-bakery-500 text-white flex items-center justify-center shadow-md shadow-bakery-500/20">
            <Cake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-bakery-900 leading-none">
              Ramesh&apos;s Bakery
            </h1>
            <p className="text-xs text-bakery-600 font-medium">
              The Uncopyable Loyalty Card
            </p>
          </div>
        </div>

        <div>
          {authenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{truncateAddress(embeddedWallet) || 'Verified Card'}</span>
                </div>
                {primaryEmail && (
                  <span className="text-[11px] text-bakery-600 truncate max-w-[150px]">
                    {primaryEmail}
                  </span>
                )}
              </div>

              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-bakery-700 hover:text-bakery-900 hover:bg-bakery-100 rounded-xl transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-bakery-600 hover:bg-bakery-700 rounded-xl shadow-sm hover:shadow transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
