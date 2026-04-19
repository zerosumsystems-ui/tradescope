-- ONE-OFF FIX — run this ONCE in the prod Supabase (ajqzvmbtfgumrkwfxmcn) SQL editor.
-- The broker_connections table was never migrated from the old Supabase project
-- to the current one, so /api/snaptrade/register 500s with PGRST205
-- "Could not find the table 'public.broker_connections' in the schema cache".
--
-- This bundles migrations 001 + 002 (idempotent, safe to re-run).

-- Migration 001: base table + RLS
CREATE TABLE IF NOT EXISTS broker_connections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  snaptrade_user_id text,
  snaptrade_user_secret text,
  status text DEFAULT 'registered',
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own broker connections" ON broker_connections;
CREATE POLICY "Users can view own broker connections"
  ON broker_connections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access" ON broker_connections;
CREATE POLICY "Service role full access"
  ON broker_connections FOR ALL
  USING (true)
  WITH CHECK (true);

-- Migration 002: persistent balance column
ALTER TABLE broker_connections ADD COLUMN IF NOT EXISTS total_balance numeric;

-- Sanity check — should return one row with the column list
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'broker_connections'
ORDER BY ordinal_position;
