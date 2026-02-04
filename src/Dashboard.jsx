import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Legend, ReferenceLine, ComposedChart, Scatter } from "recharts";

const C = {
  bg: "#06090f",
  bgAlt: "#0b1018",
  surface: "#0f1520",
  surfaceRaised: "#151d2b",
  border: "#1a2438",
  borderLight: "#243352",
  text: "#dfe6f0",
  textDim: "#6b7d9a",
  textMuted: "#3d4f6a",
  accent: "#00e5c7",
  accentDim: "#0a4d42",
  green: "#00e5a0",
  greenSoft: "rgba(0,229,160,0.1)",
  greenBar: "rgba(0,229,160,0.7)",
  red: "#ff4d6a",
  redSoft: "rgba(255,77,106,0.1)",
  redBar: "rgba(255,77,106,0.7)",
  yellow: "#ffc942",
  orange: "#ff8c42",
  purple: "#9b7dff",
  cyan: "#00c2ff",
  white: "#ffffff",
};

const SAMPLE_CSV = `Run Date,Account,Action,Symbol,Security Description,Security Type,Quantity,Price ($),Commission ($),Fees ($),Accrued Interest ($),Amount ($),Settlement Date
01/06/2025,Z12345678,YOU BOUGHT,AAPL,APPLE INC,Cash,100,182.50,0,0.06,,,-18250.06,01/08/2025
01/15/2025,Z12345678,YOU SOLD,AAPL,APPLE INC,Cash,-100,195.80,0,0.06,,,19579.94,01/17/2025
01/08/2025,Z12345678,YOU BOUGHT,MSFT,MICROSOFT CORP,Cash,50,390.20,0,0.04,,,-19510.04,01/10/2025
01/17/2025,Z12345678,YOU SOLD,MSFT,MICROSOFT CORP,Cash,-50,402.40,0,0.04,,,20119.96,01/21/2025
01/13/2025,Z12345678,YOU BOUGHT,NVDA,NVIDIA CORP,Cash,80,620.00,0,0.08,,,-49600.08,01/15/2025
01/22/2025,Z12345678,YOU SOLD,NVDA,NVIDIA CORP,Cash,-80,595.30,0,0.08,,,-47624.08,01/24/2025
01/20/2025,Z12345678,YOU BOUGHT,TSLA,TESLA INC,Cash,60,228.10,0,0.05,,,-13686.05,01/22/2025
01/29/2025,Z12345678,YOU SOLD,TSLA,TESLA INC,Cash,-60,252.70,0,0.05,,,15161.95,01/31/2025
01/27/2025,Z12345678,YOU BOUGHT,META,META PLATFORMS INC,Cash,30,478.90,0,0.03,,,-14367.03,01/29/2025
02/04/2025,Z12345678,YOU SOLD,META,META PLATFORMS INC,Cash,-30,491.20,0,0.03,,,14735.97,02/06/2025
02/03/2025,Z12345678,YOU BOUGHT,AMZN,AMAZON.COM INC,Cash,70,185.40,0,0.06,,,-12978.06,02/05/2025
02/10/2025,Z12345678,YOU SOLD,AMZN,AMAZON.COM INC,Cash,-70,178.20,0,0.06,,,-12474.06,02/12/2025
02/07/2025,Z12345678,YOU BOUGHT,GOOGL,ALPHABET INC,Cash,90,145.60,0,0.07,,,-13104.07,02/11/2025
02/18/2025,Z12345678,YOU SOLD,GOOGL,ALPHABET INC,Cash,-90,156.30,0,0.07,,,14066.93,02/20/2025
02/12/2025,Z12345678,YOU BOUGHT,AMD,ADVANCED MICRO DEVICES,Cash,120,158.40,0,0.09,,,-19008.09,02/14/2025
02/20/2025,Z12345678,YOU SOLD,AMD,ADVANCED MICRO DEVICES,Cash,-120,149.80,0,0.09,,,-17976.09,02/24/2025
02/18/2025,Z12345678,YOU BOUGHT,JPM,JPMORGAN CHASE,Cash,40,201.30,0,0.03,,,-8052.03,02/20/2025
02/26/2025,Z12345678,YOU SOLD,JPM,JPMORGAN CHASE,Cash,-40,212.50,0,0.03,,,8499.97,02/28/2025
02/24/2025,Z12345678,YOU BOUGHT,V,VISA INC,Cash,25,282.40,0,0.02,,,-7060.02,02/26/2025
03/04/2025,Z12345678,YOU SOLD,V,VISA INC,Cash,-25,290.10,0,0.02,,,7252.48,03/06/2025
03/03/2025,Z12345678,YOU BOUGHT,NFLX,NETFLIX INC,Cash,15,905.20,0,0.07,,,-13578.07,03/05/2025
03/11/2025,Z12345678,YOU SOLD,NFLX,NETFLIX INC,Cash,-15,882.60,0,0.07,,,-13239.07,03/13/2025
03/06/2025,Z12345678,YOU BOUGHT,SPY,SPDR S&P 500 ETF,Cash,100,515.80,0,0.08,,,-51580.08,03/10/2025
03/14/2025,Z12345678,YOU SOLD,SPY,SPDR S&P 500 ETF,Cash,-100,524.30,0,0.08,,,52429.92,03/18/2025
03/10/2025,Z12345678,YOU BOUGHT,QQQ,INVESCO QQQ TRUST,Cash,60,442.10,0,0.05,,,-26526.05,03/12/2025
03/18/2025,Z12345678,YOU SOLD,QQQ,INVESCO QQQ TRUST,Cash,-60,451.90,0,0.05,,,27113.95,03/20/2025
03/14/2025,Z12345678,YOU BOUGHT,DIS,WALT DISNEY CO,Cash,80,112.30,0,0.06,,,-8984.06,03/18/2025
03/24/2025,Z12345678,YOU SOLD,DIS,WALT DISNEY CO,Cash,-80,108.70,0,0.06,,,-8696.06,03/26/2025
03/20/2025,Z12345678,YOU BOUGHT,BA,BOEING CO,Cash,35,188.50,0,0.03,,,-6597.53,03/24/2025
03/28/2025,Z12345678,YOU SOLD,BA,BOEING CO,Cash,-35,201.20,0,0.03,,,7041.97,04/01/2025
03/26/2025,Z12345678,YOU BOUGHT,COST,COSTCO WHOLESALE CORP,Cash,12,920.40,0,0.08,,,-11044.88,03/28/2025
04/03/2025,Z12345678,YOU SOLD,COST,COSTCO WHOLESALE CORP,Cash,-12,935.80,0,0.08,,,11229.52,04/07/2025
04/01/2025,Z12345678,YOU BOUGHT,CRM,SALESFORCE INC,Cash,45,310.20,0,0.04,,,-13959.04,04/03/2025
04/09/2025,Z12345678,YOU SOLD,CRM,SALESFORCE INC,Cash,-45,298.40,0,0.04,,,-13428.04,04/11/2025
04/07/2025,Z12345678,YOU BOUGHT,INTC,INTEL CORP,Cash,200,22.80,0,0.10,,,-4560.10,04/09/2025
04/15/2025,Z12345678,YOU SOLD,INTC,INTEL CORP,Cash,-200,24.60,0,0.10,,,4919.90,04/17/2025
04/10/2025,Z12345678,YOU BOUGHT,SOFI,SOFI TECHNOLOGIES,Cash,300,10.20,0,0.12,,,-3060.12,04/14/2025
04/18/2025,Z12345678,YOU SOLD,SOFI,SOFI TECHNOLOGIES,Cash,-300,11.80,0,0.12,,,3539.88,04/22/2025`;

function parseFidelityCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("run date") && l.includes("symbol") && l.includes("action")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].split(",").length >= 8) { headerIdx = i; break; }
    }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",");
    if (vals.length < 6) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = (vals[idx] || "").trim(); });
    const action = (row["action"] || "").toUpperCase();
    if (!action.includes("BOUGHT") && !action.includes("SOLD")) continue;
    trades.push({
      date: row["run date"] || row["date"] || "",
      symbol: row["symbol"] || "",
      description: row["security description"] || "",
      action: action.includes("BOUGHT") ? "BUY" : "SELL",
      quantity: Math.abs(parseFloat(row["quantity"]) || 0),
      price: parseFloat(row["price"] || row["price "] || "0") || 0,
      commission: parseFloat(row["commission"] || row["commission "] || "0") || 0,
      fees: parseFloat(row["fees"] || row["fees "] || "0") || 0,
      amount: parseFloat(row["amount"] || row["amount "] || "0") || 0,
    });
  }
  return trades;
}

function matchTrades(rawTrades) {
  const buys = {};
  const matched = [];
  const sorted = [...rawTrades].sort((a, b) => new Date(a.date) - new Date(b.date));
  for (const trade of sorted) {
    if (trade.action === "BUY") {
      if (!buys[trade.symbol]) buys[trade.symbol] = [];
      buys[trade.symbol].push({ ...trade });
    } else if (trade.action === "SELL" && buys[trade.symbol]?.length) {
      let remaining = trade.quantity;
      while (remaining > 0 && buys[trade.symbol].length > 0) {
        const buy = buys[trade.symbol][0];
        const qty = Math.min(remaining, buy.quantity);
        const grossPnl = (trade.price - buy.price) * qty;
        const costs = (trade.fees + trade.commission + buy.fees + buy.commission) * (qty / trade.quantity);
        const pnl = grossPnl - costs;
        const holdDays = Math.max(1, Math.round((new Date(trade.date) - new Date(buy.date)) / 86400000));
        matched.push({
          symbol: trade.symbol,
          description: trade.description || buy.description,
          buyDate: buy.date,
          sellDate: trade.date,
          quantity: qty,
          buyPrice: buy.price,
          sellPrice: trade.price,
          pnl: Math.round(pnl * 100) / 100,
          pnlPercent: Math.round(((trade.price - buy.price) / buy.price) * 10000) / 100,
          holdDays,
          costs: Math.round(costs * 100) / 100,
          positionSize: Math.round(buy.price * qty * 100) / 100,
        });
        buy.quantity -= qty;
        remaining -= qty;
        if (buy.quantity <= 0) buys[trade.symbol].shift();
      }
    }
  }
  return matched;
}

function getSQNRating(sqn) {
  if (sqn >= 7) return { label: "Holy Grail", color: C.accent };
  if (sqn >= 5) return { label: "Superb", color: C.green };
  if (sqn >= 3) return { label: "Excellent", color: C.green };
  if (sqn >= 2) return { label: "Good", color: C.yellow };
  if (sqn >= 1.5) return { label: "Average", color: C.orange };
  return { label: "Difficult to Trade", color: C.red };
}

function getExpRatioRating(r) {
  if (r >= 0.7) return { label: "Holy Grail", color: C.accent };
  if (r >= 0.5) return { label: "Superb", color: C.green };
  if (r >= 0.3) return { label: "Excellent", color: C.green };
  if (r >= 0.25) return { label: "Good", color: C.yellow };
  if (r >= 0.2) return { label: "Average", color: C.orange };
  if (r >= 0.16) return { label: "Poor but Tradable", color: C.orange };
  return { label: "Not Tradable", color: C.red };
}

const TT = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surfaceRaised, border: `1px solid ${C.borderLight}`, borderRadius: 8, padding: "10px 14px", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
      <div style={{ fontSize: 10, color: C.textDim, marginBottom: 5, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: p.color || C.text, fontWeight: 600, fontFamily: "var(--mono)" }}>
          {p.name}: {formatter ? formatter(p.value) : (typeof p.value === "number" ? p.value.toFixed(2) : p.value)}
        </div>
      ))}
    </div>
  );
};

