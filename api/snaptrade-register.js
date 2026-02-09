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

    // Check if user already has a SnapTrade registration
    const { data: existing } = await supabase
      .from('broker_connections')
      .select('snaptrade_user_id, snaptrade_user_secret')
      .eq('user_id', user.id)
      .single();

    if (existing?.snaptrade_user_secret) {
      // Already registered — generate login redirect
      const { data: loginData } = await snaptrade.authentication.loginSnapTradeUser({
        userId: existing.snaptrade_user_id,
        userSecret: existing.snaptrade_user_secret,
        connectionType: 'read',
        customRedirect: `${req.headers.origin}/dashboard?broker=connected`,
      });

      return res.status(200).json({ redirectURI: loginData.redirectURI });
    }

    // Register new SnapTrade user
    const { data: regData } = await snaptrade.authentication.registerSnapTradeUser({
      userId: user.id,
    });

    // Save the SnapTrade credentials
    await supabase
      .from('broker_connections')
      .upsert({
        user_id: user.id,
        snaptrade_user_id: regData.userId,
        snaptrade_user_secret: regData.userSecret,
        status: 'registered',
        updated_at: new Date().toISOString(),
      });

    // Generate login redirect URI
    const { data: loginData } = await snaptrade.authentication.loginSnapTradeUser({
      userId: regData.userId,
      userSecret: regData.userSecret,
      connectionType: 'read',
      customRedirect: `${req.headers.origin}/dashboard?broker=connected`,
    });

    return res.status(200).json({ redirectURI: loginData.redirectURI });
  } catch (err) {
    console.error('SnapTrade register error:', err);
    return res.status(500).json({ error: err.message });
  }
}
