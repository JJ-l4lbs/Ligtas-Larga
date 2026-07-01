/// <reference types="google.maps" />
"use client";


import React, { useEffect, useState, useRef } from "react";
import LocationPicker from "./LocationPicker";
import SearchOverlay from "./SearchOverlay";
import ProfileDrawer, { TravelMode } from "./ProfileDrawer";
import HazardModal from "./HazardModal";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
  position: "absolute" as const,
  top: 0,
  left: 0,
  zIndex: 1,
};

const defaultCenter = {
  lat: 14.5995,
  lng: 120.9842,
};

// Custom Google Maps Loader Hook (Singleton to prevent double-injection warnings)
let globalLoadPromise: Promise<void> | null = null;

function useGoogleMapsLoader(apiKey: string) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).google) {
      setIsLoaded(true);
      return;
    }

    if (!globalLoadPromise) {
      globalLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker,geometry&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
      });
    }

    globalLoadPromise
      .then(() => setIsLoaded(true))
      .catch((err) => console.error("Error loading Google Maps script:", err));
  }, [apiKey]);

  return isLoaded;
}

interface HazardReport {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  severity: string;
  description: string;
  isValidated: boolean;
}

// Distance helper (Haversine)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDuration(durationStr: string) {
  const seconds = parseInt(durationStr.replace("s", ""), 10);
  if (isNaN(seconds)) return "";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return remMins > 0 ? `${hours} hr ${remMins} mins` : `${hours} hr`;
}

