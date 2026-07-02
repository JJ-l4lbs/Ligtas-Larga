"use client";

import React, { useState } from "react";
import ImmediateActionCard from "./ImmediateActionCard";

interface RouteStep {
  instruction: string;
  distance: string;
  maneuver?: string;
  warnings?: string[];
  surfaceInfo?: string;
  startLocation: google.maps.LatLngLiteral;
}

interface ActiveRoutePanelProps {
  routeInfo: { distance?: string; duration?: string };
  isVoiceActive: boolean;
  setIsVoiceActive: (active: boolean) => void;
  fromAddress: string;
  toAddress: string;
  isEditingAddresses: boolean;
  setIsEditingAddresses: (editing: boolean) => void;
  tempFromAddress: string;
  setTempFromAddress: (addr: string) => void;
  tempToAddress: string;
  setTempToAddress: (addr: string) => void;
  isGeocoding: boolean;
  handleSaveEditedAddresses: () => void;
  isWheelchairEnabled: boolean;
  setIsWheelchairEnabled: (enabled: boolean) => void;
  isShadedEnabled: boolean;
  setIsShadedEnabled: (enabled: boolean) => void;
  isRainEnabled: boolean;
  setIsRainEnabled: (enabled: boolean) => void;
  routeSteps: RouteStep[];
  activeStepIndex: number;
  setActiveStepIndex: (idx: number) => void;
  mapInstance: google.maps.Map | null;
  handleReset: () => void;
  
  // New props for saving routes
  user: { email: string; role: string } | null;
  fromCoords: google.maps.LatLngLiteral | null;
  toCoords: google.maps.LatLngLiteral | null;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export default function ActiveRoutePanel({
  routeInfo,
  isVoiceActive,
  setIsVoiceActive,
  fromAddress,
  toAddress,
  isEditingAddresses,
  setIsEditingAddresses,
  tempFromAddress,
  setTempFromAddress,
  tempToAddress,
  setTempToAddress,
  isGeocoding,
  handleSaveEditedAddresses,
  isWheelchairEnabled,
  setIsWheelchairEnabled,
  isShadedEnabled,
  setIsShadedEnabled,
  isRainEnabled,
  setIsRainEnabled,
  routeSteps,
  activeStepIndex,
  setActiveStepIndex,
  mapInstance,
  handleReset,
  user,
  fromCoords,
  toCoords,
  showToast,
}: ActiveRoutePanelProps) {
  // Saved route state
  const [isSavingRoute, setIsSavingRoute] = useState(false);
  const [routeLabel, setRouteLabel] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveRoute = async () => {
    if (!routeLabel.trim() || !fromCoords || !toCoords) return;
    try {
      const mode = [
        isWheelchairEnabled ? "wheelchair" : "",
        isShadedEnabled ? "shaded" : "",
        isRainEnabled ? "rain" : "",
      ].filter(Boolean).join(",") || "standard";

      const res = await fetch("/api/saved-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: routeLabel,
          fromAddress,
          toAddress,
          fromLatitude: fromCoords.lat,
          fromLongitude: fromCoords.lng,
          toLatitude: toCoords.lat,
          toLongitude: toCoords.lng,
          travelMode: mode,
        }),
      });

