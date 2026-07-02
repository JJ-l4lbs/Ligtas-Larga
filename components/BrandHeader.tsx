import React from "react";
import Link from "next/link";

interface BrandHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: { email: string; role: string } | null;
  onLogout: () => void;
  onToggleDashboard?: () => void;
}

export default function BrandHeader({
  isDarkMode,
  onToggleDarkMode,
  user,
  onLogout,
  onToggleDashboard,
}: BrandHeaderProps) {
  const getShortEmail = (email: string) => {
    if (email.length <= 15) return email;
    return email.substring(0, 12) + "...";
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1.5px solid var(--border-subtle)",
        backgroundColor: "var(--bg-card)",
        zIndex: 10,
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "20px" }}>🚀</span>
        <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>
          Ligtas-Larga
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* User Session Indicators & Action Button */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span
                style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)" }}
                title={user.email}
              >
                {getShortEmail(user.email)}
              </span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  color: user.role === "ADMIN" ? "#9F1239" : "#15803D",
                  backgroundColor: user.role === "ADMIN" ? "#FFE4E6" : "#DCFCE7",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                {user.role}
              </span>
            </div>

            {onToggleDashboard && (
              <button
                onClick={onToggleDashboard}
                className="btn-interactive"
                style={{
                  padding: "6px 10px",
                  borderRadius: "12px",
                  border: "1.5px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-app-left)",
                  color: "var(--text-on-app-left)",
                  fontWeight: 700,
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                👤 Me
              </button>
            )}

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="btn-interactive"
                style={{
                  padding: "6px 10px",
                  borderRadius: "12px",
                  border: "1.5px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-app-left)",
                  color: "var(--text-on-app-left)",
                  fontWeight: 700,
                  fontSize: "10px",
                  textDecoration: "none",
                }}
              >
                🛠️ Admin
              </Link>
            )}

            <button
              onClick={onLogout}
              className="btn-interactive"
              style={{
                padding: "6px 10px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#FFE4E6",
                color: "#9F1239",
                fontWeight: 700,
                fontSize: "10px",
                cursor: "pointer",
              }}
            >
              Out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="btn-interactive"
            style={{
              padding: "6px 12px",
              borderRadius: "12px",
              border: "1.5px solid var(--border-subtle)",
              backgroundColor: "var(--bg-app-left)",
              color: "var(--text-on-app-left)",
              fontWeight: 700,
              fontSize: "10px",
              textDecoration: "none",
            }}
          >
            🔑 Log In
          </Link>
        )}

        <button
          onClick={onToggleDarkMode}
          className="btn-interactive"
          style={{
            padding: "6px 12px",
            borderRadius: "20px",
            border: "1.5px solid var(--border-subtle)",
            backgroundColor: "var(--bg-app-left)",
            color: "var(--text-on-app-left)",
            fontWeight: 700,
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          <span>{isDarkMode ? "☀️" : "🌙"}</span>
        </button>
      </div>
    </div>
  );
}
