'use client';

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Cake, ShieldCheck, LogOut, LogIn } from 'lucide-react';

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
    <header className="w-full bg-[#fbf9f5] border-b-2 border-bakery-950 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-bakery-950 text-white flex items-center justify-center border border-bakery-950">
            <Cake className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wide text-bakery-950 uppercase leading-none">
              Ramesh&apos;s Bakery
            </h1>
            <p className="font-mono text-[10px] text-bakery-700 font-bold uppercase tracking-widest mt-1">
              The Uncopyable Loyalty Card
            </p>
          </div>
        </div>

        {/* Auth status & Action */}
        <div>
          {authenticated ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-bakery-950 border border-bakery-950 px-2 py-0.5 bg-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{truncateAddress(embeddedWallet) || 'VERIFIED CARD'}</span>
                </div>
                {primaryEmail && (
                  <span className="text-[11px] font-sans font-medium text-bakery-700 truncate max-w-[160px] mt-0.5">
                    {primaryEmail}
                  </span>
                )}
              </div>

              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-bakery-950 border border-bakery-950 bg-white hover:bg-bakery-950 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-display uppercase tracking-widest text-white bg-bakery-950 hover:bg-bakery-800 border-2 border-bakery-950 transition-colors leading-none cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
