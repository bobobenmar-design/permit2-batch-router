CREATE TABLE public.saved_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  label TEXT,
  chain TEXT NOT NULL DEFAULT 'ethereum',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, address)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_wallets TO authenticated;
GRANT ALL ON public.saved_wallets TO service_role;

ALTER TABLE public.saved_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved wallets"
  ON public.saved_wallets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own saved wallets"
  ON public.saved_wallets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved wallets"
  ON public.saved_wallets FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved wallets"
  ON public.saved_wallets FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_saved_wallets_updated_at
  BEFORE UPDATE ON public.saved_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX saved_wallets_user_id_idx ON public.saved_wallets (user_id);