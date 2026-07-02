"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          if (data.user.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (isLogin) {
        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError("Account created successfully! Logging in...");
        // Auto-login after signup
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          if (loginData.user.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        } else {
          setIsLogin(true);
          setError("Account created! Please sign in now.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="splash-liquid-bg"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        padding: "20px",
        overflow: "hidden",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          color: "#0F172A",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
            Ligtas-Larga
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            {isLogin ? "Sign in to access secure dashboard" : "Create an account to start reporting"}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: error.includes("successfully") ? "#DCFCE7" : "#FFE4E6",
              color: error.includes("successfully") ? "#15803D" : "#9F1239",
              fontSize: "13px",
              fontWeight: 600,
              border: `1.5px solid ${error.includes("successfully") ? "rgba(21,128,61,0.2)" : "rgba(159,18,57,0.2)"}`,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="email" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="e.g. admin@ligtas.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1.5px solid var(--border-subtle)",
                fontSize: "15px",
                outline: "none",
                color: "var(--text-input-typed)",
                backgroundColor: "var(--bg-input-light)",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="password" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1.5px solid var(--border-subtle)",
                fontSize: "15px",
                outline: "none",
                color: "var(--text-input-typed)",
                backgroundColor: "var(--bg-input-light)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-interactive"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "var(--text-primary)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
              marginTop: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
                style={{ color: "var(--text-primary)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                style={{ color: "var(--text-primary)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                Sign In
              </span>
            </>
          )}
        </div>

        <div style={{ textAlign: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
          <Link href="/" style={{ fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600 }}>
            ← Back to Map (Browse Anonymous)
          </Link>
        </div>
      </div>
    </div>
  );
}
