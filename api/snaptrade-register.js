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
      // Already registered — try to generate login redirect
      try {
        const { data: loginData } = await snaptrade.authentication.loginSnapTradeUser({
          userId: existing.snaptrade_user_id,
          userSecret: existing.snaptrade_user_secret,
          connectionType: 'read',
          customRedirect: `${req.headers.origin}/dashboard?broker=connected`,
        });

        return res.status(200).json({ redirectURI: loginData.redirectURI });
      } catch (loginErr) {
        // If signature verification fails (e.g. API key was rotated), re-register the user
        const status = loginErr.response?.status || loginErr.status;
        if (status === 401 || status === 403) {
          console.warn('SnapTrade login failed (likely API key rotation), re-registering user:', loginErr.message);
          // Delete old SnapTrade user (best-effort)
          try {
            await snaptrade.authentication.deleteSnapTradeUser({ userId: existing.snaptrade_user_id });
          } catch (_) { /* ignore — old user may already be invalid */ }
          // Remove stale DB record so re-registration below proceeds
          await supabase
            .from('broker_connections')
            .delete()
            .eq('user_id', user.id);
        } else {
          throw loginErr;
        }
      }
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
    const detail = err.response?.data || err.responseBody || err.body;
    const msg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
    return res.status(err.response?.status || err.status || 500).json({ error: msg });
  }
}
