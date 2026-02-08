import { useState } from "react";
import { useNavigate } from "react-router-dom";

const C = {
  bg: "#06090f", bgAlt: "#0b1018", surface: "#0f1520", surfaceRaised: "#151d2b",
  border: "#1a2438", borderLight: "#243352", text: "#dfe6f0", textDim: "#6b7d9a",
  textMuted: "#3d4f6a", accent: "#00e5c7", green: "#00e5a0", red: "#ff4d6a",
  yellow: "#ffc942", orange: "#ff8c42", purple: "#9b7dff", cyan: "#00c2ff", white: "#ffffff",
};

const Logo = ({ size = 42 }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.24,
    background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: `0 0 ${size}px rgba(0,229,199,0.2)`,
  }}>
    <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  </div>
);

function FeatureCard({ icon, title, description }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.surfaceRaised : C.surface,
        border: `1px solid ${hovered ? C.borderLight : C.border}`,
        borderRadius: 14, padding: "28px 24px",
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.3)` : "none",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `linear-gradient(135deg, ${C.accent}20, ${C.purple}20)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 18,
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8,
        fontFamily: "var(--heading)", letterSpacing: "-0.02em",
      }}>{title}</h3>
      <p style={{
        fontSize: 13, color: C.textDim, lineHeight: 1.65, margin: 0,
        fontFamily: "var(--heading)",
      }}>{description}</p>
    </div>
  );
}

