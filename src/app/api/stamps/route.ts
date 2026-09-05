import { NextRequest, NextResponse } from 'next/server';
import { privyServer } from '@/lib/privyServer';
import { getCustomerLoyaltyDetails } from '@/lib/contract';

/**
 * GET /api/stamps
 * Retrieves current loyalty stamp details for the authenticated customer.
 * Uses the verified Privy access token to ensure identity cannot be forged.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or malformed Authorization header' },
        { status: 401 }
      );
    }

    const authToken = authHeader.replace(/^Bearer\s+/, '').trim();
    let verifiedClaims;
    try {
      verifiedClaims = await privyServer.verifyAuthToken(authToken);
    } catch (err: any) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const verifiedUserId = verifiedClaims.userId;
    let customerIdentifier = verifiedUserId;

    try {
      const privyUser = await privyServer.getUser(verifiedUserId);
      if (privyUser) {
        const linkedAccounts = (privyUser.linkedAccounts || []) as any[];
        const walletAccount =
          linkedAccounts.find(
            (acc) => acc.type === 'wallet' && acc.walletClientType === 'privy'
          ) || linkedAccounts.find((acc) => acc.type === 'wallet');

        const embeddedWallet = (privyUser as any).wallet?.address || walletAccount?.address;

        if (embeddedWallet) {
          customerIdentifier = embeddedWallet;
        }
      }
    } catch {
      customerIdentifier = verifiedUserId;
    }

    const details = await getCustomerLoyaltyDetails(customerIdentifier);

    return NextResponse.json({
      success: true,
      customer: customerIdentifier,
      ...details,
    });
  } catch (error: any) {
    console.error('[Get Stamps Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch stamps' },
      { status: 500 }
    );
  }
}
