"use client";

import React from "react";

interface ProfileDrawerProps {
  isWheelchairEnabled: boolean;
  isShadedEnabled: boolean;
  isRainEnabled: boolean;
  onToggleWheelchair: () => void;
  onToggleShaded: () => void;
  onToggleRain: () => void;
  onReportTrigger: () => void;
  avoidedCount: number;
  routeInfo?: {
    distance?: string;
    duration?: string;
  };
}

export default function ProfileDrawer({
  isWheelchairEnabled,
  isShadedEnabled,
  isRainEnabled,
  onToggleWheelchair,
  onToggleShaded,
  onToggleRain,
  onReportTrigger,
  avoidedCount,
  routeInfo,
}: ProfileDrawerProps) {
  return (
    <div
      style={{
        padding: "12px 24px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        backgroundColor: "var(--bg-primary)",
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

      {/* Profile Section (Core Profile) */}
      <div
        onClick={onToggleWheelchair}
        className={`btn-interactive ${isWheelchairEnabled ? "active-wheelchair" : ""}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          borderRadius: "12px",
          border: "1.5px solid var(--border-subtle)",
          backgroundColor: "var(--bg-input-light)",
          color: "var(--text-primary)",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "22px" }}>♿</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700 }}>Wheelchair Accessibility Mode</span>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Enforce accessible paths & elevators</span>
          </div>
        </div>
        <div
          style={{
            width: "36px",
            height: "20px",
            borderRadius: "10px",
            backgroundColor: isWheelchairEnabled ? "var(--accent-accessibility)" : "rgba(0, 0, 0, 0.1)",
            position: "relative",
            transition: "background-color 0.2s",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              position: "absolute",
              top: "3px",
              left: isWheelchairEnabled ? "19px" : "3px",
              transition: "left 0.2s",
            }}
          />
        </div>
      </div>

      {/* Environmental Modifiers (Secondary Chips) */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onToggleShaded}
          className={`btn-interactive ${isShadedEnabled ? "active-shaded" : ""}`}
          style={{
            flex: 1,
            padding: "12px 10px",
            border: "1.5px solid var(--border-subtle)",
            borderRadius: "12px",
            backgroundColor: "var(--bg-input-light)",
            color: isShadedEnabled ? "var(--accent-shade)" : "var(--text-secondary)",
            fontWeight: 600,
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <span>🎒</span>
          <span>Shaded/Covered</span>
        </button>

        <button
          onClick={onToggleRain}
          className={`btn-interactive ${isRainEnabled ? "active-rain" : ""}`}
          style={{
            flex: 1,
            padding: "12px 10px",
            border: "1.5px solid var(--border-subtle)",
            borderRadius: "12px",
            backgroundColor: "var(--bg-input-light)",
            color: isRainEnabled ? "var(--accent-rain)" : "var(--text-secondary)",
            fontWeight: 600,
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
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
          border: "1.5px dashed var(--severity-high)",
          backgroundColor: "#FFE4E6",
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
