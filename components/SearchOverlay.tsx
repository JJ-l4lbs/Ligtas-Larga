"use client";

import React from "react";

interface SearchOverlayProps {
  fromAddress: string;
  toAddress: string;
  onReset: () => void;
}

export default function SearchOverlay({ fromAddress, toAddress, onReset }: SearchOverlayProps) {
  const truncate = (str: string) => {
    return str.length > 25 ? str.substring(0, 22) + "..." : str;
  };

  return (
    <div
      className="glass-panel"
      style={{
        position: "absolute",
        top: "40px",
        left: "5%",
        right: "5%",
        zIndex: 100,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        pointerEvents: "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <span style={{ color: "var(--accent-accessibility)" }}>🟢</span>
          <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{truncate(fromAddress)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <span style={{ color: "var(--severity-high)" }}>📍</span>
          <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{truncate(toAddress)}</span>
        </div>
      </div>

      <button
        onClick={onReset}
        className="btn-interactive"
        style={{
          padding: "8px 12px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Change
      </button>
    </div>
  );
}
