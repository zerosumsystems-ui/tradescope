-- Add total_balance column to persist the latest known account balance
ALTER TABLE broker_connections ADD COLUMN IF NOT EXISTS total_balance numeric;
