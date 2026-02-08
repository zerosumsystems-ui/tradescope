import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LineChart,
  Line,
} from "recharts";

/* ─── design tokens ─── */
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
const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap";

/* ─── animated counter hook ─── */
function useAnimatedValue(target, duration = 600) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    const delta = target - from;
    if (Math.abs(delta) < 0.001) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }
    startRef.current = performance.now();

    const step = (now) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const current = from + delta * ease;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display;
}

/* ─── Monte Carlo simulation (runs in main thread) ─── */
function runSimulation({
  winRate,
  avgWin,
  avgLoss,
  riskPerTrade,
  ruinThreshold,
  numTrades,
  numSimulations,
}) {
  const wr = winRate / 100;
  const riskFraction = riskPerTrade / 100;
  const ruinLevel = 1 - ruinThreshold / 100;
  const startingEquity = 10000;

  let ruinCount = 0;
  let doubleCount = 0;
  const maxDrawdowns = [];
  const finalEquities = [];
  const sampleCurves = [];
  const sampleInterval = Math.max(1, Math.floor(numSimulations / 20));

  for (let s = 0; s < numSimulations; s++) {
    let equity = startingEquity;
    let peak = equity;
    let maxDD = 0;
    let ruined = false;
    const isSample = s % sampleInterval === 0 && sampleCurves.length < 20;
    let curve;
    if (isSample) {
      curve = [{ trade: 0, equity }];
    }

    for (let t = 0; t < numTrades; t++) {
      const riskAmount = equity * riskFraction;
      if (Math.random() < wr) {
        equity += riskAmount * avgWin;
      } else {
        equity -= riskAmount * avgLoss;
      }
      if (equity <= 0) equity = 0;

      if (equity > peak) peak = equity;
      const dd = (peak - equity) / peak;
      if (dd > maxDD) maxDD = dd;

      if (!ruined && equity <= startingEquity * ruinLevel) {
        ruined = true;
      }

      if (isSample) {
        /* sample every ~5% of trades to keep data manageable */
        const step = Math.max(1, Math.floor(numTrades / 200));
        if ((t + 1) % step === 0 || t === numTrades - 1) {
          curve.push({ trade: t + 1, equity });
        }
      }
    }

    if (ruined) ruinCount++;
    if (equity >= startingEquity * 2) doubleCount++;
    maxDrawdowns.push(maxDD * 100);
    finalEquities.push(equity);
    if (isSample && curve) sampleCurves.push(curve);
  }

  /* sort for median */
  const sortedDD = [...maxDrawdowns].sort((a, b) => a - b);
  const sortedFinal = [...finalEquities].sort((a, b) => a - b);
  const median = (arr) => {
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  };

  /* drawdown distribution histogram */
  const bucketCount = 40;
  const ddMin = 0;
  const ddMax = Math.min(100, Math.ceil(Math.max(...maxDrawdowns)));
  const bucketSize = Math.max(1, (ddMax - ddMin) / bucketCount);
  const histogram = [];
  for (let i = 0; i < bucketCount; i++) {
    const lo = ddMin + i * bucketSize;
    const hi = lo + bucketSize;
    const count = maxDrawdowns.filter((d) => d >= lo && d < hi).length;
    histogram.push({
      bucket: `${lo.toFixed(0)}`,
      drawdown: lo + bucketSize / 2,
      count,
      pct: (count / numSimulations) * 100,
      pastRuin: lo + bucketSize / 2 >= ruinThreshold,
    });
  }

  /* expectancy */
  const expectancy = wr * avgWin - (1 - wr) * avgLoss;

  return {
    riskOfRuin: (ruinCount / numSimulations) * 100,
    medianMaxDD: median(sortedDD),
    medianFinalEquity: median(sortedFinal),
    probDoubling: (doubleCount / numSimulations) * 100,
    expectedReturn: expectancy * numTrades * riskFraction * 100,
    expectancy,
    histogram,
    sampleCurves,
    startingEquity,
    ruinLevel: ruinLevel * startingEquity,
  };
}

