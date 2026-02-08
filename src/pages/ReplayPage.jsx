import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const C = {
  bg: "#000000",
  surface: "#111111",
  surfaceRaised: "#1a1a1a",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  text: "#f5f5f7",
  textSecondary: "#a1a1a6",
  textTertiary: "#6e6e73",
  accent: "#2997ff",
  green: "#34c759",
  red: "#ff3b30",
  yellow: "#ffcc00",
  orange: "#ff9500",
  purple: "#af52de",
  cyan: "#5ac8fa",
  white: "#ffffff",
};

const FONT = "'Inter', -apple-system, sans-serif";
const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap";
const SPEEDS = [0.5, 1, 2, 5];
const SPEED_INTERVALS = { 0.5: 2000, 1: 1000, 2: 500, 5: 200 };

/* ---------- tiny helpers ---------- */
function fmt$(v) {
  if (v == null) return "—";
  const abs = Math.abs(v);
  const s = abs >= 1000 ? abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : abs.toFixed(2);
  return (v < 0 ? "-$" : "$") + s;
}

function fmtPct(v) {
  if (v == null) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
}

function fmtR(v) {
  if (v == null) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "R";
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function sqn(rValues) {
  if (!rValues || rValues.length < 5) return null;
  const n = rValues.length;
  const mean = rValues.reduce((a, b) => a + b, 0) / n;
  const variance = rValues.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return null;
  return (mean / stdDev) * Math.sqrt(Math.min(n, 100));
}

/* ---------- custom tooltip for the chart ---------- */
function ChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: C.surfaceRaised,
        border: `0.5px solid ${C.borderHover}`,
        borderRadius: 12,
        padding: "10px 14px",
        fontFamily: FONT,
        fontSize: 12,
        color: C.textSecondary,
        lineHeight: 1.6,
      }}
    >
      <div style={{ color: C.text, fontWeight: 600, marginBottom: 2 }}>
        Trade {d.tradeNum}
        {d.symbol ? ` · ${d.symbol}` : ""}
      </div>
      <div>
        Cumulative R:{" "}
        <span style={{ color: d.cumR >= 0 ? C.green : C.red, fontWeight: 600 }}>
          {fmtR(d.cumR)}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function ReplayPage({ stats }) {
  /* --- inject google font once --- */
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_LINK}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_LINK;
      document.head.appendChild(link);
    }
  }, []);

  /* --- derive sorted trades --- */
  const trades = useMemo(() => {
    if (!stats?.tradeData || !Array.isArray(stats.tradeData) || stats.tradeData.length === 0)
      return [];
    return [...stats.tradeData].sort(
      (a, b) => new Date(a.sellDate) - new Date(b.sellDate)
    );
  }, [stats]);

  const total = trades.length;

  /* --- playback state --- */
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);

  /* clamp helper */
  const goTo = useCallback(
    (i) => {
      setCurrentIdx(Math.max(0, Math.min(i, total - 1)));
    },
    [total]
  );

  const goFirst = useCallback(() => goTo(0), [goTo]);
  const goLast = useCallback(() => goTo(total - 1), [goTo, total]);
  const goPrev = useCallback(() => goTo(currentIdx - 1), [goTo, currentIdx]);
  const goNext = useCallback(() => {
    if (currentIdx >= total - 1) {
      setPlaying(false);
      return;
    }
    goTo(currentIdx + 1);
  }, [goTo, currentIdx, total]);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  /* auto-play interval */
  useEffect(() => {
    if (playing && total > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIdx((prev) => {
          if (prev >= total - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, SPEED_INTERVALS[speed]);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed, total]);

  /* keyboard shortcuts */
  useEffect(() => {
    function handleKey(e) {
      if (total === 0) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIdx((p) => Math.max(0, p - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIdx((p) => {
          if (p >= total - 1) {
            setPlaying(false);
            return p;
          }
          return p + 1;
        });
      } else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [total]);

  /* --- derived data up to currentIdx --- */
  const visibleTrades = useMemo(
    () => (total > 0 ? trades.slice(0, currentIdx + 1) : []),
    [trades, currentIdx, total]
  );

  const equityCurve = useMemo(() => {
    let cum = 0;
    return visibleTrades.map((t, i) => {
      cum += t.rMultiple ?? 0;
      return {
        tradeNum: i + 1,
        cumR: parseFloat(cum.toFixed(4)),
        symbol: t.symbol,
      };
    });
  }, [visibleTrades]);

  const runningStats = useMemo(() => {
    if (visibleTrades.length === 0) {
      return { cumR: 0, winRate: 0, sqn: null, drawdown: 0, winStreak: 0, lossStreak: 0 };
    }
    const rs = visibleTrades.map((t) => t.rMultiple ?? 0);
    const cumR = rs.reduce((a, b) => a + b, 0);
    const wins = visibleTrades.filter((t) => (t.pnl ?? t.rMultiple ?? 0) > 0).length;
    const winRate = (wins / visibleTrades.length) * 100;

    /* drawdown from peak cumulative R */
    let peak = -Infinity;
    let maxDd = 0;
    let running = 0;
    for (const r of rs) {
      running += r;
      if (running > peak) peak = running;
      const dd = peak - running;
      if (dd > maxDd) maxDd = dd;
    }

    /* current win/loss streak */
    let winStreak = 0;
    let lossStreak = 0;
    for (let i = visibleTrades.length - 1; i >= 0; i--) {
      const pnl = visibleTrades[i].pnl ?? visibleTrades[i].rMultiple ?? 0;
      if (i === visibleTrades.length - 1) {
        if (pnl > 0) winStreak = 1;
        else if (pnl < 0) lossStreak = 1;
        else break;
      } else {
        if (pnl > 0 && winStreak > 0) winStreak++;
        else if (pnl < 0 && lossStreak > 0) lossStreak++;
        else break;
      }
    }

    return {
      cumR,
      winRate,
      sqn: sqn(rs),
      drawdown: maxDd,
      winStreak,
      lossStreak,
    };
  }, [visibleTrades]);

  const currentTrade = total > 0 ? trades[currentIdx] : null;
  const progressPct = total > 1 ? (currentIdx / (total - 1)) * 100 : 0;

  /* ------------------------------------------------------------ */
  /* EMPTY STATE                                                   */
  /* ------------------------------------------------------------ */
  if (!stats || !trades.length) {
    return (
      <div
        style={{
          fontFamily: FONT,
          background: C.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.textSecondary,
          fontSize: 17,
          fontWeight: 400,
          padding: 32,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        Load trades in the Dashboard first to replay your trading history.
      </div>
    );
  }

  /* ------------------------------------------------------------ */
  /* STYLES                                                        */
  /* ------------------------------------------------------------ */
  const pillBtn = (active) => ({
    fontFamily: FONT,
    fontSize: 13,
    fontWeight: 600,
    border: `0.5px solid ${active ? C.accent : C.border}`,
    borderRadius: 999,
    background: active ? C.accent : "transparent",
    color: active ? C.white : C.textSecondary,
    padding: "5px 14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  });

  const controlBtn = {
    fontFamily: FONT,
    fontSize: 18,
    fontWeight: 500,
    background: "transparent",
    border: `0.5px solid ${C.border}`,
    borderRadius: 999,
    color: C.text,
    width: 44,
    height: 44,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  };

  const playBtn = {
    ...controlBtn,
    width: 56,
    height: 56,
    fontSize: 22,
    background: C.accent,
    border: "none",
    color: C.white,
  };

  /* ------------------------------------------------------------ */
  /* RENDER                                                        */
  /* ------------------------------------------------------------ */
  return (
    <div
      style={{
        fontFamily: FONT,
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
        padding: "32px 24px 48px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {/* ===== HEADER ===== */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
              color: C.text,
            }}
          >
            Trade Replay
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 15,
              color: C.textTertiary,
              fontWeight: 400,
            }}
          >
            Step through your closed trades and watch your equity curve build
          </p>
        </div>

        {/* ===== PLAYBACK CONTROLS ===== */}
        <div
          style={{
            background: C.surface,
            border: `0.5px solid ${C.border}`,
            borderRadius: 20,
            padding: "24px 28px 20px",
            marginBottom: 24,
          }}
        >
          {/* transport buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <button
              onClick={goFirst}
              style={controlBtn}
              title="First trade"
              aria-label="First trade"
            >
              ⏮
            </button>
            <button
              onClick={goPrev}
              style={controlBtn}
              title="Previous trade"
              aria-label="Previous trade"
            >
              ◀
            </button>
            <button
              onClick={togglePlay}
              style={playBtn}
              title={playing ? "Pause" : "Play"}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? "⏸" : "▶"}
            </button>
            <button
              onClick={goNext}
              style={controlBtn}
              title="Next trade"
              aria-label="Next trade"
            >
              ▶
            </button>
            <button
              onClick={goLast}
              style={controlBtn}
              title="Last trade"
              aria-label="Last trade"
            >
              ⏭
            </button>
          </div>

          {/* progress bar */}
          <div
            style={{
              position: "relative",
              height: 6,
              borderRadius: 3,
              background: C.surfaceRaised,
              cursor: "pointer",
              marginBottom: 16,
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              goTo(Math.round(pct * (total - 1)));
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${progressPct}%`,
                borderRadius: 3,
                background: C.accent,
                transition: "width 0.15s ease",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${progressPct}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: C.white,
                boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                transition: "left 0.15s ease",
              }}
            />
          </div>

          {/* counter + speed selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: C.textSecondary,
              }}
            >
              Trade{" "}
              <span style={{ color: C.text }}>{currentIdx + 1}</span> of{" "}
              <span style={{ color: C.text }}>{total}</span>
            </span>

            <div style={{ display: "flex", gap: 6 }}>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={pillBtn(speed === s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== MAIN GRID: trade card + stats ===== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 24,
            marginBottom: 24,
          }}
        >
          {/* --- CURRENT TRADE CARD --- */}
          <div
            style={{
              background: C.surface,
              border: `0.5px solid ${C.border}`,
              borderRadius: 20,
              padding: "28px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* symbol + dates row */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: C.text,
                }}
              >
                {currentTrade.symbol || "—"}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: C.textTertiary,
                }}
              >
                {fmtDate(currentTrade.buyDate)}{" "}
                <span style={{ margin: "0 6px", opacity: 0.5 }}>→</span>{" "}
                {fmtDate(currentTrade.sellDate)}
              </span>
            </div>

            {/* metrics grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 16,
              }}
            >
              {/* R-Multiple */}
              <div
                style={{
                  background: C.surfaceRaised,
                  borderRadius: 16,
                  padding: "18px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: C.textTertiary,
                    marginBottom: 6,
                  }}
                >
                  R-Multiple
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color:
                      (currentTrade.rMultiple ?? 0) >= 0 ? C.green : C.red,
                  }}
                >
                  {fmtR(currentTrade.rMultiple)}
                </div>
              </div>

              {/* P&L */}
              <div
                style={{
                  background: C.surfaceRaised,
                  borderRadius: 16,
                  padding: "18px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: C.textTertiary,
                    marginBottom: 6,
                  }}
                >
                  P&L
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: (currentTrade.pnl ?? 0) >= 0 ? C.green : C.red,
                  }}
                >
                  {fmt$(currentTrade.pnl)}
                </div>
              </div>

              {/* P&L % */}
              <div
                style={{
                  background: C.surfaceRaised,
                  borderRadius: 16,
                  padding: "18px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: C.textTertiary,
                    marginBottom: 6,
                  }}
                >
                  P&L %
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color:
                      (currentTrade.pnlPercent ?? 0) >= 0 ? C.green : C.red,
                  }}
                >
                  {fmtPct(currentTrade.pnlPercent)}
                </div>
              </div>

              {/* Prices */}
              <div
                style={{
                  background: C.surfaceRaised,
                  borderRadius: 16,
                  padding: "18px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: C.textTertiary,
                    marginBottom: 6,
                  }}
                >
                  Entry → Exit
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {fmt$(currentTrade.buyPrice)}
                  <span
                    style={{
                      margin: "0 6px",
                      color: C.textTertiary,
                      fontSize: 14,
                    }}
                  >
                    →
                  </span>
                  {fmt$(currentTrade.sellPrice)}
                </div>
              </div>

              {/* Hold Days */}
              <div
                style={{
                  background: C.surfaceRaised,
                  borderRadius: 16,
                  padding: "18px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: C.textTertiary,
                    marginBottom: 6,
                  }}
                >
                  Hold Time
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: C.text,
                  }}
                >
                  {currentTrade.holdDays != null
                    ? `${currentTrade.holdDays}d`
                    : "—"}
                </div>
              </div>

              {/* Quantity */}
              <div
                style={{
                  background: C.surfaceRaised,
                  borderRadius: 16,
                  padding: "18px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: C.textTertiary,
                    marginBottom: 6,
                  }}
                >
                  Quantity
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: C.text,
                  }}
                >
                  {currentTrade.quantity ?? "—"}
                </div>
              </div>
            </div>
          </div>

          {/* --- RUNNING STATS PANEL --- */}
          <div
            style={{
              background: C.surface,
              border: `0.5px solid ${C.border}`,
              borderRadius: 20,
              padding: "24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: C.textTertiary,
                marginBottom: 18,
              }}
            >
              Running Stats
            </div>

            {[
              {
                label: "Cumulative R",
                value: fmtR(runningStats.cumR),
                color: runningStats.cumR >= 0 ? C.green : C.red,
              },
              {
                label: "Win Rate",
                value: runningStats.winRate.toFixed(1) + "%",
                color: runningStats.winRate >= 50 ? C.green : C.orange,
              },
              {
                label: "SQN",
                value:
                  runningStats.sqn != null
                    ? runningStats.sqn.toFixed(2)
                    : "n/a",
                color:
                  runningStats.sqn == null
                    ? C.textTertiary
                    : runningStats.sqn >= 2
                    ? C.green
                    : runningStats.sqn >= 1
                    ? C.yellow
                    : C.red,
              },
              {
                label: "Drawdown",
                value:
                  runningStats.drawdown > 0
                    ? `-${runningStats.drawdown.toFixed(2)}R`
                    : "0.00R",
                color:
                  runningStats.drawdown > 0 ? C.red : C.textSecondary,
              },
              {
                label: "Win Streak",
                value: runningStats.winStreak > 0 ? String(runningStats.winStreak) : "—",
                color: runningStats.winStreak > 0 ? C.green : C.textSecondary,
              },
              {
                label: "Loss Streak",
                value: runningStats.lossStreak > 0 ? String(runningStats.lossStreak) : "—",
                color: runningStats.lossStreak > 0 ? C.red : C.textSecondary,
              },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 0",
                  borderBottom:
                    i < arr.length - 1
                      ? `0.5px solid ${C.border}`
                      : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: C.textSecondary,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: item.color,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== EQUITY CURVE CHART ===== */}
        <div
          style={{
            background: C.surface,
            border: `0.5px solid ${C.border}`,
            borderRadius: 20,
            padding: "24px 24px 16px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: C.textTertiary,
              marginBottom: 16,
            }}
          >
            Equity Curve (Cumulative R)
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={equityCurve}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.accent} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke={C.border}
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="tradeNum"
                tick={{ fontSize: 11, fill: C.textTertiary, fontFamily: FONT }}
                axisLine={{ stroke: C.border }}
                tickLine={false}
                label={{
                  value: "Trade #",
                  position: "insideBottomRight",
                  offset: -4,
                  style: { fontSize: 11, fill: C.textTertiary, fontFamily: FONT },
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: C.textTertiary, fontFamily: FONT }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}R`}
              />

              <Tooltip content={<ChartTooltip />} />

              <ReferenceLine
                y={0}
                stroke={C.textTertiary}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />

              <Area
                type="monotone"
                dataKey="cumR"
                stroke={C.accent}
                strokeWidth={2}
                fill="url(#rGrad)"
                animationDuration={300}
                dot={(props) => {
                  const { cx, cy, index } = props;
                  const isLast = index === equityCurve.length - 1;
                  if (!isLast) return null;
                  return (
                    <circle
                      key={`dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={C.accent}
                      stroke={C.white}
                      strokeWidth={2}
                      style={{
                        filter: "drop-shadow(0 0 6px rgba(41,151,255,0.5))",
                      }}
                    />
                  );
                }}
                activeDot={{
                  r: 5,
                  fill: C.accent,
                  stroke: C.white,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* keyboard hint */}
        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 12,
            color: C.textTertiary,
            fontWeight: 400,
          }}
        >
          Keyboard shortcuts:{" "}
          <span style={{ color: C.textSecondary, fontWeight: 500 }}>←</span>{" "}
          Previous{" · "}
          <span style={{ color: C.textSecondary, fontWeight: 500 }}>→</span>{" "}
          Next{" · "}
          <span style={{ color: C.textSecondary, fontWeight: 500 }}>Space</span>{" "}
          Play / Pause
        </div>
      </div>
    </div>
  );
}
