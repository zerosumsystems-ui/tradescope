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

    if (conn?.snaptrade_user_id) {
      // Delete the user from SnapTrade
      try {
        await snaptrade.authentication.deleteSnapTradeUser({
          userId: conn.snaptrade_user_id,
        });
      } catch (snapErr) {
        console.error('SnapTrade delete error (non-fatal):', snapErr.message);
      }
    }

    // Remove from our DB
    await supabase
      .from('broker_connections')
      .delete()
      .eq('user_id', user.id);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('SnapTrade disconnect error:', err);
    const detail = err.response?.data || err.responseBody || err.body;
    const msg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
    return res.status(err.response?.status || err.status || 500).json({ error: msg });
  }
}
