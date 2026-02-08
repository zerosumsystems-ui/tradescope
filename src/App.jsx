import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import * as db from './db'
import TradeDashboard from './Dashboard'
import LandingPage from './pages/LandingPage'
import JournalPage from './pages/JournalPage'
import CalculatorPage from './pages/CalculatorPage'
import Layout from './components/Layout'

const C = {
  bg: "#06090f", surface: "#0d1117", border: "#1b2433", text: "#e0e6f0",
  textDim: "#6b7b95", accent: "#22d3ee", purple: "#a78bfa", green: "#10b981",
  red: "#ef4444", yellow: "#f59e0b",
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
    width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: 8,
    background: C.surface, color: C.text, fontSize: 14, fontFamily: "'Sora', sans-serif",
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Sora', 'Space Grotesk', sans-serif", color: C.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            boxShadow: '0 0 40px rgba(34,211,238,0.15)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
              <polyline points="16,7 22,7 22,13" />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.03em' }}>TradeScope</h1>
          <p style={{ color: C.textDim, fontSize: 14 }}>Van Tharp Analytics for Fidelity Trades</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            required style={inputStyle}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            required minLength={6} style={inputStyle}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />

          {error && <div style={{ color: C.red, fontSize: 13, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 6 }}>{error}</div>}
          {confirmMsg && <div style={{ color: C.green, fontSize: 13, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 6 }}>{confirmMsg}</div>}

          <button type="submit" disabled={loading} style={{
            padding: '13px 24px', border: 'none', borderRadius: 8,
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            color: 'white', fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
            fontFamily: "'Sora', sans-serif", opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
          }}>
            {loading ? '...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setConfirmMsg(''); }}
            style={{
              background: 'none', border: 'none', color: C.accent, fontSize: 13,
              cursor: 'pointer', fontFamily: "'Sora', sans-serif",
            }}>
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', color: C.textDim, fontSize: 12,
            cursor: 'pointer', fontFamily: "'Sora', sans-serif",
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
  const [settings, setSettings] = useState({ account_size: 100000, risk_percent: 1 })

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
      const [trades, userSettings] = await Promise.all([
        db.loadTrades(userId),
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
      await db.deleteTrades(session.user.id)
      setSavedTrades([])
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
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: C.textDim, fontFamily: "'Sora', sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        Loading...
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <AuthScreen onAuth={setSession} />} />

      {/* Authenticated routes */}
      <Route element={session ? <Layout user={session.user} onSignOut={handleSignOut} /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={
          <TradeDashboard
            savedTrades={savedTrades}
            onSaveTrades={handleSaveTrades}
            onClearTrades={handleClearTrades}
            onSettingsChange={handleSettingsChange}
            initialSettings={settings}
            user={session?.user}
            onSignOut={handleSignOut}
          />
        } />
        <Route path="/journal" element={<JournalPage userId={session?.user?.id} />} />
        <Route path="/calculator" element={<CalculatorPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
