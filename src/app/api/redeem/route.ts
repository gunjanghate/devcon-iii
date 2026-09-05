import { NextRequest, NextResponse } from 'next/server';
import { privyServer } from '@/lib/privyServer';
import { redeemCustomerCake } from '@/lib/contract';

/**
 * POST /api/redeem
 * Redeems 10 stamps for 1 free cake for the authenticated customer.
 */
export async function POST(req: NextRequest) {
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
    } catch {
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
        const embeddedWallet =
          privyUser.wallet?.address ||
          privyUser.linkedAccounts?.find(
            (acc: any) => acc.type === 'wallet' && acc.walletClientType === 'privy'
          )?.address;

        if (embeddedWallet) {
          customerIdentifier = embeddedWallet;
        }
      }
    } catch {
      customerIdentifier = verifiedUserId;
    }

    const result = await redeemCustomerCake(customerIdentifier);

    return NextResponse.json({
      success: true,
      message: 'Congratulations! Your free cake has been redeemed.',
      customer: customerIdentifier,
      ...result,
    });
  } catch (error: any) {
    console.error('[Redeem Cake Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to redeem cake' },
      { status: 400 }
    );
  }
}
