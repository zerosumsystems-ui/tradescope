import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const C = {
  bg: "#000000",
  surface: "#111111",
  surfaceHover: "#1a1a1a",
  surfaceRaised: "#222222",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  text: "#f5f5f7",
  textSecondary: "#a1a1a6",
  textTertiary: "#6e6e73",
  accent: "#2997ff",
  accentSoft: "rgba(41,151,255,0.1)",
  green: "#34c759",
  red: "#ff3b30",
  yellow: "#ffcc00",
  purple: "#af52de",
  cyan: "#5ac8fa",
  white: "#ffffff",
};

function FadeIn({ children, delay = 0, style = {} }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  const navStyle = {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
    background: "rgba(0,0,0,0.72)",
    borderBottom: "0.5px solid rgba(255,255,255,0.08)",
  };

  const sectionHeading = {
    fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.08,
    letterSpacing: "-0.03em", textAlign: "center",
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
  };

  const sectionSub = {
    fontSize: "clamp(16px, 2vw, 21px)", color: C.textSecondary,
    lineHeight: 1.5, textAlign: "center", maxWidth: 600, margin: "0 auto",
    fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 400,
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      color: C.text, overflowX: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ── Nav ── */}
      <nav style={navStyle}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", maxWidth: 1080, margin: "0 auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("/")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
              <polyline points="16,7 22,7 22,13" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>TradeScope</span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {["Features", "Pricing"].map(item => (
              <button key={item} onClick={() => {
                if (item === "Pricing") navigate("/pricing");
                else document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }} style={{
                background: "none", border: "none", color: C.textSecondary,
                fontSize: 12, fontWeight: 400, cursor: "pointer", padding: 0,
                fontFamily: "inherit", transition: "color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.color = C.text}
                onMouseLeave={e => e.currentTarget.style.color = C.textSecondary}
              >{item}</button>
            ))}
            <button onClick={() => navigate("/login")} style={{
              background: "none", border: "none", color: C.accent,
              fontSize: 12, fontWeight: 400, cursor: "pointer", padding: 0,
              fontFamily: "inherit",
            }}>Sign In</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        textAlign: "center", paddingTop: "clamp(120px, 18vh, 200px)",
        paddingBottom: 40, paddingLeft: 24, paddingRight: 24,
        maxWidth: 980, margin: "0 auto", position: "relative",
      }}>
        {/* Subtle radial glow */}
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: "80vw", maxWidth: 800, height: 400, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${C.accent}06 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <FadeIn>
          <h1 style={{
            fontSize: "clamp(44px, 8vw, 80px)", fontWeight: 700, lineHeight: 1.04,
            letterSpacing: "-0.04em", margin: "0 0 24px",
          }}>
            Know your edge.
            <br />
            <span style={{ color: C.textTertiary }}>Trade with clarity.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p style={{
            fontSize: "clamp(17px, 2.2vw, 21px)", color: C.textSecondary,
            lineHeight: 1.5, maxWidth: 520, margin: "0 auto 40px",
            fontWeight: 400,
          }}>
            Van Tharp analytics that turn your trade history into
            actionable insights. SQN, R-multiples, expectancy — in seconds.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/login?signup=1")} style={{
              padding: "16px 36px", border: "none", borderRadius: 980,
              background: C.accent, color: C.white, fontSize: 17, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1a8aef"; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = "scale(1)"; }}
            >Get Started — It's Free</button>
            <button onClick={() => navigate("/login?demo=1")} style={{
              padding: "16px 36px", border: "none", borderRadius: 980,
              background: "rgba(255,255,255,0.08)", color: C.text,
              fontSize: 17, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.3s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            >Try Demo</button>
          </div>
        </FadeIn>
      </section>

      {/* ── Dashboard Preview ── */}
      <FadeIn delay={0.3} style={{ maxWidth: 1000, margin: "60px auto 0", padding: "0 24px" }}>
        <div style={{
          borderRadius: 20, overflow: "hidden",
          background: C.surface, position: "relative",
          boxShadow: "0 0 0 0.5px rgba(255,255,255,0.08), 0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(41,151,255,0.04)",
        }}>
          {/* Window chrome */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "14px 20px", background: "rgba(255,255,255,0.03)",
            borderBottom: "0.5px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: 5, background: c, opacity: 0.8 }} />
              ))}
            </div>
            <div style={{
              flex: 1, textAlign: "center", fontSize: 12, color: C.textTertiary,
              fontWeight: 500,
            }}>TradeScope — Dashboard</div>
          </div>

          {/* Mock metrics */}
          <div style={{ padding: "24px 24px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
              {[
                { l: "SQN", v: "3.42", badge: "Excellent", c: C.green },
                { l: "Expectancy", v: "+0.38R", c: C.green },
                { l: "Win Rate", v: "65.0%", c: C.text },
                { l: "Profit Factor", v: "2.14", c: C.green },
                { l: "Max DD", v: "2.14R", c: C.yellow },
                { l: "Expectunity", v: "+2.1R/mo", c: C.accent },
              ].map(m => (
                <div key={m.l} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 18px",
                }}>
                  <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, marginBottom: 6 }}>{m.l}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: m.c, letterSpacing: "-0.02em" }}>{m.v}</span>
                    {m.badge && <span style={{ fontSize: 10, fontWeight: 600, color: m.c, padding: "2px 8px", borderRadius: 6, background: `${m.c}18` }}>{m.badge}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock chart */}
          <div style={{ padding: "20px 24px 28px" }}>
            <div style={{
              background: "rgba(255,255,255,0.02)", borderRadius: 14,
              height: 160, display: "flex", alignItems: "flex-end",
              padding: "0 24px 24px", gap: 4, overflow: "hidden",
            }}>
              {[18,30,25,42,36,52,45,60,55,68,62,74,70,82,78,90,86,94,88,96].map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}%`, borderRadius: 4,
                  background: `linear-gradient(to top, ${C.accent}50, ${C.accent}10)`,
                  minWidth: 3,
                }} />
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Stats Row ── */}
      <section style={{ maxWidth: 800, margin: "80px auto", padding: "0 24px" }}>
        <FadeIn>
          <div style={{
            display: "flex", justifyContent: "center", gap: "clamp(32px, 6vw, 80px)",
            flexWrap: "wrap",
          }}>
            {[
              { v: "7", l: "Brokers supported" },
              { v: "20+", l: "Van Tharp metrics" },
              { v: "< 5s", l: "From CSV to insights" },
              { v: "Free", l: "No credit card needed" },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700,
                  letterSpacing: "-0.03em", color: C.text,
                }}>{s.v}</div>
                <div style={{
                  fontSize: 13, color: C.textTertiary, fontWeight: 500, marginTop: 4,
                }}>{s.l}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{
        maxWidth: 1080, margin: "0 auto", padding: "60px 24px 100px",
      }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={sectionHeading}>
              Everything you need to<br />
              <span style={{ color: C.textTertiary }}>measure your edge.</span>
            </h2>
            <p style={{ ...sectionSub, marginTop: 16 }}>
              Built around Van Tharp's proven framework for evaluating and improving trading systems.
            </p>
          </div>
        </FadeIn>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 1,
          background: "rgba(255,255,255,0.04)", borderRadius: 20, overflow: "hidden",
        }}>
          {[
            {
              title: "Van Tharp Metrics",
              desc: "SQN, Expectancy, Expectunity, Payoff Ratio — the complete system quality analysis used by professional traders worldwide.",
              icon: "M22 7 13.5 15.5 8.5 10.5 2 17M16 7h6v6",
            },
            {
              title: "R-Multiple Analysis",
              desc: "Every trade measured in risk units. Distribution histograms, waterfall charts, and monthly tracking reveal your system's true character.",
              icon: "M3 3h18v18H3zM3 9h18M9 21V9",
            },
            {
              title: "Trade Journal",
              desc: "Attach notes, emotions, and strategy tags. Review your psychology alongside performance metrics to find hidden patterns.",
              icon: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z",
            },
            {
              title: "Position Sizing",
              desc: "Monte Carlo simulations with Van Tharp's position sizing methods. See how different risk levels change your equity curve.",
              icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
            },
            {
              title: "AI Insights",
              desc: "Automated pattern detection spots streaks, drawdown issues, strategy weaknesses, and opportunities you might miss.",
              icon: "M12 2a10 10 0 1 0 10 10H12V2zM20 12a8 8 0 0 1-8 8",
            },
            {
              title: "Multi-Broker Import",
              desc: "Auto-detects Fidelity, Schwab, IBKR, Webull, Tradovate, AMP Futures, and TradeLocker. Just drop your CSV.",
              icon: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22V15",
            },
          ].map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.05}>
              <div style={{
                background: C.bg, padding: "40px 36px",
                transition: "background 0.3s ease",
                minHeight: 200, display: "flex", flexDirection: "column",
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface}
                onMouseLeave={e => e.currentTarget.style.background = C.bg}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ marginBottom: 20, opacity: 0.9 }}>
                  <path d={f.icon} />
                </svg>
                <h3 style={{
                  fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em",
                  marginBottom: 10, color: C.text,
                }}>{f.title}</h3>
                <p style={{
                  fontSize: 15, color: C.textSecondary, lineHeight: 1.55,
                  margin: 0, fontWeight: 400,
                }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Methodology ── */}
      <section style={{
        maxWidth: 1080, margin: "0 auto", padding: "40px 24px 120px",
      }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={sectionHeading}>
              Built on Van Tharp's<br />
              <span style={{ color: C.accent }}>System Quality Number.</span>
            </h2>
            <p style={{ ...sectionSub, marginTop: 16 }}>
              Most traders obsess over win rate. Van Tharp proved that the key is
              expectancy — the average R-multiple — combined with opportunity.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div style={{
            display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap",
            maxWidth: 700, margin: "0 auto 60px",
          }}>
            {[
              { label: "< 1.5", desc: "Difficult", c: C.red },
              { label: "1.5–2", desc: "Average", c: "#ff9500" },
              { label: "2–3", desc: "Good", c: C.yellow },
              { label: "3–5", desc: "Excellent", c: C.green },
              { label: "5–7", desc: "Superb", c: C.accent },
              { label: "7+", desc: "Holy Grail", c: C.cyan },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex: 1, minWidth: 100, padding: "20px 16px", textAlign: "center",
                background: `${s.c}08`,
                borderRadius: i === 0 ? "12px 0 0 12px" : i === 5 ? "0 12px 12px 0" : 0,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.c, letterSpacing: "-0.02em" }}>{s.label}</div>
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 4, fontWeight: 500 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div style={{
            background: C.surface, borderRadius: 20, padding: "48px",
            maxWidth: 560, margin: "0 auto", textAlign: "center",
            boxShadow: "0 0 0 0.5px rgba(255,255,255,0.06)",
          }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: C.textTertiary,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24,
            }}>The Formula</div>
            <div style={{
              fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 300,
              color: C.text, letterSpacing: "-0.02em", lineHeight: 1.4,
            }}>
              SQN = <span style={{ fontWeight: 600, color: C.accent }}>(Mean R / Std R)</span> × √n
            </div>
            <div style={{
              marginTop: 32, display: "flex", flexDirection: "column", gap: 16,
              textAlign: "left", padding: "0 20px",
            }}>
              {[
                { t: "Mean R", d: "Your average R-multiple — expectancy per trade" },
                { t: "Std R", d: "Consistency of your results" },
                { t: "√n", d: "Square root of trades (capped at 100)" },
              ].map(item => (
                <div key={item.t} style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.accent, minWidth: 56 }}>{item.t}</span>
                  <span style={{ fontSize: 14, color: C.textSecondary, fontWeight: 400 }}>{item.d}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── CTA ── */}
      <section style={{
        textAlign: "center", padding: "80px 24px 120px",
        maxWidth: 700, margin: "0 auto",
      }}>
        <FadeIn>
          <h2 style={{
            ...sectionHeading, marginBottom: 16,
          }}>
            Ready to find your edge?
          </h2>
          <p style={{ ...sectionSub, marginBottom: 40 }}>
            Drop a CSV, see your SQN in under five seconds. Free forever for core analytics.
          </p>
          <button onClick={() => navigate("/login?signup=1")} style={{
            padding: "18px 48px", border: "none", borderRadius: 980,
            background: C.white, color: C.bg, fontSize: 18, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
          >Get Started — It's Free</button>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "0.5px solid rgba(255,255,255,0.06)",
        padding: "20px 24px",
        maxWidth: 1080, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="2" strokeLinecap="round">
            <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.textTertiary }}>TradeScope</span>
        </div>
        <span style={{ fontSize: 12, color: C.textTertiary }}>
          Van Tharp analytics for systematic traders
        </span>
      </footer>
    </div>
  );
}
