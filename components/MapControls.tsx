/// <reference types="google.maps" />
import React from "react";

interface MapControlsProps {
  mapInstance: google.maps.Map | null;
  fromCoords: google.maps.LatLngLiteral | null;
  defaultCenter: google.maps.LatLngLiteral;
  showAllPins: boolean;
  setShowAllPins: (show: boolean) => void;
  isAdmin: boolean;
  isAdminPinning: boolean;
  setIsAdminPinning: (pinning: boolean) => void;
}

export default function MapControls({
  mapInstance,
  fromCoords,
  defaultCenter,
  showAllPins,
  setShowAllPins,
  isAdmin,
  isAdminPinning,
  setIsAdminPinning,
}: MapControlsProps) {
  if (!mapInstance) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: "20px",
        top: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        zIndex: 100,
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={() => mapInstance.setZoom((mapInstance.getZoom() || 13) + 1)}
        className="floating-control-btn btn-interactive"
        title="Zoom In"
      >
        +
      </button>
      <button
        onClick={() => mapInstance.setZoom((mapInstance.getZoom() || 13) - 1)}
        className="floating-control-btn btn-interactive"
        title="Zoom Out"
      >
        -
      </button>
      <button
        onClick={() => {
          mapInstance.panTo(fromCoords || defaultCenter);
          mapInstance.setZoom(15);
        }}
        className="floating-control-btn btn-interactive"
        title="Recenter Map"
      >
        🎯
      </button>
      <button
        onClick={() => setShowAllPins(!showAllPins)}
        className="floating-control-btn btn-interactive"
        style={{
          border: showAllPins ? "1.5px solid var(--accent-accessibility)" : "1px solid var(--border-glass)",
          backgroundColor: showAllPins ? "var(--badge-accessible-bg)" : "var(--bg-secondary)",
          color: showAllPins ? "var(--accent-accessibility)" : "var(--text-primary)",
        }}
        title={showAllPins ? "Hide Map Icons/POIs" : "Show Map Icons/POIs"}
      >
        📍
      </button>
      {isAdmin && (
        <button
          onClick={() => setIsAdminPinning(!isAdminPinning)}
          className="floating-control-btn btn-interactive"
          style={{
            border: isAdminPinning ? "1.5px solid #EF4444" : "1px solid var(--border-glass)",
            backgroundColor: isAdminPinning ? "rgba(239, 68, 68, 0.2)" : "var(--bg-secondary)",
            color: isAdminPinning ? "#EF4444" : "var(--text-primary)",
          }}
          title={isAdminPinning ? "Exit Direct Pinning Mode" : "Enable Direct Pinning Mode"}
        >
          {isAdminPinning ? "✕" : "🔨"}
        </button>
      )}
    </div>
  );
}