/* ─── sub-components ─── */

function SliderInput({ label, value, onChange, min, max, step, unit, tooltip }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <label
          style={{
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 500,
            color: C.textSecondary,
            letterSpacing: "-0.01em",
          }}
          title={tooltip}
        >
          {label}
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            step={step}
            style={{
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 600,
              color: C.text,
              background: C.surfaceRaised,
              border: `0.5px solid ${C.border}`,
              borderRadius: 10,
              padding: "6px 10px",
              width: 72,
              textAlign: "right",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = C.accent)}
            onBlur={(e) => (e.target.style.borderColor = C.border)}
          />
          {unit && (
            <span
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: C.textTertiary,
                fontWeight: 500,
              }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>
      <div style={{ position: "relative", height: 6 }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            borderRadius: 3,
            background: C.surfaceRaised,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${pct}%`,
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`,
            transition: "width 0.15s ease",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute",
            top: -8,
            left: 0,
            width: "100%",
            height: 22,
            WebkitAppearance: "none",
            appearance: "none",
            background: "transparent",
            cursor: "pointer",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, color, prefix, suffix, decimals = 1, small }) {
  const animated = useAnimatedValue(typeof value === "number" ? value : 0);
  const formatted =
    typeof value === "number"
      ? `${prefix || ""}${animated.toFixed(decimals)}${suffix || ""}`
      : value;

  return (
    <div
      style={{
        background: C.surface,
        border: `0.5px solid ${C.border}`,
        borderRadius: 20,
        padding: small ? "16px 20px" : "24px 28px",
        flex: 1,
        minWidth: small ? 140 : 180,
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = C.borderHover)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = C.border)
      }
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 11,
          fontWeight: 500,
          color: C.textTertiary,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: small ? 6 : 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: small ? 24 : 36,
          fontWeight: 700,
          color: color || C.text,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {formatted}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `0.5px solid ${C.border}`,
        borderRadius: 20,
        padding: "24px 24px 16px",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = C.borderHover)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = C.border)
      }
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 15,
          fontWeight: 600,
          color: C.text,
          marginBottom: 20,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: C.surfaceRaised,
        border: `0.5px solid ${C.borderHover}`,
        borderRadius: 12,
        padding: "10px 14px",
        fontFamily: FONT,
        fontSize: 12,
        color: C.text,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {formatter
        ? formatter(payload, label)
        : payload.map((p, i) => (
            <div key={i} style={{ color: p.color || C.text }}>
              {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
            </div>
          ))}
    </div>
  );
};

