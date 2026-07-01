import React from "react";

interface BrandHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function BrandHeader({ isDarkMode, onToggleDarkMode }: BrandHeaderProps) {
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
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "20px" }}>🚀</span>
        <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>Ligtas-Larga</span>
      </div>
      <button
        onClick={onToggleDarkMode}
        className="btn-interactive"
        style={{
          padding: "6px 12px",
          borderRadius: "20px",
          border: "1.5px solid var(--border-subtle)",
          backgroundColor: "var(--bg-app-left)",
          color: "var(--text-primary)",
          fontWeight: 700,
          fontSize: "11px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
        }}
      >
        <span>{isDarkMode ? "☀️ Light" : "🌙 Dark"}</span>
      </button>
    </div>
  );
}
