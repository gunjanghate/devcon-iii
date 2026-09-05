import { ethers } from 'ethers';

export const BAKERY_LOYALTY_ABI = [
  'constructor()',
  'event CakeRedeemed(address indexed customer, uint256 totalCakesRedeemed, address indexed processedBy)',
  'event StaffAuthorized(address indexed staffMember, bool isAuthorized)',
  'event StampAwarded(address indexed customer, uint256 currentBalance, uint256 lifetimeTotal, address indexed awardedBy)',
  'function STAMPS_FOR_FREE_CAKE() view returns (uint256)',
  'function authorizedStaff(address) view returns (bool)',
  'function awardStamp(address customer) returns (uint256)',
  'function cakesRedeemed(address) view returns (uint256)',
  'function getCardDetails(address customer) view returns (uint256 currentStamps, uint256 lifetimeCount, uint256 redeemedCakes, bool isEligibleForFreeCake)',
  'function lifetimeStamps(address) view returns (uint256)',
  'function owner() view returns (address)',
  'function redeemFreeCake(address customer)',
  'function setStaffAuthorization(address staffMember, bool isAuthorized)',
  'function stampBalance(address) view returns (uint256)'
];

/**
 * In-memory fallback registry for development & testing when live contract is not yet deployed on Sepolia
 */
interface LoyaltyRecord {
  currentStamps: number;
  lifetimeStamps: number;
  cakesRedeemed: number;
  lastAwardedAt: string;
}

const mockRegistry = new Map<string, LoyaltyRecord>();

/**
 * Server-side helper to interact with the on-chain contract or fallback registry.
 */
export async function recordStampForCustomer(customerAddressOrDid: string): Promise<{
  currentStamps: number;
  lifetimeStamps: number;
  isEligibleForFreeCake: boolean;
  txHash?: string;
}> {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const staffPrivateKey = process.env.BAKERY_STAFF_PRIVATE_KEY;
  const contractAddress = process.env.NEXT_PUBLIC_LOYALTY_CONTRACT_ADDRESS;

  const isEthAddress = ethers.isAddress(customerAddressOrDid);

  // If real Ethereum contract details are provided, perform genuine on-chain transaction
  if (rpcUrl && staffPrivateKey && contractAddress && isEthAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const normalizedKey = staffPrivateKey.trim().startsWith('0x') ? staffPrivateKey.trim() : `0x${staffPrivateKey.trim()}`;
      const staffSigner = new ethers.Wallet(normalizedKey, provider);
      const loyaltyContract = new ethers.Contract(contractAddress, BAKERY_LOYALTY_ABI, staffSigner);

      const tx = await loyaltyContract.awardStamp(customerAddressOrDid);
      const receipt = await tx.wait();

      const details = await loyaltyContract.getCardDetails(customerAddressOrDid);
      return {
        currentStamps: Number(details[0]),
        lifetimeStamps: Number(details[1]),
        isEligibleForFreeCake: Boolean(details[3]),
        txHash: receipt?.hash,
      };
    } catch (err) {
      console.error('[Contract Interaction Error]:', err);
      // If contract reverts (e.g. card full), throw so API can return appropriate status
      throw err;
    }
  }

  // Fallback state storage keyed strictly on the verified customer identifier
  const record = mockRegistry.get(customerAddressOrDid) || {
    currentStamps: 0,
    lifetimeStamps: 0,
    cakesRedeemed: 0,
    lastAwardedAt: new Date().toISOString(),
  };

  if (record.currentStamps >= 10) {
    throw new Error('Card is already full! Please redeem your free cake first');
  }

  record.currentStamps += 1;
  record.lifetimeStamps += 1;
  record.lastAwardedAt = new Date().toISOString();
  mockRegistry.set(customerAddressOrDid, record);

  return {
    currentStamps: record.currentStamps,
    lifetimeStamps: record.lifetimeStamps,
    isEligibleForFreeCake: record.currentStamps >= 10,
    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
  };
}

/**
 * Server-side helper to read customer loyalty card status
 */
export async function getCustomerLoyaltyDetails(customerAddressOrDid: string): Promise<{
  currentStamps: number;
  lifetimeStamps: number;
  cakesRedeemed: number;
  isEligibleForFreeCake: boolean;
}> {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const contractAddress = process.env.NEXT_PUBLIC_LOYALTY_CONTRACT_ADDRESS;
  const isEthAddress = ethers.isAddress(customerAddressOrDid);

  if (rpcUrl && contractAddress && isEthAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const loyaltyContract = new ethers.Contract(contractAddress, BAKERY_LOYALTY_ABI, provider);
      const details = await loyaltyContract.getCardDetails(customerAddressOrDid);
      return {
        currentStamps: Number(details[0]),
        lifetimeStamps: Number(details[1]),
        cakesRedeemed: Number(details[2]),
        isEligibleForFreeCake: Boolean(details[3]),
      };
    } catch (err) {
      console.error('[Contract View Error]:', err);
    }
  }

  const record = mockRegistry.get(customerAddressOrDid) || {
    currentStamps: 0,
    lifetimeStamps: 0,
    cakesRedeemed: 0,
    lastAwardedAt: new Date().toISOString(),
  };

  return {
    currentStamps: record.currentStamps,
    lifetimeStamps: record.lifetimeStamps,
    cakesRedeemed: record.cakesRedeemed,
    isEligibleForFreeCake: record.currentStamps >= 10,
  };
}

/**
 * Server-side helper to redeem free cake once 10 stamps are earned
 */
export async function redeemCustomerCake(customerAddressOrDid: string): Promise<{
  currentStamps: number;
  cakesRedeemed: number;
  txHash?: string;
}> {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const staffPrivateKey = process.env.BAKERY_STAFF_PRIVATE_KEY;
  const contractAddress = process.env.NEXT_PUBLIC_LOYALTY_CONTRACT_ADDRESS;
  const isEthAddress = ethers.isAddress(customerAddressOrDid);

  if (rpcUrl && staffPrivateKey && contractAddress && isEthAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const normalizedKey = staffPrivateKey.trim().startsWith('0x') ? staffPrivateKey.trim() : `0x${staffPrivateKey.trim()}`;
      const staffSigner = new ethers.Wallet(normalizedKey, provider);
      const loyaltyContract = new ethers.Contract(contractAddress, BAKERY_LOYALTY_ABI, staffSigner);

      const tx = await loyaltyContract.redeemFreeCake(customerAddressOrDid);
      const receipt = await tx.wait();

      const details = await loyaltyContract.getCardDetails(customerAddressOrDid);
      return {
        currentStamps: Number(details[0]),
        cakesRedeemed: Number(details[2]),
        txHash: receipt?.hash,
      };
    } catch (err) {
      console.error('[Contract Redeem Error]:', err);
      throw err;
    }
  }

  const record = mockRegistry.get(customerAddressOrDid) || {
    currentStamps: 0,
    lifetimeStamps: 0,
    cakesRedeemed: 0,
    lastAwardedAt: new Date().toISOString(),
  };

  if (record.currentStamps < 10) {
    throw new Error('Insufficient stamps: 10 stamps required to redeem free cake');
  }

  record.currentStamps -= 10;
  record.cakesRedeemed += 1;
  mockRegistry.set(customerAddressOrDid, record);

  return {
    currentStamps: record.currentStamps,
    cakesRedeemed: record.cakesRedeemed,
    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
  };
}
