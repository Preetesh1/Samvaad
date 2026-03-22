"use client";
import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "0 20px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "44px", height: "44px", background: "var(--saffron)",
            borderRadius: "12px", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 12px",
          }}>
            <i className="bi bi-chat-dots-fill" style={{ color: "#fff", fontSize: "20px" }}></i>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
            Sam<span style={{ color: "var(--saffron)" }}>vaad</span>
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Create your account
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "32px" }}>
          {error && (
            <div style={{
              background: "rgba(220,50,50,0.08)", border: "1px solid rgba(220,50,50,0.2)",
              borderRadius: "8px", padding: "10px 14px",
              fontSize: "13px", color: "#dc3545", marginBottom: "20px",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Arjun Sharma"
                required
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg)", border: "1px solid var(--border-2)",
                  borderRadius: "8px", fontSize: "14px", color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg)", border: "1px solid var(--border-2)",
                  borderRadius: "8px", fontSize: "14px", color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
                minLength={6}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg)", border: "1px solid var(--border-2)",
                  borderRadius: "8px", fontSize: "14px", color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-saffron"
              style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "14px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--saffron)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>

      </div>
    </main>
  );
}