import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const C = {
  bg: "#000000", surface: "#111111", surfaceRaised: "#1a1a1a",
  border: "rgba(255,255,255,0.06)", text: "#f5f5f7", textSecondary: "#a1a1a6",
  textTertiary: "#6e6e73", accent: "#2997ff", green: "#34c759", red: "#ff3b30",
  purple: "#af52de", cyan: "#5ac8fa", white: "#ffffff",
};

export default function PricingPage({ session, plan: currentPlan }) {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  const tiers = [
    {
      name: "Free", key: "free", price: 0,
      desc: "Get started with basic Van Tharp analytics",
      cta: "Start Free",
      features: [
        "50 trade limit", "Fidelity CSV import",
        "Core Van Tharp metrics (SQN, Expectancy)",
        "R-Multiple distribution chart", "Basic trade log",
        "Position sizing calculator",
      ],
      excluded: [
        "Multi-broker sync", "Trade journal", "AI Trade Coach",
        "Strategy tagging & filtering", "Tax reporting",
        "Performance reports", "Email digests",
      ],
    },
    {
      name: "Pro", key: "pro", price: annual ? 24 : 29,
      desc: "Full analytics suite for serious traders",
      cta: "Start Pro Trial", popular: true,
      features: [
        "Unlimited trades",
        "Multi-broker import (Fidelity, Schwab, IBKR, Webull, Tradovate, AMP, TradeLocker)",
        "Full Van Tharp metric suite",
        "Trade journal with emotions & strategy tags",
        "Strategy performance comparison",
        "All chart types & timing analysis",
        "Position sizing calculator (all methods)",
        "Monthly performance reports (PDF)",
        "Weekly email digest", "Shareable performance cards",
      ],
      excluded: [
        "AI Trade Coach", "Automated pattern detection",
        "Tax reporting", "Priority support",
      ],
    },
    {
      name: "Elite", key: "elite", price: annual ? 59 : 69,
      desc: "AI-powered coaching and professional tools",
      cta: "Start Elite Trial",
      features: [
        "Everything in Pro", "AI Trade Coach — personalized insights",
        "Automated pattern detection",
        "\"What-if\" scenario simulator",
        "Tax reporting (wash sales, Schedule D)",
        "Custom report builder", "Daily email + SMS alerts",
        "Drawdown & streak warnings", "API access", "Priority support",
      ],
      excluded: [],
    },
  ];

  const handleCheckout = async (plan) => {
    setCheckoutLoading(plan);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({ plan, period: annual ? 'annual' : 'monthly' }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
    setCheckoutLoading(null);
  };

  const handleManageSubscription = async () => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const res = await fetch('/api/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`,
        },
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Portal error:', err);
    }
  };

  const getCtaLabel = (tierKey) => {
    if (!session) return tierKey === 'free' ? 'Start Free' : `Start ${tierKey === 'pro' ? 'Pro' : 'Elite'} Trial`;
    if (currentPlan === tierKey) return 'Current Plan';
    if (tierKey === 'free') return 'Free Plan';
    if (currentPlan === 'elite' && tierKey === 'pro') return 'Current: Elite';
    return `Upgrade to ${tierKey === 'pro' ? 'Pro' : 'Elite'}`;
  };

  const isCtaDisabled = (tierKey) => {
    if (!session) return false;
    if (currentPlan === tierKey) return true;
    if (tierKey === 'free') return true;
    if (currentPlan === 'elite' && tierKey === 'pro') return true;
    return false;
  };

  const handleCtaClick = (tierKey) => {
    if (!session) {
      navigate("/login?signup=1");
      return;
    }
    if (isCtaDisabled(tierKey)) return;
    handleCheckout(tierKey);
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: C.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Nav */}
      <nav style={{
        background: "#000",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", maxWidth: 1080, margin: "0 auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("/")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>TradeScope</span>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {session ? (
              <>
                {currentPlan !== 'free' && (
                  <button onClick={handleManageSubscription} style={{
                    background: "none", border: "none", color: C.accent,
                    fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                  }}>Manage Subscription</button>
                )}
                <button onClick={() => navigate("/dashboard")} style={{
                  padding: "8px 20px", border: "none", borderRadius: 980,
                  background: C.accent, color: C.white, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>Dashboard</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/login")} style={{
                  background: "none", border: "none", color: C.textSecondary,
                  fontSize: 12, fontWeight: 400, cursor: "pointer", fontFamily: "inherit",
                }}>Sign In</button>
                <button onClick={() => navigate("/login?signup=1")} style={{
                  padding: "8px 20px", border: "none", borderRadius: 980,
                  background: C.accent, color: C.white, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section style={{ textAlign: "center", padding: "80px 24px 40px", maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{
          fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 700,
          letterSpacing: "-0.04em", marginBottom: 16, lineHeight: 1.08,
        }}>
          Simple pricing.
          <br />
          <span style={{ color: C.textTertiary }}>No surprises.</span>
        </h1>
        <p style={{ fontSize: 17, color: C.textSecondary, marginBottom: 32, fontWeight: 400 }}>
          Start free. Upgrade when your trading demands it.
        </p>

        {/* Toggle */}
        <div style={{
          display: "inline-flex", background: C.surface, borderRadius: 980, padding: 3,
          boxShadow: "0 0 0 0.5px rgba(255,255,255,0.06)",
        }}>
          {[false, true].map(isAnnual => (
            <button key={String(isAnnual)} onClick={() => setAnnual(isAnnual)} style={{
              padding: "9px 24px", borderRadius: 980, border: "none", fontSize: 14, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease",
              background: annual === isAnnual ? "rgba(255,255,255,0.1)" : "transparent",
              color: annual === isAnnual ? C.text : C.textSecondary,
            }}>
              {isAnnual ? "Annual" : "Monthly"}
              {isAnnual && <span style={{ fontSize: 11, color: C.green, marginLeft: 6, fontWeight: 600 }}>Save 17%</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Pricing Cards */}
      <section style={{
        maxWidth: 1100, margin: "0 auto 100px", padding: "0 24px",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 16,
        alignItems: "start",
      }}>
        {tiers.map(tier => {
          const disabled = isCtaDisabled(tier.key);
          const loading = checkoutLoading === tier.key;

          return (
            <div key={tier.name} style={{
              background: C.surface, borderRadius: 20,
              border: tier.popular ? `1px solid ${C.accent}40` : "0.5px solid rgba(255,255,255,0.06)",
              padding: "36px 30px", position: "relative",
              boxShadow: tier.popular ? "0 0 60px rgba(41,151,255,0.08)" : "none",
              transition: "transform 0.3s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              {tier.popular && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  padding: "5px 18px", borderRadius: 980, fontSize: 11, fontWeight: 600,
                  background: C.accent, color: C.white, letterSpacing: "0.02em",
                }}>Most Popular</div>
              )}

              {/* Current Plan badge */}
              {session && currentPlan === tier.key && (
                <div style={{
                  position: "absolute", top: tier.popular ? 16 : -12, right: 16,
                  padding: "4px 12px", borderRadius: 980, fontSize: 10, fontWeight: 600,
                  background: C.green, color: "#000", letterSpacing: "0.02em",
                  ...(tier.popular ? {} : { top: -12 }),
                }}>Your Plan</div>
              )}

              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: C.text, marginBottom: 8 }}>{tier.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em" }}>
                    ${tier.price}
                  </span>
                  {tier.price > 0 && <span style={{ fontSize: 15, color: C.textSecondary, fontWeight: 400 }}>/month</span>}
                </div>
                <p style={{ fontSize: 14, color: C.textSecondary, margin: 0, fontWeight: 400 }}>{tier.desc}</p>
                {tier.price > 0 && annual && (
                  <p style={{ fontSize: 12, color: C.textTertiary, marginTop: 6 }}>
                    Billed annually (${tier.price * 12}/yr)
                  </p>
                )}
              </div>

              <button
                onClick={() => handleCtaClick(tier.key)}
                disabled={disabled || loading}
                style={{
                  width: "100%", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                  cursor: disabled || loading ? "default" : "pointer",
                  fontFamily: "inherit", marginBottom: 28, transition: "all 0.2s",
                  border: tier.popular && !disabled ? "none" : "0.5px solid rgba(255,255,255,0.12)",
                  background: disabled ? "rgba(255,255,255,0.04)" : (tier.popular ? C.accent : "rgba(255,255,255,0.06)"),
                  color: disabled ? C.textTertiary : (tier.popular ? C.white : C.text),
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.opacity = "1"; }}
              >
                {loading ? "Redirecting..." : getCtaLabel(tier.key)}
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tier.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" style={{ marginTop: 1, flexShrink: 0 }}>
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                    <span style={{ fontSize: 14, color: C.text, lineHeight: 1.45, fontWeight: 400 }}>{f}</span>
                  </div>
                ))}
                {tier.excluded.map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="1.5" strokeLinecap="round" style={{ marginTop: 1, flexShrink: 0 }}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span style={{ fontSize: 14, color: C.textTertiary, lineHeight: 1.45, fontWeight: 400 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Manage Subscription banner for paid users */}
      {session && currentPlan !== 'free' && (
        <section style={{
          maxWidth: 640, margin: "0 auto 60px", padding: "0 24px",
        }}>
          <div style={{
            background: C.surface, borderRadius: 16, padding: "24px 28px",
            border: "0.5px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                Manage your subscription
              </div>
              <div style={{ fontSize: 13, color: C.textSecondary }}>
                Update payment method, change plan, or cancel
              </div>
            </div>
            <button onClick={handleManageSubscription} style={{
              padding: "10px 24px", borderRadius: 980, border: "none",
              background: "rgba(255,255,255,0.06)", color: C.text,
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            >
              Manage
            </button>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section style={{ maxWidth: 640, margin: "0 auto 100px", padding: "0 24px" }}>
        <h2 style={{
          fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, textAlign: "center",
          marginBottom: 40, letterSpacing: "-0.03em",
        }}>
          Questions? Answers.
        </h2>
        {[
          { q: "Can I try Pro or Elite before committing?", a: "Yes. Both paid plans come with a 14-day free trial. No credit card required to start." },
          { q: "Which brokers are supported?", a: "Free supports Fidelity CSV exports. Pro and Elite add Schwab, Interactive Brokers, Webull, Tradovate, AMP Futures (CQG/Rithmic), and TradeLocker, with more brokers added regularly." },
          { q: "How does the AI Trade Coach work?", a: "It analyzes your trade history, journal entries, and performance patterns to surface personalized insights — your best strategy, worst trading days, emotional patterns tied to losses, and more." },
          { q: "Is my data secure?", a: "All data is encrypted in transit and at rest. We use Supabase with row-level security — you can only access your own trades. We never share or sell your data." },
          { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from your account settings or the Manage Subscription button above. You'll keep access through the end of your billing period." },
          { q: "What is Van Tharp's methodology?", a: "Van Tharp's framework measures trading system quality through R-multiples, SQN, expectancy, and position sizing. It focuses on the math of your edge, not just win rate." },
        ].map(item => (
          <details key={item.q} style={{
            background: C.surface, borderRadius: 14,
            border: "0.5px solid rgba(255,255,255,0.06)",
            padding: "18px 22px", marginBottom: 8, cursor: "pointer",
          }}>
            <summary style={{
              fontSize: 15, fontWeight: 500, color: C.text, listStyle: "none",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              {item.q}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round"><polyline points="6,9 12,15 18,9" /></svg>
            </summary>
            <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.65, marginTop: 14, marginBottom: 0, fontWeight: 400 }}>{item.a}</p>
          </details>
        ))}
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "0.5px solid rgba(255,255,255,0.06)", padding: "20px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 1080, margin: "0 auto", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="2" strokeLinecap="round">
            <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.textTertiary }}>TradeScope</span>
        </div>
        <span style={{ fontSize: 12, color: C.textTertiary }}>Van Tharp analytics for systematic traders</span>
      </footer>
    </div>
  );
}
