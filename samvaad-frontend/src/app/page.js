import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Navbar */}
      <nav style={{
        height: "62px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "32px", height: "32px",
            background: "var(--saffron)",
            borderRadius: "9px",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <i className="bi bi-chat-dots-fill" style={{ color: "#fff", fontSize: "15px" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
            Sam<span style={{ color: "var(--saffron)" }}>vaad</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/auth/login" style={{
            padding: "7px 14px", fontSize: "13px", fontWeight: 500,
            color: "var(--text-primary)", textDecoration: "none",
            border: "1px solid var(--border-2)", borderRadius: "8px",
          }}>Sign in</Link>
          <Link href="/auth/register" className="btn-saffron" style={{ textDecoration: "none", padding: "7px 14px", fontSize: "13px" }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: "60px 20px 48px",
        textAlign: "center",
        maxWidth: "700px",
        margin: "0 auto",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "var(--saffron-subtle)", border: "1px solid var(--saffron-border)",
          borderRadius: "20px", padding: "5px 14px",
          fontSize: "11px", fontWeight: 600, color: "var(--saffron)",
          marginBottom: "24px",
        }}>
          <span style={{
            width: "6px", height: "6px", background: "var(--saffron)",
            borderRadius: "50%", display: "inline-block",
          }}></span>
          Now in Beta · Free forever
        </div>

        <h1 style={{
          fontSize: "clamp(32px, 8vw, 52px)",
          fontWeight: 900,
          letterSpacing: "-1.5px",
          lineHeight: 1.1,
          color: "var(--text-primary)",
          marginBottom: "16px",
        }}>
          Conversations that{" "}
          <span style={{ color: "var(--saffron)" }}>truly connect.</span>
        </h1>

        <p style={{
          fontSize: "clamp(14px, 4vw, 18px)",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          marginBottom: "36px",
          padding: "0 10px",
        }}>
          Samvaad brings the warmth of Indian dialogue to crystal-clear video meetings.
        </p>

        <div style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap",
          padding: "0 10px",
        }}>
          <Link href="/auth/register" className="btn-saffron" style={{
            textDecoration: "none",
            padding: "13px 28px",
            fontSize: "15px",
            flex: "1",
            maxWidth: "200px",
            justifyContent: "center",
          }}>
            Start a Samvaad
          </Link>
          <Link href="/auth/login" className="btn-outline" style={{
            textDecoration: "none",
            padding: "13px 28px",
            fontSize: "15px",
            flex: "1",
            maxWidth: "200px",
            textAlign: "center",
          }}>
            Join with code
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "14px",
        padding: "0 20px 60px",
        maxWidth: "900px",
        margin: "0 auto",
      }}>
        {[
          { icon: "bi-camera-video", title: "HD video calls", desc: "Crystal clear quality, adaptive to any network speed." },
          { icon: "bi-chat-text", title: "Live chat", desc: "Messages and reactions without leaving the call." },
          { icon: "bi-display", title: "Screen sharing", desc: "Share any window or your full screen instantly." },
        ].map((f) => (
          <div key={f.title} className="card" style={{ padding: "22px" }}>
            <div style={{
              width: "40px", height: "40px",
              background: "var(--saffron-subtle)",
              border: "1px solid var(--saffron-border)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "14px",
            }}>
              <i className={`bi ${f.icon}`} style={{ color: "var(--saffron)", fontSize: "18px" }}></i>
            </div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              {f.title}
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </section>

    </main>
  );
}