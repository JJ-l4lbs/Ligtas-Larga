"use client";

import React from "react";

export type TravelMode = "accessibility" | "student" | "rain";

interface ProfileDrawerProps {
  selectedMode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
  onReportTrigger: () => void;
  avoidedCount: number;
  routeInfo?: {
    distance?: string;
    duration?: string;
  };
}

export default function ProfileDrawer({
  selectedMode,
  onModeChange,
  onReportTrigger,
  avoidedCount,
  routeInfo,
}: ProfileDrawerProps) {
  return (
    <div
      className="glass-panel"
      style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        zIndex: 100,
        padding: "20px 20px 30px 20px",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        pointerEvents: "auto",
      }}
    >
      {/* Route Info Stats */}
      {routeInfo && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "20px", fontWeight: 700 }}>{routeInfo.duration || "Calculating..."}</span>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", marginLeft: "8px" }}>
              ({routeInfo.distance || ""})
            </span>
          </div>
          {avoidedCount > 0 ? (
            <div
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#10b981",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              🛡️ Bypassed {avoidedCount} {avoidedCount === 1 ? "hazard" : "hazards"}
            </div>
          ) : (
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              No hazard blockages detected
            </div>
          )}
        </div>
      )}

      {/* Tabs / Mode Selector */}
      <div style={{ display: "flex", borderRadius: "12px", backgroundColor: "rgba(11, 15, 25, 0.4)", padding: "4px" }}>
        <button
          onClick={() => onModeChange("accessibility")}
          className="btn-interactive"
          style={{
            flex: 1,
            padding: "12px 6px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: selectedMode === "accessibility" ? "var(--bg-secondary)" : "transparent",
            color: selectedMode === "accessibility" ? "var(--accent-accessibility)" : "var(--text-secondary)",
            fontWeight: 700,
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
          }}
        >
          <span>♿</span>
          <span>Wheelchair</span>
        </button>

        <button
          onClick={() => onModeChange("student")}
          className="btn-interactive"
          style={{
            flex: 1,
            padding: "12px 6px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: selectedMode === "student" ? "var(--bg-secondary)" : "transparent",
            color: selectedMode === "student" ? "var(--accent-shade)" : "var(--text-secondary)",
            fontWeight: 700,
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
          }}
        >
          <span>🎒</span>
          <span>Shaded/Covered</span>
        </button>

        <button
          onClick={() => onModeChange("rain")}
          className="btn-interactive"
          style={{
            flex: 1,
            padding: "12px 6px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: selectedMode === "rain" ? "var(--bg-secondary)" : "transparent",
            color: selectedMode === "rain" ? "var(--accent-rain)" : "var(--text-secondary)",
            fontWeight: 700,
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
          }}
        >
          <span>🌧️</span>
          <span>Flood Avoidance</span>
        </button>
      </div>

      {/* Action Trigger */}
      <button
        onClick={onReportTrigger}
        className="btn-interactive"
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          border: "1px dashed var(--border-glass)",
          backgroundColor: "rgba(239, 68, 68, 0.05)",
          color: "var(--severity-high)",
          fontWeight: 700,
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          cursor: "pointer",
        }}
      >
        <span>⚠️</span> Report Hazard at Current Position
      </button>
    </div>
  );
}
