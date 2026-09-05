import { NextRequest, NextResponse } from 'next/server';
import { privyServer } from '@/lib/privyServer';
import { recordStampForCustomer } from '@/lib/contract';

/**
 * POST /api/award-stamp
 *
 * Awards a loyalty stamp to the authenticated customer.
 *
 * CRITICAL SECURITY & SPECIFICATION COMPLIANCE:
 * 1. Token Verification: Validates Privy-issued access token server-side via PrivyClient.verifyAuthToken.
 * 2. Strict Rejection: Immediately returns 401 Unauthorized if token is missing, invalid, or expired, BEFORE any write.
 * 3. Identity Derivation: Stamped identity is derived EXCLUSIVELY from the verified token claims (verifiedClaims.userId
 *    and server lookup for customer's embedded wallet). It NEVER trusts or uses user IDs or addresses from req.body or query.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Extract Bearer token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or malformed Authorization header with Bearer token' },
        { status: 401 }
      );
    }

    const authToken = authHeader.replace(/^Bearer\s+/, '').trim();
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Empty access token provided' },
        { status: 401 }
      );
    }

    // 2. Verify Privy access token server-side BEFORE performing any write
    let verifiedClaims;
    try {
      verifiedClaims = await privyServer.verifyAuthToken(authToken);
    } catch (verificationError: any) {
      console.error('[Token Verification Failed]:', verificationError?.message || verificationError);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid, tampered, or expired Privy access token' },
        { status: 401 }
      );
    }

    if (!verifiedClaims || !verifiedClaims.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Token claims missing valid subject/userId' },
        { status: 401 }
      );
    }

    // 3. Derive stamped identity strictly from the verified token claims (NOT from request body)
    const verifiedUserId = verifiedClaims.userId; // e.g. "did:privy:cm..."

    // Look up the customer in Privy to get their verified embedded wallet address
    let customerIdentifier = verifiedUserId;
    try {
      const privyUser = await privyServer.getUser(verifiedUserId);
      if (privyUser) {
        const embeddedWallet =
          privyUser.wallet?.address ||
          privyUser.linkedAccounts?.find(
            (acc: any) => acc.type === 'wallet' && acc.walletClientType === 'privy'
          )?.address ||
          privyUser.linkedAccounts?.find((acc: any) => acc.type === 'wallet')?.address;

        if (embeddedWallet) {
          customerIdentifier = embeddedWallet;
        }
      }
    } catch (userLookupErr) {
      console.warn('[Privy User Lookup Note]: Could not fetch embedded wallet, falling back to verified DID:', userLookupErr);
      // Still keyed strictly on verified claims DID!
      customerIdentifier = verifiedUserId;
    }

    // 4. Perform the write: Stamp the loyalty card for the verified customer identity
    const result = await recordStampForCustomer(customerIdentifier);

    return NextResponse.json({
      success: true,
      message: 'Bakery stamp successfully punched!',
      customer: customerIdentifier,
      currentStamps: result.currentStamps,
      lifetimeStamps: result.lifetimeStamps,
      isEligibleForFreeCake: result.isEligibleForFreeCake,
      txHash: result.txHash,
    });
  } catch (error: any) {
    console.error('[Award Stamp Error]:', error);
    const message = error?.message || 'Failed to award bakery stamp';
    const status = message.includes('full') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
