"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  const createMeeting = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: "My Samvaad" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      router.push(`/room/${data.data.room.roomId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const joinMeeting = () => {
    if (!joinCode.trim()) return;
    router.push(`/room/${joinCode.trim()}`);
  };

  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  if (!user) return null;

  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Navbar */}
      <nav style={{
        height: "62px", background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 32px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", background: "var(--saffron)",
            borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="bi bi-chat-dots-fill" style={{ color: "#fff", fontSize: "15px" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
            Sam<span style={{ color: "var(--saffron)" }}>vaad</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {user.name}
          </span>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%",
            background: "var(--saffron)", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700, color: "#fff", cursor: "pointer",
          }}>
            {initials}
          </div>
          <button onClick={logout} style={{
            background: "transparent", border: "1px solid var(--border-2)",
            borderRadius: "8px", padding: "6px 14px",
            fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer",
          }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Greeting */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
            Namaste, {user.name.split(" ")[0]} 🙏
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "32px" }}>

          {/* New meeting */}
          <div onClick={createMeeting} style={{
            background: "var(--saffron)", borderRadius: "14px",
            padding: "22px", cursor: "pointer", transition: "all 0.18s",
          }}>
            <div style={{
              width: "36px", height: "36px", background: "rgba(255,255,255,0.2)",
              borderRadius: "9px", display: "flex", alignItems: "center",
              justifyContent: "center", marginBottom: "12px",
            }}>
              <i className="bi bi-camera-video-fill" style={{ color: "#fff", fontSize: "16px" }}></i>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>New Samvaad</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "3px" }}>Start instantly</div>
          </div>

          {/* Join meeting */}
          <div className="card" style={{ padding: "22px" }}>
            <div style={{
              width: "36px", height: "36px", background: "var(--saffron-subtle)",
              borderRadius: "9px", display: "flex", alignItems: "center",
              justifyContent: "center", marginBottom: "12px",
            }}>
              <i className="bi bi-box-arrow-in-right" style={{ color: "var(--saffron)", fontSize: "16px" }}></i>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>Join meeting</div>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
                placeholder="Enter code..."
                style={{
                  flex: 1, padding: "7px 10px",
                  background: "var(--bg)", border: "1px solid var(--border-2)",
                  borderRadius: "7px", fontSize: "12px", color: "var(--text-primary)",
                  outline: "none",
                }}
              />
              <button onClick={joinMeeting} style={{
                background: "var(--saffron)", border: "none", borderRadius: "7px",
                padding: "7px 12px", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 600,
              }}>Join</button>
            </div>
          </div>

          {/* Schedule */}
          <div className="card" style={{ padding: "22px" }}>
            <div style={{
              width: "36px", height: "36px", background: "var(--saffron-subtle)",
              borderRadius: "9px", display: "flex", alignItems: "center",
              justifyContent: "center", marginBottom: "12px",
            }}>
              <i className="bi bi-calendar3" style={{ color: "var(--saffron)", fontSize: "16px" }}></i>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Schedule</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "3px" }}>Coming soon</div>
          </div>

        </div>

        {/* Recent meetings placeholder */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "14px" }}>
            Recent Samvaads
          </div>
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <i className="bi bi-camera-video" style={{ fontSize: "32px", color: "var(--text-muted)", display: "block", marginBottom: "12px" }}></i>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
              No meetings yet — start your first Samvaad!
            </p>
            <button onClick={createMeeting} className="btn-saffron" style={{ marginTop: "16px" }}>
              Start now
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}