export default function MapComponent() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const isLoaded = useGoogleMapsLoader(apiKey);

  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [currentStep, setCurrentStep] = useState(0); // 0 = Splash Screen, 1 = Location Picker, 2 = Dashboard Map
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [activePolyline, setActivePolyline] = useState<google.maps.Polyline | null>(null);
  const [activeMarkers, setActiveMarkers] = useState<any[]>([]);

  // Route state
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromCoords, setFromCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [toCoords, setToCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("accessibility");

  // Route display info
  const [routeInfo, setRouteInfo] = useState<{ distance?: string; duration?: string }>({});
  const [avoidedCount, setAvoidedCount] = useState(0);

  // Fetch hazards on load
  const fetchHazards = async () => {
    try {
      const response = await fetch("/api/reports");
      if (response.ok) {
        const data = await response.json();
        setHazards(data);
      }
    } catch (err) {
      console.error("Failed to fetch hazard reports for map:", err);
    }
  };

  useEffect(() => {
    fetchHazards();
  }, []);

  useEffect(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        setCurrentStep(1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // 1. Initialize Map Instance (No legacy wrapper, no custom styles when mapId is present)
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance) return;

    const map = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
      disableDefaultUI: true,
      zoomControl: false,
    });

    setMapInstance(map);

    map.addListener("dragend", () => {
      const center = map.getCenter();
      if (center) {
        setMapCenter({ lat: center.lat(), lng: center.lng() });
      }
    });
  }, [isLoaded, mapInstance]);

  // 2. Render Hazard Pins via Places/Marker API (New AdvancedMarkerElement)
  useEffect(() => {
    if (!mapInstance || !hazards) return;

    let active = true;
    const newMarkers: any[] = [];

    const loadMarkers = async () => {
      try {
        const { AdvancedMarkerElement, PinElement } = (await google.maps.importLibrary(
          "marker"
        )) as google.maps.MarkerLibrary;

        if (!active) return;

        // Clear previous markers
        activeMarkers.forEach((m) => {
          m.map = null;
        });

        hazards.forEach((hazard) => {
          let color = "#ef4444";
          if (hazard.severity === "MEDIUM") {
            color = "#f59e0b";
          } else if (hazard.severity === "LOW") {
            color = "#10b981";
          }

          const pin = new PinElement({
            background: color,
            borderColor: "#ffffff",
            glyphColor: "#ffffff",
          });

          const marker = new AdvancedMarkerElement({
            map: mapInstance,
            position: { lat: hazard.latitude, lng: hazard.longitude },
            content: pin,
            title: `${hazard.category} (${hazard.severity}): ${hazard.description}`,
          });

          newMarkers.push(marker);
        });

        if (active) {
          setActiveMarkers(newMarkers);
        }
      } catch (err) {
        console.error("Error loading markers:", err);
      }
    };

    loadMarkers();

    return () => {
      active = false;
      newMarkers.forEach((m) => {
        m.map = null;
      });
    };
  }, [mapInstance, hazards]);

  // 3. Compute and Render Safe Route using the modern Routes API
  useEffect(() => {
    if (!isLoaded || !mapInstance || !fromCoords || !toCoords) return;

    let active = true;

    const fetchRoute = async () => {
      try {
        const response = await fetch("/api/routes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: fromCoords, destination: toCoords }),
        });

        if (!response.ok) throw new Error("Failed to fetch route options");
        const data = await response.json();

        if (!active) return;

        if (!data.routes || data.routes.length === 0) return;

        // Filter relevant hazards depending on commuter settings
        const relevantHazards = hazards.filter((h) => {
          if (travelMode === "accessibility") {
            return h.category === "ELEVATOR_BROKEN" || h.category === "RAMP_BLOCKED";
          }
          if (travelMode === "rain") {
            return h.category === "FLOOD";
          }
          return false; // Student/Covered mode does not block routes
        });

        let bestRouteIndex = 0;
        let minViolations = Infinity;
        let maxMinDistanceToHazard = -1;
        const decodedPaths: google.maps.LatLng[][] = [];

        // Evaluate alternative routes returned by Routes API
        data.routes.forEach((route: any, index: number) => {
          const encodedPolyline = route.polyline.encodedPolyline;
          const decodedPath = google.maps.geometry.encoding.decodePath(encodedPolyline);
          decodedPaths.push(decodedPath);

          let violations = 0;
          let minDistanceForThisRoute = Infinity;

          decodedPath.forEach((point) => {
            const ptLat = point.lat();
            const ptLng = point.lng();

            relevantHazards.forEach((hazard) => {
              const dist = getDistanceKm(ptLat, ptLng, hazard.latitude, hazard.longitude);
              if (dist < minDistanceForThisRoute) {
                minDistanceForThisRoute = dist;
              }
              if (dist < 0.05) { // Within 50 meters
                violations++;
              }
            });
          });

          if (violations < minViolations) {
            minViolations = violations;
            bestRouteIndex = index;
            maxMinDistanceToHazard = minDistanceForThisRoute;
          } else if (violations === minViolations && minDistanceForThisRoute > maxMinDistanceToHazard) {
            bestRouteIndex = index;
            maxMinDistanceToHazard = minDistanceForThisRoute;
          }
        });

        if (!active) return;

        const chosenRoute = data.routes[bestRouteIndex];
        const chosenPath = decodedPaths[bestRouteIndex];

        // Draw the polyline safely using Google Maps JS SDK (Legacy-free rendering)
        if (activePolyline) {
          activePolyline.setMap(null);
        }

        const color =
          travelMode === "accessibility"
            ? "#00f0ff"
            : travelMode === "rain"
            ? "#3b82f6"
            : "#ff9f00";

        const polyline = new google.maps.Polyline({
          path: chosenPath,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 6,
          map: mapInstance,
        });

        setActivePolyline(polyline);

        const leg = chosenRoute.legs?.[0];
        setRouteInfo({
          distance: leg ? `${(chosenRoute.distanceMeters / 1000).toFixed(1)} km` : undefined,
          duration: chosenRoute.duration ? formatDuration(chosenRoute.duration) : undefined,
        });

        setAvoidedCount(relevantHazards.length - minViolations);

        // Adjust viewport bounding box
        const bounds = new google.maps.LatLngBounds();
        chosenPath.forEach((pt) => bounds.extend(pt));
        mapInstance.fitBounds(bounds);

      } catch (err) {
        console.error("Error calculating safe route:", err);
      }
    };

    fetchRoute();

    return () => {
      active = false;
    };
  }, [isLoaded, mapInstance, fromCoords, toCoords, travelMode, hazards]);

  const handleConfirmRoute = (
    fromC: google.maps.LatLngLiteral,
    toC: google.maps.LatLngLiteral,
    fromAdd: string,
    toAdd: string
  ) => {
    setFromCoords(fromC);
    setToCoords(toC);
    setFromAddress(fromAdd);
    setToAddress(toAdd);
    setCurrentStep(2);
  };

  const handleReset = () => {
    setFromCoords(null);
    setToCoords(null);
    if (activePolyline) {
      activePolyline.setMap(null);
    }
    setActivePolyline(null);
    setCurrentStep(1);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Native Map Div Container */}
      <div ref={mapRef} style={mapContainerStyle} />

      {!isLoaded && (
        <div className="glass-panel" style={{ margin: "20px", padding: "20px", textAlign: "center", zIndex: 10 }}>
          <h3>Loading Map System...</h3>
        </div>
      )}

      {/* Overlay Screens */}
      {currentStep === 0 ? (
        <div
          className="splash-liquid-bg"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 150,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            padding: "8%",
            pointerEvents: "auto",
          }}
        >
          <div>
            <h1 style={{ fontSize: "48px", fontWeight: 300, letterSpacing: "1px", color: "white" }}>Ligtas Larga</h1>
          </div>
          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "5px" }}>
            <p style={{ fontSize: "16px", color: "white", fontWeight: 500 }}>
              Lalarga na...
            </p>
            <div style={{ width: '200px', height: '2px', backgroundColor: 'rgba(255,255,255,0.2)', position: 'relative', marginTop: '20px' }}>
              {/* Destination Marker */}
              <div className="marker-anim" style={{ position: 'absolute', right: '-8px', top: '-18px', color: 'rgba(255,255,255,0.9)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              
              {/* Walking Person Sprite Animation */}
              <div className="walking-progress-anim" style={{ position: 'absolute', left: '-12px', top: '-28px', width: '24px', height: '36px', overflow: 'hidden' }}>
                <div className="walking-sprite" style={{ display: 'flex', color: 'white' }}>
                  <svg width="120" height="36" viewBox="0 0 120 36" fill="white" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <g transform="translate(0, 0)">
                       <circle cx="12" cy="7" r="3.5" stroke="none" />
                       <path d="M12 12 L9 18" />
                       <path d="M12 21 L8 27 L6 31" />
                       <path d="M12 11 L12 21" />
                       <path d="M12 21 L16 27 L16 32" />
                       <path d="M12 12 L15 18" />
                    </g>
                    <g transform="translate(24, 0)">
                       <circle cx="12" cy="7.5" r="3.5" stroke="none" />
                       <path d="M12 12.5 L10 18" />
                       <path d="M12 21.5 L9 26 L8 31" />
                       <path d="M12 11.5 L12 21.5" />
                       <path d="M12 21.5 L14 26 L14 32" />
                       <path d="M12 12.5 L14 18" />
                    </g>
                    <g transform="translate(48, 0)">
                       <circle cx="12" cy="6.5" r="3.5" stroke="none" />
                       <path d="M12 11.5 L11 18" />
                       <path d="M12 20.5 L12 26 L14 28" />
                       <path d="M12 10.5 L12 20.5" />
                       <path d="M12 20.5 L12 27 L12 33" />
                       <path d="M12 11.5 L13 18" />
                    </g>
                    <g transform="translate(72, 0)">
                       <circle cx="12" cy="6" r="3.5" stroke="none" />
                       <path d="M12 11 L14 17" />
                       <path d="M12 20 L15 25 L15 31" />
                       <path d="M12 10 L12 20" />
                       <path d="M12 20 L10 26 L8 28" />
                       <path d="M12 11 L10 17" />
                    </g>
                    <g transform="translate(96, 0)">
                       <circle cx="12" cy="7" r="3.5" stroke="none" />
                       <path d="M12 12 L15 18" />
                       <path d="M12 21 L16 27 L16 32" />
                       <path d="M12 11 L12 21" />
                       <path d="M12 21 L8 27 L6 31" />
                       <path d="M12 12 L9 18" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : currentStep === 1 ? (
        <LocationPicker isLoaded={isLoaded} onConfirmRoute={handleConfirmRoute} />
      ) : (
        <>
          <SearchOverlay fromAddress={fromAddress} toAddress={toAddress} onReset={handleReset} />
          <ProfileDrawer
            selectedMode={travelMode}
            onModeChange={(mode) => setTravelMode(mode)}
            onReportTrigger={() => setIsReportModalOpen(true)}
            avoidedCount={avoidedCount}
            routeInfo={routeInfo}
          />
        </>
      )}

      {/* Hazard Report Modal */}
      <HazardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        mapCenter={mapCenter}
        onReportAdded={fetchHazards}
      />
    </div>
  );
}
