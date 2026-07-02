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
  userLocation: google.maps.LatLngLiteral | null;
  followUser: boolean;
  setFollowUser: (follow: boolean) => void;
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
  userLocation,
  followUser,
  setFollowUser,
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
          const target = userLocation || fromCoords || defaultCenter;
          mapInstance.panTo(target);
          mapInstance.setZoom(15);
          if (userLocation) {
            setFollowUser(true);
          }
        }}
        className="floating-control-btn btn-interactive"
        title="Recenter Map"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: (userLocation && followUser) ? "1.5px solid var(--accent-accessibility)" : "1px solid var(--border-glass)",
          backgroundColor: (userLocation && followUser) ? "var(--badge-accessible-bg)" : "var(--bg-secondary)",
          color: (userLocation && followUser) ? "var(--accent-accessibility)" : "var(--text-primary)",
        }}
      >
        <img 
          src="/current-loc.svg" 
          alt="Recenter" 
          style={{ 
            width: "16px", 
            height: "16px", 
            filter: (userLocation && followUser) ? "none" : "invert(var(--theme-icon-invert, 0))" 
          }} 
        />
      </button>
      <button
        onClick={() => setShowAllPins(!showAllPins)}
        className="floating-control-btn btn-interactive"
        style={{
          border: showAllPins ? "1.5px solid var(--accent-accessibility)" : "1px solid var(--border-glass)",
          backgroundColor: showAllPins ? "var(--badge-accessible-bg)" : "var(--bg-secondary)",
          color: showAllPins ? "var(--accent-accessibility)" : "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title={showAllPins ? "Hide Map Icons/POIs" : "Show Map Icons/POIs"}
      >
        <img src="/map-pin.svg" alt="Map Pin" style={{ width: "16px", height: "16px", filter: "invert(var(--theme-icon-invert, 0))" }} />
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
