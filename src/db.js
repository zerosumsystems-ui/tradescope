import { supabase } from './supabaseClient'

// ── Auth ──
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}

// ── Trades ──
export async function saveTrades(userId, trades) {
  // trades = array of { date, symbol, description, action, quantity, price, commission, fees, amount }
  const rows = trades.map(t => ({
    user_id: userId,
    date: t.date,
    symbol: t.symbol,
    description: t.description || '',
    action: t.action,
    quantity: t.quantity,
    price: t.price,
    commission: t.commission || 0,
    fees: t.fees || 0,
    amount: t.amount || 0,
  }))

  // Use upsert with onConflict to skip duplicates
  const { data, error } = await supabase
    .from('trades')
    .upsert(rows, { onConflict: 'user_id,date,symbol,action,quantity,price', ignoreDuplicates: true })
    .select()

  if (error) throw error
  return data
}

export async function loadTrades(userId) {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function deleteTrades(userId) {
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

// ── Settings ──
export async function loadSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data || { account_size: 25000, risk_percent: 1 }
}

export async function saveSettings(userId, accountSize, riskPercent) {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      account_size: accountSize,
      risk_percent: riskPercent,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Subscription ──
export async function getSubscription(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}
