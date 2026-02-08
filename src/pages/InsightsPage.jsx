import { useMemo } from "react";

const C = {
  bg: "#06090f", bgAlt: "#0b1018", surface: "#0f1520", surfaceRaised: "#151d2b",
  border: "#1a2438", borderLight: "#243352", text: "#dfe6f0", textDim: "#6b7d9a",
  textMuted: "#3d4f6a", accent: "#00e5c7", green: "#00e5a0", red: "#ff4d6a",
  yellow: "#ffc942", orange: "#ff8c42", purple: "#9b7dff", cyan: "#00c2ff", white: "#ffffff",
};

function InsightCard({ icon, title, description, severity, metric }) {
  const colors = { positive: C.green, warning: C.yellow, negative: C.red, info: C.cyan, neutral: C.purple };
  const color = colors[severity] || C.accent;

  return (
    <div style={{
      background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${color}`, padding: "18px 20px",
      transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</span>
        </div>
        {metric && (
          <span style={{
            fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)",
            padding: "2px 8px", borderRadius: 4,
            background: `${color}18`, color,
          }}>{metric}</span>
        )}
      </div>
      <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6, margin: 0 }}>{description}</p>
    </div>
  );
}

function generateInsights(stats, strategyTags) {
  if (!stats) return [];
  const insights = [];

  // SQN insight
  if (stats.sqn >= 3) {
    insights.push({ icon: "🏆", title: "Excellent System Quality", description: `Your SQN of ${stats.sqn.toFixed(2)} rates as "${stats.sqnRating.label}". This indicates a high-quality trading system. Focus on position sizing to maximize returns.`, severity: "positive", metric: `SQN ${stats.sqn.toFixed(2)}` });
  } else if (stats.sqn >= 1.5) {
    insights.push({ icon: "📊", title: "Decent System Quality", description: `Your SQN of ${stats.sqn.toFixed(2)} rates as "${stats.sqnRating.label}". There's room for improvement. Focus on cutting losing trades faster or letting winners run longer.`, severity: "info", metric: `SQN ${stats.sqn.toFixed(2)}` });
  } else {
    insights.push({ icon: "⚠️", title: "System Needs Work", description: `Your SQN of ${stats.sqn.toFixed(2)} rates as "${stats.sqnRating.label}". Consider paper trading while you refine your entries and exits. The system isn't reliably profitable yet.`, severity: "negative", metric: `SQN ${stats.sqn.toFixed(2)}` });
  }

  // Sample size warning
  if (stats.n < 30) {
    insights.push({ icon: "📉", title: "Low Sample Size", description: `You only have ${stats.n} trades. Van Tharp recommends at least 30 trades (ideally 100+) before drawing conclusions about your system's quality. Keep trading and tracking.`, severity: "warning", metric: `${stats.n} trades` });
  }

  // Win rate vs payoff analysis
  const payoff = parseFloat(stats.payoffRatio);
  if (stats.winRate < 40 && payoff > 2) {
    insights.push({ icon: "🎯", title: "Low Win Rate, High Payoff — Trend Follower Profile", description: `Your ${stats.winRate}% win rate is low, but your ${stats.payoffRatio} payoff ratio compensates. This is a classic trend-following profile. The key is managing the psychology of frequent small losses.`, severity: "info", metric: `${stats.winRate}% WR` });
  } else if (stats.winRate > 65 && payoff < 1.2) {
    insights.push({ icon: "🎯", title: "High Win Rate, Low Payoff — Scalper Profile", description: `Your ${stats.winRate}% win rate is high, but your ${stats.payoffRatio} payoff ratio is thin. One bad loss can wipe many wins. Consider widening your targets or tightening your stops.`, severity: "warning", metric: `${payoff.toFixed(2)} payoff` });
  }

  // Expectancy
  if (stats.meanR > 0) {
    const perTrade = stats.meanR.toFixed(3);
    insights.push({ icon: "💰", title: "Positive Expectancy", description: `You earn an average of ${perTrade}R per trade. Over ${stats.n} trades, that's ${stats.totalR}R total. As long as this holds, the math is on your side.`, severity: "positive", metric: `+${perTrade}R/trade` });
  } else {
    insights.push({ icon: "🚨", title: "Negative Expectancy", description: `Your system loses ${Math.abs(stats.meanR).toFixed(3)}R per trade on average. This means you're expected to lose money over time regardless of position sizing. Review your strategy before risking more capital.`, severity: "negative", metric: `${stats.meanR.toFixed(3)}R/trade` });
  }

  // Drawdown analysis
  if (stats.maxDDR > 5) {
    insights.push({ icon: "📉", title: "Large Maximum Drawdown", description: `Your max drawdown of ${stats.maxDDR}R is significant. Van Tharp suggests keeping drawdowns under 5R for most systems. Consider reducing position size or adding a drawdown-based circuit breaker.`, severity: "negative", metric: `${stats.maxDDR}R DD` });
  } else if (stats.maxDDR <= 3) {
    insights.push({ icon: "🛡️", title: "Well-Controlled Drawdown", description: `Your max drawdown of ${stats.maxDDR}R shows good risk management. This level is psychologically manageable and suggests disciplined stop losses.`, severity: "positive", metric: `${stats.maxDDR}R DD` });
  }

  // Loss streak warning
  if (stats.maxLossStreak >= 5) {
    insights.push({ icon: "🔥", title: "Extended Loss Streak Detected", description: `You had a ${stats.maxLossStreak}-trade losing streak. This is psychologically challenging and where most traders deviate from their system. Consider having a pre-planned response for streaks of 4+ losses (reduce size, take a break).`, severity: "warning", metric: `${stats.maxLossStreak} losses` });
  }

  // Win streak
  if (stats.maxWinStreak >= 5) {
    insights.push({ icon: "🔥", title: "Strong Win Streak", description: `You had a ${stats.maxWinStreak}-trade win streak. Be aware of overconfidence bias — traders often increase risk after win streaks, which can amplify the next inevitable drawdown.`, severity: "info", metric: `${stats.maxWinStreak} wins` });
  }

  // Skewness insight
  if (stats.skewness > 1) {
    insights.push({ icon: "📐", title: "Positive Skew — Right Tail Advantage", description: `Your R-distribution has positive skewness (${stats.skewness}). This means you have occasional large winners that pull the average up. This is the ideal profile — small frequent losses, occasional big wins.`, severity: "positive", metric: `Skew ${stats.skewness}` });
  } else if (stats.skewness < -1) {
    insights.push({ icon: "📐", title: "Negative Skew — Left Tail Risk", description: `Your R-distribution has negative skewness (${stats.skewness}). This means your large trades tend to be losers. Consider reviewing your worst trades to see if stops are being honored.`, severity: "negative", metric: `Skew ${stats.skewness}` });
  }

  // Largest loss analysis
  if (stats.largestLossR < -3) {
    insights.push({ icon: "💥", title: "Outsized Loss Detected", description: `Your largest loss was ${stats.largestLossR}R on ${stats.worstR?.symbol}. In a disciplined system, losses should cluster near -1R. A loss beyond -2R suggests a blown stop or no stop at all. Review this trade.`, severity: "negative", metric: `${stats.largestLossR}R` });
  }

  // Opportunity analysis
  if (stats.tradesPerMonth < 3) {
    insights.push({ icon: "⏱️", title: "Low Trading Frequency", description: `At ${stats.tradesPerMonth} trades/month, your expectunity (expectancy x opportunity) is limited. Even with positive expectancy, infrequent trading slows compounding. Consider if there are additional setups you're missing.`, severity: "info", metric: `${stats.tradesPerMonth}/mo` });
  } else if (stats.tradesPerMonth > 40) {
    insights.push({ icon: "⏱️", title: "High Trading Frequency", description: `At ${stats.tradesPerMonth} trades/month, you're very active. Ensure commissions and slippage aren't eroding your edge. Also monitor for overtrading — more trades isn't always better.`, severity: "info", metric: `${stats.tradesPerMonth}/mo` });
  }

  // Strategy analysis if tags exist
  if (strategyTags && Object.keys(strategyTags).length > 0) {
    const stratPerf = {};
    if (stats.tradeData) {
      stats.tradeData.forEach(t => {
        const key = `${t.symbol}_${t.buyDate}`;
        const strat = strategyTags[key];
        if (strat) {
          if (!stratPerf[strat]) stratPerf[strat] = { totalR: 0, count: 0, wins: 0 };
          stratPerf[strat].totalR += t.rMultiple;
          stratPerf[strat].count++;
          if (t.rMultiple > 0) stratPerf[strat].wins++;
        }
      });
    }
    const sorted = Object.entries(stratPerf).sort((a, b) => (b[1].totalR / b[1].count) - (a[1].totalR / a[1].count));
    if (sorted.length >= 2) {
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];
      if (best[1].count >= 2) {
        insights.push({
          icon: "🏅", title: `Best Strategy: ${best[0]}`,
          description: `Your "${best[0]}" trades average ${(best[1].totalR / best[1].count).toFixed(2)}R across ${best[1].count} trades with a ${Math.round((best[1].wins / best[1].count) * 100)}% win rate. Consider allocating more capital to this setup.`,
          severity: "positive", metric: `${(best[1].totalR / best[1].count).toFixed(2)}R avg`,
        });
      }
      if (worst[1].count >= 2 && worst[1].totalR < 0) {
        insights.push({
          icon: "🚫", title: `Weakest Strategy: ${worst[0]}`,
          description: `Your "${worst[0]}" trades average ${(worst[1].totalR / worst[1].count).toFixed(2)}R across ${worst[1].count} trades. Consider eliminating or refining this setup — it's dragging your overall system quality down.`,
          severity: "negative", metric: `${(worst[1].totalR / worst[1].count).toFixed(2)}R avg`,
        });
      }
    }
  }

  // Best symbol
  if (stats.bySymbol?.length >= 3) {
    const best = stats.bySymbol[0];
    const worst = stats.bySymbol[stats.bySymbol.length - 1];
    if (best.totalR > 0) {
      insights.push({ icon: "⭐", title: `Top Performer: ${best.symbol}`, description: `${best.symbol} is your best ticker with ${best.totalR}R across ${best.trades} trades (${best.winRate}% WR). You clearly have an edge here.`, severity: "positive", metric: `+${best.totalR}R` });
    }
    if (worst.totalR < 0) {
      insights.push({ icon: "🔻", title: `Worst Performer: ${worst.symbol}`, description: `${worst.symbol} is your worst ticker at ${worst.totalR}R across ${worst.trades} trades (${worst.winRate}% WR). Consider whether you have a real edge in this name or if you should avoid it.`, severity: "negative", metric: `${worst.totalR}R` });
    }
  }

  // Holding period analysis
  if (stats.tradeData?.length) {
    const shortHolds = stats.tradeData.filter(t => t.holdDays <= 3);
    const longHolds = stats.tradeData.filter(t => t.holdDays >= 10);
    if (shortHolds.length >= 3 && longHolds.length >= 3) {
      const shortAvgR = shortHolds.reduce((s, t) => s + t.rMultiple, 0) / shortHolds.length;
      const longAvgR = longHolds.reduce((s, t) => s + t.rMultiple, 0) / longHolds.length;
      if (Math.abs(shortAvgR - longAvgR) > 0.3) {
        const better = shortAvgR > longAvgR ? "short" : "long";
        const betterAvg = better === "short" ? shortAvgR : longAvgR;
        insights.push({
          icon: "⏳", title: `${better === "short" ? "Short" : "Long"} Holds Perform Better`,
          description: `Trades held ${better === "short" ? "1-3 days" : "10+ days"} average ${betterAvg.toFixed(2)}R vs ${(better === "short" ? longAvgR : shortAvgR).toFixed(2)}R for ${better === "short" ? "longer" : "shorter"} holds. Consider optimizing your holding period toward what works.`,
          severity: "info", metric: `${betterAvg.toFixed(2)}R avg`,
        });
      }
    }
  }

  return insights;
}

export default function InsightsPage({ stats, strategyTags }) {
  const insights = useMemo(() => generateInsights(stats, strategyTags), [stats, strategyTags]);

  const positiveCount = insights.filter(i => i.severity === "positive").length;
  const warningCount = insights.filter(i => i.severity === "warning" || i.severity === "negative").length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 60px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>AI Trade Coach</h1>
        <p style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>
          Automated pattern detection and personalized insights from your trade data
        </p>
      </div>

      {!stats ? (
        <div style={{
          textAlign: "center", padding: "60px 24px", color: C.textMuted,
          background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`,
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 14 }}>
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.textDim }}>No trade data yet</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>
            Import trades from the Dashboard first, then come back for insights.
          </div>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div style={{
            display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap",
          }}>
            <div style={{
              background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
              padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 12, color: C.textDim }}>Insights found:</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.accent, fontFamily: "var(--mono)" }}>{insights.length}</span>
            </div>
            <div style={{
              background: `${C.green}10`, borderRadius: 8, border: `1px solid ${C.green}25`,
              padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 12, color: C.green }}>Strengths:</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.green, fontFamily: "var(--mono)" }}>{positiveCount}</span>
            </div>
            <div style={{
              background: `${C.red}10`, borderRadius: 8, border: `1px solid ${C.red}25`,
              padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 12, color: C.red }}>Areas to improve:</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.red, fontFamily: "var(--mono)" }}>{warningCount}</span>
            </div>
          </div>

          {/* Insights */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {insights.map((insight, i) => (
              <InsightCard key={i} {...insight} />
            ))}
          </div>

          {/* Tip */}
          <div style={{
            marginTop: 24, padding: "16px 20px", borderRadius: 10,
            background: `${C.purple}08`, border: `1px solid ${C.purple}25`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.purple, fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
              Pro tip
            </div>
            <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>
              Tag your trades with strategies in the Trade Log tab and journal your trades in the Journal page.
              The more data you provide, the more specific and actionable your insights become.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { generateInsights };
