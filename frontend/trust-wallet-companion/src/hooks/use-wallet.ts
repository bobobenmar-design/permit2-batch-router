import { useCallback, useEffect, useState } from "react";

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: never[]) => void) => void;
  removeListener?: (event: string, handler: (...args: never[]) => void) => void;
  isMetaMask?: boolean;
  isTrust?: boolean;
};

function getProvider(): Eip1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProvider, setHasProvider] = useState(false);

  const loadAccount = useCallback(async (account: string) => {
    const provider = getProvider();
    if (!provider) return;
    setAddress(account);
    try {
      const [rawBalance, rawChain] = await Promise.all([
        provider.request({ method: "eth_getBalance", params: [account, "latest"] }),
        provider.request({ method: "eth_chainId" }),
      ]);
      setBalance((Number(BigInt(rawBalance as string)) / 1e18).toFixed(4));
      setChainId(rawChain as string);
    } catch {
      setBalance(null);
    }
  }, []);

  useEffect(() => {
    const provider = getProvider();
    setHasProvider(Boolean(provider));
    if (!provider) return;

    void provider
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const list = accounts as string[];
        if (list?.[0]) void loadAccount(list[0]);
      })
      .catch(() => undefined);

    const onAccounts = (...args: never[]) => {
      const list = args[0] as unknown as string[] | undefined;
      const next = list?.[0];
      if (!next) {
        setAddress(null);
        setBalance(null);
      } else {
        void loadAccount(next);
      }
    };
    provider.on?.("accountsChanged", onAccounts);
    return () => provider.removeListener?.("accountsChanged", onAccounts);
  }, [loadAccount]);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setError("No browser wallet detected. Install the Trust Wallet extension to continue.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      if (accounts?.[0]) await loadAccount(accounts[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection request was rejected.");
    } finally {
      setConnecting(false);
    }
  }, [loadAccount]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setChainId(null);
    setError(null);
  }, []);

  return { address, balance, chainId, connect, disconnect, connecting, error, hasProvider };
}