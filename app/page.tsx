import React from "react";
import MapWrapper from "../components/MapWrapper";

export const unstable_instant = false;

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Background Interactive Map */}
      <MapWrapper />
      
      {/* Layout Overlays Container */}
      <div style={{ position: "relative", zIndex: 10, pointerEvents: "none" }}>
        {/* Placeholder container for overlays to be populated in next phases */}
      </div>
    </main>
  );
}
