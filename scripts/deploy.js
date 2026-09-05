const hre = require("hardhat");

async function main() {
  console.log("🥖 Starting deployment of Ramesh's Bakery Loyalty Card to", hre.network.name, "...");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    console.error("❌ Error: No deployer account found. Ensure BAKERY_STAFF_PRIVATE_KEY is set in .env.local");
    process.exit(1);
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`👤 Deployer (Ramesh): ${deployer.address}`);
  console.log(`💰 Account Balance: ${hre.ethers.formatEther(balance)} ETH`);

  if (balance === 0n && hre.network.name !== "hardhat") {
    console.warn("⚠️ Warning: Deployer balance is 0. You will need Sepolia testnet ETH to pay for gas.");
  }

  const BakeryLoyaltyCard = await hre.ethers.getContractFactory("BakeryLoyaltyCard");
  const contract = await BakeryLoyaltyCard.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n========================================================");
  console.log("🎉 BakeryLoyaltyCard deployed successfully!");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${hre.network.name}`);
  console.log("========================================================\n");
  console.log("👉 Next Steps:");
  console.log(`1. Copy this address into your .env.local file:`);
  console.log(`   NEXT_PUBLIC_LOYALTY_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`2. Start your Next.js application: npm run dev\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
