import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PRICES = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  elite_monthly: process.env.STRIPE_ELITE_MONTHLY_PRICE_ID,
  elite_annual: process.env.STRIPE_ELITE_ANNUAL_PRICE_ID,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify user from Supabase JWT
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    const { plan, period } = req.body;
    const priceKey = `${plan}_${period}`;
    const priceId = PRICES[priceKey];

    if (!priceId) {
      return res.status(400).json({ error: `Invalid plan/period: ${priceKey}` });
    }

    // Check if user already has a Stripe customer ID
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = existing?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/dashboard?checkout=success`,
      cancel_url: `${req.headers.origin}/pricing?checkout=canceled`,
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan },
        trial_period_days: 14,
      },
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}
