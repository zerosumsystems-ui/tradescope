import { Snaptrade } from 'snaptrade-typescript-sdk';
import { createClient } from '@supabase/supabase-js';

const snaptrade = new Snaptrade({
  consumerKey: process.env.SNAPTRADE_CONSUMER_KEY,
  clientId: process.env.SNAPTRADE_CLIENT_ID,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Convert SnapTrade activity to our trade format
function activityToTrade(activity) {
  const type = (activity.type || '').toUpperCase();
  if (type !== 'BUY' && type !== 'SELL') return null;

  const symbol = activity.symbol?.symbol || activity.symbol?.description || '';
  if (!symbol) return null;

  const qty = Math.abs(activity.units || activity.quantity || 0);
  const price = activity.price || 0;
  if (qty === 0 || price === 0) return null;

  // Parse trade date
  const dateStr = activity.tradeDate || activity.trade_date || activity.settlementDate || '';
  const date = dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
  if (!date) return null;

  return {
    date,
    symbol: symbol.split(' ')[0].toUpperCase(),
    description: activity.description || activity.symbol?.description || '',
    action: type,
    quantity: qty,
    price,
    commission: Math.abs(activity.commission || 0),
    fees: Math.abs(activity.fee || activity.fees || 0),
    amount: qty * price,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    // Get SnapTrade credentials
    const { data: conn } = await supabase
      .from('broker_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!conn?.snaptrade_user_secret) {
      return res.status(400).json({ error: 'No broker connected. Please connect a broker first.' });
    }

    // List all accounts
    const { data: accounts } = await snaptrade.accountInformation.listUserAccounts({
      userId: conn.snaptrade_user_id,
      userSecret: conn.snaptrade_user_secret,
    });

    if (!accounts || accounts.length === 0) {
      return res.status(400).json({ error: 'No brokerage accounts found. Please connect a broker.' });
    }

    // Fetch activities from all accounts
    const allTrades = [];
    const startDate = req.body?.startDate || '2020-01-01';
    const endDate = req.body?.endDate || new Date().toISOString().split('T')[0];

    for (const account of accounts) {
      try {
        let offset = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data: activitiesPage } = await snaptrade.accountInformation.getAccountActivities({
            accountId: account.id,
            userId: conn.snaptrade_user_id,
            userSecret: conn.snaptrade_user_secret,
            startDate,
            endDate,
            type: 'BUY,SELL',
            offset,
            limit,
          });

          const activities = activitiesPage?.activities || activitiesPage || [];
          if (!Array.isArray(activities) || activities.length === 0) {
            hasMore = false;
            break;
          }

          for (const activity of activities) {
            const trade = activityToTrade(activity);
            if (trade) allTrades.push(trade);
          }

          hasMore = activities.length === limit;
          offset += limit;
        }
      } catch (acctErr) {
        console.error(`Error fetching activities for account ${account.id}:`, acctErr.message);
      }
    }

    if (allTrades.length === 0) {
      // Update last sync time even if no trades
      await supabase
        .from('broker_connections')
        .update({ last_sync_at: new Date().toISOString(), status: 'connected' })
        .eq('user_id', user.id);

      return res.status(200).json({ trades: 0, message: 'No buy/sell trades found in the selected date range.' });
    }

    // Save trades to DB (upsert to avoid duplicates)
    const rows = allTrades.map(t => ({
      user_id: user.id,
      date: t.date,
      symbol: t.symbol,
      description: t.description,
      action: t.action,
      quantity: t.quantity,
      price: t.price,
      commission: t.commission,
      fees: t.fees,
      amount: t.amount,
    }));

    const { error: upsertError } = await supabase
      .from('trades')
      .upsert(rows, { onConflict: 'user_id,date,symbol,action,quantity,price', ignoreDuplicates: true });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return res.status(500).json({ error: 'Failed to save trades' });
    }

    // Update last sync timestamp
    await supabase
      .from('broker_connections')
      .update({ last_sync_at: new Date().toISOString(), status: 'connected' })
      .eq('user_id', user.id);

    return res.status(200).json({
      trades: allTrades.length,
      accounts: accounts.length,
      message: `Synced ${allTrades.length} trades from ${accounts.length} account(s).`,
    });
  } catch (err) {
    console.error('SnapTrade sync error:', err);
    const detail = err.response?.data || err.responseBody || err.body;
    const msg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
    return res.status(err.response?.status || err.status || 500).json({ error: msg });
  }
}
