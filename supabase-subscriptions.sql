-- ============================================
-- TradeScope Subscriptions Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Subscriptions table: tracks Stripe subscription state per user
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'elite')),
  billing_period text check (billing_period in ('monthly', 'annual')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table subscriptions enable row level security;

-- Users can read their own subscription
create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Service role can do everything (webhooks write via service key)
-- No insert/update/delete policy for anon — only service_role bypasses RLS

-- Index for fast lookups
create index if not exists idx_subscriptions_user on subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_customer on subscriptions(stripe_customer_id);

-- Enable realtime for subscriptions table
alter publication supabase_realtime add table subscriptions;
