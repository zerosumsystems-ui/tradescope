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

// Normalize SnapTrade activity type to BUY or SELL
function normalizeAction(activity) {
  const type = (activity.type || '').toUpperCase().trim();
  const optionType = (activity.option_type || '').toUpperCase().trim();
  const raw = type || optionType;

  // Direct matches (SnapTrade UniversalActivity known types)
  const buyTypes = [
    'BUY', 'BOUGHT', 'PURCHASE',
    'BUY_TO_COVER', 'BUY TO COVER',
    'BUY_TO_OPEN', 'BUY_TO_CLOSE',
    'REI',  // Dividend reinvestment (results in a purchase)
  ];
  const sellTypes = [
    'SELL', 'SOLD',
    'SELL_SHORT', 'SELL SHORT',
    'SELL_TO_OPEN', 'SELL_TO_CLOSE',
  ];

  if (buyTypes.includes(raw)) return 'BUY';
  if (sellTypes.includes(raw)) return 'SELL';

  // Fuzzy match for broker-specific formats (e.g. "YOU BOUGHT", "MARKET BUY")
  if (raw.includes('BOUGHT') || raw.includes('PURCHASE') || raw.includes('BUY')) return 'BUY';
  if (raw.includes('SOLD') || raw.includes('SELL')) return 'SELL';

  return null;
}

// Track why activities are being filtered out
function diagnoseDrop(activity) {
  const type = activity.type || activity.option_type || 'unknown';
  const symbol = activity.symbol?.symbol || activity.symbol?.raw_symbol || '';
  const qty = activity.units || 0;
  const price = activity.price || 0;
  const dateStr = activity.trade_date || activity.settlement_date || activity.date || '';

  if (!normalizeAction(activity)) return { reason: 'unrecognized_type', type, symbol };
  if (!symbol && !activity.symbol?.description) return { reason: 'no_symbol', type };
  if (Number(qty) === 0) return { reason: 'zero_quantity', type, symbol };
  if (Number(price) === 0) return { reason: 'zero_price', type, symbol };
  if (!dateStr) return { reason: 'no_date', type, symbol };
  return { reason: 'parse_error', type, symbol };
}

// Convert SnapTrade activity to our trade format
function activityToTrade(activity) {
  const action = normalizeAction(activity);
  if (!action) return null;

  const symbol = activity.symbol?.symbol || activity.symbol?.raw_symbol
    || activity.symbol?.description || '';
  if (!symbol) return null;

  // Explicitly convert to numbers to prevent string coercion issues
  const qty = Math.abs(Number(activity.units) || 0);
  const price = Number(activity.price) || 0;
  if (qty === 0 || price === 0) return null;

  // Parse trade date - SnapTrade uses trade_date and settlement_date (snake_case)
  const dateStr = activity.trade_date || activity.settlement_date || activity.date || '';
  let date = '';
  if (dateStr) {
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        date = parsed.toISOString().split('T')[0];
      }
    } catch {
      // Invalid date format
    }
  }
  if (!date) return null;

  return {
    date,
    symbol: symbol.split(' ')[0].toUpperCase(),
    description: activity.description || activity.symbol?.description || '',
    action,
    quantity: qty,
    price,
    commission: 0, // SnapTrade doesn't provide a commission field
    fees: Math.abs(Number(activity.fee) || 0),
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

    // Diagnostics: track what's being fetched and what's filtered
    let totalActivitiesFetched = 0;
    const droppedReasons = {};

    for (const account of accounts) {
      try {
        let offset = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
          const response = await snaptrade.accountInformation.getAccountActivities({
            accountId: account.id,
            userId: conn.snaptrade_user_id,
            userSecret: conn.snaptrade_user_secret,
            startDate,
            endDate,
            offset,
            limit,
          });

          // The SDK may return data in different shapes:
          // - response.data (PaginatedUniversalActivity wrapper)
          // - response.data.data (nested data array)
          // - response.data as the array directly
          const responseData = response?.data;
          const activities = Array.isArray(responseData)
            ? responseData
            : (responseData?.data || responseData?.activities || []);

          if (!Array.isArray(activities) || activities.length === 0) {
            hasMore = false;
            break;
          }

          totalActivitiesFetched += activities.length;

          // Log activity types for debugging
          const typeSummary = {};
          for (const a of activities) {
            const t = a.type || a.option_type || 'unknown';
            typeSummary[t] = (typeSummary[t] || 0) + 1;
          }
          console.log(`Account ${account.id}: ${activities.length} activities (offset=${offset}), types:`, typeSummary);

          for (const activity of activities) {
            const trade = activityToTrade(activity);
            if (trade) {
              allTrades.push(trade);
            } else {
              // Track why this activity was dropped
              const diag = diagnoseDrop(activity);
              const key = `${diag.reason}:${diag.type || ''}`;
              droppedReasons[key] = (droppedReasons[key] || 0) + 1;
            }
          }

          // Check if there are more pages
          const totalItems = responseData?.pagination?.total_items;
          if (totalItems != null) {
            hasMore = (offset + activities.length) < totalItems;
          } else {
            hasMore = activities.length === limit;
          }
          offset += limit;
        }
      } catch (acctErr) {
        console.error(`Error fetching activities for account ${account.id}:`, acctErr.message);
      }
    }

    // Log diagnostic summary
    const droppedCount = totalActivitiesFetched - allTrades.length;
    if (droppedCount > 0) {
      console.log(`Sync diagnostics: ${totalActivitiesFetched} fetched, ${allTrades.length} recognized as trades, ${droppedCount} filtered out`);
      console.log('Filtered activity breakdown:', droppedReasons);
    }

    if (allTrades.length === 0) {
      await supabase
        .from('broker_connections')
        .update({ last_sync_at: new Date().toISOString(), status: 'connected' })
        .eq('user_id', user.id);

      // Build a helpful diagnostic message
      let msg = `No buy/sell trades found in the period ${startDate} to ${endDate}.`;
      if (totalActivitiesFetched > 0) {
        msg += ` ${totalActivitiesFetched} activities were fetched but none were recognized as trades.`;
        const topReasons = Object.entries(droppedReasons)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([key, count]) => `${key} (${count})`)
          .join(', ');
        if (topReasons) msg += ` Filtered types: ${topReasons}.`;
      } else {
        msg += ' Your broker returned no activities for this date range.';
      }

      return res.status(200).json({ trades: 0, totalActivities: totalActivitiesFetched, filtered: droppedReasons, message: msg });
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
      totalActivities: totalActivitiesFetched,
      filtered: droppedCount > 0 ? droppedReasons : undefined,
      dateRange: { startDate, endDate },
      message: `Synced ${allTrades.length} trades from ${accounts.length} account(s) (${startDate} to ${endDate}).`,
    });
  } catch (err) {
    console.error('SnapTrade sync error:', err);
    const detail = err.response?.data || err.responseBody || err.body;
    const msg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
    return res.status(err.response?.status || err.status || 500).json({ error: msg });
  }
}
