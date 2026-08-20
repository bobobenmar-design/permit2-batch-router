import { createFileRoute } from "@tanstack/react-router";
import { Check, X, Smartphone, Monitor, Star, ShieldCheck, EyeOff, BellRing } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ConnectWallet } from "@/components/site/ConnectWallet";
import heroImg from "@/assets/hero-wallet.png";
import buildImg from "@/assets/build-astronaut.png";
import depositImg from "@/assets/deposit-hand.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trust Wallet — True crypto ownership, powerful Web3" },
      {
        name: "description",
        content:
          "Trust Wallet is a free self-custody crypto wallet supporting 100+ blockchains — buy, send, swap, stake and earn while you alone control your private keys.",
      },
      { property: "og:title", content: "Trust Wallet — True crypto ownership" },
      {
        property: "og:description",
        content:
          "Self-custody crypto wallet for 100+ blockchains. Buy, swap, stake and earn on iOS, Android and browser.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const TRUST_STATS = [
  ["Trusted by", "200M people"],
  ["Founded in", "2017"],
  ["Independently", "Audited"],
  ["ISO", "Certified"],
];

const CHAINS = [
  { name: "BNB Smart Chain (BNB)", cells: [true, true, true, true, true] },
  { name: "Solana (SOL)", cells: [true, true, true, true, false] },
  { name: "Sui (SUI)", cells: [true, true, false, true, false] },
  { name: "Ethereum (ETH)", cells: [true, true, true, true, true] },
  { name: "Bitcoin (BTC)", cells: [true, true, true, false, false] },
];

const PRIVACY = [
  {
    icon: ShieldCheck,
    title: "Added security with encryption",
    body: "Use our Encrypted Cloud Backup for increased wallet security.",
  },
  {
    icon: EyeOff,
    title: "Zero personal tracking",
    body: "We don't track any personal information, including your IP address or balances.",
  },
  {
    icon: BellRing,
    title: "Proactive alerts for risky transactions",
    body: "Stay safe with alerts for risky address and dApp connections.",
  },
];