function StatPreview({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontSize: 28, fontWeight: 800, color: color || C.accent,
        fontFamily: "var(--mono)", letterSpacing: "-0.03em",
      }}>{value}</div>
      <div style={{
        fontSize: 10, color: C.textDim, fontFamily: "var(--mono)",
        letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4,
      }}>{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      "--mono": "'IBM Plex Mono', monospace",
      "--heading": "'DM Sans', sans-serif",
      minHeight: "100vh", background: C.bg,
      fontFamily: "var(--heading)", color: C.text,
      overflowX: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Nav ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px", maxWidth: 1200, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={34} />
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em" }}>TradeScope</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => navigate("/pricing")} style={{
            padding: "9px 16px", border: "none", borderRadius: 8,
            background: "transparent", color: C.textDim, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--heading)",
          }}>Pricing</button>
          <button onClick={() => navigate("/login")} style={{
            padding: "9px 20px", border: `1px solid ${C.border}`, borderRadius: 8,
            background: "transparent", color: C.text, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--heading)", transition: "border-color 0.2s",
          }}>Sign In</button>
          <button onClick={() => navigate("/login?signup=1")} style={{
            padding: "9px 20px", border: "none", borderRadius: 8,
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            color: C.white, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--heading)",
          }}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        textAlign: "center", padding: "80px 24px 60px",
        maxWidth: 800, margin: "0 auto", position: "relative",
      }}>
        {/* Glow effect */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accent}08 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-block", padding: "5px 16px", borderRadius: 20,
          background: `${C.accent}12`, border: `1px solid ${C.accent}30`,
          fontSize: 12, fontWeight: 600, color: C.accent, fontFamily: "var(--mono)",
          letterSpacing: "0.04em", marginBottom: 28,
        }}>
          Van Tharp Methodology
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 800, lineHeight: 1.1,
          letterSpacing: "-0.04em", marginBottom: 20, position: "relative",
        }}>
          Know Your Edge.{" "}
          <span style={{
            background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Trade It.</span>
        </h1>

        <p style={{
          fontSize: "clamp(15px, 2vw, 18px)", color: C.textDim, lineHeight: 1.7,
          maxWidth: 560, margin: "0 auto 36px",
        }}>
          Import your trades, see your R-multiples, SQN, and expectancy instantly.
          TradeScope turns raw CSV exports into Van Tharp analytics so you can
          measure and improve your trading system.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/login?signup=1")} style={{
            padding: "14px 32px", border: "none", borderRadius: 10,
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: "var(--heading)", boxShadow: `0 4px 20px ${C.accent}30`,
            transition: "transform 0.2s, box-shadow 0.2s",
          }}>Start Free</button>
          <button onClick={() => navigate("/login?demo=1")} style={{
            padding: "14px 32px", border: `1px solid ${C.border}`, borderRadius: 10,
            background: C.surface, color: C.text, fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--heading)", transition: "border-color 0.2s",
          }}>Try Demo</button>
        </div>
      </section>

      {/* ── Stat Preview Row ── */}
      <section style={{
        maxWidth: 700, margin: "20px auto 60px", padding: "24px 32px",
        display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24,
        background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`,
      }}>
        <StatPreview label="System Quality" value="3.42" color={C.green} />
        <StatPreview label="Expectancy" value="+0.38R" color={C.green} />
        <StatPreview label="Win Rate" value="65%" color={C.accent} />
        <StatPreview label="Profit Factor" value="2.14" color={C.green} />
        <StatPreview label="Expectunity" value="+2.1R/mo" color={C.cyan} />
      </section>

      {/* ── Dashboard Preview ── */}
      <section style={{
        maxWidth: 1000, margin: "0 auto 80px", padding: "0 24px",
      }}>
        <div style={{
          background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`,
          overflow: "hidden", boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
        }}>
          {/* Mock nav bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
            borderBottom: `1px solid ${C.border}`,
          }}>
            <Logo size={24} />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em" }}>TradeScope</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              {["Van Tharp", "R-Multiples", "Trade Log", "Journal"].map(tab => (
                <span key={tab} style={{
                  padding: "4px 10px", borderRadius: 4, fontSize: 10, fontFamily: "var(--mono)",
                  color: tab === "Van Tharp" ? C.accent : C.textMuted,
                  background: tab === "Van Tharp" ? `${C.accent}18` : "transparent",
                  fontWeight: 600,
                }}>{tab}</span>
              ))}
            </div>
          </div>
          {/* Mock metric cards */}
          <div style={{ padding: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {[
                { l: "SQN", v: "3.42", c: C.green, r: "Excellent" },
                { l: "Expectancy", v: "+0.38R", c: C.green },
                { l: "Win Rate", v: "65.0%", c: C.green },
                { l: "Total R", v: "+7.62R", c: C.green },
                { l: "Max Drawdown", v: "2.14R", c: C.yellow },
                { l: "Profit Factor", v: "2.14", c: C.green },
              ].map(m => (
                <div key={m.l} style={{
                  background: C.bgAlt, borderRadius: 8, border: `1px solid ${C.border}`,
                  padding: "12px 14px",
                }}>
                  <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{m.l}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: m.c, fontFamily: "var(--heading)", letterSpacing: "-0.03em" }}>{m.v}</span>
                    {m.r && <span style={{ fontSize: 8, fontWeight: 600, color: m.c, fontFamily: "var(--mono)", padding: "1px 6px", borderRadius: 3, background: `${m.c}18` }}>{m.r}</span>}
                  </div>
                </div>
              ))}
            </div>
            {/* Mock chart area */}
            <div style={{
              marginTop: 14, background: C.bgAlt, borderRadius: 10, border: `1px solid ${C.border}`,
              height: 140, display: "flex", alignItems: "end", padding: "0 20px 20px", gap: 3, overflow: "hidden",
            }}>
              {[20,35,28,45,38,55,48,62,58,72,65,78,74,85,80,92,88,95,90,98].map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0",
                  background: `linear-gradient(to top, ${C.accent}40, ${C.accent}15)`,
                  minWidth: 4,
                }} />
              ))}
            </div>
          </div>
        </div>
        <div style={{
          textAlign: "center", marginTop: 14, fontSize: 11, color: C.textMuted,
          fontFamily: "var(--mono)",
        }}>Sample dashboard view with Van Tharp metrics</div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{
        maxWidth: 1100, margin: "0 auto 80px", padding: "0 24px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{
            fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12,
          }}>
            Everything You Need to{" "}
            <span style={{ color: C.accent }}>Measure Your Edge</span>
          </h2>
          <p style={{ fontSize: 15, color: C.textDim, maxWidth: 500, margin: "0 auto" }}>
            Built around Van Tharp's proven framework for evaluating and improving trading systems.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          <FeatureCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" /></svg>}
            title="Van Tharp Metrics"
            description="SQN, Expectancy, Expectunity, Payoff Ratio, Profit Factor — the complete Van Tharp system quality analysis at a glance."
          />
          <FeatureCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>}
            title="R-Multiple Analysis"
            description="Every trade measured in risk units. Distribution histograms, waterfall charts, and monthly R tracking reveal your system's true character."
          />
          <FeatureCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>}
            title="Trade Journal"
            description="Attach notes, emotions, and strategy tags to every trade. Review your psychology alongside your performance metrics."
          />
          <FeatureCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
            title="Timing Analysis"
            description="Discover which days, holding periods, and months produce your best results. Optimize when and how long you trade."
          />
          <FeatureCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>}
            title="Position Sizing Calculator"
            description="Model Van Tharp's position sizing methods — fixed fractional, percent risk, and more — with interactive equity curve simulations."
          />
          <FeatureCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>}
            title="Strategy Tags"
            description="Categorize trades by strategy — breakout, mean reversion, earnings — and see which setups actually produce positive expectancy."
          />
        </div>
      </section>

      {/* ── Van Tharp Methodology Section ── */}
      <section style={{
        maxWidth: 1100, margin: "0 auto 80px", padding: "0 24px",
      }}>
        <div style={{
          background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`,
          padding: "48px 40px", display: "flex", gap: 48, flexWrap: "wrap", alignItems: "center",
        }}>
          <div style={{ flex: "1 1 340px" }}>
            <div style={{
              fontSize: 10, fontWeight: 600, color: C.purple, fontFamily: "var(--mono)",
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12,
            }}>The Framework</div>
            <h2 style={{
              fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.2,
            }}>Built on Van Tharp's System Quality Number</h2>
            <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.7, marginBottom: 16 }}>
              Most traders obsess over win rate. Van Tharp proved that the key to long-term
              profitability is <strong style={{ color: C.text }}>expectancy</strong> — the average
              R-multiple of your trades — combined with <strong style={{ color: C.text }}>opportunity</strong>.
            </p>
            <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.7, marginBottom: 20 }}>
              TradeScope computes your <strong style={{ color: C.accent }}>System Quality Number (SQN)</strong> to
              give you a single score that tells you if your system is tradable, good, excellent, or superb.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "< 1.5", desc: "Difficult", color: C.red },
                { label: "1.5 - 2", desc: "Average", color: C.orange },
                { label: "2 - 3", desc: "Good", color: C.yellow },
                { label: "3 - 5", desc: "Excellent", color: C.green },
                { label: "5 - 7", desc: "Superb", color: C.accent },
                { label: "7+", desc: "Holy Grail", color: C.cyan },
              ].map(s => (
                <div key={s.label} style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 11,
                  fontFamily: "var(--mono)", fontWeight: 600,
                  background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30`,
                }}>
                  {s.label} {s.desc}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: "1 1 300px" }}>
            {/* SQN Formula visualization */}
            <div style={{
              background: C.bgAlt, borderRadius: 12, border: `1px solid ${C.border}`,
              padding: 28, textAlign: "center",
            }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: C.textDim, fontFamily: "var(--mono)",
                letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20,
              }}>SQN Formula</div>
              <div style={{ fontSize: 26, fontFamily: "var(--mono)", fontWeight: 700, color: C.accent, marginBottom: 20 }}>
                SQN = <span style={{ fontSize: 20 }}>(Mean R / Std R)</span> <span style={{ fontSize: 18 }}>x</span> <span style={{ fontSize: 20 }}>&#8730;n</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
                {[
                  { term: "Mean R", desc: "Your average R-multiple (expectancy)" },
                  { term: "Std R", desc: "Standard deviation of R-multiples" },
                  { term: "n", desc: "Number of trades (capped at 100)" },
                ].map(item => (
                  <div key={item.term} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: "var(--mono)", minWidth: 60 }}>{item.term}</span>
                    <span style={{ fontSize: 12, color: C.textDim }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        textAlign: "center", padding: "60px 24px 100px",
        maxWidth: 600, margin: "0 auto",
      }}>
        <h2 style={{
          fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 14,
        }}>
          Ready to Measure Your Edge?
        </h2>
        <p style={{ fontSize: 15, color: C.textDim, marginBottom: 32 }}>
          Upload a CSV, get your SQN in seconds. Free and open source.
        </p>
        <button onClick={() => navigate("/login?signup=1")} style={{
          padding: "15px 40px", border: "none", borderRadius: 10,
          background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
          color: C.white, fontSize: 16, fontWeight: 700, cursor: "pointer",
          fontFamily: "var(--heading)", boxShadow: `0 4px 24px ${C.accent}30`,
        }}>Get Started Free</button>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: `1px solid ${C.border}`, padding: "28px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 1200, margin: "0 auto", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={22} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em" }}>TradeScope</span>
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "var(--mono)" }}>
          Van Tharp analytics for systematic traders
        </div>
      </footer>
    </div>
  );
}