function MetricCard({ label, value, sub, color, rating, ratingColor, small }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: small ? "14px 16px" : "18px 20px", display: "flex", flexDirection: "column", gap: 4,
      transition: "border-color 0.2s", minWidth: 0,
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = C.borderLight}
    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--mono)" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: small ? 20 : 26, fontWeight: 700, color: color || C.text, fontFamily: "var(--heading)", letterSpacing: "-0.03em" }}>{value}</span>
        {rating && <span style={{ fontSize: 10, fontWeight: 600, color: ratingColor || C.accent, fontFamily: "var(--mono)", padding: "2px 8px", borderRadius: 4, background: `${ratingColor || C.accent}18`, letterSpacing: "0.04em" }}>{rating}</span>}
      </div>
      {sub && <div style={{ fontSize: 11, color: C.textDim, fontFamily: "var(--mono)", lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}

function ChartBox({ title, children, info }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "18px 18px 10px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textDim, fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</div>
        {info && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowInfo(!showInfo)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, color: C.textDim, fontSize: 10, padding: "2px 6px", cursor: "pointer", fontFamily: "var(--mono)" }}>?</button>
            {showInfo && (
              <div style={{ position: "absolute", right: 0, top: 24, width: 280, background: C.surfaceRaised, border: `1px solid ${C.borderLight}`, borderRadius: 8, padding: 14, fontSize: 11, color: C.textDim, lineHeight: 1.6, zIndex: 20, boxShadow: "0 12px 40px rgba(0,0,0,0.5)", fontFamily: "var(--mono)" }}>
                {info}
                <button onClick={() => setShowInfo(false)} style={{ display: "block", marginTop: 8, background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 10, fontFamily: "var(--mono)" }}>close</button>
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function TradeTableComponent({ trades }) {
  const [sortKey, setSortKey] = useState("idx");
  const [sortDir, setSortDir] = useState(1);
  const sorted = useMemo(() => {
    return [...trades].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "buyDate" || sortKey === "sellDate") { va = new Date(va); vb = new Date(vb); }
      if (va < vb) return -1 * sortDir;
      if (va > vb) return 1 * sortDir;
      return 0;
    });
  }, [trades, sortKey, sortDir]);
  const toggle = k => { if (sortKey === k) setSortDir(d => d * -1); else { setSortKey(k); setSortDir(-1); } };
  const th = { padding: "9px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--mono)", cursor: "pointer", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", background: C.surface, position: "sticky", top: 0, zIndex: 1 };
  const td = { padding: "8px 12px", fontSize: 12, fontFamily: "var(--mono)", borderBottom: `1px solid ${C.border}`, color: C.text, whiteSpace: "nowrap" };
  return (
    <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 520, borderRadius: 8, border: `1px solid ${C.border}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
        <thead><tr>
          {[["idx", "#"], ["symbol", "Sym"], ["buyDate", "Entry"], ["sellDate", "Exit"], ["quantity", "Qty"], ["buyPrice", "Buy"], ["sellPrice", "Sell"], ["rMultiple", "R-Mult"], ["pnl", "P&L $"], ["pnlPercent", "%"], ["holdDays", "Days"]].map(([k, l]) => (
            <th key={k} style={th} onClick={() => toggle(k)}>{l} {sortKey === k ? (sortDir > 0 ? "▲" : "▼") : ""}</th>
          ))}
        </tr></thead>
        <tbody>
          {sorted.map((t, i) => (
            <tr key={i} style={{ background: i % 2 ? "rgba(255,255,255,0.01)" : "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = `${C.accent}08`}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 ? "rgba(255,255,255,0.01)" : "transparent"}
            >
              <td style={{ ...td, color: C.textDim }}>{t.idx}</td>
              <td style={{ ...td, fontWeight: 700, color: C.accent }}>{t.symbol}</td>
              <td style={td}>{t.buyDate}</td>
              <td style={td}>{t.sellDate}</td>
              <td style={td}>{t.quantity}</td>
              <td style={td}>${t.buyPrice.toFixed(2)}</td>
              <td style={td}>${t.sellPrice.toFixed(2)}</td>
              <td style={{ ...td, fontWeight: 700, color: t.rMultiple >= 0 ? C.green : C.red, fontSize: 13 }}>
                {t.rMultiple >= 0 ? "+" : ""}{t.rMultiple.toFixed(2)}R
              </td>
              <td style={{ ...td, color: t.pnl >= 0 ? C.green : C.red }}>
                {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
              </td>
              <td style={{ ...td, color: t.pnlPercent >= 0 ? C.green : C.red }}>
                {t.pnlPercent >= 0 ? "+" : ""}{t.pnlPercent.toFixed(1)}%
              </td>
              <td style={td}>{t.holdDays}d</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TradeDashboard({ savedTrades, onSaveTrades, onClearTrades, onSettingsChange, initialSettings, user, onSignOut }) {
  const [loaded, setLoaded] = useState(false);
  const [matched, setMatched] = useState([]);
  const [activeTab, setActiveTab] = useState("tharp");
  const [dragOver, setDragOver] = useState(false);
  const [riskPct, setRiskPct] = useState(initialSettings?.risk_percent || 1);
  const [accountSize, setAccountSize] = useState(initialSettings?.account_size || 100000);
  const [saveStatus, setSaveStatus] = useState("");
  const fileRef = useRef(null);

  // Load saved trades from DB on mount
  useEffect(() => {
    if (savedTrades && savedTrades.length > 0) {
      const m = matchTrades(savedTrades);
      if (m.length) {
        setMatched(m);
        setLoaded(true);
      }
    }
  }, []);

  const processCSV = useCallback((text) => {
    const parsed = parseFidelityCSV(text);
    if (!parsed.length) return false;
    const m = matchTrades(parsed);
    if (!m.length) return false;
    setMatched(m);
    setLoaded(true);
    // Save to database if callback provided
    if (onSaveTrades) {
      setSaveStatus("saving");
      onSaveTrades(parsed).then(() => setSaveStatus("saved")).catch(() => setSaveStatus("error"));
      setTimeout(() => setSaveStatus(""), 2500);
    }
    return true;
  }, [onSaveTrades]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!processCSV(e.target.result)) alert("Could not parse trades. Ensure this is a Fidelity CSV export.");
    };
    reader.readAsText(file);
  }, [processCSV]);

  const riskPerTrade = (accountSize * riskPct) / 100;

  // Save settings to DB when they change
  useEffect(() => {
    if (onSettingsChange) {
      const timer = setTimeout(() => onSettingsChange(accountSize, riskPct), 500);
      return () => clearTimeout(timer);
    }
  }, [accountSize, riskPct, onSettingsChange]);

  const stats = useMemo(() => {
    if (!matched.length) return null;
    const R = riskPerTrade;
    const rMultiples = matched.map(t => Math.round((t.pnl / R) * 1000) / 1000);
    const winRm = rMultiples.filter(r => r > 0);
    const lossRm = rMultiples.filter(r => r <= 0);
    const n = rMultiples.length;
    const meanR = rMultiples.reduce((s, r) => s + r, 0) / n;
    const stdR = Math.sqrt(rMultiples.reduce((s, r) => s + Math.pow(r - meanR, 2), 0) / n);
    const sqn = stdR > 0 ? (meanR / stdR) * Math.sqrt(Math.min(n, 100)) : 0;
    const sqnRating = getSQNRating(sqn);
    const avgWinR = winRm.length ? winRm.reduce((s, r) => s + r, 0) / winRm.length : 0;
    const avgLossR = lossRm.length ? Math.abs(lossRm.reduce((s, r) => s + r, 0) / lossRm.length) : 0;
    const payoffRatio = avgLossR > 0 ? avgWinR / avgLossR : Infinity;
    const winRate = (winRm.length / n) * 100;
    const profitFactorR = Math.abs(lossRm.reduce((s, r) => s + r, 0)) > 0 ? winRm.reduce((s, r) => s + r, 0) / Math.abs(lossRm.reduce((s, r) => s + r, 0)) : Infinity;
    const expectancyRatio = stdR > 0 ? meanR / stdR : 0;
    const expRating = getExpRatioRating(expectancyRatio);
    const sortedByDate = [...matched].sort((a, b) => new Date(a.sellDate) - new Date(b.sellDate));
    const firstDate = new Date(sortedByDate[0].sellDate);
    const lastDate = new Date(sortedByDate[sortedByDate.length - 1].sellDate);
    const tradingDays = Math.max(1, Math.round((lastDate - firstDate) / 86400000));
    const tradingMonths = Math.max(1, tradingDays / 30.44);
    const tradesPerMonth = n / tradingMonths;
    const expectunity = meanR * tradesPerMonth;
    let cumR = 0;
    const cumRData = sortedByDate.map((t, i) => { cumR += rMultiples[matched.indexOf(t)]; return { date: t.sellDate, cumR: Math.round(cumR * 100) / 100, trade: i + 1 }; });
    const totalR = Math.round(cumR * 100) / 100;
    let peakR = 0, maxDDR = 0, runCumR = 0;
    const ddRData = sortedByDate.map((t, i) => {
      runCumR += rMultiples[matched.indexOf(t)];
      if (runCumR > peakR) peakR = runCumR;
      const dd = peakR - runCumR;
      if (dd > maxDDR) maxDDR = dd;
      return { date: t.sellDate, dd: -Math.round(dd * 100) / 100, trade: i + 1 };
    });
    const rMin = Math.floor(Math.min(...rMultiples));
    const rMax = Math.ceil(Math.max(...rMultiples));
    const bins = [];
    for (let b = rMin; b <= rMax; b++) {
      const count = rMultiples.filter(r => r >= b && r < b + 1).length;
      bins.push({ range: `${b >= 0 ? "+" : ""}${b}R`, rangeNum: b, count, isWin: b >= 0 });
    }
    let maxWS = 0, maxLS = 0, cW = 0, cL = 0;
    for (const r of rMultiples) { if (r > 0) { cW++; cL = 0; maxWS = Math.max(maxWS, cW); } else { cL++; cW = 0; maxLS = Math.max(maxLS, cL); } }
    const symbols = [...new Set(matched.map(t => t.symbol))];
    const bySymbol = symbols.map(sym => {
      const st = matched.filter(t => t.symbol === sym);
      const symR = st.map(t => rMultiples[matched.indexOf(t)]);
      const symTotalR = symR.reduce((s, r) => s + r, 0);
      return { symbol: sym, trades: st.length, totalR: Math.round(symTotalR * 100) / 100, avgR: Math.round((symTotalR / st.length) * 100) / 100, winRate: Math.round((symR.filter(r => r > 0).length / st.length) * 100), totalPnl: Math.round(st.reduce((s, t) => s + t.pnl, 0) * 100) / 100 };
    }).sort((a, b) => b.totalR - a.totalR);
    const monthly = {};
    for (let i = 0; i < sortedByDate.length; i++) {
      const d = new Date(sortedByDate[i].sellDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthly[key]) monthly[key] = { month: key, totalR: 0, trades: 0, wins: 0 };
      monthly[key].totalR += rMultiples[matched.indexOf(sortedByDate[i])];
      monthly[key].trades++;
      if (rMultiples[matched.indexOf(sortedByDate[i])] > 0) monthly[key].wins++;
    }
    const monthlyData = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
    monthlyData.forEach(m => { m.totalR = Math.round(m.totalR * 100) / 100; m.winRate = Math.round((m.wins / m.trades) * 100); });
    const tradeData = sortedByDate.map((t, i) => ({ ...t, rMultiple: Math.round(rMultiples[matched.indexOf(t)] * 100) / 100, idx: i + 1 }));
    const sortedByR = [...tradeData].sort((a, b) => b.rMultiple - a.rMultiple);
    const totalPnL = matched.reduce((s, t) => s + t.pnl, 0);
    // Median R
    const sortedR = [...rMultiples].sort((a, b) => a - b);
    const medianR = n % 2 === 0 ? (sortedR[n / 2 - 1] + sortedR[n / 2]) / 2 : sortedR[Math.floor(n / 2)];
    // Skewness
    const skewness = n > 2 ? (n / ((n - 1) * (n - 2))) * rMultiples.reduce((s, r) => s + Math.pow((r - meanR) / stdR, 3), 0) : 0;
    // Kurtosis (excess)
    const kurtosis = n > 3 ? ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * rMultiples.reduce((s, r) => s + Math.pow((r - meanR) / stdR, 4), 0) - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3)) : 0;

    return {
      n, rMultiples, meanR: Math.round(meanR * 1000) / 1000, stdR: Math.round(stdR * 1000) / 1000,
      sqn: Math.round(sqn * 100) / 100, sqnRating,
      avgWinR: Math.round(avgWinR * 100) / 100, avgLossR: Math.round(avgLossR * 100) / 100,
      payoffRatio: payoffRatio === Infinity ? "∞" : (Math.round(payoffRatio * 100) / 100).toFixed(2),
      winRate: Math.round(winRate * 10) / 10, wins: winRm.length, losses: lossRm.length,
      profitFactorR: profitFactorR === Infinity ? "∞" : (Math.round(profitFactorR * 100) / 100).toFixed(2),
      expectancyRatio: Math.round(expectancyRatio * 1000) / 1000, expRating,
      tradesPerMonth: Math.round(tradesPerMonth * 10) / 10,
      expectunity: Math.round(expectunity * 100) / 100,
      totalR, cumRData, ddRData, maxDDR: Math.round(maxDDR * 100) / 100,
      bins, maxWinStreak: maxWS, maxLossStreak: maxLS,
      bySymbol, monthlyData, tradeData,
      bestR: sortedByR[0], worstR: sortedByR[sortedByR.length - 1],
      largestWinR: Math.round(Math.max(...rMultiples) * 100) / 100,
      largestLossR: Math.round(Math.min(...rMultiples) * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      tradingDays, medianR: Math.round(medianR * 1000) / 1000,
      skewness: Math.round(skewness * 100) / 100,
      kurtosis: Math.round(kurtosis * 100) / 100,
    };
  }, [matched, riskPerTrade]);

  if (!loaded) {
    return (
      <div style={{ "--mono": "'IBM Plex Mono', monospace", "--heading": "'DM Sans', sans-serif", minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--heading)", color: C.text }}>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ width: "100%", maxWidth: 540, padding: 28 }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px rgba(0,229,199,0.2)` }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" /></svg>
              </div>
              <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em" }}>TradeScope</span>
            </div>
            <p style={{ color: C.textDim, fontSize: 14, maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>
              Van Tharp analytics — R-multiples, SQN, expectancy, expectunity, and complete system quality analysis
            </p>
          </div>
          <div style={{ border: `2px dashed ${dragOver ? C.accent : C.border}`, borderRadius: 14, padding: "44px 28px", textAlign: "center", cursor: "pointer", background: dragOver ? `${C.accent}08` : "transparent", transition: "all 0.2s" }}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 14 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Drop your Fidelity CSV or click to browse</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6, fontFamily: "var(--mono)" }}>Activity & Orders → Download CSV</div>
          </div>
          <div style={{ textAlign: "center", margin: "20px 0", color: C.textMuted, fontSize: 12 }}>or</div>
          <button onClick={() => processCSV(SAMPLE_CSV)} style={{ width: "100%", padding: "13px 24px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--heading)", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >Load Sample Data (20 trades)</button>
          <div style={{ marginTop: 28, padding: "16px 18px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--mono)", marginBottom: 8 }}>R-value configuration</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: C.textDim, fontFamily: "var(--mono)", display: "block", marginBottom: 4 }}>Account Size ($)</label>
                <input type="number" value={accountSize} onChange={e => setAccountSize(Number(e.target.value) || 100000)} style={{ width: "100%", padding: "8px 10px", background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, fontFamily: "var(--mono)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: C.textDim, fontFamily: "var(--mono)", display: "block", marginBottom: 4 }}>Risk per Trade (%)</label>
                <input type="number" value={riskPct} step="0.25" onChange={e => setRiskPct(Number(e.target.value) || 1)} style={{ width: "100%", padding: "8px 10px", background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, fontFamily: "var(--mono)", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: "var(--mono)", marginTop: 8 }}>1R = ${riskPerTrade.toLocaleString()} (initial risk per trade)</div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "tharp", label: "Van Tharp" },
    { id: "rmultiples", label: "R-Multiples" },
    { id: "trades", label: "Trade Log" },
    { id: "symbols", label: "By Symbol" },
    { id: "timing", label: "Timing" },
  ];

  return (
    <div style={{ "--mono": "'IBM Plex Mono', monospace", "--heading": "'DM Sans', sans-serif", minHeight: "100vh", background: C.bg, fontFamily: "var(--heading)", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: `${C.bg}dd`, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" /></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em" }}>TradeScope</span>
          <span style={{ fontSize: 10, color: C.textDim, fontFamily: "var(--mono)", marginLeft: 4 }}>1R = ${riskPerTrade.toLocaleString()}</span>
        </div>
        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "6px 14px", border: "none", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--heading)", background: activeTab === tab.id ? `${C.accent}18` : "transparent", color: activeTab === tab.id ? C.accent : C.textDim, transition: "all 0.15s" }}>{tab.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <label style={{ fontSize: 10, color: C.textMuted, fontFamily: "var(--mono)" }}>Acct $</label>
            <input type="number" value={accountSize} onChange={e => setAccountSize(Number(e.target.value) || 100000)} style={{ width: 80, padding: "4px 6px", background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 11, fontFamily: "var(--mono)", outline: "none" }} />
            <label style={{ fontSize: 10, color: C.textMuted, fontFamily: "var(--mono)" }}>Risk %</label>
            <input type="number" value={riskPct} step="0.25" onChange={e => setRiskPct(Number(e.target.value) || 1)} style={{ width: 48, padding: "4px 6px", background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 11, fontFamily: "var(--mono)", outline: "none" }} />
          </div>
          {saveStatus === "saving" && <span style={{ fontSize: 10, color: C.yellow, fontFamily: "var(--mono)" }}>Saving...</span>}
          {saveStatus === "saved" && <span style={{ fontSize: 10, color: C.green, fontFamily: "var(--mono)" }}>✓ Saved</span>}
          {saveStatus === "error" && <span style={{ fontSize: 10, color: C.red, fontFamily: "var(--mono)" }}>Save failed</span>}
          {user && <span style={{ fontSize: 10, color: C.textDim, fontFamily: "var(--mono)" }}>{user.email}</span>}
          <button onClick={() => { setLoaded(false); setMatched([]); }} style={{ padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 5, background: "transparent", color: C.textDim, fontSize: 10, cursor: "pointer", fontFamily: "var(--mono)" }}>New Import</button>
          {onClearTrades && <button onClick={async () => { if (confirm("Delete all saved trades from the database?")) { await onClearTrades(); setLoaded(false); setMatched([]); }}} style={{ padding: "5px 10px", border: `1px solid ${C.red}33`, borderRadius: 5, background: "transparent", color: C.red, fontSize: 10, cursor: "pointer", fontFamily: "var(--mono)" }}>Clear DB</button>}
          {onSignOut && <button onClick={onSignOut} style={{ padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 5, background: "transparent", color: C.textDim, fontSize: 10, cursor: "pointer", fontFamily: "var(--mono)" }}>Sign Out</button>}
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 24px" }}>

        {activeTab === "tharp" && stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
              <MetricCard label="System Quality Number (SQN®)" value={stats.sqn.toFixed(2)} color={stats.sqnRating.color} rating={stats.sqnRating.label} ratingColor={stats.sqnRating.color} sub="√min(n,100) × (Mean R / Std R)" />
              <MetricCard label="Expectancy (Mean R)" value={`${stats.meanR >= 0 ? "+" : ""}${stats.meanR.toFixed(3)}R`} color={stats.meanR >= 0 ? C.green : C.red} sub="Avg profit per trade in risk units" />
              <MetricCard label="Expectancy Ratio" value={stats.expectancyRatio.toFixed(3)} color={stats.expRating.color} rating={stats.expRating.label} ratingColor={stats.expRating.color} sub="Mean R / Std Dev R (quality w/o n)" />
              <MetricCard label="Expectunity" value={`${stats.expectunity >= 0 ? "+" : ""}${stats.expectunity.toFixed(2)}R / mo`} color={stats.expectunity >= 0 ? C.green : C.red} sub={`Expectancy × ${stats.tradesPerMonth} trades/mo`} />
              <MetricCard label="Payoff Ratio" value={stats.payoffRatio} color={parseFloat(stats.payoffRatio) >= 1.5 ? C.green : C.yellow} sub={`Avg Win ${stats.avgWinR}R / Avg Loss ${stats.avgLossR}R`} />
              <MetricCard label="Profit Factor (R)" value={stats.profitFactorR} color={parseFloat(stats.profitFactorR) >= 1.5 ? C.green : C.yellow} sub="Σ Winning R / |Σ Losing R|" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 10 }}>
              <MetricCard small label="Win Rate" value={`${stats.winRate}%`} color={stats.winRate >= 50 ? C.green : C.red} sub={`${stats.wins}W / ${stats.losses}L`} />
              <MetricCard small label="Total R Earned" value={`${stats.totalR >= 0 ? "+" : ""}${stats.totalR}R`} color={stats.totalR >= 0 ? C.green : C.red} sub={`$${stats.totalPnL.toLocaleString()}`} />
              <MetricCard small label="Max Drawdown (R)" value={`${stats.maxDDR}R`} color={stats.maxDDR > 5 ? C.red : C.yellow} sub={`$${Math.round(stats.maxDDR * riskPerTrade).toLocaleString()}`} />
              <MetricCard small label="Std Dev of R" value={`${stats.stdR}R`} color={C.text} sub="Consistency" />
              <MetricCard small label="Median R" value={`${stats.medianR >= 0 ? "+" : ""}${stats.medianR}R`} color={stats.medianR >= 0 ? C.green : C.red} sub="Middle trade result" />
              <MetricCard small label="R Skewness" value={stats.skewness.toFixed(2)} color={stats.skewness > 0 ? C.green : C.red} sub={stats.skewness > 0 ? "Right-skewed (good)" : "Left-skewed"} />
              <MetricCard small label="R Kurtosis" value={stats.kurtosis.toFixed(2)} color={C.text} sub={stats.kurtosis > 0 ? "Fat tails" : "Thin tails"} />
              <MetricCard small label="Largest Win" value={`+${stats.largestWinR}R`} color={C.green} sub={stats.bestR?.symbol} />
              <MetricCard small label="Largest Loss" value={`${stats.largestLossR}R`} color={C.red} sub={stats.worstR?.symbol} />
              <MetricCard small label="Win Streak" value={stats.maxWinStreak} color={C.green} sub="Consecutive" />
              <MetricCard small label="Loss Streak" value={stats.maxLossStreak} color={C.red} sub="Consecutive" />
              <MetricCard small label="Opportunity" value={`${stats.tradesPerMonth}/mo`} color={C.cyan} sub={`${stats.n} trades total`} />
              <MetricCard small label="Sample Size" value={stats.n} color={C.text} sub={stats.n < 30 ? "⚠ Low (<30)" : stats.n < 100 ? "Moderate" : "Good (100+)"} />
            </div>

            <ChartBox title="SQN® Quality Scale" info="Van Tharp's System Quality Number: <1.5 Difficult · 1.5-2 Average · 2-3 Good · 3-5 Excellent · 5-7 Superb · 7+ Holy Grail. SQN = (Mean R / Std R) × √min(n,100).">
              <div style={{ padding: "8px 0 12px" }}>
                <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden", position: "relative", marginBottom: 8 }}>
                  {[{ max: 1.5, label: "<1.5 Hard", c: C.red }, { max: 2, label: "1.5-2 Avg", c: C.orange }, { max: 3, label: "2-3 Good", c: C.yellow }, { max: 5, label: "3-5 Excellent", c: C.green }, { max: 7, label: "5-7 Superb", c: C.accent }, { max: 10, label: "7+ Grail", c: C.cyan }].map((seg, i, arr) => (
                    <div key={i} style={{ flex: seg.max - (i === 0 ? 0 : arr[i - 1].max), background: `${seg.c}30`, borderRight: `1px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 8, color: seg.c, fontFamily: "var(--mono)", fontWeight: 600, whiteSpace: "nowrap" }}>{seg.label}</span>
                    </div>
                  ))}
                  <div style={{ position: "absolute", top: -4, bottom: -4, left: `${Math.min(95, Math.max(2, (stats.sqn / 10) * 100))}%`, width: 3, background: C.white, borderRadius: 2, boxShadow: `0 0 8px ${C.white}80`, transition: "left 0.3s" }} />
                </div>
                <div style={{ fontSize: 12, color: C.text, fontFamily: "var(--mono)", textAlign: "center" }}>
                  Your SQN: <strong style={{ color: stats.sqnRating.color }}>{stats.sqn.toFixed(2)}</strong> — {stats.sqnRating.label}
                </div>
              </div>
            </ChartBox>

            <ChartBox title="Cumulative R (Equity Curve in Risk Units)" info="Total accumulated R-multiples over time. A steadily rising curve = consistent edge independent of position sizing.">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.cumRData}>
                  <defs><linearGradient id="cumRGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.accent} stopOpacity={0.15} /><stop offset="95%" stopColor={C.accent} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="trade" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} label={{ value: "Trade #", position: "insideBottomRight", offset: -5, style: { fontSize: 10, fill: C.textDim, fontFamily: "var(--mono)" } }} />
                  <YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} tickFormatter={v => `${v}R`} />
                  <ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="3 3" />
                  <Tooltip content={<TT formatter={v => `${v}R`} />} />
                  <Area type="monotone" dataKey="cumR" stroke={C.accent} strokeWidth={2} fill="url(#cumRGrad)" name="Cumulative R" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Drawdown in R" info="Peak-to-trough decline in R-multiples. Max DD in R tells you the worst equity decline in risk units.">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={stats.ddRData}>
                  <defs><linearGradient id="ddRGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.red} stopOpacity={0.15} /><stop offset="95%" stopColor={C.red} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="trade" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} />
                  <YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} tickFormatter={v => `${v}R`} />
                  <Tooltip content={<TT formatter={v => `${v}R`} />} />
                  <Area type="monotone" dataKey="dd" stroke={C.red} strokeWidth={1.5} fill="url(#ddRGrad)" name="Drawdown" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>
        )}

        {activeTab === "rmultiples" && stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <ChartBox title="R-Multiple Distribution" info="Core Van Tharp visualization. Healthy systems show losses clustered near -1R (disciplined stops) and a long right tail of winners.">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.bins}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="range" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} />
                  <YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} label={{ value: "Trades", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: C.textDim, fontFamily: "var(--mono)" } }} />
                  <Tooltip content={<TT formatter={v => `${v} trades`} />} />
                  <Bar dataKey="count" name="Trades" radius={[4, 4, 0, 0]}>
                    {stats.bins.map((b, i) => <Cell key={i} fill={b.isWin ? C.greenBar : C.redBar} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="R-Multiple per Trade (Waterfall)" info="Each bar = one trade's R-multiple. Green = winner, Red = loser. Look for controlled losses near -1R.">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.tradeData.map((t, i) => ({ name: `#${i + 1}`, r: t.rMultiple, sym: t.symbol }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 8, fontFamily: "var(--mono)" }} stroke={C.border} interval={Math.max(0, Math.floor(stats.n / 20))} />
                  <YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} tickFormatter={v => `${v}R`} />
                  <ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="3 3" />
                  <Tooltip content={<TT formatter={v => `${v}R`} />} />
                  <Bar dataKey="r" name="R-Multiple" radius={[3, 3, 0, 0]}>
                    {stats.tradeData.map((t, i) => <Cell key={i} fill={t.rMultiple >= 0 ? C.greenBar : C.redBar} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Monthly R Earned" info="Total R-multiples per month. Consistent monthly R = tradable system.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="month" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} />
                  <YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} tickFormatter={v => `${v}R`} />
                  <ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="3 3" />
                  <Tooltip content={<TT formatter={v => `${v}R`} />} />
                  <Bar dataKey="totalR" name="Monthly R" radius={[4, 4, 0, 0]}>
                    {stats.monthlyData.map((m, i) => <Cell key={i} fill={m.totalR >= 0 ? C.greenBar : C.redBar} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              <MetricCard small label="Mean R (Expectancy)" value={`${stats.meanR >= 0 ? "+" : ""}${stats.meanR}R`} color={stats.meanR >= 0 ? C.green : C.red} />
              <MetricCard small label="Median R" value={`${stats.medianR >= 0 ? "+" : ""}${stats.medianR}R`} color={stats.medianR >= 0 ? C.green : C.red} />
              <MetricCard small label="Std Dev of R" value={`${stats.stdR}R`} color={C.text} sub="Lower = more consistent" />
              <MetricCard small label="Avg Winning R" value={`+${stats.avgWinR}R`} color={C.green} sub={`${stats.wins} winners`} />
              <MetricCard small label="Avg Losing R" value={`-${stats.avgLossR}R`} color={C.red} sub={`${stats.losses} losers`} />
              <MetricCard small label="Skewness" value={stats.skewness.toFixed(2)} color={stats.skewness > 0 ? C.green : C.red} sub={stats.skewness > 0 ? "Positive skew (good)" : "Negative skew"} />
            </div>
          </div>
        )}

        {activeTab === "trades" && stats && (
          <div>
            <div style={{ marginBottom: 12, fontSize: 11, color: C.textDim, fontFamily: "var(--mono)" }}>{stats.n} closed trades · 1R = ${riskPerTrade.toLocaleString()}</div>
            <TradeTableComponent trades={stats.tradeData} />
          </div>
        )}

        {activeTab === "symbols" && stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {stats.bySymbol.map(s => (
                <div key={s.symbol} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: C.accent, fontFamily: "var(--mono)" }}>{s.symbol}</div>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>{s.trades} trades · {s.winRate}% WR</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--mono)", color: s.totalR >= 0 ? C.green : C.red }}>{s.totalR >= 0 ? "+" : ""}{s.totalR}R</div>
                    <div style={{ fontSize: 10, color: C.textDim, fontFamily: "var(--mono)" }}>avg {s.avgR}R · ${s.totalPnl.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <ChartBox title="Total R by Symbol">
              <ResponsiveContainer width="100%" height={Math.max(200, stats.bySymbol.length * 36)}>
                <BarChart data={stats.bySymbol} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis type="number" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} tickFormatter={v => `${v}R`} />
                  <YAxis dataKey="symbol" type="category" tick={{ fill: C.accent, fontSize: 11, fontWeight: 600, fontFamily: "var(--mono)" }} stroke={C.border} width={55} />
                  <ReferenceLine x={0} stroke={C.textMuted} strokeDasharray="3 3" />
                  <Tooltip content={<TT formatter={v => `${v}R`} />} />
                  <Bar dataKey="totalR" name="Total R" radius={[0, 4, 4, 0]}>
                    {stats.bySymbol.map((s, i) => <Cell key={i} fill={s.totalR >= 0 ? C.greenBar : C.redBar} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>
        )}

        {activeTab === "timing" && stats && (() => {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const byDay = Array(7).fill(null).map((_, i) => ({ day: dayNames[i], totalR: 0, count: 0 }));
          stats.tradeData.forEach(t => { const d = new Date(t.sellDate).getDay(); byDay[d].totalR += t.rMultiple; byDay[d].count++; });
          const dayData = byDay.filter(d => d.count > 0).map(d => ({ ...d, totalR: Math.round(d.totalR * 100) / 100 }));
          const avgHold = Math.round(stats.tradeData.reduce((s, t) => s + t.holdDays, 0) / stats.n * 10) / 10;
          const holdData = stats.tradeData.map(t => ({ hold: t.holdDays, r: t.rMultiple, sym: t.symbol }));
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                <MetricCard small label="Avg Holding Period" value={`${avgHold} days`} color={C.cyan} />
                <MetricCard small label="Trades / Month" value={stats.tradesPerMonth} color={C.cyan} sub="Opportunity factor" />
                <MetricCard small label="Max Win Streak" value={stats.maxWinStreak} color={C.green} />
                <MetricCard small label="Max Loss Streak" value={stats.maxLossStreak} color={C.red} />
              </div>
              <ChartBox title="R by Day of Week" info="Total R earned by exit day. Identify your best/worst trading days.">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="day" tick={{ fill: C.textMuted, fontSize: 11, fontFamily: "var(--mono)" }} stroke={C.border} /><YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} tickFormatter={v => `${v}R`} /><ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="3 3" /><Tooltip content={<TT formatter={v => `${v}R`} />} />
                    <Bar dataKey="totalR" name="Total R" radius={[4, 4, 0, 0]}>{dayData.map((d, i) => <Cell key={i} fill={d.totalR >= 0 ? C.greenBar : C.redBar} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
              <ChartBox title="Monthly Win Rate vs Trade Count" info="Opportunity (frequency) × Expectancy = total return. Van Tharp calls this Expectunity.">
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={stats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="month" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} /><YAxis yAxisId="left" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} tickFormatter={v => `${v}%`} /><YAxis yAxisId="right" orientation="right" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} /><Tooltip content={<TT />} /><Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--mono)" }} />
                    <Bar yAxisId="right" dataKey="trades" name="Trades" fill={`${C.purple}40`} radius={[4, 4, 0, 0]} /><Line yAxisId="left" dataKey="winRate" name="Win %" stroke={C.accent} strokeWidth={2} dot={{ r: 3, fill: C.accent }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartBox>
              <ChartBox title="Holding Period vs R-Multiple" info="Do your best trades come from quick flips or patient holds? Scatter of days held vs R outcome.">
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={holdData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="hold" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} label={{ value: "Days Held", position: "insideBottomRight", offset: -5, style: { fontSize: 10, fill: C.textDim } }} /><YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "var(--mono)" }} stroke={C.border} tickFormatter={v => `${v}R`} /><ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="3 3" /><Tooltip content={<TT formatter={v => `${v}R`} />} />
                    <Scatter dataKey="r" name="R-Multiple" fill={C.accent}>{holdData.map((d, i) => <Cell key={i} fill={d.r >= 0 ? C.green : C.red} />)}</Scatter>
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartBox>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