const VOICES = [
  {
    name: "Juan",
    quote:
      "The easiest way to understand DeFi is to get your hands dirty. The Trust Wallet dApp browser helped me use protocols with small amounts and learn what works.",
  },
  { name: "Jen", quote: "Secure your private keys like your life depends on it. #DoNotShare 🔑" },
  {
    name: "Harry",
    quote:
      "As a newcomer, blockchain technology has had a transformative impact on my life. It opened up an entirely new realm of possibilities.",
  },
  {
    name: "Esmart",
    quote:
      "I always do my own research and check the Trust Wallet Security Scanner before any acquisition. That's how I stay #SAFU. 🛡️",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-[1400px] px-5 pt-14 pb-6 lg:px-10 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-[2.75rem] leading-[1.05] font-extrabold sm:text-6xl">
                True crypto ownership. Powerful Web3 experiences
              </h1>
              <p className="mt-7 max-w-lg text-base leading-relaxed text-foreground/70">
                Trust Wallet is a free self-custody crypto wallet supporting 100+ blockchains —
                buy, send, swap, stake, and earn crypto and NFTs while you alone control your
                private keys. Available on iOS, Android, and as a browser extension, with no
                account required.
              </p>
              <div className="mt-9 flex flex-wrap gap-4" id="download">
                <ConnectWallet size="lg" />
                <a href="#" className="pill-outline flex items-center gap-3 px-6 py-3">
                  <Smartphone className="size-6" />
                  <span className="text-left text-sm leading-tight">
                    Download
                    <br />
                    <span className="font-semibold">Mobile App</span>
                  </span>
                </a>
                <a href="#" className="pill-outline flex items-center gap-3 px-6 py-3">
                  <Monitor className="size-6" />
                  <span className="text-left text-sm leading-tight">
                    Download
                    <br />
                    <span className="font-semibold">Extension</span>
                  </span>
                </a>
              </div>
            </div>
            <img
              src={heroImg}
              alt="Trust Wallet app screens surrounded by keys and a padlock"
              width={1408}
              height={1104}
              className="w-full"
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8 border-border py-10 sm:grid-cols-3 lg:grid-cols-5">
            {TRUST_STATS.map(([top, bottom]) => (
              <div key={bottom} className="text-center">
                <p className="text-xl font-bold sm:text-2xl">{top}</p>
                <p className="text-xl font-bold sm:text-2xl">{bottom}</p>
              </div>
            ))}
            <div className="text-center">
              <p className="text-xl font-bold sm:text-2xl">Top reviews</p>
              <div className="mt-1 flex justify-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-5 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Building on Trust */}
        <section className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-primary px-8 py-12 text-primary-foreground lg:grid-cols-2 lg:px-16 lg:py-16">
            <div>
              <h2 className="text-4xl font-extrabold sm:text-5xl">Building on Trust</h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed opacity-90">
                We know that working together as a community is better for everyone. Our platform
                enables blockchain developers to build their dApps and wallets natively and connect
                with millions of users, without having to worry about the low-level implementation
                details.
              </p>
              <a
                href="#"
                className="mt-8 inline-flex rounded-full bg-background px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
              >
                Check out our Developer Docs
              </a>
            </div>
            <img
              src={buildImg}
              alt="Developer astronaut helmet with binary code"
              width={912}
              height={912}
              loading="lazy"
              className="mx-auto w-2/3 lg:w-full"
            />
          </div>
        </section>

        {/* Chains table */}
        <section className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
          <h2 className="max-w-2xl text-4xl font-extrabold sm:text-5xl">
            One Platform, Millions of Assets
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70">
            As a leading self-custody multi-chain platform, we support millions of assets across
            100+ blockchains. From Bitcoin, Ethereum, and Solana, to Cosmos, Optimism, and much
            more.
          </p>

          <div className="mt-10 overflow-x-auto rounded-3xl border border-border">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-secondary text-sm font-bold">
                <tr>
                  {["Chain", "Buy", "Sell", "Swap", "Earn", "dApps"].map((h) => (
                    <th key={h} className="px-6 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CHAINS.map((chain) => (
                  <tr key={chain.name} className="border-t border-border">
                    <td className="px-6 py-5 text-sm font-semibold">{chain.name}</td>
                    {chain.cells.map((ok, i) => (
                      <td key={i} className="px-6 py-5">
                        {ok ? (
                          <Check className="size-5 text-primary" />
                        ) : (
                          <X className="size-5 text-muted-foreground" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              ["10M+", "Assets"],
              ["600M+", "NFTs"],
              ["100+", "Blockchains"],
            ].map(([n, label]) => (
              <div key={label} className="rounded-3xl bg-secondary px-8 py-10">
                <p className="text-4xl font-extrabold text-primary">{n}</p>
                <p className="mt-2 text-lg font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Simple. Seamless. */}
        <section className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <h2 className="text-4xl font-extrabold sm:text-5xl">Simple. Seamless.</h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70">
            Enjoy a smooth mobile app and desktop experience with easy-to-use, powerful tools to
            support your entire Web3 journey.
          </p>
          <div className="mt-12 grid items-center gap-10 rounded-3xl bg-secondary px-8 py-12 lg:grid-cols-2 lg:px-16">
            <div>
              <h3 className="text-3xl font-bold">Deposit crypto easily from exchanges</h3>
              <p className="mt-5 text-base leading-relaxed text-foreground/70">
                Take control of your crypto. Avoid complicated steps and deposit directly to your
                wallet from exchanges like Binance and Coinbase.
              </p>
              <a href="#" className="pill-solid mt-8 inline-flex px-6 py-3 text-sm font-semibold">
                Get started with deposits
              </a>
            </div>
            <img
              src={depositImg}
              alt="Deposit crypto from an exchange to Trust Wallet"
              width={1200}
              height={1008}
              loading="lazy"
              className="w-full"
            />
          </div>
        </section>

        {/* Privacy & security */}
        <section className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
          <h2 className="text-4xl font-extrabold sm:text-5xl">Stay private and secure</h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70">
            Rest easy knowing that our privacy and security measures keep you in control of your
            data and digital assets, while also keeping them safe.
          </p>

          <div className="mt-12 rounded-3xl border border-border p-8 lg:p-12">
            <h3 className="max-w-xl text-3xl font-bold">
              True ownership of your crypto assets
            </h3>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/70">
              We secure your wallet, but don't control or have access to your private keys or
              secret phrase — only you do.
            </p>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {PRIVACY.map(({ icon: Icon, title, body }) => (
                <div key={title}>
                  <Icon className="size-8 text-primary" />
                  <h4 className="mt-4 text-lg font-bold">{title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">{body}</p>
                </div>
              ))}
            </div>
            <a href="#" className="pill-outline mt-10 inline-flex px-6 py-3 text-sm font-semibold">
              Learn more about privacy &amp; security
            </a>
          </div>
        </section>

        {/* Ratings */}
        <section className="bg-secondary py-20 lg:py-28">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <h2 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">
              Trust Wallet is one of the highest-rated self-custody crypto wallets
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70">
              Rated 4.7 on the App Store and 4.6 on Google Play, across 2.7M verified reviews —
              trusted by millions of users on iOS and Android.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {[
                ["4.7", "197.1K Reviews", "App Store"],
                ["4.6", "2.5M Reviews", "Google Play"],
              ].map(([score, reviews, store]) => (
                <div key={store} className="rounded-3xl bg-background px-8 py-10">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-extrabold text-primary">{score}</span>
                    <span className="pb-1 text-xl font-semibold text-muted-foreground">/ 5</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{reviews}</p>
                  <p className="mt-6 text-lg font-bold">{store}</p>
                </div>
              ))}
            </div>
            <a href="#" className="pill-solid mt-10 inline-flex px-6 py-3 text-sm font-semibold">
              Join Trust Wallet
            </a>
          </div>
        </section>

        {/* Community */}
        <section className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
          <h2 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">
            Enjoy a Web3 experience powered by community
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70">
            Join our vibrant and diverse community to learn about the power of self-custody,
            crypto, and Web3.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {VOICES.map((v) => (
              <figure key={v.name} className="rounded-3xl border border-border p-7">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  {v.name[0]}
                </div>
                <figcaption className="mt-4 font-bold">{v.name}</figcaption>
                <blockquote className="mt-2 text-sm leading-relaxed text-foreground/70">
                  {v.quote}
                </blockquote>
              </figure>
            ))}
          </div>
          <a href="#" className="pill-outline mt-10 inline-flex px-6 py-3 text-sm font-semibold">
            Join our community on Telegram
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
