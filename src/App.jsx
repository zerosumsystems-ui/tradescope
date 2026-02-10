import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import * as db from './db'
import TradeDashboard from './Dashboard'
import LandingPage from './pages/LandingPage'
import JournalPage from './pages/JournalPage'
import CalculatorPage from './pages/CalculatorPage'
import InsightsPage from './pages/InsightsPage'
import PricingPage from './pages/PricingPage'
import ContactPage from './pages/ContactPage'
import HeatmapPage from './pages/HeatmapPage'
import RiskOfRuinPage from './pages/RiskOfRuinPage'
import { useSubscription } from './hooks/useSubscription'

import Layout from './components/Layout'

const C = {
  bg: "#000000", surface: "#111111", border: "rgba(255,255,255,0.06)",
  text: "#f5f5f7", textSecondary: "#a1a1a6", textTertiary: "#6e6e73",
  accent: "#2997ff", green: "#34c759", red: "#ff3b30",
}

function AuthScreen({ onAuth }) {
  const [searchParams] = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === '1')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmMsg, setConfirmMsg] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setConfirmMsg('')
    setLoading(true)
    try {
      if (isSignUp) {
        await db.signUp(email, password)
        setConfirmMsg('Check your email to confirm your account, then sign in.')
        setIsSignUp(false)
      } else {
        const data = await db.signIn(email, password)
        onAuth(data.session)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12,
    background: C.surface, color: C.text, fontSize: 15,
    fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 400,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: C.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ width: '100%', maxWidth: 380, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            width: 48, height: 48, margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
              <polyline points="16,7 22,7 22,13" />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.03em' }}>
            {isSignUp ? 'Create your account' : 'Sign in to AI Edge'}
          </h1>
          <p style={{ color: C.textSecondary, fontSize: 15, fontWeight: 400 }}>
            Van Tharp analytics for your trades
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            required style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(41,151,255,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            required minLength={6} style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(41,151,255,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />

          {error && <div style={{ color: C.red, fontSize: 13, padding: '10px 14px', background: 'rgba(255,59,48,0.08)', borderRadius: 10, fontWeight: 500 }}>{error}</div>}
          {confirmMsg && <div style={{ color: C.green, fontSize: 13, padding: '10px 14px', background: 'rgba(52,199,89,0.08)', borderRadius: 10, fontWeight: 500 }}>{confirmMsg}</div>}

          <button type="submit" disabled={loading} style={{
            padding: '14px 24px', border: 'none', borderRadius: 12,
            background: C.accent, color: 'white', fontSize: 16, fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
            opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s',
            marginTop: 4,
          }}>
            {loading ? '...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setConfirmMsg(''); }}
            style={{
              background: 'none', border: 'none', color: C.accent, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
            }}>
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', color: C.textTertiary, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 400,
          }}>Back to home</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savedTrades, setSavedTrades] = useState([])
  const [savedCashEvents, setSavedCashEvents] = useState([])
  const [settings, setSettings] = useState({ account_size: 100000, risk_percent: 1 })
  const [dashboardStats, setDashboardStats] = useState(null)
  const { plan, isPro, isElite } = useSubscription(session?.user?.id)

  // Check existing session on mount
  useEffect(() => {
    db.getSession().then(session => {
      setSession(session)
      if (session) loadUserData(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadUserData(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async (userId) => {
    try {
      const [trades, cashEvents, userSettings] = await Promise.all([
        db.loadTrades(userId),
        db.loadCashEvents(userId),
        db.loadSettings(userId),
      ])
      const formatted = trades.map(t => ({
        date: t.date,
        symbol: t.symbol,
        description: t.description,
        action: t.action,
        quantity: Number(t.quantity),
        price: Number(t.price),
        commission: Number(t.commission),
        fees: Number(t.fees),
        amount: Number(t.amount),
      }))
      setSavedTrades(formatted)
      setSavedCashEvents(cashEvents.map(e => ({
        date: e.date,
        type: e.type,
        amount: Number(e.amount),
        symbol: e.symbol || null,
        description: e.description || '',
      })))
      if (userSettings) {
        setSettings({
          account_size: Number(userSettings.account_size),
          risk_percent: Number(userSettings.risk_percent),
        })
      }
    } catch (err) {
      console.error('Failed to load user data:', err)
    }
  }

  const handleSaveTrades = useCallback(async (parsedTrades) => {
    if (!session) return
    try {
      await db.saveTrades(session.user.id, parsedTrades)
    } catch (err) {
      console.error('Failed to save trades:', err)
      throw err
    }
  }, [session])

  const handleClearTrades = useCallback(async () => {
    if (!session) return
    try {
      await Promise.all([
        db.deleteTrades(session.user.id),
        db.deleteCashEvents(session.user.id),
      ])
      setSavedTrades([])
      setSavedCashEvents([])
    } catch (err) {
      console.error('Failed to clear trades:', err)
    }
  }, [session])

  const handleSettingsChange = useCallback(async (accountSize, riskPct) => {
    if (!session) return
    try {
      await db.saveSettings(session.user.id, accountSize, riskPct)
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }, [session])

  const handleSignOut = useCallback(async () => {
    await db.signOut()
    setSession(null)
    setSavedTrades([])
    setSavedCashEvents([])
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#a1a1a6',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        Loading...
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <AuthScreen onAuth={setSession} />} />

      {/* Public routes */}
      <Route path="/pricing" element={<PricingPage session={session} plan={plan} />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Authenticated routes */}
      <Route element={session ? <Layout user={session.user} plan={plan} onSignOut={handleSignOut} /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={
          <TradeDashboard
            savedTrades={savedTrades}
            savedCashEvents={savedCashEvents}
            onSaveTrades={handleSaveTrades}
            onClearTrades={handleClearTrades}
            onSettingsChange={handleSettingsChange}
            initialSettings={settings}
            user={session?.user}
            onSignOut={handleSignOut}
            onStatsChange={setDashboardStats}
          />
        } />
        <Route path="/journal" element={<JournalPage userId={session?.user?.id} />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/insights" element={<InsightsPage stats={dashboardStats} />} />
        <Route path="/heatmap" element={<HeatmapPage stats={dashboardStats} />} />
        <Route path="/risk-of-ruin" element={<RiskOfRuinPage />} />

      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
