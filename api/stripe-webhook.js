import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable Vercel body parsing so we can verify the Stripe signature
export const config = {
  api: { bodyParser: false },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function getPlanFromSubscription(subscription) {
  // Check metadata first, fall back to price lookup
  return subscription.metadata?.plan || 'pro';
}

function getBillingPeriod(subscription) {
  const interval = subscription.items?.data?.[0]?.plan?.interval;
  return interval === 'year' ? 'annual' : 'monthly';
}

async function upsertSubscription(userId, subscription, customerId) {
  const plan = getPlanFromSubscription(subscription);

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customerId || subscription.customer,
    stripe_subscription_id: subscription.id,
    plan,
    status: subscription.status,
    billing_period: getBillingPeriod(subscription),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Read raw body for signature verification
  const rawBody = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const userId = subscription.metadata.supabase_user_id;
        if (!userId) {
          console.error('No supabase_user_id in subscription metadata');
          break;
        }

        await upsertSubscription(userId, subscription, session.customer);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata.supabase_user_id;
        if (!userId) break;

        await upsertSubscription(userId, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata.supabase_user_id;
        if (!userId) break;

        await supabase.from('subscriptions').update({
          status: 'canceled',
          plan: 'free',
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (!invoice.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const userId = subscription.metadata.supabase_user_id;
        if (!userId) break;

        await supabase.from('subscriptions').update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  return res.status(200).json({ received: true });
}
