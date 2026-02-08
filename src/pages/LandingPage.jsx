import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── Scroll-triggered reveal ── */
function Reveal({ children, delay = 0, style = {} }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: `opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1) ${delay}s, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) ${delay}s`,
      ...style,
    }}>{children}</div>
  );
}

/* ── Feature card (like a Mac product card) ── */
function FeatureCard({ title, tagline, visual, dark = false, wide = false, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: dark ? "#000" : "#111",
        borderRadius: 24,
        padding: "clamp(28px, 5vw, 48px) clamp(20px, 4vw, 40px) clamp(28px, 5vw, 44px)",
        gridColumn: wide ? "1 / -1" : undefined,
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        border: "0.5px solid rgba(255,255,255,0.06)",
        transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.4s ease",
        transform: hovered ? "scale(1.012)" : "scale(1)",
        borderColor: hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        minHeight: wide ? "clamp(260px, 40vw, 340px)" : "clamp(300px, 45vw, 380px)",
      }}
    >
      <div style={{ marginBottom: "auto" }}>
        <h3 style={{
          fontSize: wide ? 32 : 24, fontWeight: 700, letterSpacing: "-0.03em",
          marginBottom: 8, color: "#f5f5f7", lineHeight: 1.1,
        }}>{title}</h3>
        <p style={{
          fontSize: 15, color: "#86868b", fontWeight: 400, lineHeight: 1.45,
          maxWidth: wide ? 400 : 280,
        }}>{tagline}</p>
        <div style={{
          display: "inline-flex", alignItems: "center", marginTop: 14,
          fontSize: 17, fontWeight: 500, color: "#2997ff",
          transition: "gap 0.3s ease",
          gap: hovered ? 9 : 5,
        }}>
          Learn more
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </div>
      </div>

      {/* Visual */}
      <div style={{
        marginTop: 32, display: "flex", justifyContent: wide ? "center" : "center",
        transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}>
        {visual}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   LANDING PAGE — Apple /mac style product hub
   ════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (path) => navigate(path);

  return (
    <div style={{
      background: "#000", color: "#f5f5f7", overflowX: "hidden",
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        background: navSolid ? "rgba(0,0,0,0.82)" : "transparent",
        borderBottom: navSolid ? "0.5px solid rgba(255,255,255,0.06)" : "0.5px solid transparent",
        transition: "background 0.5s ease, border-color 0.5s ease",
      }}>
        <div style={{
          maxWidth: 1024, margin: "0 auto", padding: "14px 22px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5f5f7" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>TradeScope</span>
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <button onClick={() => navigate("/pricing")} style={{
              background: "none", border: "none", fontSize: 12, fontWeight: 400,
              color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "inherit",
              padding: 0, transition: "color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#f5f5f7"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
            >Pricing</button>
            <button onClick={() => navigate("/login")} style={{
              background: "none", border: "none", fontSize: 12, fontWeight: 400,
              color: "#2997ff", cursor: "pointer", fontFamily: "inherit", padding: 0,
            }}>Sign in</button>
          </div>
        </div>
      </nav>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         HERO
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        paddingTop: "clamp(120px, 18vh, 200px)",
        paddingBottom: "clamp(60px, 8vh, 100px)",
        textAlign: "center",
        position: "relative",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: "60vw", maxWidth: 700, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(41,151,255,0.04) 0%, transparent 70%)",
          pointerEvents: "none", filter: "blur(80px)",
        }} />

        <Reveal>
          <h1 style={{
            fontSize: "clamp(64px, 12vw, 120px)", fontWeight: 700, lineHeight: 1.0,
            letterSpacing: "-0.055em", margin: "0 0 16px",
          }}>TradeScope</h1>
        </Reveal>
        <Reveal delay={0.06}>
          <p style={{
            fontSize: "clamp(24px, 4vw, 32px)", color: "#86868b",
            fontWeight: 500, lineHeight: 1.25, letterSpacing: "-0.02em",
            maxWidth: 500, margin: "0 auto 28px",
          }}>
            Van Tharp analytics<br />for systematic traders.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => go("/login?signup=1")} style={{
              padding: "16px 36px", border: "none", borderRadius: 980,
              background: "#2997ff", color: "#fff", fontSize: 17, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em",
              transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#0077ed"; e.currentTarget.style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#2997ff"; e.currentTarget.style.transform = "scale(1)"; }}
            >Get started free</button>
            <button onClick={() => go("/pricing")} style={{
              padding: "16px 36px", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: 980,
              background: "transparent", color: "#f5f5f7", fontSize: 17, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em",
              transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >View pricing</button>
          </div>
        </Reveal>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         PRODUCT GRID — Like Apple /mac lineup
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ padding: "0 24px 80px", maxWidth: 1080, margin: "0 auto" }}>

        {/* ── Row 1: Dashboard (full width hero card) ── */}
        <Reveal>
          <FeatureCard
            wide
            dark
            title="Dashboard"
            tagline="SQN, Expectancy, R-Multiples, Profit Factor — every metric that matters, computed instantly from your CSV."
            onClick={() => go("/login?signup=1")}
            visual={
              <div style={{
                background: "#111", borderRadius: 20, padding: "20px 24px 16px",
                width: "100%", maxWidth: 700,
                border: "0.5px solid rgba(255,255,255,0.04)",
              }}>
                {/* Mini window chrome */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map(c => (
                    <div key={c} style={{ width: 8, height: 8, borderRadius: 4, background: c, opacity: 0.5 }} />
                  ))}
                </div>
                {/* Metric pills */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {[
                    { l: "SQN", v: "3.42", c: "#34c759" },
                    { l: "Expectancy", v: "+0.38R", c: "#34c759" },
                    { l: "Win Rate", v: "65%", c: "#f5f5f7" },
                    { l: "Profit Factor", v: "2.14", c: "#34c759" },
                    { l: "Max DD", v: "2.1R", c: "#ffcc00" },
                  ].map(m => (
                    <div key={m.l} style={{
                      background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px",
                      flex: "1 1 100px", minWidth: 90,
                    }}>
                      <div style={{ fontSize: 9, color: "#48484a", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{m.l}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: m.c, letterSpacing: "-0.03em" }}>{m.v}</div>
                    </div>
                  ))}
                </div>
                {/* Mini chart */}
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 80 }}>
                  {[15,22,18,30,26,38,34,42,38,48,44,52,50,58,54,62,60,68,64,72,70,76,74,80,78,84,82,88,86,92].map((h, i) => (
                    <div key={i} style={{
                      flex: 1, height: `${h}%`, borderRadius: 2, minWidth: 1,
                      background: `linear-gradient(to top, rgba(41,151,255,0.5), rgba(41,151,255,0.08))`,
                    }} />
                  ))}
                </div>
              </div>
            }
          />
        </Reveal>

        {/* ── Row 2: 2-column grid ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
          gap: 16, marginTop: 16,
        }}>
          <Reveal delay={0}>
            <FeatureCard
              title="Journal"
              tagline="Log emotions, strategies, and confidence. Find the patterns behind your numbers."
              onClick={() => go("/login?signup=1")}
              visual={
                <div style={{ width: "100%" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.025)", borderRadius: 14, padding: "16px",
                    border: "0.5px solid rgba(255,255,255,0.04)", marginBottom: 12,
                  }}>
                    <div style={{ fontSize: 12, color: "#86868b", lineHeight: 1.5, fontStyle: "italic" }}>
                      "Followed my plan — entered at support, sized at 1R. Feeling disciplined."
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[{ t: "Disciplined", c: "#34c759" }, { t: "Patient", c: "#2997ff" }, { t: "1R Risk", c: "#86868b" }].map(({ t, c }) => (
                      <span key={t} style={{
                        padding: "5px 12px", borderRadius: 980, fontSize: 11, fontWeight: 500,
                        background: `${c}15`, color: c,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              }
            />
          </Reveal>
          <Reveal delay={0.06}>
            <FeatureCard
              dark
              title="Heatmap"
              tagline="365 days of P&L at a glance. Spot streaks, slumps, and seasonal patterns."
              onClick={() => go("/login?signup=1")}
              visual={
                <div style={{ width: "100%" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 3 }}>
                    {Array.from({ length: 70 }, (_, i) => {
                      const seed = Math.sin(i * 7.3 + 42) * 0.5 + 0.5;
                      const c = seed > 0.6
                        ? `rgba(52,199,89,${0.2 + seed * 0.5})`
                        : seed > 0.35
                        ? "rgba(255,255,255,0.03)"
                        : `rgba(255,59,48,${0.2 + (1 - seed) * 0.4})`;
                      return <div key={i} style={{ aspectRatio: "1", borderRadius: 3, background: c }} />;
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 10, color: "#48484a" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(52,199,89,0.5)" }} /> Profit
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,59,48,0.4)" }} /> Loss
                    </span>
                  </div>
                </div>
              }
            />
          </Reveal>
        </div>

        {/* ── Row 3: 2-column grid ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
          gap: 16, marginTop: 16,
        }}>
          <Reveal delay={0}>
            <FeatureCard
              dark
              title="Position Sizing"
              tagline="Van Tharp's position sizing models. Know exactly how much to risk on every trade."
              onClick={() => go("/login?signup=1")}
              visual={
                <div style={{ width: "100%", textAlign: "center" }}>
                  <div style={{
                    display: "inline-flex", flexDirection: "column", alignItems: "center",
                    background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px 32px",
                  }}>
                    <div style={{ fontSize: 10, color: "#48484a", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Suggested Size</div>
                    <div style={{ fontSize: 40, fontWeight: 700, color: "#2997ff", letterSpacing: "-0.04em" }}>3 contracts</div>
                    <div style={{ fontSize: 13, color: "#86868b", marginTop: 6 }}>$100K account · 1% risk · $320 stop</div>
                  </div>
                </div>
              }
            />
          </Reveal>
          <Reveal delay={0.06}>
            <FeatureCard
              title="Risk of Ruin"
              tagline="Monte Carlo simulation. 10,000 scenarios. Know your probability of blowing up."
              onClick={() => go("/login?signup=1")}
              visual={
                <div style={{ width: "100%" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.025)", borderRadius: 14, padding: "20px",
                    border: "0.5px solid rgba(255,255,255,0.04)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                      <span style={{ fontSize: 10, color: "#48484a", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk of Ruin</span>
                      <span style={{ fontSize: 28, fontWeight: 700, color: "#34c759", letterSpacing: "-0.03em" }}>0.3%</span>
                    </div>
                    {/* Mini equity fan */}
                    <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: 60 }}>
                      {Array.from({ length: 30 }, (_, i) => {
                        const base = 40 + i * 1.5;
                        const variance = Math.sin(i * 2.1) * 15 + Math.sin(i * 0.7) * 10;
                        return (
                          <div key={i} style={{
                            flex: 1, height: `${Math.max(10, Math.min(95, base + variance))}%`,
                            borderRadius: 1, background: "rgba(52,199,89,0.3)",
                          }} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              }
            />
          </Reveal>
        </div>

        {/* ── Row 4: Insights (full width) ── */}
        <div style={{ marginTop: 16 }}>
          <Reveal>
            <FeatureCard
              wide
              title="Insights"
              tagline="AI-powered analysis of your trading patterns. Discover what's working, what's not, and what to change."
              onClick={() => go("/login?signup=1")}
              visual={
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", width: "100%", maxWidth: 600 }}>
                  {[
                    { icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", label: "Win rate peaks on Tuesdays at 78%", c: "#2997ff" },
                    { icon: "M22 12h-4l-3 9L9 3l-3 9H2", label: "Your edge disappears after 3pm", c: "#ff9500" },
                    { icon: "M12 2a10 10 0 1 0 10 10", label: "Best R-multiple on AAPL setups", c: "#34c759" },
                  ].map(insight => (
                    <div key={insight.label} style={{
                      flex: "1 1 160px", background: "rgba(255,255,255,0.03)",
                      borderRadius: 14, padding: "16px",
                      border: "0.5px solid rgba(255,255,255,0.04)",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={insight.c}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}>
                        <path d={insight.icon} />
                      </svg>
                      <div style={{ fontSize: 13, color: "#a1a1a6", lineHeight: 1.45 }}>{insight.label}</div>
                    </div>
                  ))}
                </div>
              }
            />
          </Reveal>
        </div>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         BROKERS STRIP
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        padding: "80px 24px", textAlign: "center",
        borderTop: "0.5px solid rgba(255,255,255,0.04)",
        borderBottom: "0.5px solid rgba(255,255,255,0.04)",
      }}>
        <Reveal>
          <div style={{ fontSize: 13, color: "#48484a", fontWeight: 500, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Import from any broker
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", maxWidth: 600, margin: "0 auto" }}>
            {["Fidelity", "Schwab", "IBKR", "Webull", "Tradovate", "AMP Futures", "TradeLocker"].map(b => (
              <span key={b} style={{
                padding: "10px 22px", borderRadius: 980, fontSize: 14, fontWeight: 500,
                background: "rgba(255,255,255,0.04)", color: "#86868b",
                border: "0.5px solid rgba(255,255,255,0.06)",
              }}>{b}</span>
            ))}
          </div>
        </Reveal>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         WHY TRADESCOPE
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ padding: "100px 24px", maxWidth: 860, margin: "0 auto" }}>
        <Reveal>
          <h2 style={{
            fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 700,
            letterSpacing: "-0.04em", lineHeight: 1.07, textAlign: "center",
            marginBottom: 56,
          }}>
            Why TradeScope.
          </h2>
        </Reveal>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
          gap: 40,
        }}>
          {[
            {
              title: "Van Tharp methodology",
              desc: "SQN, R-Multiples, Expectancy, Expectunity — the framework professional traders use to quantify their edge.",
              color: "#2997ff",
            },
            {
              title: "5 second setup",
              desc: "Drop a CSV. Auto-detection handles the rest. No column mapping, no manual config, no wasted time.",
              color: "#34c759",
            },
            {
              title: "Free forever",
              desc: "Core analytics cost nothing. See your SQN, expectancy, and R-distribution without paying a cent.",
              color: "#af52de",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div>
                <div style={{
                  width: 6, height: 6, borderRadius: 3, background: item.color,
                  marginBottom: 16,
                }} />
                <h3 style={{
                  fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em",
                  marginBottom: 8, color: "#f5f5f7",
                }}>{item.title}</h3>
                <p style={{
                  fontSize: 14, color: "#86868b", lineHeight: 1.55, fontWeight: 400,
                }}>{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         CTA
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        padding: "80px 24px 100px", textAlign: "center",
        borderTop: "0.5px solid rgba(255,255,255,0.04)",
      }}>
        <Reveal>
          <h2 style={{
            fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 700,
            letterSpacing: "-0.04em", lineHeight: 1.07,
            marginBottom: 16,
          }}>
            Start for free.
          </h2>
          <p style={{
            fontSize: 17, color: "#86868b", fontWeight: 400, lineHeight: 1.47,
            marginBottom: 32,
          }}>
            Drop a CSV. See your SQN in five seconds.
          </p>
          <button onClick={() => go("/login?signup=1")} style={{
            padding: "16px 36px", border: "none", borderRadius: 980,
            background: "#f5f5f7", color: "#000", fontSize: 17, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em",
            transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >Get started free</button>
        </Reveal>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         FOOTER
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{
        borderTop: "0.5px solid rgba(255,255,255,0.04)",
        padding: "20px 24px", maxWidth: 1024, margin: "0 auto",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#48484a" strokeWidth="2" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" />
            </svg>
            <span style={{ fontSize: 12, color: "#48484a", fontWeight: 400 }}>TradeScope</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <button onClick={() => navigate("/pricing")} style={{
              background: "none", border: "none", fontSize: 12, color: "#48484a",
              cursor: "pointer", fontFamily: "inherit", fontWeight: 400, padding: 0,
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#86868b"}
              onMouseLeave={e => e.currentTarget.style.color = "#48484a"}
            >Pricing</button>
            <button onClick={() => navigate("/login")} style={{
              background: "none", border: "none", fontSize: 12, color: "#48484a",
              cursor: "pointer", fontFamily: "inherit", fontWeight: 400, padding: 0,
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#86868b"}
              onMouseLeave={e => e.currentTarget.style.color = "#48484a"}
            >Sign in</button>
          </div>
          <span style={{ fontSize: 12, color: "#2c2c2e", fontWeight: 400 }}>Van Tharp analytics for systematic traders</span>
        </div>
      </footer>

    </div>
  );
}
