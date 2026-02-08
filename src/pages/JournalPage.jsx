import { useState, useEffect, useMemo } from "react";

const C = {
  bg: "#06090f", bgAlt: "#0b1018", surface: "#0f1520", surfaceRaised: "#151d2b",
  border: "#1a2438", borderLight: "#243352", text: "#dfe6f0", textDim: "#6b7d9a",
  textMuted: "#3d4f6a", accent: "#00e5c7", green: "#00e5a0", red: "#ff4d6a",
  yellow: "#ffc942", orange: "#ff8c42", purple: "#9b7dff", cyan: "#00c2ff", white: "#ffffff",
};

const EMOTIONS = ["Confident", "Fearful", "Greedy", "Patient", "Impulsive", "Disciplined", "Anxious", "Calm", "FOMO", "Revenge"];
const STRATEGIES = ["Breakout", "Mean Reversion", "Momentum", "Earnings Play", "Swing Trade", "Scalp", "Gap Fill", "Trend Follow", "Reversal", "Other"];

function EmotionTag({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
      fontFamily: "var(--mono)", cursor: "pointer", transition: "all 0.15s",
      border: `1px solid ${selected ? C.accent : C.border}`,
      background: selected ? `${C.accent}18` : "transparent",
      color: selected ? C.accent : C.textDim,
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
    width: "100%", padding: "10px 12px", background: C.bgAlt, border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "var(--mono)",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
  };
  const labelStyle = {
    fontSize: 10, color: C.textDim, fontFamily: "var(--mono)",
    letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6,
  };

  return (
    <div style={{
      background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`,
      padding: 24,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          {entry ? "Edit Entry" : "New Journal Entry"}
        </h3>
        <button onClick={onCancel} style={{
          background: "none", border: "none", color: C.textDim, cursor: "pointer",
          fontSize: 18, fontFamily: "var(--mono)",
        }}>x</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 18 }}>
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
          <div style={{ display: "flex", gap: 6 }}>
            {["LONG", "SHORT"].map(d => (
              <button key={d} onClick={() => update("direction", d)} style={{
                flex: 1, padding: "9px 0", borderRadius: 6, fontSize: 12, fontWeight: 600,
                fontFamily: "var(--mono)", cursor: "pointer", transition: "all 0.15s",
                border: `1px solid ${form.direction === d ? (d === "LONG" ? C.green : C.red) : C.border}`,
                background: form.direction === d ? `${d === "LONG" ? C.green : C.red}18` : "transparent",
                color: form.direction === d ? (d === "LONG" ? C.green : C.red) : C.textDim,
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
          <div style={{ display: "flex", gap: 4, paddingTop: 4 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => update("rating", n)} style={{
                width: 36, height: 36, borderRadius: 6, fontSize: 14, fontWeight: 700,
                fontFamily: "var(--mono)", cursor: "pointer", transition: "all 0.15s",
                border: `1px solid ${form.rating === n ? C.accent : C.border}`,
                background: form.rating === n ? `${C.accent}18` : "transparent",
                color: form.rating === n ? C.accent : C.textDim,
              }}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Emotions</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {EMOTIONS.map(e => (
            <EmotionTag key={e} label={e} selected={form.emotions.includes(e)} onClick={() => toggleEmotion(e)} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Pre-Trade Plan</label>
        <textarea value={form.preTrade} onChange={e => update("preTrade", e.target.value)}
          placeholder="What's the thesis? Entry criteria, target, stop loss..."
          rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--heading)", fontSize: 13 }} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Post-Trade Review</label>
        <textarea value={form.postTrade} onChange={e => update("postTrade", e.target.value)}
          placeholder="What happened? Did you follow your plan? What would you do differently?"
          rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--heading)", fontSize: 13 }} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Lessons Learned</label>
        <textarea value={form.lessons} onChange={e => update("lessons", e.target.value)}
          placeholder="Key takeaways from this trade..."
          rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--heading)", fontSize: 13 }} />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{
          padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`,
          background: "transparent", color: C.textDim, fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: "var(--heading)",
        }}>Cancel</button>
        <button onClick={() => onSave({ ...form, id: form.id || Date.now(), updatedAt: new Date().toISOString() })} style={{
          padding: "10px 24px", borderRadius: 8, border: "none",
          background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
          color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer",
          fontFamily: "var(--heading)",
        }}>Save Entry</button>
      </div>
    </div>
  );
}

