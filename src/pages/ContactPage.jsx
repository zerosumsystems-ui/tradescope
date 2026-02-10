import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // mailto fallback — opens user's email client
    const subject = encodeURIComponent(`Contact from ${form.name}`);
    const body = encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`);
    window.location.href = `mailto:support@aiedge.trade?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#000", color: "#f5f5f7",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "80px 24px 60px",
    }}>
      {/* Back to home */}
      <a href="/" style={{
        position: "absolute", top: 24, left: 24,
        fontSize: 14, color: "#2997ff", textDecoration: "none",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Home
      </a>

      <div style={{ maxWidth: 480, width: "100%" }}>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700,
          letterSpacing: "-0.03em", marginBottom: 8, textAlign: "center",
        }}>Contact Us</h1>
        <p style={{
          fontSize: 15, color: "#86868b", textAlign: "center",
          marginBottom: 40, lineHeight: 1.5,
        }}>
          Have a question or need help? We'd love to hear from you.
        </p>

        {sent ? (
          <div style={{
            background: "#111", borderRadius: 16,
            border: "0.5px solid rgba(255,255,255,0.06)",
            padding: 40, textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>&#10003;</div>
            <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Message ready</p>
            <p style={{ fontSize: 14, color: "#86868b" }}>
              Your email client should open with the message. If it didn't,
              email us directly at{" "}
              <a href="mailto:support@aiedge.trade" style={{ color: "#2997ff", textDecoration: "none" }}>
                support@aiedge.trade
              </a>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: "#86868b", display: "block", marginBottom: 6 }}>Name</label>
              <input
                type="text" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{
                  width: "100%", padding: "12px 16px", fontSize: 15,
                  background: "#111", color: "#f5f5f7", border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, outline: "none", fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#86868b", display: "block", marginBottom: 6 }}>Email</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{
                  width: "100%", padding: "12px 16px", fontSize: 15,
                  background: "#111", color: "#f5f5f7", border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, outline: "none", fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#86868b", display: "block", marginBottom: 6 }}>Message</label>
              <textarea
                required rows={5} value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{
                  width: "100%", padding: "12px 16px", fontSize: 15,
                  background: "#111", color: "#f5f5f7", border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, outline: "none", fontFamily: "inherit", resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button type="submit" style={{
              padding: "14px 24px", fontSize: 15, fontWeight: 600,
              background: "#2997ff", color: "#fff", border: "none",
              borderRadius: 980, cursor: "pointer", fontFamily: "inherit",
              marginTop: 8, transition: "opacity 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >Send Message</button>
          </form>
        )}

        <p style={{
          fontSize: 13, color: "#48484a", textAlign: "center",
          marginTop: 32, lineHeight: 1.5,
        }}>
          Or email us directly at{" "}
          <a href="mailto:support@aiedge.trade" style={{ color: "#2997ff", textDecoration: "none" }}>
            support@aiedge.trade
          </a>
        </p>
      </div>
    </div>
  );
}