/* ─── slider thumb CSS injected once ─── */
const SLIDER_STYLE_ID = "ror-slider-style";
function injectSliderStyles() {
  if (document.getElementById(SLIDER_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = SLIDER_STYLE_ID;
  style.textContent = `
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${C.white};
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      cursor: pointer;
      border: none;
    }
    input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${C.white};
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      cursor: pointer;
      border: none;
    }
  `;
  document.head.appendChild(style);
}

/* ─── main component ─── */
export default function RiskOfRuinPage() {
  /* inputs */
  const [winRate, setWinRate] = useState(55);
  const [avgWin, setAvgWin] = useState(1.5);
  const [avgLoss, setAvgLoss] = useState(1.0);
  const [riskPerTrade, setRiskPerTrade] = useState(1.0);
  const [ruinThreshold, setRuinThreshold] = useState(50);
  const [numTrades, setNumTrades] = useState(1000);
  const [numSimulations, setNumSimulations] = useState(10000);

  /* results */
  const [results, setResults] = useState(null);
  const [computing, setComputing] = useState(false);
  const debounceRef = useRef(null);

  /* inject styles */
  useEffect(() => {
    injectSliderStyles();
    /* Google Fonts */
    if (!document.querySelector(`link[href="${GOOGLE_FONTS_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  /* debounced simulation */
  const runSim = useCallback(() => {
    setComputing(true);
    /* use setTimeout to keep UI responsive */
    setTimeout(() => {
      const res = runSimulation({
        winRate,
        avgWin,
        avgLoss,
        riskPerTrade,
        ruinThreshold,
        numTrades,
        numSimulations,
      });
      setResults(res);
      setComputing(false);
    }, 10);
  }, [winRate, avgWin, avgLoss, riskPerTrade, ruinThreshold, numTrades, numSimulations]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runSim, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [runSim]);

  /* derived colors */
  const rorColor = useMemo(() => {
    if (!results) return C.textTertiary;
    if (results.riskOfRuin < 1) return C.green;
    if (results.riskOfRuin <= 5) return C.yellow;
    return C.red;
  }, [results]);

  /* sample curve colors */
  const curveColors = useMemo(
    () => [
      "rgba(41,151,255,0.35)",
      "rgba(90,200,250,0.30)",
      "rgba(175,82,222,0.30)",
      "rgba(52,199,89,0.25)",
      "rgba(255,204,0,0.25)",
      "rgba(255,149,0,0.25)",
      "rgba(255,59,48,0.25)",
      "rgba(41,151,255,0.25)",
      "rgba(90,200,250,0.20)",
      "rgba(175,82,222,0.20)",
      "rgba(52,199,89,0.20)",
      "rgba(255,204,0,0.20)",
      "rgba(255,149,0,0.20)",
      "rgba(255,59,48,0.20)",
      "rgba(41,151,255,0.20)",
      "rgba(90,200,250,0.18)",
      "rgba(175,82,222,0.18)",
      "rgba(52,199,89,0.18)",
      "rgba(255,204,0,0.18)",
      "rgba(255,149,0,0.18)",
    ],
    []
  );

  /* merge sample curves into single dataset keyed by trade number */
  const equityCurveData = useMemo(() => {
    if (!results || !results.sampleCurves.length) return [];
    const map = new Map();
    results.sampleCurves.forEach((curve, ci) => {
      curve.forEach(({ trade, equity }) => {
        if (!map.has(trade)) map.set(trade, { trade });
        map.get(trade)[`s${ci}`] = equity;
      });
    });
    return Array.from(map.values()).sort((a, b) => a.trade - b.trade);
  }, [results]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: FONT,
        color: C.text,
        padding: "40px 24px 80px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* ─── header ─── */}
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: FONT,
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              margin: 0,
              lineHeight: 1.1,
              background: `linear-gradient(135deg, ${C.text} 0%, ${C.textSecondary} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Risk of Ruin
          </h1>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 16,
              color: C.textSecondary,
              margin: "8px 0 0",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              lineHeight: 1.5,
            }}
          >
            Monte Carlo simulation to estimate the probability your account
            drops to a critical level.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
            gap: 32,
            alignItems: "start",
          }}
        >
          {/* ─── left column: inputs ─── */}
          <div
            style={{
              background: C.surface,
              border: `0.5px solid ${C.border}`,
              borderRadius: 20,
              padding: "28px 24px",
              position: "sticky",
              top: 24,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 600,
                color: C.textTertiary,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 24,
              }}
            >
              Parameters
            </div>

            <SliderInput
              label="Win Rate"
              value={winRate}
              onChange={setWinRate}
              min={10}
              max={95}
              step={1}
              unit="%"
              tooltip="Probability of each trade being a winner"
            />
            <SliderInput
              label="Avg Win (R-multiple)"
              value={avgWin}
              onChange={setAvgWin}
              min={0.1}
              max={10}
              step={0.1}
              unit="R"
              tooltip="Average winning trade in R-multiples"
            />
            <SliderInput
              label="Avg Loss (R-multiple)"
              value={avgLoss}
              onChange={setAvgLoss}
              min={0.1}
              max={5}
              step={0.1}
              unit="R"
              tooltip="Average losing trade in R-multiples"
            />
            <SliderInput
              label="Risk per Trade"
              value={riskPerTrade}
              onChange={setRiskPerTrade}
              min={0.1}
              max={10}
              step={0.1}
              unit="%"
              tooltip="Percentage of account risked on each trade"
            />
            <SliderInput
              label="Ruin Threshold"
              value={ruinThreshold}
              onChange={setRuinThreshold}
              min={10}
              max={90}
              step={5}
              unit="%"
              tooltip="Account drawdown percentage that counts as ruin"
            />
            <SliderInput
              label="Trades per Simulation"
              value={numTrades}
              onChange={(v) => setNumTrades(Math.round(v))}
              min={50}
              max={5000}
              step={50}
              tooltip="Number of trades in each simulated sequence"
            />
            <SliderInput
              label="Simulations"
              value={numSimulations}
              onChange={(v) => setNumSimulations(Math.round(v))}
              min={1000}
              max={50000}
              step={1000}
              tooltip="Number of Monte Carlo iterations to run"
            />

            {/* expectancy callout */}
            {results && (
              <div
                style={{
                  marginTop: 8,
                  padding: "14px 16px",
                  background: C.surfaceRaised,
                  borderRadius: 14,
                  border: `0.5px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 500,
                    color: C.textTertiary,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                  }}
                >
                  System Expectancy
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 22,
                    fontWeight: 700,
                    color: results.expectancy >= 0 ? C.green : C.red,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {results.expectancy >= 0 ? "+" : ""}
                  {results.expectancy.toFixed(3)}R
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 12,
                    color: C.textTertiary,
                    marginTop: 4,
                    lineHeight: 1.4,
                  }}
                >
                  per trade &middot; {(winRate / 100 * avgWin).toFixed(2)}R won
                  &minus; {((1 - winRate / 100) * avgLoss).toFixed(2)}R lost
                </div>
              </div>
            )}

            {computing && (
              <div
                style={{
                  marginTop: 16,
                  fontFamily: FONT,
                  fontSize: 12,
                  color: C.accent,
                  fontWeight: 500,
                  textAlign: "center",
                  animation: "pulse 1s ease-in-out infinite",
                }}
              >
                Computing...
              </div>
            )}
          </div>

          {/* ─── right column: results ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* stat cards row */}
            {results && (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <StatCard
                    label="Risk of Ruin"
                    value={results.riskOfRuin}
                    color={rorColor}
                    suffix="%"
                  />
                  <StatCard
                    label="Median Max Drawdown"
                    value={results.medianMaxDD}
                    color={results.medianMaxDD > ruinThreshold * 0.7 ? C.orange : C.text}
                    suffix="%"
                  />
                  <StatCard
                    label="Prob. of Doubling"
                    value={results.probDoubling}
                    color={results.probDoubling > 50 ? C.green : C.textSecondary}
                    suffix="%"
                  />
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <StatCard
                    label="Median Final Equity"
                    value={results.medianFinalEquity}
                    color={results.medianFinalEquity >= results.startingEquity ? C.green : C.red}
                    prefix="$"
                    suffix=""
                    decimals={0}
                    small
                  />
                  <StatCard
                    label="Expected Return"
                    value={results.expectedReturn}
                    color={results.expectedReturn >= 0 ? C.green : C.red}
                    suffix="%"
                    small
                  />
                </div>

                {/* drawdown distribution */}
                <ChartCard title="Maximum Drawdown Distribution">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={results.histogram}
                      margin={{ top: 4, right: 8, bottom: 0, left: -12 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={C.border}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="drawdown"
                        tick={{
                          fontFamily: FONT,
                          fontSize: 10,
                          fill: C.textTertiary,
                        }}
                        tickFormatter={(v) => `${Math.round(v)}%`}
                        axisLine={{ stroke: C.border }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{
                          fontFamily: FONT,
                          fontSize: 10,
                          fill: C.textTertiary,
                        }}
                        tickFormatter={(v) => `${v}`}
                        axisLine={false}
                        tickLine={false}
                        label={{
                          value: "Frequency",
                          angle: -90,
                          position: "insideLeft",
                          style: {
                            fontFamily: FONT,
                            fontSize: 10,
                            fill: C.textTertiary,
                          },
                          offset: 20,
                        }}
                      />
                      <Tooltip
                        content={
                          <CustomTooltip
                            formatter={(payload, label) => (
                              <div>
                                <div style={{ fontWeight: 600 }}>
                                  Drawdown: {parseFloat(label).toFixed(1)}%
                                </div>
                                <div style={{ color: C.textSecondary }}>
                                  Count: {payload[0]?.value}
                                </div>
                              </div>
                            )}
                          />
                        }
                      />
                      <ReferenceLine
                        x={ruinThreshold}
                        stroke={C.red}
                        strokeDasharray="6 4"
                        strokeWidth={1.5}
                        label={{
                          value: "Ruin",
                          position: "top",
                          style: {
                            fontFamily: FONT,
                            fontSize: 10,
                            fill: C.red,
                            fontWeight: 600,
                          },
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {results.histogram.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.pastRuin ? C.red : C.accent}
                            fillOpacity={entry.pastRuin ? 0.8 : 0.7}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* equity curves */}
                <ChartCard title="Sample Equity Curves (20 simulations)">
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart
                      data={equityCurveData}
                      margin={{ top: 4, right: 8, bottom: 0, left: -4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={C.border}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="trade"
                        tick={{
                          fontFamily: FONT,
                          fontSize: 10,
                          fill: C.textTertiary,
                        }}
                        axisLine={{ stroke: C.border }}
                        tickLine={false}
                        label={{
                          value: "Trade #",
                          position: "insideBottom",
                          style: {
                            fontFamily: FONT,
                            fontSize: 10,
                            fill: C.textTertiary,
                          },
                          offset: -2,
                        }}
                      />
                      <YAxis
                        tick={{
                          fontFamily: FONT,
                          fontSize: 10,
                          fill: C.textTertiary,
                        }}
                        tickFormatter={(v) =>
                          v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                        }
                        axisLine={false}
                        tickLine={false}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        content={
                          <CustomTooltip
                            formatter={(payload) => (
                              <div>
                                <div style={{ fontWeight: 600 }}>
                                  Trade {payload[0]?.payload?.trade}
                                </div>
                                {payload.slice(0, 5).map((p, i) => (
                                  <div
                                    key={i}
                                    style={{ color: C.textSecondary, fontSize: 11 }}
                                  >
                                    Sim {i + 1}: $
                                    {typeof p.value === "number"
                                      ? p.value.toFixed(0)
                                      : "—"}
                                  </div>
                                ))}
                                {payload.length > 5 && (
                                  <div
                                    style={{ color: C.textTertiary, fontSize: 10 }}
                                  >
                                    +{payload.length - 5} more
                                  </div>
                                )}
                              </div>
                            )}
                          />
                        }
                      />
                      <ReferenceLine
                        y={results.ruinLevel}
                        stroke={C.red}
                        strokeDasharray="6 4"
                        strokeWidth={1.5}
                        label={{
                          value: `Ruin ($${results.ruinLevel.toFixed(0)})`,
                          position: "right",
                          style: {
                            fontFamily: FONT,
                            fontSize: 10,
                            fill: C.red,
                            fontWeight: 600,
                          },
                        }}
                      />
                      <ReferenceLine
                        y={results.startingEquity}
                        stroke={C.textTertiary}
                        strokeDasharray="3 3"
                        strokeWidth={0.5}
                      />
                      {results.sampleCurves.map((_, i) => (
                        <Line
                          key={i}
                          type="monotone"
                          dataKey={`s${i}`}
                          stroke={curveColors[i % curveColors.length]}
                          strokeWidth={1.2}
                          dot={false}
                          activeDot={false}
                          connectNulls
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Van Tharp section */}
                <div
                  style={{
                    background: C.surface,
                    border: `0.5px solid ${C.border}`,
                    borderRadius: 20,
                    padding: "28px 28px 24px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = C.borderHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = C.border)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: `linear-gradient(135deg, ${C.purple}33, ${C.accent}33)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 1v14M1 8h14"
                          stroke={C.purple}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="8"
                          cy="8"
                          r="6.5"
                          stroke={C.purple}
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                    <h3
                      style={{
                        fontFamily: FONT,
                        fontSize: 17,
                        fontWeight: 700,
                        color: C.text,
                        margin: 0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Van Tharp on Risk of Ruin
                    </h3>
                  </div>

                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 14,
                      color: C.textSecondary,
                      lineHeight: 1.7,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    <p style={{ margin: "0 0 12px" }}>
                      Van Tharp, in{" "}
                      <em style={{ color: C.text, fontWeight: 500 }}>
                        Trade Your Way to Financial Freedom
                      </em>
                      , emphasizes that{" "}
                      <strong style={{ color: C.text }}>
                        risk of ruin should be kept below 1%
                      </strong>
                      . A trader with a positive expectancy system can still go
                      broke if position sizing is too aggressive.
                    </p>
                    <p style={{ margin: "0 0 12px" }}>
                      The two primary levers for controlling risk of ruin are:
                    </p>
                    <ul
                      style={{
                        margin: "0 0 12px",
                        paddingLeft: 20,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <li>
                        <strong style={{ color: C.accent }}>
                          Position sizing (risk per trade)
                        </strong>{" "}
                        — The single most important factor. Reducing risk per
                        trade from 2% to 1% can dramatically lower ruin
                        probability even with the same system.
                      </li>
                      <li>
                        <strong style={{ color: C.accent }}>
                          System quality (expectancy &times; opportunity)
                        </strong>{" "}
                        — A higher win rate, better reward-to-risk ratio, or
                        both will produce a larger positive expectancy,
                        providing a bigger edge over randomness.
                      </li>
                    </ul>
                    <p style={{ margin: "0 0 0" }}>
                      Tharp&apos;s{" "}
                      <strong style={{ color: C.text }}>
                        System Quality Number (SQN)
                      </strong>{" "}
                      combines expectancy and trade frequency into a single
                      metric. Systems with SQN above 3.0 are considered
                      excellent and are naturally resistant to ruin when paired
                      with conservative position sizing. Use the sliders to
                      explore how each variable affects your survival
                      probability.
                    </p>
                  </div>

                  {/* traffic light indicator */}
                  <div
                    style={{
                      marginTop: 20,
                      padding: "14px 18px",
                      borderRadius: 14,
                      background: C.surfaceRaised,
                      border: `0.5px solid ${C.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: rorColor,
                        boxShadow: `0 0 8px ${rorColor}66`,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontFamily: FONT,
                        fontSize: 13,
                        fontWeight: 500,
                        color: C.text,
                        lineHeight: 1.5,
                      }}
                    >
                      {results.riskOfRuin < 1 && (
                        <>
                          Your risk of ruin is{" "}
                          <span style={{ color: C.green, fontWeight: 700 }}>
                            under 1%
                          </span>
                          . This meets Van Tharp&apos;s recommended threshold for
                          professional-grade position sizing.
                        </>
                      )}
                      {results.riskOfRuin >= 1 && results.riskOfRuin <= 5 && (
                        <>
                          Your risk of ruin is{" "}
                          <span style={{ color: C.yellow, fontWeight: 700 }}>
                            between 1% and 5%
                          </span>
                          . Consider reducing risk per trade or improving your
                          system&apos;s expectancy to bring this below 1%.
                        </>
                      )}
                      {results.riskOfRuin > 5 && (
                        <>
                          Your risk of ruin is{" "}
                          <span style={{ color: C.red, fontWeight: 700 }}>
                            above 5%
                          </span>
                          . This is dangerously high. Reduce your risk per trade
                          immediately or do not trade this system live.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
