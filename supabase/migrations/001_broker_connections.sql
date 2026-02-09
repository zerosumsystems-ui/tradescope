-- Create broker_connections table for SnapTrade integration
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

-- Enable RLS
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

-- Users can only see their own connections
CREATE POLICY "Users can view own broker connections"
  ON broker_connections FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (used by API endpoints)
CREATE POLICY "Service role full access"
  ON broker_connections FOR ALL
  USING (true)
  WITH CHECK (true);
