import { useState } from "react";
import Logo from "../components/Logo";

const WEB3FORMS_KEY = "4f4d203e-a4a3-44a4-8d0e-2e47a424d620";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(""); // "", "sending", "sent", "error"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Contact from ${form.name} — AI Edge`,
          from_name: form.name,
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
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
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Logo size={48} />
        </div>
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

        {status === "sent" ? (
          <div style={{
            background: "#111", borderRadius: 16,
            border: "0.5px solid rgba(255,255,255,0.06)",
            padding: 40, textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12, color: "#34c759" }}>&#10003;</div>
            <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Message sent!</p>
            <p style={{ fontSize: 14, color: "#86868b" }}>
              We'll get back to you as soon as possible.
            </p>
            <button onClick={() => setStatus("")} style={{
              marginTop: 20, padding: "10px 20px", fontSize: 14, fontWeight: 500,
              background: "rgba(255,255,255,0.06)", color: "#a1a1a6", border: "none",
              borderRadius: 980, cursor: "pointer", fontFamily: "inherit",
            }}>Send another message</button>
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
            {status === "error" && (
              <p style={{ fontSize: 13, color: "#ff3b30" }}>Something went wrong. Please try again.</p>
            )}
            <button type="submit" disabled={status === "sending"} style={{
              padding: "14px 24px", fontSize: 15, fontWeight: 600,
              background: status === "sending" ? "#1a6ecc" : "#2997ff",
              color: "#fff", border: "none",
              borderRadius: 980, cursor: status === "sending" ? "default" : "pointer",
              fontFamily: "inherit", marginTop: 8, transition: "opacity 0.2s",
            }}
              onMouseEnter={e => { if (status !== "sending") e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >{status === "sending" ? "Sending..." : "Send Message"}</button>
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
