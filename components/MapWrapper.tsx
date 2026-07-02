"use client";

import React from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function MapWrapper() {
  return <MapComponent />;
}
