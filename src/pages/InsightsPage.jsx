import { useMemo } from "react";

const C = {
  bg: "#000000", surface: "#111111", surfaceRaised: "#1a1a1a",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
  text: "#f5f5f7", textSecondary: "#a1a1a6", textTertiary: "#6e6e73",
  accent: "#2997ff", green: "#34c759", red: "#ff3b30",
  yellow: "#ffcc00", orange: "#ff9500", purple: "#af52de", cyan: "#5ac8fa", white: "#ffffff",
};

function InsightCard({ icon, title, description, severity, metric }) {
  const colors = { positive: C.green, warning: C.yellow, negative: C.red, info: C.cyan, neutral: C.purple };
  const color = colors[severity] || C.accent;

  return (
    <div style={{
      background: C.surface, borderRadius: 16, border: `0.5px solid ${C.border}`,
      borderLeft: `3px solid ${color}`, padding: "22px 24px",
      transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>{title}</span>
        </div>
        {metric && (
          <span style={{
            fontSize: 11, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif",
            padding: "3px 10px", borderRadius: 8,
            background: `${color}18`, color,
          }}>{metric}</span>
        )}
      </div>
      <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.7, margin: 0, fontFamily: "'Inter', -apple-system, sans-serif" }}>{description}</p>
    </div>
  );
}

