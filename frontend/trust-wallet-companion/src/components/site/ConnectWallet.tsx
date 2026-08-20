import { useEffect, useState } from "react";
import { Wallet, X, Copy, LogOut, Loader2, QrCode, Check } from "lucide-react";

import { useWallet, shortAddress } from "@/hooks/use-wallet";

const WALLETS = [
  { id: "trust", name: "Trust Wallet", hint: "Browser extension" },
  { id: "metamask", name: "MetaMask", hint: "Browser extension" },
  { id: "walletconnect", name: "WalletConnect", hint: "Scan with mobile wallet" },
];

export function ConnectWallet({
  variant = "solid",
  size = "md",
}: {
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const { address, balance, connect, disconnect, connecting, error } = useWallet();

  useEffect(() => {
    if (address) {
      setOpen(false);
      setShowQr(false);
    }
  }, [address]);

  const copy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={copy}
          className={`pill-outline flex items-center font-semibold ${
            size === "sm"
              ? "h-9 gap-1.5 px-3 text-xs leading-none"
              : "h-10 gap-2 px-4 text-sm leading-none"
          }`}
          title="Copy address"
        >
          {copied ? (
            <Check className={size === "sm" ? "size-3.5" : "size-4"} />
          ) : (
            <Copy className={size === "sm" ? "size-3.5" : "size-4"} />
          )}
          {shortAddress(address)}
          {balance !== null && size !== "sm" && (
            <span className="text-muted-foreground">· {balance} ETH</span>
          )}
        </button>
        <button
          onClick={disconnect}
          aria-label="Disconnect wallet"
          className={`flex items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground ${
            size === "sm" ? "size-9" : "size-10"
          }`}
        >
          <LogOut className={size === "sm" ? "size-3.5" : "size-4"} />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`${variant === "solid" ? "pill-solid" : "pill-outline"} flex items-center justify-center font-semibold ${
          size === "lg"
            ? "gap-3 px-6 py-3 text-base leading-none"
            : size === "sm"
              ? "h-9 gap-1.5 px-3 text-xs leading-none"
              : "h-10 gap-2 px-4 text-sm leading-none"
        }`}
      >
        <Wallet className={size === "lg" ? "size-6" : size === "sm" ? "size-3.5" : "size-4"} />
        {size === "sm" ? "Connect" : "Connect Wallet"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Connect a wallet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect to explore Web3 with self-custody.
                </p>
              </div>
              <button aria-label="Close" onClick={() => setOpen(false)}>
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>

            {showQr ? (
              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-secondary p-6 text-center">
                <QrCode className="size-28 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Open the Trust Wallet mobile app, tap the scanner, and scan to pair via
                  WalletConnect.
                </p>
                <button
                  onClick={() => setShowQr(false)}
                  className="text-sm font-semibold text-primary"
                >
                  Back to wallets
                </button>
              </div>
            ) : (
              <ul className="mt-6 space-y-2">
                {WALLETS.map((w) => (
                  <li key={w.id}>
                    <button
                      onClick={() =>
                        w.id === "walletconnect" ? setShowQr(true) : void connect()
                      }
                      disabled={connecting}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left transition-colors hover:bg-secondary disabled:opacity-60"
                    >
                      <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        {connecting && w.id !== "walletconnect" ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : w.id === "walletconnect" ? (
                          <QrCode className="size-4" />
                        ) : (
                          <Wallet className="size-4" />
                        )}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{w.name}</span>
                        <span className="block text-xs text-muted-foreground">{w.hint}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {error && <p className="mt-4 text-xs text-destructive">{error}</p>}

            <p className="mt-6 text-xs text-muted-foreground">
              By connecting, you agree to the Terms of Service. Trust Wallet never has access to
              your private keys.
            </p>
          </div>
        </div>
      )}
    </>
  );
}