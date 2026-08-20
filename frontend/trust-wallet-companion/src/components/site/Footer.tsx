import { ShieldMark } from "./Header";

const COLUMNS = [
  { title: "Wallet", links: ["Mobile App", "Browser Extension", "Buy Crypto", "Swap Crypto", "Staking"] },
  { title: "Build", links: ["Developer Docs", "Wallet Core", "SDK", "Submit Token", "Bug Bounty"] },
  { title: "Company", links: ["About Us", "Careers", "Newsroom", "Brand Assets", "Contact"] },
  { title: "Support", links: ["Help Center", "Security", "Community", "Status", "Terms of Service"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <ShieldMark />
              <span className="text-2xl font-extrabold tracking-tight text-primary">TRUST</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The most trusted &amp; secure crypto wallet. Buy, store, collect NFTs, exchange
              &amp; earn crypto.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Trust Wallet. All rights reserved.</p>
          <p>Crypto assets are volatile. Never share your secret phrase.</p>
        </div>
      </div>
    </footer>
  );
}