import { PrivyClient } from '@privy-io/server-auth';

// Validate server configuration without leaking credentials
const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const appSecret = process.env.PRIVY_APP_SECRET;

if (!appId || !appSecret) {
  console.warn(
    '[PrivyServer] Missing NEXT_PUBLIC_PRIVY_APP_ID or PRIVY_APP_SECRET in environment variables. Server token verification will require these.'
  );
}

/**
 * Server-side singleton instance of PrivyClient for verifying client access tokens
 * and inspecting verified user records directly from Privy's API.
 */
export const privyServer = new PrivyClient(
  appId || 'dummy-app-id',
  appSecret || 'dummy-app-secret'
);
