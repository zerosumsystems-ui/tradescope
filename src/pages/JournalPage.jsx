import { useState, useEffect, useMemo } from "react";

const C = {
  bg: "#000000", surface: "#111111", surfaceRaised: "#1a1a1a",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
  text: "#f5f5f7", textSecondary: "#a1a1a6", textTertiary: "#6e6e73",
  accent: "#2997ff", green: "#34c759", red: "#ff3b30",
  yellow: "#ffcc00", purple: "#af52de", cyan: "#5ac8fa", white: "#ffffff",
};

const EMOTIONS = ["Confident", "Fearful", "Greedy", "Patient", "Impulsive", "Disciplined", "Anxious", "Calm", "FOMO", "Revenge"];
const STRATEGIES = ["Breakout", "Mean Reversion", "Momentum", "Earnings Play", "Swing Trade", "Scalp", "Gap Fill", "Trend Follow", "Reversal", "Other"];

function EmotionTag({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: 980, fontSize: 12, fontWeight: 500,
      fontFamily: "'Inter', -apple-system, sans-serif", cursor: "pointer", transition: "all 0.15s",
      border: `0.5px solid ${selected ? C.accent : C.border}`,
      background: selected ? `${C.accent}18` : "transparent",
      color: selected ? C.accent : C.textSecondary,
    }}>{label}</button>
  );
}

function JournalEntryForm({ entry, onSave, onCancel }) {
  const [form, setForm] = useState(entry || {
    date: new Date().toISOString().split("T")[0],
    symbol: "",
    strategy: "",
    direction: "LONG",
    preTrade: "",
    postTrade: "",
    emotions: [],
    lessons: "",
    rating: 3,
    rMultiple: "",
  });

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggleEmotion = (e) => {
    setForm(prev => ({
      ...prev,
      emotions: prev.emotions.includes(e)
        ? prev.emotions.filter(x => x !== e)
        : [...prev.emotions, e],
    }));
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", background: C.surfaceRaised, border: `0.5px solid ${C.border}`,
    borderRadius: 12, color: C.text, fontSize: 14, fontFamily: "'Inter', -apple-system, sans-serif",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
  };
  const labelStyle = {
    fontSize: 11, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif",
    letterSpacing: "0.02em", textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 500,
  };

  return (
    <div style={{
      background: C.surface, borderRadius: 20, border: `0.5px solid ${C.border}`,
      padding: 28,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "-0.02em" }}>
          {entry ? "Edit Entry" : "New Journal Entry"}
        </h3>
        <button onClick={onCancel} style={{
          background: "none", border: "none", color: C.textTertiary, cursor: "pointer",
          fontSize: 18, fontFamily: "'Inter', -apple-system, sans-serif",
        }}>x</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 22 }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" value={form.date} onChange={e => update("date", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Symbol</label>
          <input type="text" value={form.symbol} onChange={e => update("symbol", e.target.value.toUpperCase())} placeholder="AAPL" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Strategy</label>
          <select value={form.strategy} onChange={e => update("strategy", e.target.value)}
            style={{ ...inputStyle, appearance: "auto" }}>
            <option value="">Select...</option>
            {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Direction</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["LONG", "SHORT"].map(d => (
              <button key={d} onClick={() => update("direction", d)} style={{
                flex: 1, padding: "10px 0", borderRadius: 980, fontSize: 13, fontWeight: 500,
                fontFamily: "'Inter', -apple-system, sans-serif", cursor: "pointer", transition: "all 0.15s",
                border: `0.5px solid ${form.direction === d ? (d === "LONG" ? C.green : C.red) : C.border}`,
                background: form.direction === d ? `${d === "LONG" ? C.green : C.red}18` : "transparent",
                color: form.direction === d ? (d === "LONG" ? C.green : C.red) : C.textSecondary,
              }}>{d}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>R-Multiple (Outcome)</label>
          <input type="number" step="0.01" value={form.rMultiple} onChange={e => update("rMultiple", e.target.value)} placeholder="+1.50" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Trade Rating (1-5)</label>
          <div style={{ display: "flex", gap: 6, paddingTop: 4 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => update("rating", n)} style={{
                width: 38, height: 38, borderRadius: 12, fontSize: 14, fontWeight: 600,
                fontFamily: "'Inter', -apple-system, sans-serif", cursor: "pointer", transition: "all 0.15s",
                border: `0.5px solid ${form.rating === n ? C.accent : C.border}`,
                background: form.rating === n ? `${C.accent}18` : "transparent",
                color: form.rating === n ? C.accent : C.textSecondary,
              }}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <label style={labelStyle}>Emotions</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EMOTIONS.map(e => (
            <EmotionTag key={e} label={e} selected={form.emotions.includes(e)} onClick={() => toggleEmotion(e)} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Pre-Trade Plan</label>
        <textarea value={form.preTrade} onChange={e => update("preTrade", e.target.value)}
          placeholder="What's the thesis? Entry criteria, target, stop loss..."
          rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 14 }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Post-Trade Review</label>
        <textarea value={form.postTrade} onChange={e => update("postTrade", e.target.value)}
          placeholder="What happened? Did you follow your plan? What would you do differently?"
          rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 14 }} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Lessons Learned</label>
        <textarea value={form.lessons} onChange={e => update("lessons", e.target.value)}
          placeholder="Key takeaways from this trade..."
          rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 14 }} />
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{
          padding: "11px 24px", borderRadius: 980, border: `0.5px solid ${C.border}`,
          background: "transparent", color: C.textSecondary, fontSize: 14, fontWeight: 500,
          cursor: "pointer", fontFamily: "'Inter', -apple-system, sans-serif",
        }}>Cancel</button>
        <button onClick={() => onSave({ ...form, id: form.id || Date.now(), updatedAt: new Date().toISOString() })} style={{
          padding: "11px 28px", borderRadius: 980, border: "none",
          background: C.accent,
          color: C.white, fontSize: 14, fontWeight: 500, cursor: "pointer",
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}>Save Entry</button>
      </div>
    </div>
  );
}

