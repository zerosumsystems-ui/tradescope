import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useSubscription(userId) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      setSubscription(data);
      setLoading(false);
    };

    fetchSubscription();

    // Real-time updates when subscription changes
    const channel = supabase
      .channel('subscription-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setSubscription(payload.new);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  const plan = subscription?.plan || 'free';
  const isActive = !subscription || subscription.status === 'active' || subscription.status === 'trialing';
  const isPro = isActive && (plan === 'pro' || plan === 'elite');
  const isElite = isActive && plan === 'elite';

  return { subscription, loading, plan, isActive, isPro, isElite };
}
