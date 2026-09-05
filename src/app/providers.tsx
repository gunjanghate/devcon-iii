'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

/**
 * Privy Provider Configuration
 * 
 * Satisfies Test Case 2:
 * - createOnLogin is explicitly set to 'users-without-wallets'
 *   so first-time bakery customers get an embedded Ethereum wallet
 *   automatically upon login without clicking any "create wallet" button.
 * - Prioritizes frictionless consumer login (email, Google, SMS)
 * - Hides external web3 wallet prompts by default.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'dummy-app-id';

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'google', 'sms'],
        appearance: {
          theme: 'light',
          accentColor: '#27160c', // High-contrast bakery deep roast
          showWalletLoginFirst: false,
          logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=128&auto=format&fit=crop&q=80',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
