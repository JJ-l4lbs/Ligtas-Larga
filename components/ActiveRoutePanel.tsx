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
  transitDetails?: {
    arrivalStop: string;
    departureStop: string;
    lineName: string;
    lineShortName: string;
    vehicleType: string;
    numStops: number;
  };
  fare?: number;
}

interface ActiveRoutePanelProps {
  routeInfo: { distance?: string; duration?: string; totalFare?: number; totalDiscountedFare?: number };
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

  activeMode: "walk" | "commute" | "bicycle" | "motorcycle" | "car";
  setActiveMode: (mode: "walk" | "commute" | "bicycle" | "motorcycle" | "car") => void;
  isDiscounted: boolean;
  setIsDiscounted: (val: boolean) => void;
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
  activeMode,
  setActiveMode,
  isDiscounted,
  setIsDiscounted,
}: ActiveRoutePanelProps) {
  // Saved route state
  const [isSavingRoute, setIsSavingRoute] = useState(false);
  const [routeLabel, setRouteLabel] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveRoute = async () => {
    if (!routeLabel.trim() || !fromCoords || !toCoords) return;
    try {
      const mode = activeMode !== "walk" ? activeMode : [
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
      {/* Travel Mode Selector Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "var(--bg-input-light)",
          borderRadius: "12px",
          padding: "4px",
          border: "1.5px solid var(--border-subtle)",
          margin: "0 0 4px 0",
        }}
      >
        {[
          { id: "walk", label: "Walk", icon: "🚶" },
          { id: "commute", label: "Commute", icon: "🚌" },
          { id: "bicycle", label: "Cycle", icon: "🚲" },
          { id: "motorcycle", label: "Moto", icon: "🏍️" },
          { id: "car", label: "Car", icon: "🚗" },
        ].map((mode) => {
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveMode(mode.id as any)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "8px 4px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isActive ? "var(--accent-accessibility)" : "transparent",
                color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: "16px" }}>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* High-Contrast Route Header */}
      <div className="nav-header-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px" }}>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              {routeInfo.duration || "Calculating..."}
            </span>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", marginLeft: "4px" }}>
              ({routeInfo.distance || ""})
            </span>
            {activeMode === "commute" && routeInfo.totalFare !== undefined && (
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "var(--accent-accessibility)",
                  marginLeft: "8px",
                  backgroundColor: "rgba(20, 184, 166, 0.12)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(20, 184, 166, 0.2)",
                  display: "inline-flex",
                  alignItems: "center"
                }}
              >
                ₱{(isDiscounted ? routeInfo.totalDiscountedFare : routeInfo.totalFare)?.toFixed(2)}
              </span>
            )}
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

        {activeMode === "commute" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              backgroundColor: "var(--bg-input-light)",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              marginTop: "4px"
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
              🎓 Student / PWD / Senior Discount
            </span>
            <input
              type="checkbox"
              checked={isDiscounted}
              onChange={(e) => setIsDiscounted(e.target.checked)}
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer",
                accentColor: "var(--accent-accessibility)",
              }}
            />
          </div>
        )}
      </div>

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

      {/* Dynamicbottom toggles card based on activeMode */}
      {(() => {
        const showAccessible = activeMode === "walk" || activeMode === "commute";
        const showShaded = activeMode === "walk";
        const showRain = true;

        return (
          <div className="nav-header-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Balanced, equally-sized travel mode toggles */}
            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
              {showAccessible && (
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
              )}
              {showShaded && (
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
              )}
              {showRain && (
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
              )}
            </div>
          </div>
        );
      })()}

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
            isDiscounted={isDiscounted}
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
