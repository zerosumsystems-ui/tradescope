import { useState } from "react";
import { useNavigate } from "react-router-dom";

const C = {
  bg: "#06090f", bgAlt: "#0b1018", surface: "#0f1520", surfaceRaised: "#151d2b",
  border: "#1a2438", borderLight: "#243352", text: "#dfe6f0", textDim: "#6b7d9a",
  textMuted: "#3d4f6a", accent: "#00e5c7", green: "#00e5a0", red: "#ff4d6a",
  yellow: "#ffc942", orange: "#ff8c42", purple: "#9b7dff", cyan: "#00c2ff", white: "#ffffff",
};

export default function PricingPage() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(true);

  const tiers = [
    {
      name: "Free",
      price: 0,
      desc: "Get started with basic Van Tharp analytics",
      color: C.textDim,
      cta: "Start Free",
      features: [
        "50 trade limit",
        "Fidelity CSV import",
        "Core Van Tharp metrics (SQN, Expectancy)",
        "R-Multiple distribution chart",
        "Basic trade log",
        "Position sizing calculator",
      ],
      excluded: [
        "Multi-broker sync",
        "Trade journal",
        "AI Trade Coach",
        "Strategy tagging & filtering",
        "Tax reporting",
        "Performance reports",
        "Email digests",
      ],
    },
    {
      name: "Pro",
      price: annual ? 24 : 29,
      desc: "Full analytics suite for serious traders",
      color: C.accent,
      cta: "Start Pro Trial",
      popular: true,
      features: [
        "Unlimited trades",
        "Multi-broker import (Fidelity, Schwab, IBKR, Webull, Tradovate, AMP, TradeLocker)",
        "Full Van Tharp metric suite",
        "Trade journal with emotions & strategy tags",
        "Strategy performance comparison",
        "All chart types & timing analysis",
        "Position sizing calculator (all methods)",
        "Monthly performance reports (PDF)",
        "Weekly email digest",
        "Shareable performance cards",
      ],
      excluded: [
        "AI Trade Coach",
        "Automated pattern detection",
        "Tax reporting",
        "Priority support",
      ],
    },
    {
      name: "Elite",
      price: annual ? 59 : 69,
      desc: "AI-powered coaching and professional tools",
      color: C.purple,
      cta: "Start Elite Trial",
      features: [
        "Everything in Pro",
        "AI Trade Coach — personalized insights",
        "Automated pattern detection",
        "\"What-if\" trade replay simulator",
        "Tax reporting (wash sales, Schedule D)",
        "Custom report builder",
        "Daily email + SMS alerts",
        "Drawdown & streak warnings",
        "API access",
        "Priority support",
      ],
      excluded: [],
    },
  ];

  return (
    <div style={{
      "--mono": "'IBM Plex Mono', monospace",
      "--heading": "'DM Sans', sans-serif",
      minHeight: "100vh", background: C.bg,
      fontFamily: "var(--heading)", color: C.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px", maxWidth: 1200, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
              <polyline points="16,7 22,7 22,13" />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em" }}>TradeScope</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/login")} style={{
            padding: "9px 20px", border: `1px solid ${C.border}`, borderRadius: 8,
            background: "transparent", color: C.text, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--heading)",
          }}>Sign In</button>
          <button onClick={() => navigate("/login?signup=1")} style={{
            padding: "9px 20px", border: "none", borderRadius: 8,
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            color: C.white, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--heading)",
          }}>Get Started</button>
        </div>
      </nav>

      {/* Header */}
      <section style={{ textAlign: "center", padding: "60px 24px 40px", maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 14,
        }}>
          Simple, Transparent{" "}
          <span style={{
            background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Pricing</span>
        </h1>
        <p style={{ fontSize: 15, color: C.textDim, marginBottom: 28 }}>
          Start free. Upgrade when your trading demands it.
        </p>

        {/* Toggle */}
        <div style={{
          display: "inline-flex", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
          padding: 3,
        }}>
          <button onClick={() => setAnnual(false)} style={{
            padding: "8px 20px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--heading)", transition: "all 0.15s",
            background: !annual ? `${C.accent}18` : "transparent",
            color: !annual ? C.accent : C.textDim,
          }}>Monthly</button>
          <button onClick={() => setAnnual(true)} style={{
            padding: "8px 20px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--heading)", transition: "all 0.15s",
            background: annual ? `${C.accent}18` : "transparent",
            color: annual ? C.accent : C.textDim,
          }}>
            Annual <span style={{ fontSize: 10, color: C.green, fontFamily: "var(--mono)", marginLeft: 4 }}>Save 17%</span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section style={{
        maxWidth: 1100, margin: "0 auto 80px", padding: "0 24px",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16,
        alignItems: "start",
      }}>
        {tiers.map(tier => (
          <div key={tier.name} style={{
            background: C.surface, borderRadius: 16,
            border: `1px solid ${tier.popular ? C.accent : C.border}`,
            padding: "32px 28px", position: "relative",
            boxShadow: tier.popular ? `0 0 40px ${C.accent}10` : "none",
          }}>
            {tier.popular && (
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                padding: "4px 16px", borderRadius: 12, fontSize: 10, fontWeight: 700,
                fontFamily: "var(--mono)", letterSpacing: "0.06em",
                background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                color: C.white,
              }}>MOST POPULAR</div>
            )}

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: tier.color, marginBottom: 6 }}>{tier.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 42, fontWeight: 800, fontFamily: "var(--mono)", letterSpacing: "-0.04em" }}>
                  ${tier.price}
                </span>
                {tier.price > 0 && <span style={{ fontSize: 13, color: C.textDim }}>/month</span>}
              </div>
              <p style={{ fontSize: 13, color: C.textDim, margin: 0 }}>{tier.desc}</p>
              {tier.price > 0 && annual && (
                <p style={{ fontSize: 11, color: C.textMuted, fontFamily: "var(--mono)", marginTop: 4 }}>
                  Billed annually (${tier.price * 12}/yr)
                </p>
              )}
            </div>

            <button onClick={() => navigate("/login?signup=1")} style={{
              width: "100%", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "var(--heading)", marginBottom: 24, transition: "all 0.2s",
              border: tier.popular ? "none" : `1px solid ${C.border}`,
              background: tier.popular ? `linear-gradient(135deg, ${C.accent}, ${C.purple})` : "transparent",
              color: tier.popular ? C.white : C.text,
            }}>{tier.cta}</button>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tier.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" style={{ marginTop: 2, flexShrink: 0 }}>
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  <span style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
              {tier.excluded.map(f => (
                <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" style={{ marginTop: 2, flexShrink: 0 }}>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 700, margin: "0 auto 80px", padding: "0 24px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 32, letterSpacing: "-0.03em" }}>
          Frequently Asked Questions
        </h2>
        {[
          { q: "Can I try Pro or Elite before committing?", a: "Yes. Both paid plans come with a 14-day free trial. No credit card required to start." },
          { q: "Which brokers are supported?", a: "Free supports Fidelity CSV exports. Pro and Elite add Schwab, Interactive Brokers, Webull, Tradovate, AMP Futures (CQG/Rithmic), and TradeLocker, with more brokers added regularly." },
          { q: "How does the AI Trade Coach work?", a: "It analyzes your trade history, journal entries, and performance patterns to surface personalized insights. Things like your best strategy, worst trading days, emotional patterns tied to losses, and more." },
          { q: "Is my data secure?", a: "Yes. All data is encrypted in transit and at rest. We use Supabase with row-level security — you can only access your own trades. We never share or sell your data." },
          { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from your account settings. You'll keep access through the end of your billing period." },
          { q: "What is Van Tharp's methodology?", a: "Van Tharp's framework measures trading system quality through R-multiples (risk units), SQN (System Quality Number), expectancy, and position sizing. It focuses on the math of your edge, not just win rate." },
        ].map(item => (
          <details key={item.q} style={{
            background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`,
            padding: "16px 20px", marginBottom: 8, cursor: "pointer",
          }}>
            <summary style={{ fontSize: 14, fontWeight: 600, color: C.text, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {item.q}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,9 12,15 18,9" /></svg>
            </summary>
            <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>{item.a}</p>
          </details>
        ))}
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${C.border}`, padding: "28px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 1200, margin: "0 auto", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 5,
            background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
              <polyline points="16,7 22,7 22,13" />
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em" }}>TradeScope</span>
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "var(--mono)" }}>
          Van Tharp analytics for systematic traders
        </div>
      </footer>
    </div>
  );
}
