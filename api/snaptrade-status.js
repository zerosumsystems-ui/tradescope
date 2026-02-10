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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    // Check if user has a SnapTrade registration
    const { data: conn } = await supabase
      .from('broker_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!conn?.snaptrade_user_secret) {
      return res.status(200).json({ connected: false, accounts: [] });
    }

    // List connected accounts from SnapTrade
    try {
      const { data: accounts } = await snaptrade.accountInformation.listUserAccounts({
        userId: conn.snaptrade_user_id,
        userSecret: conn.snaptrade_user_secret,
      });

      const connected = accounts && accounts.length > 0;

      // Update status in DB
      if (connected && conn.status !== 'connected') {
        await supabase
          .from('broker_connections')
          .update({ status: 'connected', updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }

      // Sum total account balance across all accounts
      let totalBalance = null;
      for (const a of (accounts || [])) {
        const amt = a.balance?.total?.amount;
        if (amt != null && !isNaN(Number(amt))) {
          totalBalance = (totalBalance || 0) + Number(amt);
        }
      }

      return res.status(200).json({
        connected,
        status: connected ? 'connected' : 'registered',
        accounts: (accounts || []).map(a => ({
          id: a.id,
          name: a.name,
          number: a.number,
          institution: a.institutionName || a.brokerage?.name || 'Unknown',
          balance: a.balance?.total?.amount ?? null,
        })),
        totalBalance,
        lastSync: conn.last_sync_at,
      });
    } catch (snapErr) {
      // SnapTrade user might be invalid
      return res.status(200).json({ connected: false, accounts: [], status: 'error' });
    }
  } catch (err) {
    console.error('SnapTrade status error:', err);
    const detail = err.response?.data || err.responseBody || err.body;
    const msg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
    return res.status(err.response?.status || err.status || 500).json({ error: msg });
  }
}
