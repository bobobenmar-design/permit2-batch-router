import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkPlus, Loader2, Star, Trash2 } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { deleteSavedWallet, listSavedWallets, saveWallet } from "@/lib/saved-wallets";

export function SavedWallets({ currentAddress }: { currentAddress: string | null }) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: wallets, isLoading } = useQuery({
    queryKey: ["saved-wallets", user?.id],
    queryFn: listSavedWallets,
    enabled: !!user,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["saved-wallets", user?.id] });

  const addMutation = useMutation({
    mutationFn: () => saveWallet({ userId: user!.id, address: currentAddress!, label }),
    onSuccess: () => {
      setLabel("");
      setError(null);
      void invalidate();
    },
    onError: (err: unknown) =>
      setError(err instanceof Error ? err.message : "Could not save that address."),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteSavedWallet(id),
    onSuccess: () => void invalidate(),
  });

  if (loading) return null;

  if (!user) {
    return (
      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold">Saved wallet addresses</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a free account to save your wallet addresses and find them on any device.
        </p>
        <Link
          to="/auth"
          className="pill-solid mt-4 inline-flex h-10 items-center px-5 text-sm font-semibold leading-none"
        >
          Sign in or sign up
        </Link>
      </section>
    );
  }

  const alreadySaved = wallets?.some(
    (w) => w.address.toLowerCase() === currentAddress?.toLowerCase(),
  );

  return (
    <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Saved wallet addresses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Stored with your account — {user.email}
          </p>
        </div>
        <Star className="size-5 text-primary" aria-hidden="true" />
      </div>

      {currentAddress && !alreadySaved && (
        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            addMutation.mutate();
          }}
        >
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. Main wallet)"
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="pill-solid flex items-center justify-center gap-2 whitespace-nowrap px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {addMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <BookmarkPlus className="size-4" />
            )}
            Save connected wallet
          </button>
        </form>
      )}

      {!currentAddress && (
        <p className="mt-4 text-sm text-muted-foreground">
          Connect a wallet above to save its address to your account.
        </p>
      )}

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

      {isLoading ? (
        <p className="mt-5 text-sm text-muted-foreground">Loading your wallets…</p>
      ) : wallets && wallets.length > 0 ? (
        <ul className="mt-5 divide-y divide-border">
          {wallets.map((w) => (
            <li key={w.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-semibold">{w.label ?? "Wallet"}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{w.address}</p>
              </div>
              <button
                onClick={() => removeMutation.mutate(w.id)}
                aria-label={`Remove ${w.label ?? w.address}`}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">No saved addresses yet.</p>
      )}
    </section>
  );
}