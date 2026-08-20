import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User as UserIcon } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function AccountMenu({ size = "md" }: { size?: "sm" | "md" }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const height = size === "sm" ? "h-9" : "h-10";

  if (loading) {
    return <span className={`${height} w-24 animate-pulse rounded-full bg-muted`} aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link
        to="/auth"
        className={`pill-outline flex ${height} items-center gap-2 px-4 text-sm font-semibold leading-none`}
      >
        <UserIcon className="size-4" />
        <span className={size === "sm" ? "sr-only" : undefined}>Sign in</span>
      </Link>
    );
  }

  async function signOut() {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className={`pill-outline flex ${height} items-center gap-2 px-3 text-sm font-semibold leading-none`}
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {initial}
        </span>
        <span className="hidden max-w-[130px] truncate lg:inline">{user.email}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-lg">
          <p className="truncate px-3 py-2 text-xs text-muted-foreground">{user.email}</p>
          <Link
            to="/wallet"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            My wallet
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-destructive hover:bg-muted"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}