function JournalCard({ entry, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const rVal = parseFloat(entry.rMultiple);
  const rColor = isNaN(rVal) ? C.textSecondary : rVal >= 0 ? C.green : C.red;

  return (
    <div style={{
      background: C.surface, borderRadius: 16, border: `0.5px solid ${C.border}`,
      padding: "20px 24px", transition: "border-color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHover}
    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            fontSize: 18, fontWeight: 700, color: C.accent, fontFamily: "'Inter', -apple-system, sans-serif",
            minWidth: 60, letterSpacing: "-0.01em",
          }}>{entry.symbol || "---"}</div>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 400 }}>{entry.date}</span>
              {entry.strategy && (
                <span style={{
                  fontSize: 10, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif",
                  padding: "3px 10px", borderRadius: 980,
                  background: `${C.purple}18`, color: C.purple,
                }}>{entry.strategy}</span>
              )}
              <span style={{
                fontSize: 10, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif",
                padding: "3px 10px", borderRadius: 980,
                background: entry.direction === "LONG" ? `${C.green}18` : `${C.red}18`,
                color: entry.direction === "LONG" ? C.green : C.red,
              }}>{entry.direction}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {!isNaN(rVal) && (
            <span style={{ fontSize: 16, fontWeight: 600, color: rColor, fontFamily: "'Inter', -apple-system, sans-serif" }}>
              {rVal >= 0 ? "+" : ""}{rVal.toFixed(2)}R
            </span>
          )}
          <div style={{ display: "flex", gap: 2 }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} style={{ fontSize: 10, color: n <= entry.rating ? C.yellow : C.textTertiary }}>&#9733;</span>
            ))}
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="2" strokeLinecap="round"
            style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      </div>

      {entry.emotions.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: expanded ? 14 : 0 }}>
          {entry.emotions.map(e => (
            <span key={e} style={{
              fontSize: 10, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif",
              padding: "3px 10px", borderRadius: 980,
              background: `${C.accent}12`, color: C.accent,
            }}>{e}</span>
          ))}
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          {entry.preTrade && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 6 }}>Pre-Trade Plan</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, background: C.surfaceRaised, borderRadius: 12, padding: "12px 16px", fontFamily: "'Inter', -apple-system, sans-serif" }}>{entry.preTrade}</div>
            </div>
          )}
          {entry.postTrade && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 6 }}>Post-Trade Review</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, background: C.surfaceRaised, borderRadius: 12, padding: "12px 16px", fontFamily: "'Inter', -apple-system, sans-serif" }}>{entry.postTrade}</div>
            </div>
          )}
          {entry.lessons && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 6 }}>Lessons Learned</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, background: C.surfaceRaised, borderRadius: 12, padding: "12px 16px", fontFamily: "'Inter', -apple-system, sans-serif" }}>{entry.lessons}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }} style={{
              padding: "7px 18px", borderRadius: 980, border: `0.5px solid ${C.border}`,
              background: "transparent", color: C.textSecondary, fontSize: 12, fontWeight: 500,
              cursor: "pointer", fontFamily: "'Inter', -apple-system, sans-serif",
            }}>Edit</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} style={{
              padding: "7px 18px", borderRadius: 980, border: `0.5px solid ${C.red}33`,
              background: "transparent", color: C.red, fontSize: 12, fontWeight: 500,
              cursor: "pointer", fontFamily: "'Inter', -apple-system, sans-serif",
            }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JournalPage({ userId }) {
  const storageKey = `aiedge_journal_${userId || "local"}`;
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [filterStrategy, setFilterStrategy] = useState("");
  const [filterEmotion, setFilterEmotion] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries, storageKey]);

  const filtered = useMemo(() => {
    return entries
      .filter(e => !filterStrategy || e.strategy === filterStrategy)
      .filter(e => !filterEmotion || e.emotions.includes(filterEmotion))
      .filter(e => {
        if (!searchText) return true;
        const s = searchText.toLowerCase();
        return (e.symbol || "").toLowerCase().includes(s)
          || (e.preTrade || "").toLowerCase().includes(s)
          || (e.postTrade || "").toLowerCase().includes(s)
          || (e.lessons || "").toLowerCase().includes(s);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, filterStrategy, filterEmotion, searchText]);

  const handleSave = (entry) => {
    setEntries(prev => {
      const existing = prev.findIndex(e => e.id === entry.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = entry;
        return updated;
      }
      return [...prev, entry];
    });
    setShowForm(false);
    setEditEntry(null);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this journal entry?")) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleEdit = (entry) => {
    setEditEntry(entry);
    setShowForm(true);
  };

  // Stats
  const stats = useMemo(() => {
    if (!entries.length) return null;
    const withR = entries.filter(e => e.rMultiple !== "" && !isNaN(parseFloat(e.rMultiple)));
    const rVals = withR.map(e => parseFloat(e.rMultiple));
    const emotionCounts = {};
    entries.forEach(e => e.emotions.forEach(em => { emotionCounts[em] = (emotionCounts[em] || 0) + 1; }));
    const strategyCounts = {};
    entries.forEach(e => { if (e.strategy) strategyCounts[e.strategy] = (strategyCounts[e.strategy] || 0) + 1; });
    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
    const topStrategy = Object.entries(strategyCounts).sort((a, b) => b[1] - a[1])[0];
    const avgRating = entries.reduce((s, e) => s + e.rating, 0) / entries.length;
    return {
      total: entries.length,
      withNotes: entries.filter(e => e.preTrade || e.postTrade || e.lessons).length,
      avgR: rVals.length ? (rVals.reduce((s, r) => s + r, 0) / rVals.length).toFixed(2) : "N/A",
      avgRating: avgRating.toFixed(1),
      topEmotion: topEmotion ? topEmotion[0] : "N/A",
      topStrategy: topStrategy ? topStrategy[0] : "N/A",
    };
  }, [entries]);

  const selectStyle = {
    padding: "8px 14px", background: C.surfaceRaised, border: `0.5px solid ${C.border}`,
    borderRadius: 980, color: C.text, fontSize: 12, fontFamily: "'Inter', -apple-system, sans-serif",
    outline: "none", appearance: "auto", fontWeight: 400,
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 28px 64px", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* -- Header -- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.04em", fontFamily: "'Inter', -apple-system, sans-serif", color: C.text }}>Trade Journal</h1>
          <p style={{ fontSize: 14, color: C.textSecondary, marginTop: 6, fontWeight: 400 }}>Record your thoughts, emotions, and lessons for every trade</p>
        </div>
        <button onClick={() => { setEditEntry(null); setShowForm(true); }} style={{
          padding: "11px 24px", border: "none", borderRadius: 980,
          background: C.accent,
          color: C.white, fontSize: 14, fontWeight: 500, cursor: "pointer",
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}>+ New Entry</button>
      </div>

      {/* -- Stats Bar -- */}
      {stats && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 12, marginBottom: 24,
        }}>
          {[
            { l: "Entries", v: stats.total, c: C.accent },
            { l: "With Notes", v: stats.withNotes, c: C.cyan },
            { l: "Avg R", v: stats.avgR === "N/A" ? "N/A" : `${parseFloat(stats.avgR) >= 0 ? "+" : ""}${stats.avgR}R`, c: stats.avgR === "N/A" ? C.textSecondary : parseFloat(stats.avgR) >= 0 ? C.green : C.red },
            { l: "Avg Rating", v: `${stats.avgRating}/5`, c: C.yellow },
            { l: "Top Emotion", v: stats.topEmotion, c: C.purple },
            { l: "Top Strategy", v: stats.topStrategy, c: C.accent },
          ].map(m => (
            <div key={m.l} style={{
              background: C.surface, borderRadius: 16, border: `0.5px solid ${C.border}`,
              padding: "14px 18px",
            }}>
              <div style={{ fontSize: 10, color: C.textTertiary, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.02em", textTransform: "uppercase", fontWeight: 500 }}>{m.l}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: m.c, fontFamily: "'Inter', -apple-system, sans-serif", marginTop: 4, letterSpacing: "-0.01em" }}>{m.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* -- Form -- */}
      {showForm && (
        <div style={{ marginBottom: 24 }}>
          <JournalEntryForm
            entry={editEntry}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditEntry(null); }}
          />
        </div>
      )}

      {/* -- Filters -- */}
      <div style={{
        display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center",
      }}>
        <input
          type="text" placeholder="Search entries..." value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{
            padding: "8px 16px", background: C.surfaceRaised, border: `0.5px solid ${C.border}`,
            borderRadius: 980, color: C.text, fontSize: 13, fontFamily: "'Inter', -apple-system, sans-serif",
            outline: "none", width: 220, fontWeight: 400,
          }}
        />
        <select value={filterStrategy} onChange={e => setFilterStrategy(e.target.value)} style={selectStyle}>
          <option value="">All Strategies</option>
          {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterEmotion} onChange={e => setFilterEmotion(e.target.value)} style={selectStyle}>
          <option value="">All Emotions</option>
          {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: "'Inter', -apple-system, sans-serif", marginLeft: "auto", fontWeight: 400 }}>
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* -- Entries -- */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "clamp(32px, 6vw, 64px) 20px", color: C.textTertiary,
          background: C.surface, borderRadius: 20, border: `0.5px solid ${C.border}`,
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 16 }}>
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 500, color: C.textSecondary }}>
            {entries.length === 0 ? "No journal entries yet" : "No entries match your filters"}
          </div>
          <div style={{ fontSize: 13, marginTop: 8, fontWeight: 400 }}>
            {entries.length === 0 ? "Click \"+ New Entry\" to record your first trade journal entry." : "Try adjusting your search or filter criteria."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(entry => (
            <JournalCard key={entry.id} entry={entry} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
