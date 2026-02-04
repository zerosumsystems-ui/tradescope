-- ============================================
-- TradeScope Database Schema
-- Run this in Supabase SQL Editor (one time)
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Trades table: stores every raw buy/sell from CSV imports
create table if not exists trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  symbol text not null,
  description text,
  action text not null check (action in ('BUY', 'SELL')),
  quantity numeric not null,
  price numeric not null,
  commission numeric default 0,
  fees numeric default 0,
  amount numeric default 0,
  imported_at timestamptz default now(),
  -- Prevent duplicate imports
  unique(user_id, date, symbol, action, quantity, price)
);

-- User settings: account size, risk %, preferences
create table if not exists user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  account_size numeric default 25000,
  risk_percent numeric default 1,
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table trades enable row level security;
alter table user_settings enable row level security;

-- RLS Policies: users can only see/modify their own data
create policy "Users can view own trades"
  on trades for select using (auth.uid() = user_id);

create policy "Users can insert own trades"
  on trades for insert with check (auth.uid() = user_id);

create policy "Users can delete own trades"
  on trades for delete using (auth.uid() = user_id);

create policy "Users can view own settings"
  on user_settings for select using (auth.uid() = user_id);

create policy "Users can upsert own settings"
  on user_settings for insert with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on user_settings for update using (auth.uid() = user_id);

-- Index for fast queries
create index if not exists idx_trades_user_symbol on trades(user_id, symbol);
create index if not exists idx_trades_user_date on trades(user_id, date);
