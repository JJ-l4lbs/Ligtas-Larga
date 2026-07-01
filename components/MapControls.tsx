/// <reference types="google.maps" />
import React from "react";

interface MapControlsProps {
  mapInstance: google.maps.Map | null;
  fromCoords: google.maps.LatLngLiteral | null;
  defaultCenter: google.maps.LatLngLiteral;
}

export default function MapControls({ mapInstance, fromCoords, defaultCenter }: MapControlsProps) {
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
    </div>
  );
}
