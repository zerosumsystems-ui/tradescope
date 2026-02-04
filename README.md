# TradeScope — Van Tharp Analytics Dashboard

A personal trade analytics dashboard for Fidelity CSV exports with comprehensive Van Tharp methodology metrics (SQN, Expectancy, R-Multiples, Expectunity).

## Quick Start (Deploy in 15 minutes)

### Step 1: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Paste the entire contents of `supabase-schema.sql` and click **Run**
4. This creates the `trades` and `user_settings` tables with security policies

### Step 2: Enable Supabase Auth

1. In Supabase, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Optionally disable "Confirm email" under **Authentication** → **Settings** if you want to skip email verification during testing

### Step 3: Push to GitHub

```bash
# Create a new repo on github.com, then:
cd tradescope
git init
git add .
git commit -m "TradeScope initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tradescope.git
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your `tradescope` GitHub repo
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://zdjynjmomsaqiptbundx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_jhVzDp3glxiS9W3wmw2LHA_FYtuFwlg`
5. Click **Deploy**
6. Your site will be live at `tradescope.vercel.app` (or similar)

### Step 5: Use It

1. Visit your Vercel URL
2. Create an account (email + password)
3. Upload your Fidelity CSV or use the sample data
4. Your trades are saved to the database — they'll be there next time you log in

## How to Export from Fidelity

1. Log in to Fidelity.com
2. Go to **Accounts** → **Activity & Orders**
3. Set your date range
4. Click the **Download** icon (CSV)
5. Upload the file to TradeScope

## Features

- **Van Tharp Metrics**: SQN, Expectancy, Expectunity, Payoff Ratio, Profit Factor
- **R-Multiple Analysis**: Distribution histogram, waterfall chart, monthly R earned
- **Statistics**: Median R, Skewness, Kurtosis, Max Drawdown in R
- **Standard Analytics**: Win rate, P&L by symbol, timing analysis, cumulative equity curve
- **Persistent Storage**: Trades saved to Supabase — upload once, access anywhere
- **Auth**: Email/password login keeps your data private

## Tech Stack

- **Frontend**: React + Vite + Recharts
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Hosting**: Vercel (free tier)

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`