function JournalCard({ entry, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const rVal = parseFloat(entry.rMultiple);
  const rColor = isNaN(rVal) ? C.textDim : rVal >= 0 ? C.green : C.red;

  return (
    <div style={{
      background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`,
      padding: "18px 20px", transition: "border-color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = C.borderLight}
    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            fontSize: 18, fontWeight: 800, color: C.accent, fontFamily: "var(--mono)",
            minWidth: 60,
          }}>{entry.symbol || "---"}</div>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.textDim, fontFamily: "var(--mono)" }}>{entry.date}</span>
              {entry.strategy && (
                <span style={{
                  fontSize: 9, fontWeight: 600, fontFamily: "var(--mono)",
                  padding: "2px 8px", borderRadius: 4,
                  background: `${C.purple}18`, color: C.purple,
                }}>{entry.strategy}</span>
              )}
              <span style={{
                fontSize: 9, fontWeight: 600, fontFamily: "var(--mono)",
                padding: "2px 8px", borderRadius: 4,
                background: entry.direction === "LONG" ? `${C.green}18` : `${C.red}18`,
                color: entry.direction === "LONG" ? C.green : C.red,
              }}>{entry.direction}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isNaN(rVal) && (
            <span style={{ fontSize: 16, fontWeight: 700, color: rColor, fontFamily: "var(--mono)" }}>
              {rVal >= 0 ? "+" : ""}{rVal.toFixed(2)}R
            </span>
          )}
          <div style={{ display: "flex", gap: 2 }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} style={{ fontSize: 10, color: n <= entry.rating ? C.yellow : C.textMuted }}>&#9733;</span>
            ))}
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"
            style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      </div>

      {entry.emotions.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: expanded ? 12 : 0 }}>
          {entry.emotions.map(e => (
            <span key={e} style={{
              fontSize: 9, fontWeight: 600, fontFamily: "var(--mono)",
              padding: "2px 7px", borderRadius: 10,
              background: `${C.accent}12`, color: C.accent,
            }}>{e}</span>
          ))}
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          {entry.preTrade && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textDim, fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Pre-Trade Plan</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, background: C.bgAlt, borderRadius: 8, padding: "10px 14px" }}>{entry.preTrade}</div>
            </div>
          )}
          {entry.postTrade && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textDim, fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Post-Trade Review</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, background: C.bgAlt, borderRadius: 8, padding: "10px 14px" }}>{entry.postTrade}</div>
            </div>
          )}
          {entry.lessons && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textDim, fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Lessons Learned</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, background: C.bgAlt, borderRadius: 8, padding: "10px 14px" }}>{entry.lessons}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }} style={{
              padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textDim, fontSize: 11,
              cursor: "pointer", fontFamily: "var(--mono)",
            }}>Edit</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} style={{
              padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.red}33`,
              background: "transparent", color: C.red, fontSize: 11,
              cursor: "pointer", fontFamily: "var(--mono)",
            }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JournalPage({ userId }) {
  const storageKey = `tradescope_journal_${userId || "local"}`;
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
    padding: "7px 10px", background: C.bgAlt, border: `1px solid ${C.border}`,
    borderRadius: 6, color: C.text, fontSize: 11, fontFamily: "var(--mono)",
    outline: "none", appearance: "auto",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 60px" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Trade Journal</h1>
          <p style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>Record your thoughts, emotions, and lessons for every trade</p>
        </div>
        <button onClick={() => { setEditEntry(null); setShowForm(true); }} style={{
          padding: "10px 20px", border: "none", borderRadius: 8,
          background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
          color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer",
          fontFamily: "var(--heading)",
        }}>+ New Entry</button>
      </div>

      {/* ── Stats Bar ── */}
      {stats && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 10, marginBottom: 20,
        }}>
          {[
            { l: "Entries", v: stats.total, c: C.accent },
            { l: "With Notes", v: stats.withNotes, c: C.cyan },
            { l: "Avg R", v: stats.avgR === "N/A" ? "N/A" : `${parseFloat(stats.avgR) >= 0 ? "+" : ""}${stats.avgR}R`, c: stats.avgR === "N/A" ? C.textDim : parseFloat(stats.avgR) >= 0 ? C.green : C.red },
            { l: "Avg Rating", v: `${stats.avgRating}/5`, c: C.yellow },
            { l: "Top Emotion", v: stats.topEmotion, c: C.purple },
            { l: "Top Strategy", v: stats.topStrategy, c: C.accent },
          ].map(m => (
            <div key={m.l} style={{
              background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
              padding: "10px 14px",
            }}>
              <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{m.l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: m.c, fontFamily: "var(--mono)", marginTop: 2 }}>{m.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Form ── */}
      {showForm && (
        <div style={{ marginBottom: 20 }}>
          <JournalEntryForm
            entry={editEntry}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditEntry(null); }}
          />
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center",
      }}>
        <input
          type="text" placeholder="Search entries..." value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{
            padding: "7px 12px", background: C.bgAlt, border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.text, fontSize: 12, fontFamily: "var(--mono)",
            outline: "none", width: 200,
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
        <span style={{ fontSize: 11, color: C.textDim, fontFamily: "var(--mono)", marginLeft: "auto" }}>
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* ── Entries ── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 24px", color: C.textMuted,
          background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`,
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 14 }}>
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.textDim }}>
            {entries.length === 0 ? "No journal entries yet" : "No entries match your filters"}
          </div>
          <div style={{ fontSize: 12, marginTop: 6 }}>
            {entries.length === 0 ? "Click \"+ New Entry\" to record your first trade journal entry." : "Try adjusting your search or filter criteria."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(entry => (
            <JournalCard key={entry.id} entry={entry} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
