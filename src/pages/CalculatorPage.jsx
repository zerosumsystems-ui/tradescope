import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, BarChart, Bar, Cell } from "recharts";

const C = {
  bg: "#000000", surface: "#111111", surfaceRaised: "#1a1a1a",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
  text: "#f5f5f7", textSecondary: "#a1a1a6", textTertiary: "#6e6e73",
  accent: "#2997ff", green: "#34c759", red: "#ff3b30",
  yellow: "#ffcc00", orange: "#ff9500", purple: "#af52de", cyan: "#5ac8fa", white: "#ffffff",
};

const TT = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surfaceRaised, border: `0.5px solid ${C.borderHover}`, borderRadius: 12, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", backdropFilter: "blur(20px)" }}>
      <div style={{ fontSize: 11, color: C.textTertiary, marginBottom: 6, fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 500, letterSpacing: "0.02em" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: p.color || C.text, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif" }}>
          {p.name}: {formatter ? formatter(p.value) : (typeof p.value === "number" ? p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.value)}
        </div>
      ))}
    </div>
  );
};

function simulateEquityCurve({ accountSize, riskPct, winRate, avgWinR, avgLossR, numTrades, method, fixedRatioD }) {
  const curves = [];
  const numSims = 100;

  for (let sim = 0; sim < numSims; sim++) {
    let equity = accountSize;
    const curve = [equity];
    for (let i = 0; i < numTrades; i++) {
      let riskAmount;
      switch (method) {
        case "fixed_fractional":
          riskAmount = equity * (riskPct / 100);
          break;
        case "fixed_dollar":
          riskAmount = accountSize * (riskPct / 100);
          break;
        case "fixed_ratio":
          riskAmount = Math.max(accountSize * (riskPct / 100), (equity - accountSize) / (fixedRatioD || 10) + accountSize * (riskPct / 100));
          riskAmount = Math.min(riskAmount, equity * 0.1);
          break;
        default:
          riskAmount = equity * (riskPct / 100);
      }
      const isWin = Math.random() * 100 < winRate;
      const rMult = isWin ? avgWinR : -avgLossR;
      equity += riskAmount * rMult;
      equity = Math.max(0, equity);
      curve.push(Math.round(equity));
      if (equity <= 0) break;
    }
    curves.push(curve);
  }

  // Calculate percentiles at each trade
  const maxLen = Math.max(...curves.map(c => c.length));
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    const values = curves.map(c => c[Math.min(i, c.length - 1)]).sort((a, b) => a - b);
    result.push({
      trade: i,
      median: values[Math.floor(values.length * 0.5)],
      p10: values[Math.floor(values.length * 0.1)],
      p90: values[Math.floor(values.length * 0.9)],
      worst: values[0],
      best: values[values.length - 1],
    });
  }

  // Calculate summary stats across simulations
  const finalEquities = curves.map(c => c[c.length - 1]);
  const busted = curves.filter(c => c[c.length - 1] <= 0).length;
  const sortedFinals = [...finalEquities].sort((a, b) => a - b);
  const medianFinal = sortedFinals[Math.floor(sortedFinals.length * 0.5)];

  // Max drawdown stats
  const maxDDs = curves.map(curve => {
    let peak = curve[0], maxDD = 0;
    for (const v of curve) {
      if (v > peak) peak = v;
      const dd = (peak - v) / peak * 100;
      if (dd > maxDD) maxDD = dd;
    }
    return maxDD;
  });
  const medianDD = [...maxDDs].sort((a, b) => a - b)[Math.floor(maxDDs.length * 0.5)];

  return { curve: result, medianFinal, busted, medianDD, numSims };
}