      if (res.ok) {
        showToast(`Route "${routeLabel}" successfully saved!`, "success");
        setSaveSuccess(true);
        setRouteLabel("");
        setIsSavingRoute(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errData = await res.json();
        showToast(errData.error || "Failed to save route.", "error");
      }
    } catch (e: any) {
      console.error("Failed to save route:", e);
      showToast(`Error saving route: ${e.message}`, "error");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "24px",
        height: "100%",
        backgroundColor: "var(--bg-primary)",
        pointerEvents: "auto",
      }}
    >
      {/* High-Contrast Route Header */}
      <div className="nav-header-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              {routeInfo.duration || "Calculating..."}
            </span>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", marginLeft: "8px" }}>
              ({routeInfo.distance || ""})
            </span>
          </div>
        </div>

        {/* Action Row: Voice & Save Route */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
          <button
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className="btn-interactive"
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: isVoiceActive ? "rgba(30, 81, 63, 0.1)" : "rgba(0, 0, 0, 0.05)",
              color: isVoiceActive ? "var(--accent-accessibility)" : "var(--text-primary)",
              fontWeight: 700,
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <span>{isVoiceActive ? "🔊 Voice On" : "🔇 Voice Off"}</span>
          </button>

          {user && (
            <button
              onClick={() => setIsSavingRoute(!isSavingRoute)}
              className="btn-interactive"
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: saveSuccess ? "#DCFCE7" : "rgba(30, 144, 255, 0.1)",
                color: saveSuccess ? "#15803D" : "var(--accent-rain)",
                fontWeight: 700,
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>{saveSuccess ? "✓ Saved!" : "⭐ Save Route"}</span>
            </button>
          )}
        </div>

        {/* Naming Input Widget for Saving Route */}
        {isSavingRoute && (
          <div style={{ display: "flex", gap: "6px", alignItems: "center", backgroundColor: "var(--bg-app-left)", padding: "10px", borderRadius: "10px", border: "1.5px solid var(--border-subtle)" }}>
            <input
              type="text"
              placeholder="e.g. My Commute"
              value={routeLabel}
              onChange={(e) => setRouteLabel(e.target.value)}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1.5px solid var(--border-subtle)",
                fontSize: "11px",
                backgroundColor: "var(--bg-input-light)",
                color: "var(--text-input-typed)",
                outline: "none",
              }}
            />
            <button
              onClick={handleSaveRoute}
              style={{
                padding: "6px 10px",
                backgroundColor: "var(--accent-accessibility)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={() => setIsSavingRoute(false)}
              style={{
                padding: "6px 10px",
                backgroundColor: "rgba(0,0,0,0.05)",
                color: "var(--text-secondary)",
                border: "none",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Start & Destination Addresses Info (Emphasized Inset block) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            backgroundColor: "var(--bg-app-left)",
            border: "1.5px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "14px 16px",
            margin: "6px 0",
          }}
        >
          {!isEditingAddresses ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                  ACTIVE ROUTE
                </span>
                <button
                  onClick={() => {
                    setTempFromAddress(fromAddress);
                    setTempToAddress(toAddress);
                    setIsEditingAddresses(true);
                  }}
                  className="btn-interactive"
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--accent-accessibility)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "2px 6px",
                  }}
                >
                  ✏️ Edit
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#2ECC71", flexShrink: 0 }} />
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
                  <strong style={{ color: "var(--text-primary)" }}>From: </strong>{fromAddress || "PUP Manila"}
                </div>
              </div>
              
              {/* Visual Connector Line */}
              <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", marginLeft: "18px" }} />

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#E74C3C", flexShrink: 0 }} />
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
                  <strong style={{ color: "var(--text-primary)" }}>To: </strong>{toAddress || "Master Buffalo"}
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#2ECC71", flexShrink: 0 }} />
                <input
                  type="text"
                  value={tempFromAddress}
                  onChange={(e) => setTempFromAddress(e.target.value)}
                  placeholder="Starting address"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#E74C3C", flexShrink: 0 }} />
                <input
                  type="text"
                  value={tempToAddress}
                  onChange={(e) => setTempToAddress(e.target.value)}
                  placeholder="Destination address"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
              </div>
              
              {/* Action buttons row */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
                <button
                  disabled={isGeocoding}
                  onClick={() => setIsEditingAddresses(false)}
                  className="btn-interactive"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1.5px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={isGeocoding || !tempFromAddress.trim() || !tempToAddress.trim()}
                  onClick={handleSaveEditedAddresses}
                  className="btn-interactive"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "var(--accent-accessibility)",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {isGeocoding ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Balanced, equally-sized travel mode toggles */}
        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
          <button
            onClick={() => setIsWheelchairEnabled(!isWheelchairEnabled)}
            className={`btn-interactive badge-pill ${isWheelchairEnabled ? 'active-wheelchair' : ''}`}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid var(--border-subtle)",
              backgroundColor: isWheelchairEnabled ? "var(--badge-accessible-bg)" : "var(--bg-app-left)",
              color: isWheelchairEnabled ? "var(--badge-accessible-text)" : "var(--text-secondary)",
              fontSize: "11px",
              fontWeight: 700,
              padding: "10px 4px",
              borderRadius: "10px",
              whiteSpace: "nowrap",
            }}
          >
            ♿ {isWheelchairEnabled ? "Accessible" : "Standard"}
          </button>
          <button
            onClick={() => setIsShadedEnabled(!isShadedEnabled)}
            className={`btn-interactive badge-pill ${isShadedEnabled ? 'active-shaded' : ''}`}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid var(--border-subtle)",
              backgroundColor: isShadedEnabled ? "var(--badge-shaded-bg)" : "var(--bg-app-left)",
              color: isShadedEnabled ? "var(--badge-shaded-text)" : "var(--text-secondary)",
              fontSize: "11px",
              fontWeight: 700,
              padding: "10px 4px",
              borderRadius: "10px",
              whiteSpace: "nowrap",
            }}
          >
            ☀️ Shaded
          </button>
          <button
            onClick={() => setIsRainEnabled(!isRainEnabled)}
            className={`btn-interactive badge-pill ${isRainEnabled ? 'active-rain' : ''}`}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid var(--border-subtle)",
              backgroundColor: isRainEnabled ? "var(--badge-flood-bg)" : "var(--bg-app-left)",
              color: isRainEnabled ? "var(--badge-flood-text)" : "var(--text-secondary)",
              fontSize: "11px",
              fontWeight: 700,
              padding: "10px 4px",
              borderRadius: "10px",
              whiteSpace: "nowrap",
            }}
          >
            🌧️ Flood-Free
          </button>
        </div>
      </div>

      {/* Immediate Next Turn Card with interactive pagination */}
      {routeSteps.length > 0 && routeSteps[activeStepIndex] && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px 0",
          }}
        >
          <ImmediateActionCard
            routeSteps={routeSteps}
            activeStepIndex={activeStepIndex}
            onStepChange={setActiveStepIndex}
            mapInstance={mapInstance}
          />
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={handleReset}
        className="btn-interactive"
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid var(--border-glass)",
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-primary)",
          fontWeight: 600,
          fontSize: "13px",
          cursor: "pointer",
          boxShadow: "var(--shadow-glass)",
        }}
      >
        ◄ Back to Route Planning
      </button>
    </div>
  );
}
