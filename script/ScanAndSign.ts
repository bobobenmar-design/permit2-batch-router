import { Alchemy, Network } from 'alchemy-sdk';
import 'dotenv/config';

const apiKey = process.env.ALCHEMY_API_KEY;
if (!apiKey) {
  throw new Error('Set ALCHEMY_API_KEY in your environment (see .env.example).');
}

const config = {
  apiKey,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

async function scanAndOrderTokens(walletAddress: string) {
  console.log(`Scanning live wallet: ${walletAddress}...`);
  const balances = await alchemy.core.getTokenBalances(walletAddress);

  const activeTokens = balances.tokenBalances.filter(t => BigInt(t.tokenBalance || '0') > 0n);
  const sortedTokens = activeTokens.slice(0, 50);

  const tokenAddresses: string[] = [];
  const tokenAmounts: string[] = [];

  console.log("\n=== SEQUENTIAL CONTRACT QUEUE SUMMARY ===");
  sortedTokens.forEach((token, index) => {
    tokenAddresses.push(token.contractAddress);
    tokenAmounts.push(token.tokenBalance || '0');
    console.log(`Index [${index}] -> Position ${index + 1}: ${token.contractAddress} | Balance: ${token.tokenBalance}`);
  });

  console.log("\n=== READY FOR CONTRACT SUBMISSION ===");
  console.log("Tokens Param:", JSON.stringify(tokenAddresses));
  console.log("Amounts Param:", JSON.stringify(tokenAmounts));
}

// Example runtime target check
const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
scanAndOrderTokens(testAddress).catch(console.error);