export default function CalculatorPage() {
  const [accountSize, setAccountSize] = useState(100000);
  const [riskPct, setRiskPct] = useState(1);
  const [winRate, setWinRate] = useState(50);
  const [avgWinR, setAvgWinR] = useState(2.0);
  const [avgLossR, setAvgLossR] = useState(1.0);
  const [numTrades, setNumTrades] = useState(200);
  const [method, setMethod] = useState("fixed_fractional");
  const [fixedRatioD, setFixedRatioD] = useState(10);

  const expectancy = useMemo(() => {
    return (winRate / 100) * avgWinR - ((100 - winRate) / 100) * avgLossR;
  }, [winRate, avgWinR, avgLossR]);

  const riskAmount = accountSize * (riskPct / 100);

  const sim = useMemo(() => {
    return simulateEquityCurve({ accountSize, riskPct, winRate, avgWinR, avgLossR, numTrades, method, fixedRatioD });
  }, [accountSize, riskPct, winRate, avgWinR, avgLossR, numTrades, method, fixedRatioD]);

  // Distribution of final equities
  const distData = useMemo(() => {
    const curves = [];
    for (let i = 0; i < 500; i++) {
      let equity = accountSize;
      for (let t = 0; t < numTrades; t++) {
        let riskAmt;
        if (method === "fixed_fractional") riskAmt = equity * (riskPct / 100);
        else if (method === "fixed_dollar") riskAmt = accountSize * (riskPct / 100);
        else riskAmt = equity * (riskPct / 100);
        const isWin = Math.random() * 100 < winRate;
        equity += riskAmt * (isWin ? avgWinR : -avgLossR);
        equity = Math.max(0, equity);
        if (equity <= 0) break;
      }
      curves.push(equity);
    }
    // Bin into ranges
    const sorted = curves.sort((a, b) => a - b);
    const min = sorted[0], max = sorted[sorted.length - 1];
    const binCount = 20;
    const binSize = Math.max(1, (max - min) / binCount);
    const bins = [];
    for (let i = 0; i < binCount; i++) {
      const lo = min + i * binSize;
      const hi = lo + binSize;
      const count = sorted.filter(v => v >= lo && (i === binCount - 1 ? v <= hi : v < hi)).length;
      bins.push({
        range: `$${Math.round(lo / 1000)}k`,
        count,
        isAboveStart: lo >= accountSize,
      });
    }
    return bins;
  }, [accountSize, riskPct, winRate, avgWinR, avgLossR, numTrades, method]);

  const inputStyle = {
    width: "100%", padding: "12px 14px", background: C.surface, border: `0.5px solid ${C.border}`,
    borderRadius: 12, color: C.text, fontSize: 14, fontFamily: "'Inter', -apple-system, sans-serif",
    fontWeight: 400, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s ease",
  };
  const labelStyle = {
    fontSize: 11, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif",
    fontWeight: 500, letterSpacing: "0.02em", textTransform: "uppercase", display: "block", marginBottom: 8,
  };

  const methods = [
    { id: "fixed_fractional", label: "Fixed Fractional", desc: "Risk a fixed % of current equity on each trade. Compounds gains, limits losses." },
    { id: "fixed_dollar", label: "Fixed Dollar", desc: "Risk the same dollar amount on every trade regardless of equity changes." },
    { id: "fixed_ratio", label: "Fixed Ratio", desc: "Ryan Jones method: increase size as equity grows, with delta parameter controlling aggressiveness." },
  ];

  return (
    <div style={{
      maxWidth: 1100, margin: "0 auto", padding: "32px 28px 72px",
      fontFamily: "'Inter', -apple-system, sans-serif", color: C.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.04em", fontFamily: "'Inter', -apple-system, sans-serif" }}>Position Sizing Calculator</h1>
        <p style={{ fontSize: 15, color: C.textSecondary, marginTop: 6, fontWeight: 400, lineHeight: 1.5 }}>
          Model Van Tharp's position sizing methods and simulate equity curves with Monte Carlo analysis
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))", gap: 24, alignItems: "start" }}>
        {/* ── Left: Controls ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 80 }}>
          {/* System Parameters */}
          <div style={{
            background: C.surface, borderRadius: 20, border: `0.5px solid ${C.border}`, padding: 24,
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.accent, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 20 }}>System Parameters</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Win Rate (%)</label>
                <input type="number" value={winRate} min={1} max={99} onChange={e => setWinRate(Number(e.target.value) || 50)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Avg Winning R-Multiple</label>
                <input type="number" value={avgWinR} step="0.1" min={0.1} onChange={e => setAvgWinR(Number(e.target.value) || 1)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Avg Losing R-Multiple</label>
                <input type="number" value={avgLossR} step="0.1" min={0.1} onChange={e => setAvgLossR(Number(e.target.value) || 1)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Trades to Simulate</label>
                <input type="number" value={numTrades} min={10} max={1000} step={10} onChange={e => setNumTrades(Number(e.target.value) || 200)} style={inputStyle} />
              </div>
              <div style={{
                padding: "14px 18px", borderRadius: 16,
                background: expectancy >= 0 ? `${C.green}10` : `${C.red}10`,
                border: `0.5px solid ${expectancy >= 0 ? `${C.green}20` : `${C.red}20`}`,
              }}>
                <div style={{ fontSize: 11, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>System Expectancy</div>
                <div style={{
                  fontSize: 28, fontWeight: 700, fontFamily: "'Inter', -apple-system, sans-serif",
                  color: expectancy >= 0 ? C.green : C.red, letterSpacing: "-0.03em",
                }}>
                  {expectancy >= 0 ? "+" : ""}{expectancy.toFixed(3)}R
                </div>
                <div style={{ fontSize: 12, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 400, marginTop: 2 }}>
                  {expectancy > 0 ? "Positive edge" : expectancy === 0 ? "Breakeven system" : "Negative edge"}
                </div>
              </div>
            </div>
          </div>

          {/* Position Sizing */}
          <div style={{
            background: C.surface, borderRadius: 20, border: `0.5px solid ${C.border}`, padding: 24,
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.purple, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 20 }}>Position Sizing</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Account Size ($)</label>
                <input type="number" value={accountSize} onChange={e => setAccountSize(Number(e.target.value) || 100000)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Risk per Trade (%)</label>
                <input type="number" value={riskPct} step="0.25" min={0.1} max={10} onChange={e => setRiskPct(Number(e.target.value) || 1)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Method</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {methods.map(m => (
                    <button key={m.id} onClick={() => setMethod(m.id)} style={{
                      padding: "14px 16px", borderRadius: 16, textAlign: "left", cursor: "pointer",
                      border: `0.5px solid ${method === m.id ? C.accent : C.border}`,
                      background: method === m.id ? `${C.accent}10` : "transparent",
                      transition: "all 0.2s ease",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: method === m.id ? C.accent : C.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4, fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 400, lineHeight: 1.5 }}>{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {method === "fixed_ratio" && (
                <div>
                  <label style={labelStyle}>Delta (D)</label>
                  <input type="number" value={fixedRatioD} min={1} onChange={e => setFixedRatioD(Number(e.target.value) || 10)} style={inputStyle} />
                </div>
              )}
              <div style={{ fontSize: 13, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 500 }}>
                1R = ${riskAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Summary Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { l: "Median Final Equity", v: `$${sim.medianFinal.toLocaleString()}`, c: sim.medianFinal >= accountSize ? C.green : C.red },
              { l: "Median Return", v: `${((sim.medianFinal / accountSize - 1) * 100).toFixed(1)}%`, c: sim.medianFinal >= accountSize ? C.green : C.red },
              { l: "Median Max Drawdown", v: `${sim.medianDD.toFixed(1)}%`, c: sim.medianDD > 30 ? C.red : sim.medianDD > 15 ? C.orange : C.yellow },
              { l: "Ruin Probability", v: `${((sim.busted / sim.numSims) * 100).toFixed(0)}%`, c: sim.busted > 0 ? C.red : C.green },
              { l: "Expectancy", v: `${expectancy >= 0 ? "+" : ""}${expectancy.toFixed(3)}R`, c: expectancy >= 0 ? C.green : C.red },
              { l: "Risk per Trade", v: `$${riskAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, c: C.cyan },
            ].map(m => (
              <div key={m.l} style={{
                background: C.surface, borderRadius: 16, border: `0.5px solid ${C.border}`,
                padding: "18px 20px",
              }}>
                <div style={{ fontSize: 10, color: C.textTertiary, fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{m.l}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: m.c, fontFamily: "'Inter', -apple-system, sans-serif", marginTop: 6, letterSpacing: "-0.03em" }}>{m.v}</div>
              </div>
            ))}
          </div>

          {/* Equity Curve */}
          <div style={{
            background: C.surface, borderRadius: 20, border: `0.5px solid ${C.border}`, padding: "24px 24px 14px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 18 }}>
              Monte Carlo Equity Curves ({sim.numSims} simulations)
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={sim.curve}>
                <defs>
                  <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.accent} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.purple} stopOpacity={0.08} />
                    <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="trade" tick={{ fill: C.textTertiary, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} label={{ value: "Trade #", position: "insideBottomRight", offset: -5, style: { fontSize: 10, fill: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif" } }} />
                <YAxis tick={{ fill: C.textTertiary, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <ReferenceLine y={accountSize} stroke={C.textTertiary} strokeDasharray="3 3" label={{ value: "Start", fill: C.textTertiary, fontSize: 9, fontFamily: "'Inter', -apple-system, sans-serif" }} />
                <Tooltip content={<TT formatter={v => `$${v.toLocaleString()}`} />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Inter', -apple-system, sans-serif" }} />
                <Area type="monotone" dataKey="p90" stroke="none" fill="url(#rangeGrad)" name="90th Percentile" />
                <Area type="monotone" dataKey="p10" stroke={C.red} strokeWidth={1} strokeDasharray="4 4" fill="none" name="10th Percentile" dot={false} />
                <Area type="monotone" dataKey="median" stroke={C.accent} strokeWidth={2} fill="url(#medGrad)" name="Median" dot={false} />
                <Area type="monotone" dataKey="best" stroke={C.green} strokeWidth={1} strokeDasharray="2 2" fill="none" name="Best Case" dot={false} />
                <Area type="monotone" dataKey="worst" stroke={C.red} strokeWidth={1} strokeDasharray="2 2" fill="none" name="Worst Case" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Final Equity Distribution */}
          <div style={{
            background: C.surface, borderRadius: 20, border: `0.5px solid ${C.border}`, padding: "24px 24px 14px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 18 }}>
              Final Equity Distribution (500 runs)
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="range" tick={{ fill: C.textTertiary, fontSize: 9, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} interval={2} />
                <YAxis tick={{ fill: C.textTertiary, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} />
                <Tooltip content={<TT formatter={v => `${v} simulations`} />} />
                <Bar dataKey="count" name="Simulations" radius={[3, 3, 0, 0]}>
                  {distData.map((d, i) => <Cell key={i} fill={d.isAboveStart ? `${C.green}80` : `${C.red}80`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Van Tharp's Position Sizing Rules */}
          <div style={{
            background: C.surface, borderRadius: 20, border: `0.5px solid ${C.border}`, padding: 28,
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.purple, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 20 }}>
              Van Tharp's Position Sizing Guidelines
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {[
                { title: "Conservative", risk: "0.5% - 1%", desc: "For new traders or during drawdowns. Prioritizes capital preservation. Slow equity growth but high survival probability.", color: C.green },
                { title: "Moderate", risk: "1% - 2%", desc: "Standard for experienced traders with proven positive expectancy. Good balance of growth and risk management.", color: C.yellow },
                { title: "Aggressive", risk: "2% - 5%", desc: "For systems with high SQN (>3) and proven track record. Can produce excellent returns but increases drawdown risk significantly.", color: C.orange },
                { title: "Reckless", risk: "5%+", desc: "Almost never recommended. Even strong systems face ruin risk at this level. Reserved only for very high SQN systems with limited capital.", color: C.red },
              ].map(g => (
                <div key={g.title} style={{
                  padding: "18px 20px", borderRadius: 16, border: `0.5px solid ${g.color}20`,
                  background: `${g.color}08`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: g.color, fontFamily: "'Inter', -apple-system, sans-serif" }}>{g.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif", color: g.color, background: `${g.color}12`, padding: "4px 12px", borderRadius: 980 }}>{g.risk}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, fontWeight: 400 }}>{g.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
