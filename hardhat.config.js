require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const rawKey = process.env.BAKERY_STAFF_PRIVATE_KEY?.trim();
const formattedKey = rawKey ? (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) : null;
const BAKERY_STAFF_PRIVATE_KEY = formattedKey ? [formattedKey] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: BAKERY_STAFF_PRIVATE_KEY,
      chainId: 11155111,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
