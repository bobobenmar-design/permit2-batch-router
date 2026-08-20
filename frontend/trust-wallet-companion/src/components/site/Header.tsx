import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ConnectWallet } from "./ConnectWallet";
import { ThemeToggle } from "./ThemeToggle";
import { AccountMenu } from "./AccountMenu";

const NAV: { label: string; to?: string }[] = [
  { label: "Markets" },
  { label: "Wallet", to: "/wallet" },
  { label: "Features" },
  { label: "Build" },
  { label: "Support" },
  { label: "About" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-10">
        <a href="/" className="flex items-center gap-2" aria-label="Trust Wallet home">
          <ShieldMark />
          <span className="text-2xl font-extrabold tracking-tight text-primary">TRUST</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href="#"
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle className="mr-1" />
          <button className="pill-outline flex h-10 items-center gap-2 px-4 text-sm font-semibold leading-none">
            <Globe className="size-4" />
            Language
          </button>
          <ConnectWallet variant="outline" />
          <AccountMenu />
          <a
            href="#download"
            className="pill-solid flex h-10 items-center px-5 text-sm font-semibold leading-none"
          >
            Download
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <AccountMenu size="sm" />
          <ConnectWallet variant="outline" size="sm" />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {NAV.map((item) =>
              item.to ? (
                <Link key={item.label} to={item.to} className="text-base font-medium" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href="#" className="text-base font-medium">
                  {item.label}
                </a>
              ),
            )}
            <a href="#download" className="pill-solid px-5 py-3 text-center text-sm font-semibold">
              Download
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

export function ShieldMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 2 4 7v10c0 7 5.2 11.4 12 13 6.8-1.6 12-6 12-13V7L16 2Z" fill="currentColor" className="text-primary" />
      <path d="M16 2v28c6.8-1.6 12-6 12-13V7L16 2Z" fill="oklch(0.86 0.24 148)" opacity="0.9" />
    </svg>
  );
}