import { useMemo, useState, useCallback } from "react";

const C = {
  bg: "#000000", surface: "#111111", surfaceRaised: "#1a1a1a",
  border: "rgba(255,255,255,0.06)", text: "#f5f5f7", textSecondary: "#a1a1a6",
  textTertiary: "#6e6e73", accent: "#2997ff", green: "#34c759", red: "#ff3b30",
  yellow: "#ffcc00", purple: "#af52de", cyan: "#5ac8fa", white: "#ffffff",
};

const FONT = "'Inter', -apple-system, sans-serif";

const GREEN_SHADES = [
  "rgba(52, 199, 89, 0.15)",
  "rgba(52, 199, 89, 0.35)",
  "rgba(52, 199, 89, 0.55)",
  "rgba(52, 199, 89, 0.75)",
  "rgba(52, 199, 89, 0.95)",
];

const RED_SHADES = [
  "rgba(255, 59, 48, 0.15)",
  "rgba(255, 59, 48, 0.35)",
  "rgba(255, 59, 48, 0.55)",
  "rgba(255, 59, 48, 0.75)",
  "rgba(255, 59, 48, 0.95)",
];

const EMPTY_COLOR = "rgba(255,255,255,0.04)";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ─── helpers ────────────────────────────────────────────────── */

function toDateKey(d) {
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatCurrency(v) {
  if (v == null) return "$0.00";
  const sign = v >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatR(v) {
  if (v == null) return "0.00R";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}R`;
}

function formatDate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function getIntensity(value, maxAbs) {
  if (maxAbs === 0) return 0;
  const ratio = Math.min(Math.abs(value) / maxAbs, 1);
  if (ratio <= 0.2) return 0;
  if (ratio <= 0.4) return 1;
  if (ratio <= 0.6) return 2;
  if (ratio <= 0.8) return 3;
  return 4;
}

function getCellColor(dayData, maxAbsPnl) {
  if (!dayData || dayData.trades === 0) return EMPTY_COLOR;
  if (dayData.pnl === 0) return EMPTY_COLOR;
  const idx = getIntensity(dayData.pnl, maxAbsPnl);
  return dayData.pnl > 0 ? GREEN_SHADES[idx] : RED_SHADES[idx];
}

/* ─── data aggregation ───────────────────────────────────────── */

function buildDailyMap(stats) {
  const map = {};
  if (!stats || !stats.tradeData) return map;

  for (const trade of stats.tradeData) {
    const date = trade.sellDate || trade.buyDate;
    if (!date) continue;
    const key = toDateKey(date);
    if (!map[key]) map[key] = { pnl: 0, rTotal: 0, trades: 0 };
    map[key].pnl += (trade.pnl || 0);
    map[key].rTotal += (trade.rMultiple || 0);
    map[key].trades += 1;
  }
  return map;
}

function buildCalendarWeeks(endDate) {
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);
  start.setDate(start.getDate() + 1);

  // Roll back start to the previous Sunday
  while (start.getDay() !== 0) {
    start.setDate(start.getDate() - 1);
  }

  const weeks = [];
  let current = new Date(start);

  while (current <= end) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function computeStreaks(dailyMap) {
  const sortedKeys = Object.keys(dailyMap)
    .filter(k => dailyMap[k].trades > 0)
    .sort();

  if (sortedKeys.length === 0) {
    return { currentStreak: 0, currentStreakType: "none", longestWin: 0, longestLoss: 0 };
  }

  let longestWin = 0, longestLoss = 0;
  let curWin = 0, curLoss = 0;

  for (const key of sortedKeys) {
    if (dailyMap[key].pnl > 0) {
      curWin++;
      curLoss = 0;
      longestWin = Math.max(longestWin, curWin);
    } else if (dailyMap[key].pnl < 0) {
      curLoss++;
      curWin = 0;
      longestLoss = Math.max(longestLoss, curLoss);
    } else {
      curWin = 0;
      curLoss = 0;
    }
  }

  let currentStreak = 0;
  let currentStreakType = "none";
  if (sortedKeys.length > 0) {
    const lastKey = sortedKeys[sortedKeys.length - 1];
    const lastPnl = dailyMap[lastKey].pnl;
    if (lastPnl > 0) {
      currentStreakType = "win";
      for (let i = sortedKeys.length - 1; i >= 0; i--) {
        if (dailyMap[sortedKeys[i]].pnl > 0) currentStreak++;
        else break;
      }
    } else if (lastPnl < 0) {
      currentStreakType = "loss";
      for (let i = sortedKeys.length - 1; i >= 0; i--) {
        if (dailyMap[sortedKeys[i]].pnl < 0) currentStreak++;
        else break;
      }
    }
  }

  return { currentStreak, currentStreakType, longestWin, longestLoss };
}

function computeMonthlyBreakdown(dailyMap) {
  const months = {};
  for (const [key, data] of Object.entries(dailyMap)) {
    if (data.trades === 0) continue;
    const monthKey = key.slice(0, 7); // YYYY-MM
    if (!months[monthKey]) months[monthKey] = { pnl: 0, trades: 0, wins: 0 };
    months[monthKey].pnl += data.pnl;
    months[monthKey].trades += data.trades;
    if (data.pnl > 0) months[monthKey].wins += 1;
  }

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      const [y, m] = key.split("-").map(Number);
      return {
        key,
        label: `${MONTH_LABELS[m - 1]} ${y}`,
        pnl: data.pnl,
        trades: data.trades,
        winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
      };
    });
}

/* ─── tooltip ────────────────────────────────────────────────── */

function Tooltip({ data, position }) {
  if (!data) return null;
  return (
    <div style={{
      position: "fixed",
      left: position.x + 12,
      top: position.y - 10,
      background: C.surfaceRaised,
      border: `0.5px solid ${C.border}`,
      borderRadius: 12,
      padding: "12px 16px",
      pointerEvents: "none",
      zIndex: 9999,
      fontFamily: FONT,
      minWidth: 180,
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>
        {formatDate(data.date)}
      </div>
      {data.trades > 0 ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: C.textSecondary }}>Trades</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{data.trades}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: C.textSecondary }}>P&L</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: data.pnl >= 0 ? C.green : C.red }}>
              {formatCurrency(data.pnl)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: C.textSecondary }}>Total R</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: data.rTotal >= 0 ? C.green : C.red }}>
              {formatR(data.rTotal)}
            </span>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 11, color: C.textTertiary }}>No trades</div>
      )}
    </div>
  );
}

/* ─── stat card ──────────────────────────────────────────────── */

function StatCard({ label, value, subValue, color }) {
  return (
    <div style={{
      background: C.surface,
      border: `0.5px solid ${C.border}`,
      borderRadius: 16,
      padding: "20px 24px",
      flex: "1 1 0",
      minWidth: 150,
    }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: C.textTertiary, marginBottom: 8, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || C.text, fontFamily: FONT, lineHeight: 1.2 }}>
        {value}
      </div>
      {subValue && (
        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4, fontFamily: FONT }}>
          {subValue}
        </div>
      )}
    </div>
  );
}

/* ─── monthly card ───────────────────────────────────────────── */

function MonthlyCard({ label, pnl, trades, winRate }) {
  const isPositive = pnl >= 0;
  return (
    <div style={{
      background: C.surface,
      border: `0.5px solid ${C.border}`,
      borderRadius: 16,
      padding: "18px 20px",
      minWidth: 140,
      flex: "0 0 auto",
      transition: "border-color 0.2s",
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 12, fontFamily: FONT }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: isPositive ? C.green : C.red, fontFamily: FONT, marginBottom: 10 }}>
        {formatCurrency(pnl)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: C.textTertiary, fontFamily: FONT, marginBottom: 2 }}>Trades</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, fontFamily: FONT }}>{trades}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: C.textTertiary, fontFamily: FONT, marginBottom: 2 }}>Win Rate</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: winRate >= 50 ? C.green : C.red, fontFamily: FONT }}>{winRate}%</div>
        </div>
      </div>
    </div>
  );
}

/* ─── legend ─────────────────────────────────────────────────── */

function Legend() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT }}>
      <span style={{ fontSize: 11, color: C.textTertiary }}>Loss</span>
      {[...RED_SHADES].reverse().map((color, i) => (
        <div key={`r-${i}`} style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
      ))}
      <div style={{ width: 12, height: 12, borderRadius: 3, background: EMPTY_COLOR, margin: "0 2px" }} />
      {GREEN_SHADES.map((color, i) => (
        <div key={`g-${i}`} style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
      ))}
      <span style={{ fontSize: 11, color: C.textTertiary }}>Profit</span>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────── */

export default function HeatmapPage({ stats }) {
  const [tooltip, setTooltip] = useState(null);

  const dailyMap = useMemo(() => buildDailyMap(stats), [stats]);

  const today = useMemo(() => new Date(), []);
  const weeks = useMemo(() => buildCalendarWeeks(today), [today]);

  const maxAbsPnl = useMemo(() => {
    let m = 0;
    for (const d of Object.values(dailyMap)) {
      if (d.trades > 0) m = Math.max(m, Math.abs(d.pnl));
    }
    return m || 1;
  }, [dailyMap]);

  const summaryStats = useMemo(() => {
    const entries = Object.entries(dailyMap).filter(([, d]) => d.trades > 0);
    if (entries.length === 0) return null;

    const totalDays = entries.length;
    let bestDay = entries[0], worstDay = entries[0], totalPnl = 0;
    for (const entry of entries) {
      totalPnl += entry[1].pnl;
      if (entry[1].pnl > bestDay[1].pnl) bestDay = entry;
      if (entry[1].pnl < worstDay[1].pnl) worstDay = entry;
    }

    const avgPnl = totalPnl / totalDays;
    const streaks = computeStreaks(dailyMap);

    return { totalDays, bestDay, worstDay, avgPnl, ...streaks };
  }, [dailyMap]);

  const monthlyBreakdown = useMemo(() => computeMonthlyBreakdown(dailyMap), [dailyMap]);

  const handleMouseEnter = useCallback((e, dateKey, dayData) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      data: {
        date: parseDateKey(dateKey),
        trades: dayData ? dayData.trades : 0,
        pnl: dayData ? dayData.pnl : 0,
        rTotal: dayData ? dayData.rTotal : 0,
      },
      position: { x: rect.right, y: rect.top },
    });
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  // Month label positions for the calendar header
  const monthPositions = useMemo(() => {
    const positions = [];
    let lastMonth = -1;
    for (let w = 0; w < weeks.length; w++) {
      const midDay = weeks[w][3] || weeks[w][0];
      const month = midDay.getMonth();
      if (month !== lastMonth) {
        positions.push({ month, weekIndex: w });
        lastMonth = month;
      }
    }
    return positions;
  }, [weeks]);

  /* ─── empty state ────────────────────────────────────────── */

  if (!stats || !stats.tradeData || stats.tradeData.length === 0) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          fontFamily: FONT,
        }}>
          <div style={{
            background: C.surface,
            border: `0.5px solid ${C.border}`,
            borderRadius: 20,
            padding: "60px 48px",
            textAlign: "center",
            maxWidth: 480,
          }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>&#128197;</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 12px", fontFamily: FONT }}>
              No Trading Data Yet
            </h2>
            <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.7, margin: 0, fontFamily: FONT }}>
              Load trades in the Dashboard first to see your performance heatmap.
            </p>
          </div>
        </div>
      </>
    );
  }

  const CELL_SIZE = 14;
  const CELL_GAP = 3;
  const DAY_LABEL_WIDTH = 36;

  /* ─── render ─────────────────────────────────────────────── */

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{
        minHeight: "100vh",
        background: C.bg,
        padding: "40px 48px 80px",
        fontFamily: FONT,
      }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: C.text, margin: "0 0 8px", fontFamily: FONT }}>
            Performance Heatmap
          </h1>
          <p style={{ fontSize: 14, color: C.textSecondary, margin: 0, fontFamily: FONT }}>
            Daily P&L over the last 12 months
          </p>
        </div>

        {/* ── Stats Summary ── */}
        {summaryStats && (
          <div style={{
            display: "flex",
            gap: 12,
            marginBottom: 36,
            flexWrap: "wrap",
          }}>
            <StatCard
              label="Trading Days"
              value={summaryStats.totalDays}
            />
            <StatCard
              label="Best Day"
              value={formatCurrency(summaryStats.bestDay[1].pnl)}
              subValue={formatDate(parseDateKey(summaryStats.bestDay[0]))}
              color={C.green}
            />
            <StatCard
              label="Worst Day"
              value={formatCurrency(summaryStats.worstDay[1].pnl)}
              subValue={formatDate(parseDateKey(summaryStats.worstDay[0]))}
              color={C.red}
            />
            <StatCard
              label="Avg Daily P&L"
              value={formatCurrency(summaryStats.avgPnl)}
              color={summaryStats.avgPnl >= 0 ? C.green : C.red}
            />
            <StatCard
              label="Current Streak"
              value={summaryStats.currentStreak > 0 ? `${summaryStats.currentStreak} day${summaryStats.currentStreak !== 1 ? "s" : ""}` : "---"}
              subValue={summaryStats.currentStreakType === "win" ? "Winning" : summaryStats.currentStreakType === "loss" ? "Losing" : null}
              color={summaryStats.currentStreakType === "win" ? C.green : summaryStats.currentStreakType === "loss" ? C.red : C.textTertiary}
            />
            <StatCard
              label="Longest Win Streak"
              value={`${summaryStats.longestWin} day${summaryStats.longestWin !== 1 ? "s" : ""}`}
              color={C.green}
            />
            <StatCard
              label="Longest Loss Streak"
              value={`${summaryStats.longestLoss} day${summaryStats.longestLoss !== 1 ? "s" : ""}`}
              color={C.red}
            />
          </div>
        )}

        {/* ── Heatmap Container ── */}
        <div style={{
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 20,
          padding: "32px 32px 28px",
          marginBottom: 36,
          overflowX: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0, fontFamily: FONT }}>
              Daily Activity
            </h2>
            <Legend />
          </div>

          {/* ── Month labels ── */}
          <div style={{ display: "flex", paddingLeft: DAY_LABEL_WIDTH, marginBottom: 6 }}>
            {monthPositions.map(({ month, weekIndex }, i) => {
              const nextWeekIndex = i + 1 < monthPositions.length ? monthPositions[i + 1].weekIndex : weeks.length;
              const span = nextWeekIndex - weekIndex;
              return (
                <div
                  key={`ml-${i}`}
                  style={{
                    width: span * (CELL_SIZE + CELL_GAP),
                    fontSize: 10,
                    fontWeight: 500,
                    color: C.textTertiary,
                    fontFamily: FONT,
                    flexShrink: 0,
                  }}
                >
                  {MONTH_LABELS[month]}
                </div>
              );
            })}
          </div>

          {/* ── Grid ── */}
          <div style={{ display: "flex" }}>
            {/* Day-of-week labels */}
            <div style={{ width: DAY_LABEL_WIDTH, flexShrink: 0 }}>
              {DAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  style={{
                    height: CELL_SIZE + CELL_GAP,
                    display: "flex",
                    alignItems: "center",
                    fontSize: 10,
                    fontWeight: 500,
                    color: C.textTertiary,
                    fontFamily: FONT,
                    visibility: (i === 1 || i === 3 || i === 5) ? "visible" : "hidden",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div style={{ display: "flex", gap: CELL_GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: CELL_GAP }}>
                  {week.map((day, di) => {
                    const key = toDateKey(day);
                    const dayData = dailyMap[key] || null;
                    const isAfterToday = day > today;

                    return (
                      <div
                        key={`${wi}-${di}`}
                        onMouseEnter={isAfterToday ? undefined : (e) => handleMouseEnter(e, key, dayData)}
                        onMouseLeave={isAfterToday ? undefined : handleMouseLeave}
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: 3,
                          background: isAfterToday ? "transparent" : getCellColor(dayData, maxAbsPnl),
                          cursor: isAfterToday ? "default" : "pointer",
                          transition: "opacity 0.15s",
                          opacity: isAfterToday ? 0 : 1,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Monthly Breakdown ── */}
        {monthlyBreakdown.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 16px", fontFamily: FONT }}>
              Monthly Breakdown
            </h2>
            <div style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              paddingBottom: 8,
            }}>
              {monthlyBreakdown.map((m) => (
                <MonthlyCard key={m.key} label={m.label} pnl={m.pnl} trades={m.trades} winRate={m.winRate} />
              ))}
            </div>
          </div>
        )}

        {/* ── Tooltip ── */}
        {tooltip && <Tooltip data={tooltip.data} position={tooltip.position} />}
      </div>
    </>
  );
}
