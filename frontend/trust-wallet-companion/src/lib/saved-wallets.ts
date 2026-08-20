import { supabase } from "@/integrations/supabase/client";

export type SavedWallet = {
  id: string;
  address: string;
  label: string | null;
  chain: string;
  created_at: string;
};

export async function listSavedWallets(): Promise<SavedWallet[]> {
  const { data, error } = await supabase
    .from("saved_wallets")
    .select("id, address, label, chain, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveWallet(input: { userId: string; address: string; label?: string }) {
  const { error } = await supabase.from("saved_wallets").insert({
    user_id: input.userId,
    address: input.address,
    label: input.label?.trim() ? input.label.trim() : null,
  });
  if (error) throw error;
}

export async function deleteSavedWallet(id: string) {
  const { error } = await supabase.from("saved_wallets").delete().eq("id", id);
  if (error) throw error;
}