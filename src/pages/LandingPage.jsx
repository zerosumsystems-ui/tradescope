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
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(48px)",
      transition: `opacity 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      willChange: "opacity, transform",
      ...style,
    }}>{children}</div>
  );
}

/* ── Animated counter (triggers on scroll) ── */
function Counter({ end, suffix = "", prefix = "", duration = 1400 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const num = parseFloat(end);
        const isFloat = String(end).includes(".");
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - t, 4);
          setVal(isFloat ? (num * ease).toFixed(1) : Math.round(num * ease));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

/* ── Sticky feature section (Mac page style) ── */
function StickyFeature({ title, subtitle, description, cta, visual, dark = false, reverse = false, id }) {
  const navigate = useNavigate();
  return (
    <section id={id} style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: dark ? "#000" : "#080808",
      padding: "80px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        maxWidth: 1080, width: "100%", margin: "0 auto",
        display: "flex", alignItems: "center", gap: "clamp(40px, 6vw, 80px)",
        flexDirection: reverse ? "row-reverse" : "row",
        flexWrap: "wrap",
      }}>
        {/* Text side */}
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          {subtitle && (
            <div style={{
              fontSize: 15, color: "#86868b", fontWeight: 500, marginBottom: 16,
              letterSpacing: "0.01em",
            }}>{subtitle}</div>
          )}
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700,
            lineHeight: 1.07, letterSpacing: "-0.04em", marginBottom: 20,
            color: "#f5f5f7",
          }}>{title}</h2>
          <p style={{
            fontSize: "clamp(16px, 2vw, 19px)", color: "#86868b",
            lineHeight: 1.52, fontWeight: 400, maxWidth: 440, marginBottom: 28,
          }}>{description}</p>
          {cta && (
            <button onClick={() => navigate(cta.to)} style={{
              background: "none", border: "none", fontSize: 19, fontWeight: 500,
              color: "#2997ff", cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6, padding: 0,
              letterSpacing: "-0.01em", transition: "gap 0.3s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.gap = "10px"}
              onMouseLeave={e => e.currentTarget.style.gap = "6px"}
            >
              {cta.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>

        {/* Visual side */}
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          {visual}
        </div>
      </div>
    </section>
  );
}

/* ── Product card (Mac lineup style) ── */
function ProductCard({ name, price, tagline, features, popular, onCtaClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#111", borderRadius: 28, padding: "48px 36px 40px",
        textAlign: "center", position: "relative",
        border: popular ? "1px solid rgba(41,151,255,0.3)" : "0.5px solid rgba(255,255,255,0.06)",
        boxShadow: popular ? "0 0 80px rgba(41,151,255,0.06)" : "none",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease",
      }}
    >
      {popular && (
        <div style={{
          position: "absolute", top: -1, left: "50%", transform: "translate(-50%, -50%)",
          padding: "6px 20px", borderRadius: 980, fontSize: 11, fontWeight: 600,
          background: "#2997ff", color: "#fff", letterSpacing: "0.03em",
        }}>Most Popular</div>
      )}

      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: 16, margin: "0 auto 24px",
        background: popular ? "rgba(41,151,255,0.1)" : "rgba(255,255,255,0.04)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke={popular ? "#2997ff" : "#86868b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" />
        </svg>
      </div>

      <h3 style={{
        fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em",
        marginBottom: 8, color: "#f5f5f7",
      }}>{name}</h3>

      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em", color: "#f5f5f7" }}>
          {price === 0 ? "Free" : `$${price}`}
        </span>
        {price > 0 && <span style={{ fontSize: 17, color: "#86868b", fontWeight: 400 }}>/mo</span>}
      </div>

      <p style={{
        fontSize: 15, color: "#86868b", fontWeight: 400,
        marginBottom: 32, lineHeight: 1.45,
      }}>{tagline}</p>

      <button onClick={onCtaClick} style={{
        width: "100%", padding: "16px 24px", borderRadius: 14, fontSize: 17, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit", marginBottom: 32,
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        border: popular ? "none" : "0.5px solid rgba(255,255,255,0.12)",
        background: popular ? "#2997ff" : "transparent",
        color: popular ? "#fff" : "#2997ff",
      }}
        onMouseEnter={e => {
          if (!popular) { e.currentTarget.style.background = "rgba(41,151,255,0.08)"; }
          else { e.currentTarget.style.background = "#0077ed"; }
        }}
        onMouseLeave={e => {
          if (!popular) { e.currentTarget.style.background = "transparent"; }
          else { e.currentTarget.style.background = "#2997ff"; }
        }}
      >{price === 0 ? "Get started" : "Start free trial"}</button>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
        {features.map(f => (
          <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759"
              strokeWidth="2.5" strokeLinecap="round" style={{ marginTop: 2, flexShrink: 0 }}>
              <polyline points="20,6 9,17 4,12" />
            </svg>
            <span style={{ fontSize: 14, color: "#a1a1a6", lineHeight: 1.45, fontWeight: 400 }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   LANDING PAGE
   ════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      setNavSolid(window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroProgress = Math.min(scrollY / 700, 1);
  const heroOpacity = Math.max(0, 1 - heroProgress * 1.2);
  const heroScale = 1 - heroProgress * 0.06;
  const dashboardY = Math.min(heroProgress * 60, 60);

  return (
    <div style={{
      background: "#000", color: "#f5f5f7", overflowX: "hidden",
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* ── NAVIGATION (frosted glass, transitions on scroll) ── */}
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
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5f5f7" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>TradeScope</span>
          </div>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[
              { label: "Features", action: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
              { label: "Pricing", action: () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }) },
            ].map(item => (
              <button key={item.label} onClick={item.action} style={{
                background: "none", border: "none", fontSize: 12, fontWeight: 400,
                color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "inherit",
                padding: 0, transition: "color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "#f5f5f7"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
              >{item.label}</button>
            ))}
            <button onClick={() => navigate("/login")} style={{
              background: "none", border: "none", fontSize: 12, fontWeight: 400,
              color: "#2997ff", cursor: "pointer", fontFamily: "inherit", padding: 0,
            }}>Sign in</button>
          </div>
        </div>
      </nav>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         HERO — Full viewport, parallax
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "0 24px", position: "relative",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
          width: "70vw", maxWidth: 800, height: 600, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(41,151,255,0.035) 0%, transparent 70%)",
          pointerEvents: "none", filter: "blur(60px)",
        }} />

        <div style={{
          position: "relative", maxWidth: 900,
          opacity: heroOpacity, transform: `scale(${heroScale})`,
          transition: "opacity 0.05s linear, transform 0.05s linear",
        }}>
          <h1 style={{
            fontSize: "clamp(52px, 10vw, 96px)", fontWeight: 700, lineHeight: 1.0,
            letterSpacing: "-0.05em", margin: "0 0 20px",
          }}>
            Know your edge.
          </h1>
          <h1 style={{
            fontSize: "clamp(52px, 10vw, 96px)", fontWeight: 700, lineHeight: 1.0,
            letterSpacing: "-0.05em", margin: "0 0 32px",
            color: "#6e6e73",
          }}>
            Trade with clarity.
          </h1>
          <p style={{
            fontSize: "clamp(17px, 2.4vw, 21px)", color: "#86868b",
            lineHeight: 1.47, maxWidth: 480, margin: "0 auto 40px", fontWeight: 400,
          }}>
            Van Tharp analytics that transform your trade history into the insights that matter.
          </p>

          <div style={{ display: "flex", gap: 24, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/login?signup=1")} style={{
              padding: "18px 40px", border: "none", borderRadius: 980,
              background: "#2997ff", color: "#fff", fontSize: 17, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#0071e3"; e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#2997ff"; e.currentTarget.style.transform = "scale(1)"; }}
            >Get started free</button>
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} style={{
              background: "none", border: "none", fontSize: 17, fontWeight: 500,
              color: "#2997ff", cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6, padding: 0,
              letterSpacing: "-0.01em", transition: "gap 0.3s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.gap = "10px"}
              onMouseLeave={e => e.currentTarget.style.gap = "6px"}
            >
              Learn more
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          opacity: heroOpacity > 0.8 ? 0.25 : 0, transition: "opacity 0.4s",
        }}>
          <div style={{
            width: 26, height: 42, borderRadius: 13, border: "1.5px solid rgba(255,255,255,0.15)",
            display: "flex", justifyContent: "center", paddingTop: 8,
          }}>
            <div style={{
              width: 3, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.3)",
              animation: "scrollBounce 2.2s ease-in-out infinite",
            }} />
          </div>
        </div>
        <style>{`@keyframes scrollBounce { 0%,100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(7px); opacity: 0.2; } }`}</style>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         DASHBOARD PREVIEW — Floats up as you scroll
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        padding: "0 24px 0", maxWidth: 1100, margin: "0 auto",
        transform: `translateY(-${dashboardY}px)`,
        transition: "transform 0.05s linear",
      }}>
        <Reveal>
          <div style={{
            borderRadius: 24, overflow: "hidden", background: "#111",
            boxShadow: "0 0 0 0.5px rgba(255,255,255,0.06), 0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(41,151,255,0.02)",
          }}>
            {/* macOS window chrome */}
            <div style={{
              display: "flex", alignItems: "center", padding: "14px 18px",
              background: "rgba(255,255,255,0.02)",
              borderBottom: "0.5px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ display: "flex", gap: 7 }}>
                {["#ff5f57", "#febc2e", "#28c840"].map(c => (
                  <div key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c, opacity: 0.65 }} />
                ))}
              </div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#48484a", fontWeight: 500 }}>
                TradeScope — Dashboard
              </div>
            </div>

            {/* Mock metrics */}
            <div style={{ padding: "24px 24px 12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                {[
                  { l: "SQN", v: "3.42", badge: "Excellent", c: "#34c759" },
                  { l: "Expectancy", v: "+0.38R", c: "#34c759" },
                  { l: "Win Rate", v: "65.0%", c: "#f5f5f7" },
                  { l: "Profit Factor", v: "2.14", c: "#34c759" },
                  { l: "Max Drawdown", v: "2.14R", c: "#ffcc00" },
                  { l: "Expectunity", v: "+2.1R", c: "#2997ff" },
                ].map(m => (
                  <div key={m.l} style={{
                    background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: "14px 16px",
                  }}>
                    <div style={{ fontSize: 10, color: "#48484a", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>{m.l}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 22, fontWeight: 700, color: m.c, letterSpacing: "-0.03em" }}>{m.v}</span>
                      {m.badge && <span style={{ fontSize: 8, fontWeight: 600, color: m.c, padding: "2px 7px", borderRadius: 5, background: `${m.c}15` }}>{m.badge}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock equity curve */}
            <div style={{ padding: "12px 24px 28px" }}>
              <div style={{
                background: "rgba(255,255,255,0.012)", borderRadius: 14,
                height: 160, display: "flex", alignItems: "flex-end",
                padding: "0 24px 24px", gap: 2, overflow: "hidden",
              }}>
                {[12,18,15,24,22,32,28,38,34,44,40,50,46,54,52,60,56,66,62,70,68,74,70,78,76,82,80,86,84,90,88,94].map((h, i) => (
                  <div key={i} style={{
                    flex: 1, height: `${h}%`, borderRadius: 3, minWidth: 1,
                    background: `linear-gradient(to top, rgba(41,151,255,0.45), rgba(41,151,255,0.06))`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         STATS STRIP
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ padding: "120px 24px 120px" }}>
        <div style={{
          maxWidth: 960, margin: "0 auto",
          display: "flex", justifyContent: "center",
          gap: "clamp(40px, 8vw, 100px)", flexWrap: "wrap",
        }}>
          {[
            { v: "7", l: "Brokers supported", s: "+" },
            { v: "20", l: "Van Tharp metrics", s: "+" },
            { v: "5", l: "Seconds to insights", s: "s" },
            { v: "0", l: "Cost to start", p: "$" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.06}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "clamp(44px, 7vw, 72px)", fontWeight: 700,
                  letterSpacing: "-0.045em", color: "#f5f5f7", lineHeight: 1,
                }}>
                  <Counter end={s.v} suffix={s.s || ""} prefix={s.p || ""} />
                </div>
                <div style={{ fontSize: 14, color: "#86868b", fontWeight: 400, marginTop: 6 }}>{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         FEATURE SECTIONS — Full viewport, alternating bg
         (Mac page style: each feature gets a full screen)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div id="features">

        {/* ── SQN ── */}
        <StickyFeature
          dark
          subtitle="System Quality Number"
          title={<>One number that tells you<br />if your system works.</>}
          description="Van Tharp's SQN combines expectancy, consistency, and sample size into a single quality score. From &ldquo;Difficult to Trade&rdquo; to &ldquo;Holy Grail.&rdquo;"
          cta={{ label: "Learn more", to: "/login?signup=1" }}
          visual={
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "clamp(72px, 12vw, 120px)", fontWeight: 700,
                letterSpacing: "-0.05em", color: "#f5f5f7", lineHeight: 1,
              }}>
                <Counter end="3.42" duration={1600} />
              </div>
              <div style={{
                fontSize: 16, color: "#34c759", fontWeight: 600, marginTop: 14,
                display: "inline-block", padding: "6px 20px", borderRadius: 980,
                background: "rgba(52,199,89,0.08)",
              }}>Excellent</div>
              <div style={{
                display: "flex", gap: 2, justifyContent: "center", marginTop: 32,
                maxWidth: 420, margin: "32px auto 0",
              }}>
                {[
                  { n: "< 1.5", c: "#ff3b30" }, { n: "1.5–2", c: "#ff9500" },
                  { n: "2–3", c: "#ffcc00" }, { n: "3–5", c: "#34c759" },
                  { n: "5–7", c: "#2997ff" }, { n: "7+", c: "#5ac8fa" },
                ].map((s, i, arr) => (
                  <div key={s.n} style={{
                    flex: 1, padding: "14px 6px",
                    background: `${s.c}0a`,
                    borderRadius: i === 0 ? "10px 0 0 10px" : i === arr.length - 1 ? "0 10px 10px 0" : 0,
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.c }}>{s.n}</div>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        {/* ── R-Multiples ── */}
        <StickyFeature
          reverse
          subtitle="R-Multiple Analysis"
          title={<>Every trade measured<br />in risk units.</>}
          description="Distribution histograms and waterfall charts reveal the shape of your edge. Stop thinking in dollars — think in R."
          cta={{ label: "Learn more", to: "/login?signup=1" }}
          visual={
            <div style={{
              background: "#111", borderRadius: 20, padding: "32px",
              border: "0.5px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 12, color: "#48484a", fontWeight: 500, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                R-Distribution
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 140 }}>
                {[
                  { h: 12, c: "#ff3b30" }, { h: 25, c: "#ff3b30" }, { h: 45, c: "#ff3b30" },
                  { h: 85, c: "#ff3b30" }, { h: 100, c: "#86868b" },
                  { h: 75, c: "#34c759" }, { h: 55, c: "#34c759" },
                  { h: 35, c: "#34c759" }, { h: 18, c: "#34c759" }, { h: 8, c: "#34c759" },
                ].map((bar, i) => (
                  <div key={i} style={{
                    flex: 1, height: `${bar.h}%`, borderRadius: 4, minHeight: 4,
                    background: bar.c, opacity: 0.5,
                    transition: "height 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  }} />
                ))}
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between", marginTop: 12,
                fontSize: 11, color: "#48484a", fontWeight: 500,
              }}>
                <span>−3R</span><span>0</span><span>+3R</span>
              </div>
            </div>
          }
        />

        {/* ── Trade Journal ── */}
        <StickyFeature
          dark
          subtitle="Trade Journal"
          title={<>Your psychology,<br />tracked.</>}
          description="Log emotions, strategies, and confidence ratings. Find the patterns you can't see in the numbers alone."
          cta={{ label: "Learn more", to: "/login?signup=1" }}
          visual={
            <div style={{
              background: "#111", borderRadius: 20, padding: "32px",
              border: "0.5px solid rgba(255,255,255,0.06)",
            }}>
              {/* Mock journal entry */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#48484a", fontWeight: 500, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Journal Entry
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.025)", borderRadius: 12, padding: "18px",
                  border: "0.5px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ fontSize: 13, color: "#86868b", lineHeight: 1.6, fontWeight: 400 }}>
                    "Held through the pullback. Followed my plan — entered at support, sized at 1R. Feeling disciplined today."
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { tag: "Disciplined", c: "#34c759" },
                  { tag: "Patient", c: "#2997ff" },
                  { tag: "Confident", c: "#af52de" },
                  { tag: "1R Risk", c: "#86868b" },
                ].map(({ tag, c }) => (
                  <span key={tag} style={{
                    padding: "6px 14px", borderRadius: 980, fontSize: 12, fontWeight: 500,
                    background: `${c}12`, color: c,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          }
        />

        {/* ── Heatmap ── */}
        <StickyFeature
          reverse
          subtitle="Performance Heatmap"
          title={<>365 days.<br />One glance.</>}
          description="GitHub-style contribution calendar for your P&L. Spot your best months, worst weeks, and seasonal patterns instantly."
          cta={{ label: "Learn more", to: "/login?signup=1" }}
          visual={
            <div style={{
              background: "#111", borderRadius: 20, padding: "32px",
              border: "0.5px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 11, color: "#48484a", fontWeight: 500, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                2025 Performance
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: 3 }}>
                {Array.from({ length: 90 }, (_, i) => {
                  const seed = Math.sin(i * 7.3 + 42) * 0.5 + 0.5;
                  const c = seed > 0.65
                    ? `rgba(52,199,89,${0.15 + seed * 0.45})`
                    : seed > 0.35
                    ? "rgba(255,255,255,0.025)"
                    : `rgba(255,59,48,${0.15 + (1 - seed) * 0.35})`;
                  return <div key={i} style={{ aspectRatio: "1", borderRadius: 3, background: c }} />;
                })}
              </div>
              <div style={{
                display: "flex", gap: 16, marginTop: 16, fontSize: 11, color: "#48484a", fontWeight: 500,
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(52,199,89,0.5)" }} /> Profit
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,59,48,0.4)" }} /> Loss
                </span>
              </div>
            </div>
          }
        />

        {/* ── Trade Replay ── */}
        <StickyFeature
          dark
          subtitle="Trade Replay"
          title={<>Relive every trade.<br />Learn from each one.</>}
          description="Step through your trading history with playback controls and live running statistics. See your equity curve build in real time."
          cta={{ label: "Learn more", to: "/login?signup=1" }}
          visual={
            <div style={{
              background: "#111", borderRadius: 20, padding: "32px",
              border: "0.5px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 11, color: "#48484a", fontWeight: 500, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Replay Controls
              </div>
              {/* Progress bar */}
              <div style={{
                height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginBottom: 20,
                overflow: "hidden",
              }}>
                <div style={{ width: "62%", height: "100%", borderRadius: 2, background: "#2997ff" }} />
              </div>
              {/* Controls */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                {[
                  { icon: "M19 20L9 12l10-8v16z", size: 18 },
                  { icon: "M5 3l14 9-14 9V3z", size: 24, accent: true },
                  { icon: "M5 4l10 8-10 8V4z", size: 18 },
                ].map((btn, i) => (
                  <div key={i} style={{
                    width: btn.accent ? 52 : 36, height: btn.accent ? 52 : 36,
                    borderRadius: btn.accent ? 26 : 10,
                    background: btn.accent ? "#2997ff" : "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width={btn.size} height={btn.size} viewBox="0 0 24 24" fill={btn.accent ? "#fff" : "#86868b"} stroke="none">
                      <path d={btn.icon} />
                    </svg>
                  </div>
                ))}
              </div>
              {/* Mini stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { l: "Trade", v: "47/76" },
                  { l: "Running P&L", v: "+$3,420" },
                  { l: "Win Rate", v: "64%" },
                ].map(s => (
                  <div key={s.l} style={{
                    background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "12px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 9, color: "#48484a", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{s.l}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#f5f5f7", letterSpacing: "-0.02em" }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        {/* ── Multi-broker (full width, centered) ── */}
        <section style={{
          minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "#080808", padding: "80px 24px",
        }}>
          <div style={{ maxWidth: 680, textAlign: "center" }}>
            <Reveal>
              <div style={{ fontSize: 15, color: "#86868b", fontWeight: 500, marginBottom: 16 }}>Multi-Broker Import</div>
              <h2 style={{
                fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.06,
                letterSpacing: "-0.04em", marginBottom: 20, color: "#f5f5f7",
              }}>
                Drop a CSV.<br /><span style={{ color: "#6e6e73" }}>Any broker.</span>
              </h2>
              <p style={{
                fontSize: "clamp(16px, 2vw, 19px)", color: "#86868b",
                lineHeight: 1.52, fontWeight: 400, marginBottom: 40,
              }}>
                Auto-detects your format instantly. No mapping, no configuration, no friction.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {["Fidelity", "Schwab", "IBKR", "Webull", "Tradovate", "AMP", "TradeLocker"].map((b, i) => (
                  <Reveal key={b} delay={0.04 * i} style={{ display: "inline-block" }}>
                    <span style={{
                      padding: "11px 24px", borderRadius: 980, fontSize: 14, fontWeight: 500,
                      background: "rgba(255,255,255,0.04)", color: "#a1a1a6",
                      border: "0.5px solid rgba(255,255,255,0.06)",
                      display: "inline-block",
                    }}>{b}</span>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         METHODOLOGY — Van Tharp formula
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        minHeight: "80vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px", background: "#000", textAlign: "center",
      }}>
        <Reveal>
          <h2 style={{
            fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 700, lineHeight: 1.05,
            letterSpacing: "-0.045em", maxWidth: 700, margin: "0 auto 24px",
          }}>
            Built on Van Tharp.
          </h2>
          <p style={{
            fontSize: "clamp(17px, 2.2vw, 21px)", color: "#86868b", lineHeight: 1.47,
            maxWidth: 500, margin: "0 auto 56px", fontWeight: 400,
          }}>
            The framework professional traders use to measure what actually matters.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <div style={{
            background: "#111", borderRadius: 24, padding: "clamp(36px, 5vw, 56px) clamp(32px, 5vw, 64px)",
            maxWidth: 560, width: "100%",
            border: "0.5px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 300,
              letterSpacing: "-0.02em", lineHeight: 1.5, color: "#f5f5f7",
            }}>
              SQN = <span style={{ fontWeight: 600, color: "#2997ff" }}>(Mean R / Std R)</span>{" "}
              <span style={{ color: "#6e6e73" }}>× √n</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         PRICING — Product lineup (Mac style)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="pricing" style={{
        padding: "120px 24px 140px", background: "#080808",
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <h2 style={{
                fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 700, lineHeight: 1.05,
                letterSpacing: "-0.045em", marginBottom: 20,
              }}>
                Find your plan.
              </h2>
              <p style={{
                fontSize: "clamp(17px, 2.2vw, 21px)", color: "#86868b",
                lineHeight: 1.47, fontWeight: 400,
              }}>
                Start free. Upgrade when your trading demands it.
              </p>
            </div>
          </Reveal>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16, alignItems: "start",
          }}>
            <Reveal delay={0}>
              <ProductCard
                name="Free"
                price={0}
                tagline="Get started with core Van Tharp analytics"
                features={[
                  "50 trade limit",
                  "Fidelity CSV import",
                  "SQN, Expectancy, R-Multiples",
                  "R-Distribution chart",
                  "Position sizing calculator",
                ]}
                onCtaClick={() => navigate("/login?signup=1")}
              />
            </Reveal>
            <Reveal delay={0.06}>
              <ProductCard
                name="Pro"
                price={24}
                tagline="Full analytics suite for serious traders"
                popular
                features={[
                  "Unlimited trades",
                  "7 broker imports",
                  "Trade journal with tagging",
                  "Performance heatmap",
                  "Trade replay",
                  "All chart types",
                  "Monthly PDF reports",
                ]}
                onCtaClick={() => navigate("/login?signup=1")}
              />
            </Reveal>
            <Reveal delay={0.12}>
              <ProductCard
                name="Elite"
                price={59}
                tagline="AI coaching and professional tools"
                features={[
                  "Everything in Pro",
                  "AI Trade Coach",
                  "Pattern detection",
                  "Risk of Ruin simulator",
                  "Tax reporting",
                  "API access",
                  "Priority support",
                ]}
                onCtaClick={() => navigate("/login?signup=1")}
              />
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button onClick={() => navigate("/pricing")} style={{
                background: "none", border: "none", fontSize: 19, fontWeight: 500,
                color: "#2997ff", cursor: "pointer", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 6,
                letterSpacing: "-0.01em", transition: "gap 0.3s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.gap = "10px"}
                onMouseLeave={e => e.currentTarget.style.gap = "6px"}
              >
                Compare all features
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         FINAL CTA — Big, clean, confident
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        minHeight: "60vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px", textAlign: "center", background: "#000",
      }}>
        <Reveal>
          <h2 style={{
            fontSize: "clamp(48px, 9vw, 88px)", fontWeight: 700, lineHeight: 1.02,
            letterSpacing: "-0.05em", margin: "0 0 20px",
          }}>
            Ready?
          </h2>
          <p style={{
            fontSize: "clamp(17px, 2.4vw, 21px)", color: "#86868b",
            lineHeight: 1.47, margin: "0 auto 48px", maxWidth: 420, fontWeight: 400,
          }}>
            Drop a CSV. See your SQN in five seconds.<br />Free forever.
          </p>
          <button onClick={() => navigate("/login?signup=1")} style={{
            padding: "19px 48px", border: "none", borderRadius: 980,
            background: "#f5f5f7", color: "#000", fontSize: 19, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 80px rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
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