function generateInsights(stats, strategyTags) {
  if (!stats) return [];
  const insights = [];

  // SQN insight
  if (stats.sqn >= 3) {
    insights.push({ icon: "\u{1F3C6}", title: "Excellent System Quality", description: `Your SQN of ${stats.sqn.toFixed(2)} rates as "${stats.sqnRating.label}". This indicates a high-quality trading system. Focus on position sizing to maximize returns.`, severity: "positive", metric: `SQN ${stats.sqn.toFixed(2)}` });
  } else if (stats.sqn >= 1.5) {
    insights.push({ icon: "\u{1F4CA}", title: "Decent System Quality", description: `Your SQN of ${stats.sqn.toFixed(2)} rates as "${stats.sqnRating.label}". There's room for improvement. Focus on cutting losing trades faster or letting winners run longer.`, severity: "info", metric: `SQN ${stats.sqn.toFixed(2)}` });
  } else {
    insights.push({ icon: "\u26A0\uFE0F", title: "System Needs Work", description: `Your SQN of ${stats.sqn.toFixed(2)} rates as "${stats.sqnRating.label}". Consider paper trading while you refine your entries and exits. The system isn't reliably profitable yet.`, severity: "negative", metric: `SQN ${stats.sqn.toFixed(2)}` });
  }

  // Sample size warning
  if (stats.n < 30) {
    insights.push({ icon: "\u{1F4C9}", title: "Low Sample Size", description: `You only have ${stats.n} trades. Van Tharp recommends at least 30 trades (ideally 100+) before drawing conclusions about your system's quality. Keep trading and tracking.`, severity: "warning", metric: `${stats.n} trades` });
  }

  // Win rate vs payoff analysis
  const payoff = parseFloat(stats.payoffRatio);
  if (stats.winRate < 40 && payoff > 2) {
    insights.push({ icon: "\u{1F3AF}", title: "Low Win Rate, High Payoff \u2014 Trend Follower Profile", description: `Your ${stats.winRate}% win rate is low, but your ${stats.payoffRatio} payoff ratio compensates. This is a classic trend-following profile. The key is managing the psychology of frequent small losses.`, severity: "info", metric: `${stats.winRate}% WR` });
  } else if (stats.winRate > 65 && payoff < 1.2) {
    insights.push({ icon: "\u{1F3AF}", title: "High Win Rate, Low Payoff \u2014 Scalper Profile", description: `Your ${stats.winRate}% win rate is high, but your ${stats.payoffRatio} payoff ratio is thin. One bad loss can wipe many wins. Consider widening your targets or tightening your stops.`, severity: "warning", metric: `${payoff.toFixed(2)} payoff` });
  }

  // Expectancy
  if (stats.meanR > 0) {
    const perTrade = stats.meanR.toFixed(3);
    insights.push({ icon: "\u{1F4B0}", title: "Positive Expectancy", description: `You earn an average of ${perTrade}R per trade. Over ${stats.n} trades, that's ${stats.totalR}R total. As long as this holds, the math is on your side.`, severity: "positive", metric: `+${perTrade}R/trade` });
  } else {
    insights.push({ icon: "\u{1F6A8}", title: "Negative Expectancy", description: `Your system loses ${Math.abs(stats.meanR).toFixed(3)}R per trade on average. This means you're expected to lose money over time regardless of position sizing. Review your strategy before risking more capital.`, severity: "negative", metric: `${stats.meanR.toFixed(3)}R/trade` });
  }

  // Drawdown analysis
  if (stats.maxDDR > 5) {
    insights.push({ icon: "\u{1F4C9}", title: "Large Maximum Drawdown", description: `Your max drawdown of ${stats.maxDDR}R is significant. Van Tharp suggests keeping drawdowns under 5R for most systems. Consider reducing position size or adding a drawdown-based circuit breaker.`, severity: "negative", metric: `${stats.maxDDR}R DD` });
  } else if (stats.maxDDR <= 3) {
    insights.push({ icon: "\u{1F6E1}\uFE0F", title: "Well-Controlled Drawdown", description: `Your max drawdown of ${stats.maxDDR}R shows good risk management. This level is psychologically manageable and suggests disciplined stop losses.`, severity: "positive", metric: `${stats.maxDDR}R DD` });
  }

  // Loss streak warning
  if (stats.maxLossStreak >= 5) {
    insights.push({ icon: "\u{1F525}", title: "Extended Loss Streak Detected", description: `You had a ${stats.maxLossStreak}-trade losing streak. This is psychologically challenging and where most traders deviate from their system. Consider having a pre-planned response for streaks of 4+ losses (reduce size, take a break).`, severity: "warning", metric: `${stats.maxLossStreak} losses` });
  }

  // Win streak
  if (stats.maxWinStreak >= 5) {
    insights.push({ icon: "\u{1F525}", title: "Strong Win Streak", description: `You had a ${stats.maxWinStreak}-trade win streak. Be aware of overconfidence bias \u2014 traders often increase risk after win streaks, which can amplify the next inevitable drawdown.`, severity: "info", metric: `${stats.maxWinStreak} wins` });
  }

  // Skewness insight
  if (stats.skewness > 1) {
    insights.push({ icon: "\u{1F4D0}", title: "Positive Skew \u2014 Right Tail Advantage", description: `Your R-distribution has positive skewness (${stats.skewness}). This means you have occasional large winners that pull the average up. This is the ideal profile \u2014 small frequent losses, occasional big wins.`, severity: "positive", metric: `Skew ${stats.skewness}` });
  } else if (stats.skewness < -1) {
    insights.push({ icon: "\u{1F4D0}", title: "Negative Skew \u2014 Left Tail Risk", description: `Your R-distribution has negative skewness (${stats.skewness}). This means your large trades tend to be losers. Consider reviewing your worst trades to see if stops are being honored.`, severity: "negative", metric: `Skew ${stats.skewness}` });
  }

  // Largest loss analysis
  if (stats.largestLossR < -3) {
    insights.push({ icon: "\u{1F4A5}", title: "Outsized Loss Detected", description: `Your largest loss was ${stats.largestLossR}R on ${stats.worstR?.symbol}. In a disciplined system, losses should cluster near -1R. A loss beyond -2R suggests a blown stop or no stop at all. Review this trade.`, severity: "negative", metric: `${stats.largestLossR}R` });
  }

  // Opportunity analysis
  if (stats.tradesPerMonth < 3) {
    insights.push({ icon: "\u23F1\uFE0F", title: "Low Trading Frequency", description: `At ${stats.tradesPerMonth} trades/month, your expectunity (expectancy x opportunity) is limited. Even with positive expectancy, infrequent trading slows compounding. Consider if there are additional setups you're missing.`, severity: "info", metric: `${stats.tradesPerMonth}/mo` });
  } else if (stats.tradesPerMonth > 40) {
    insights.push({ icon: "\u23F1\uFE0F", title: "High Trading Frequency", description: `At ${stats.tradesPerMonth} trades/month, you're very active. Ensure commissions and slippage aren't eroding your edge. Also monitor for overtrading \u2014 more trades isn't always better.`, severity: "info", metric: `${stats.tradesPerMonth}/mo` });
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
          icon: "\u{1F3C5}", title: `Best Strategy: ${best[0]}`,
          description: `Your "${best[0]}" trades average ${(best[1].totalR / best[1].count).toFixed(2)}R across ${best[1].count} trades with a ${Math.round((best[1].wins / best[1].count) * 100)}% win rate. Consider allocating more capital to this setup.`,
          severity: "positive", metric: `${(best[1].totalR / best[1].count).toFixed(2)}R avg`,
        });
      }
      if (worst[1].count >= 2 && worst[1].totalR < 0) {
        insights.push({
          icon: "\u{1F6AB}", title: `Weakest Strategy: ${worst[0]}`,
          description: `Your "${worst[0]}" trades average ${(worst[1].totalR / worst[1].count).toFixed(2)}R across ${worst[1].count} trades. Consider eliminating or refining this setup \u2014 it's dragging your overall system quality down.`,
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
      insights.push({ icon: "\u2B50", title: `Top Performer: ${best.symbol}`, description: `${best.symbol} is your best ticker with ${best.totalR}R across ${best.trades} trades (${best.winRate}% WR). You clearly have an edge here.`, severity: "positive", metric: `+${best.totalR}R` });
    }
    if (worst.totalR < 0) {
      insights.push({ icon: "\u{1F53B}", title: `Worst Performer: ${worst.symbol}`, description: `${worst.symbol} is your worst ticker at ${worst.totalR}R across ${worst.trades} trades (${worst.winRate}% WR). Consider whether you have a real edge in this name or if you should avoid it.`, severity: "negative", metric: `${worst.totalR}R` });
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
          icon: "\u231B", title: `${better === "short" ? "Short" : "Long"} Holds Perform Better`,
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
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.03em", color: C.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>AI Trade Coach</h1>
        <p style={{ fontSize: 14, color: C.textSecondary, marginTop: 6, fontWeight: 400, letterSpacing: "-0.01em" }}>
          Automated pattern detection and personalized insights from your trade data
        </p>
      </div>

      {!stats ? (
        <div style={{
          textAlign: "center", padding: "80px 32px", color: C.textTertiary,
          background: C.surface, borderRadius: 20, border: `0.5px solid ${C.border}`,
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 16 }}>
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 500, color: C.textSecondary }}>No trade data yet</div>
          <div style={{ fontSize: 13, marginTop: 8, color: C.textTertiary }}>
            Import trades from the Dashboard first, then come back for insights.
          </div>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div style={{
            display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap",
          }}>
            <div style={{
              background: C.surface, borderRadius: 16, border: `0.5px solid ${C.border}`,
              padding: "14px 20px", display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 13, color: C.textSecondary, fontWeight: 400 }}>Insights found:</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: C.accent, fontFamily: "'Inter', -apple-system, sans-serif" }}>{insights.length}</span>
            </div>
            <div style={{
              background: `${C.green}10`, borderRadius: 16, border: `0.5px solid ${C.green}25`,
              padding: "14px 20px", display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 13, color: C.green, fontWeight: 400 }}>Strengths:</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: C.green, fontFamily: "'Inter', -apple-system, sans-serif" }}>{positiveCount}</span>
            </div>
            <div style={{
              background: `${C.red}10`, borderRadius: 16, border: `0.5px solid ${C.red}25`,
              padding: "14px 20px", display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 13, color: C.red, fontWeight: 400 }}>Areas to improve:</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: C.red, fontFamily: "'Inter', -apple-system, sans-serif" }}>{warningCount}</span>
            </div>
          </div>

          {/* Insights */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {insights.map((insight, i) => (
              <InsightCard key={i} {...insight} />
            ))}
          </div>

          {/* Tip */}
          <div style={{
            marginTop: 28, padding: "20px 24px", borderRadius: 16,
            background: `${C.purple}08`, border: `0.5px solid ${C.purple}25`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: C.purple, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Pro tip
            </div>
            <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}>
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
