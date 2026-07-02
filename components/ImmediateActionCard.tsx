/// <reference types="google.maps" />
import React from "react";

interface RouteStep {
  instruction: string;
  distance: string;
  maneuver?: string;
  warnings?: string[];
  surfaceInfo?: string;
  startLocation: google.maps.LatLngLiteral;
  fareInfo?: {
    fare: number;
    discountedFare: number;
    type: "train" | "bus" | "jeepney" | "walk";
    warning?: string;
  };
  transitDetails?: any;
}

interface ImmediateActionCardProps {
  routeSteps: RouteStep[];
  activeStepIndex: number;
  onStepChange: (index: number) => void;
  mapInstance: google.maps.Map | null;
  isDiscounted?: boolean;
}

export default function ImmediateActionCard({
  routeSteps,
  activeStepIndex,
  onStepChange,
  mapInstance,
  isDiscounted = false,
}: ImmediateActionCardProps) {
  if (routeSteps.length === 0 || !routeSteps[activeStepIndex]) return null;

  const currentStep = routeSteps[activeStepIndex];
  const hasCommuteFare = currentStep.fareInfo && currentStep.fareInfo.fare > 0;

  const renderNavigationControls = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "12px" }}>
      <button
        disabled={activeStepIndex === 0}
        onClick={() => {
          const nextIdx = activeStepIndex - 1;
          onStepChange(nextIdx);
          mapInstance?.panTo(routeSteps[nextIdx].startLocation);
        }}
        className="btn-interactive"
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1.5px solid var(--border-subtle)",
          backgroundColor: "var(--bg-app-left)",
          color: activeStepIndex === 0 ? "var(--text-muted)" : "var(--text-primary)",
          fontSize: "12px",
          fontWeight: 700,
          cursor: activeStepIndex === 0 ? "not-allowed" : "pointer",
        }}
      >
        ◄ Prev
      </button>
      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
        Step {activeStepIndex + 1} of {routeSteps.length}
      </span>
      <button
        disabled={activeStepIndex === routeSteps.length - 1}
        onClick={() => {
          const nextIdx = activeStepIndex + 1;
          onStepChange(nextIdx);
          mapInstance?.panTo(routeSteps[nextIdx].startLocation);
        }}
        className="btn-interactive"
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1.5px solid var(--border-subtle)",
          backgroundColor: "var(--bg-app-left)",
          color: activeStepIndex === routeSteps.length - 1 ? "var(--text-muted)" : "var(--text-primary)",
          fontSize: "12px",
          fontWeight: 700,
          cursor: activeStepIndex === routeSteps.length - 1 ? "not-allowed" : "pointer",
        }}
      >
        Next ►
      </button>
    </div>
  );

  // 1. Commute Turn-by-Turn Card (renders when commute segment has a fare)
  if (hasCommuteFare) {
    return (
      <div
        className="glass-panel"
        style={{
          width: "100%",
          padding: "24px",
          border: "2px solid var(--accent-accessibility)",
          boxShadow: "var(--shadow-glass)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          backgroundColor: "var(--bg-card)",
          borderRadius: "16px",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", color: "var(--accent-accessibility)" }}>
            COMMUTE SEGMENT
          </span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
            Step {activeStepIndex + 1} of {routeSteps.length}
          </span>
        </div>
        
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              backgroundColor: "rgba(20, 184, 166, 0.12)",
              border: "1.5px solid rgba(20, 184, 166, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "var(--accent-accessibility)",
            }}
          >
            {(() => {
              if (currentStep.fareInfo?.type === "train") return "🚆";
              if (currentStep.fareInfo?.type === "bus") return "🚌";
              if (currentStep.fareInfo?.type === "jeepney") return "🛺";
              return "🚌";
            })()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3 }}>
              {currentStep.instruction}
            </div>
            {currentStep.transitDetails && (
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", fontWeight: 600 }}>
                Line: {currentStep.transitDetails.transitLine?.name || currentStep.transitDetails.transitLine?.shortName || "Transit Line"} 
                {currentStep.transitDetails.stopCount ? ` • ${currentStep.transitDetails.stopCount} stops` : ""}
              </div>
            )}
            {currentStep.transitDetails?.stopDetails?.departureStop?.name && currentStep.transitDetails?.stopDetails?.arrivalStop?.name && (
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", flexDirection: "column", gap: "2px", borderLeft: "2px solid var(--accent-accessibility)", paddingLeft: "8px" }}>
                <div><strong>Board:</strong> {currentStep.transitDetails.stopDetails.departureStop.name}</div>
                <div><strong>Alight:</strong> {currentStep.transitDetails.stopDetails.arrivalStop.name}</div>
              </div>
            )}
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              In {currentStep.distance}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <span style={{ fontSize: "14px" }}>
              {currentStep.fareInfo?.type === "train" ? "🚆" : currentStep.fareInfo?.type === "bus" ? "🚌" : currentStep.fareInfo?.type === "jeepney" ? "🛺" : "🚶"}
            </span>
            <span>{currentStep.surfaceInfo}</span>
          </div>
          
          <div style={{ fontSize: "13px", color: "var(--accent-accessibility)", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
            <span style={{ fontSize: "14px" }}>💳</span>
            <span>
              Segment Fare: ₱{(isDiscounted ? currentStep.fareInfo!.discountedFare : currentStep.fareInfo!.fare).toFixed(2)}
              {currentStep.fareInfo?.warning ? " (Estimated)" : ""}
            </span>
          </div>

          {currentStep.fareInfo?.warning && (
            <div style={{ fontSize: "11px", color: "var(--severity-medium, #e6a23c)", fontStyle: "italic", marginLeft: "20px" }}>
              ⚠️ {currentStep.fareInfo.warning}
            </div>
          )}

          {currentStep.warnings && currentStep.warnings.map((w, wIdx) => (
            <div key={wIdx} className="warning-pill" style={{ marginTop: "4px", alignSelf: "flex-start" }}>
              {w}
            </div>
          ))}
        </div>

        {renderNavigationControls()}
      </div>
    );
  }

  // 2. Generic Turn-by-Turn Card (renders when step doesn't have a commute segment fare)
  return (
    <div
      className="glass-panel"
      style={{
        width: "100%",
        padding: "24px",
        border: "1.5px solid var(--border-subtle)",
        boxShadow: "var(--shadow-glass)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backgroundColor: "var(--bg-card)",
        borderRadius: "16px",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", color: "var(--text-muted)" }}>
          IMMEDIATE ACTION
        </span>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
          Step {activeStepIndex + 1} of {routeSteps.length}
        </span>
      </div>
      
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "12px",
            backgroundColor: "#EDF2FF",
            border: "1.5px solid rgba(30, 144, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            color: "var(--text-secondary)",
          }}
        >
          {(() => {
            let arrow = "➜";
            if (currentStep.maneuver?.includes("LEFT")) arrow = "◄";
            if (currentStep.maneuver?.includes("RIGHT")) arrow = "►";
            if (currentStep.maneuver?.includes("UTURN")) arrow = "⟲";
            return arrow;
          })()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {currentStep.instruction}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            In {currentStep.distance}
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
          <span style={{ fontSize: "14px" }}>🚶</span>
          <span>{currentStep.surfaceInfo}</span>
        </div>

        {currentStep.warnings && currentStep.warnings.map((w, wIdx) => (
          <div key={wIdx} className="warning-pill" style={{ marginTop: "4px", alignSelf: "flex-start" }}>
            {w}
          </div>
        ))}
      </div>

      {renderNavigationControls()}
    </div>
  );
}
