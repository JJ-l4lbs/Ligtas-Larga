/// <reference types="google.maps" />
"use client";

import React, { useEffect, useState, useRef } from "react";
import LocationPicker from "./LocationPicker";
import SearchOverlay from "./SearchOverlay";
import ProfileDrawer from "./ProfileDrawer";
import HazardModal from "./HazardModal";

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

interface RouteStep {
  instruction: string;
  distance: string;
  maneuver?: string;
  warnings?: string[];
  surfaceInfo?: string;
  startLocation: google.maps.LatLngLiteral;
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

const lightMapStyle = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#F8FAFC" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#D4E6F1" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#EBEFFA" }]
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "on" }]
  }
];

const darkMapStyle = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#1E293B" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0F172A" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1E293B" }]
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "on" }]
  }
];

export default function MapComponent() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const isLoaded = useGoogleMapsLoader(apiKey);

  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [currentStep, setCurrentStep] = useState(0); // 0 = Splash Screen, 1 = Location Picker, 2 = Dashboard Map
  const [showSplash, setShowSplash] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [activePolyline, setActivePolyline] = useState<google.maps.Polyline | null>(null);
  const [activeBypassedPolyline, setActiveBypassedPolyline] = useState<google.maps.Polyline | null>(null);
  const [activeMarkers, setActiveMarkers] = useState<any[]>([]);
  const [activeWarningMarkers, setActiveWarningMarkers] = useState<any[]>([]);
  const startEndMarkersRef = useRef<any[]>([]);

  // Route state
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromCoords, setFromCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [toCoords, setToCoords] = useState<google.maps.LatLngLiteral | null>(null);

  // Profile toggle states (Independent modifiers)
  const [isWheelchairEnabled, setIsWheelchairEnabled] = useState(true);
  const [isShadedEnabled, setIsShadedEnabled] = useState(false);
  const [isRainEnabled, setIsRainEnabled] = useState(false);

  // Parsed steps list for high-contrast feed
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Route display info
  const [routeInfo, setRouteInfo] = useState<{ distance?: string; duration?: string }>({});
  const [avoidedCount, setAvoidedCount] = useState(0);

  // UI/UX Theme and Active Step Tracking states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Inline address editing states
  const [isEditingAddresses, setIsEditingAddresses] = useState(false);
  const [tempFromAddress, setTempFromAddress] = useState("");
  const [tempToAddress, setTempToAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Cached Google routes data for sub-millisecond local scoring optimization
  const [cachedRoutesData, setCachedRoutesData] = useState<any>(null);
  const [lastRouteCoords, setLastRouteCoords] = useState<{ from: google.maps.LatLngLiteral; to: google.maps.LatLngLiteral } | null>(null);

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

  useEffect(() => {
    if (currentStep > 0) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Handle map resizing when changing layout dimensions
  useEffect(() => {
    if (mapInstance) {
      setTimeout(() => {
        google.maps.event.trigger(mapInstance, "resize");
        if (fromCoords && toCoords) {
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(fromCoords);
          bounds.extend(toCoords);
          mapInstance.fitBounds(bounds);
        }
      }, 600); // Wait for split panel animation
    }
  }, [currentStep, mapInstance]);

  // 1. Initialize Map Instance with desaturated accessibility map styles
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance) return;

    const map = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
      disableDefaultUI: true,
      zoomControl: false,
      styles: isDarkMode ? darkMapStyle : lightMapStyle
    });

    setMapInstance(map);

    map.addListener("dragend", () => {
      const center = map.getCenter();
      if (center) {
        setMapCenter({ lat: center.lat(), lng: center.lng() });
      }
    });
  }, [isLoaded, mapInstance]);

  // Update map style when theme changes dynamically
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setOptions({
        styles: isDarkMode ? darkMapStyle : lightMapStyle,
      });
    }
  }, [isDarkMode, mapInstance]);

  // 2. Render Hazard Pins via Places/Marker API
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

  // Speech synthesis speaker
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // Speak directions steps when voice toggle or steps list changes
  useEffect(() => {
    if (isVoiceActive && routeSteps.length > 0 && routeSteps[activeStepIndex]) {
      const currentInstruction = routeSteps[activeStepIndex];
      const safetyWarning = currentInstruction.warnings && currentInstruction.warnings.length > 0
        ? `. Look out for: ${currentInstruction.warnings.join(". ")}`
        : "";
      speakText(
        `Next step. ${currentInstruction.instruction} in ${currentInstruction.distance}. ${currentInstruction.surfaceInfo}${safetyWarning}`
      );
    } else {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isVoiceActive, routeSteps, activeStepIndex]);

  // 3. Compute and Cache raw Route data when origin or destination changes (Optimized to save API quotas)
  useEffect(() => {
    if (!isLoaded || !fromCoords || !toCoords) return;

    // Skip if we already have the route coordinates cached
    if (
      lastRouteCoords &&
      lastRouteCoords.from.lat === fromCoords.lat &&
      lastRouteCoords.from.lng === fromCoords.lng &&
      lastRouteCoords.to.lat === toCoords.lat &&
      lastRouteCoords.to.lng === toCoords.lng &&
      cachedRoutesData
    ) {
      return;
    }

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

        if (active) {
          setCachedRoutesData(data);
          setLastRouteCoords({ from: fromCoords, to: toCoords });
        }
      } catch (err) {
        console.error("Error calculating safe route:", err);
      }
    };

    fetchRoute();

    return () => {
      active = false;
    };
  }, [isLoaded, fromCoords, toCoords, lastRouteCoords, cachedRoutesData]);

  // 4. Sub-millisecond Local Routing Scoring & Map Overlay rendering
  useEffect(() => {
    if (!mapInstance || !cachedRoutesData || !fromCoords || !toCoords) return;

    const data = cachedRoutesData;
    if (!data.routes || data.routes.length === 0) return;

    // Filter active database hazards based on user profile settings
    const relevantHazards = hazards.filter((h) => {
      if (isWheelchairEnabled && (h.category === "ELEVATOR_BROKEN" || h.category === "RAMP_BLOCKED")) {
        return true;
      }
      if (isRainEnabled && h.category === "FLOOD") {
        return true;
      }
      return false;
    });

    let bestRouteIndex = 0;
    let minViolations = Infinity;
    let maxMinDistanceToHazard = -1;
    const decodedPaths: google.maps.LatLng[][] = [];

    // Evaluate alternative routes returned by Routes API locally in memory
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

    const chosenRoute = data.routes[bestRouteIndex];
    const chosenPath = decodedPaths[bestRouteIndex];

    // Reset previous polylines & markers from map
    if (activePolyline) {
      activePolyline.setMap(null);
    }
    if (activeBypassedPolyline) {
      activeBypassedPolyline.setMap(null);
    }
    activeWarningMarkers.forEach((m) => {
      m.map = null;
    });

    // Draw active safe route
    let strokeColor = "#cbd5e1";
    if (isWheelchairEnabled) {
      strokeColor = "#00f0ff";
    } else if (isRainEnabled) {
      strokeColor = "#3b82f6";
    } else if (isShadedEnabled) {
      strokeColor = "#ff9f00";
    }

    const polyline = new google.maps.Polyline({
      path: chosenPath,
      geodesic: true,
      strokeColor: strokeColor,
      strokeOpacity: 0.9,
      strokeWeight: 6,
      map: mapInstance,
    });
    setActivePolyline(polyline);

    // Draw origin/destination markers
    startEndMarkersRef.current.forEach((m) => (m.map = null));
    startEndMarkersRef.current = [];

    if (fromCoords) {
      const startMarker = new google.maps.Marker({
        position: fromCoords,
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#2ECC71",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
        },
        title: `Start: ${fromAddress}`
      });
      startEndMarkersRef.current.push(startMarker);
    }

    if (toCoords) {
      const endMarker = new google.maps.Marker({
        position: toCoords,
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#E74C3C",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
        },
        title: `Destination: ${toAddress}`
      });
      startEndMarkersRef.current.push(endMarker);
    }

    // Highlight bypassed route if chosen route has bypassed barriers
    if (bestRouteIndex !== 0) {
      const defaultPath = decodedPaths[0];

      const bypassedPolyline = new google.maps.Polyline({
        path: defaultPath,
        geodesic: true,
        strokeColor: "#94a3b8",
        strokeOpacity: 0.35,
        strokeWeight: 5,
        map: mapInstance,
        icons: [
          {
            icon: { path: "M 0,-1 0,1", strokeOpacity: 0.5, scale: 3 },
            offset: "0",
            repeat: "15px",
          },
        ],
      });
      setActiveBypassedPolyline(bypassedPolyline);

      // Render avoided obstacle pins asynchronously
      const loadObstacles = async () => {
        const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as any;
        const newWarnings: any[] = [];

        relevantHazards.forEach((hazard) => {
          let nearDefault = false;
          defaultPath.forEach((pt) => {
            if (getDistanceKm(pt.lat(), pt.lng(), hazard.latitude, hazard.longitude) < 0.05) {
              nearDefault = true;
            }
          });

          let nearSafe = false;
          chosenPath.forEach((pt) => {
            if (getDistanceKm(pt.lat(), pt.lng(), hazard.latitude, hazard.longitude) < 0.05) {
              nearSafe = true;
            }
          });

          if (nearDefault && !nearSafe) {
            const warningEl = document.createElement("div");
            warningEl.innerHTML = `
              <div class="pulse-hazard" style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                background-color: var(--severity-high);
                border: 2px solid #ffffff;
                border-radius: 50%;
                font-size: 16px;
                color: #ffffff;
                font-weight: bold;
              ">🚫</div>
            `;

            const marker = new AdvancedMarkerElement({
              map: mapInstance,
              position: { lat: hazard.latitude, lng: hazard.longitude },
              content: warningEl,
              title: `Avoided Barrier: ${hazard.description}`,
            });
            newWarnings.push(marker);
          }
        });
        setActiveWarningMarkers(newWarnings);
      };
      loadObstacles();
    } else {
      setActiveWarningMarkers([]);
    }

    // Compile travel steps directions
    const parsedSteps: RouteStep[] = [];
    if (chosenRoute.legs?.[0]?.steps) {
      chosenRoute.legs[0].steps.forEach((step: any) => {
        const instruction = step.navigationInstruction?.instruction || "Go straight";
        const distanceVal = step.distanceMeters ? `${step.distanceMeters} m` : "";
        const lat = step.startLocation?.latLng?.latitude;
        const lng = step.startLocation?.latLng?.longitude;
        const stepCoords = lat && lng ? { lat, lng } : defaultCenter;

        const stepWarnings: string[] = [];
        relevantHazards.forEach((hazard) => {
          const dist = getDistanceKm(stepCoords.lat, stepCoords.lng, hazard.latitude, hazard.longitude);
          if (dist < 0.05) {
            stepWarnings.push(`⚠️ ${hazard.category.replace("_", " ")}: ${hazard.description}`);
          }
        });

        let surfaceInfo = "Smooth concrete, clear walkway.";
        if (isWheelchairEnabled) {
          if (stepWarnings.length > 0) {
            surfaceInfo = "Low sidewalk curb or elevator issues reported near this block.";
          } else {
            surfaceInfo = "Curb cuts available, standard slope incline.";
          }
        } else if (isRainEnabled) {
          surfaceInfo = "Well-drained surface. Damp, flood-free path.";
        }

        parsedSteps.push({
          instruction,
          distance: distanceVal,
          maneuver: step.navigationInstruction?.maneuver,
          warnings: stepWarnings,
          surfaceInfo,
          startLocation: stepCoords,
        });
      });
    }
    setRouteSteps(parsedSteps);

    const leg = chosenRoute.legs?.[0];
    setRouteInfo({
      distance: leg ? `${(chosenRoute.distanceMeters / 1000).toFixed(1)} km` : undefined,
      duration: chosenRoute.duration ? formatDuration(chosenRoute.duration) : undefined,
    });

    setAvoidedCount(relevantHazards.length - minViolations);

    // Pan map to focus start direction
    if (fromCoords) {
      mapInstance.setCenter(fromCoords);
      mapInstance.setZoom(16);
    }
  }, [cachedRoutesData, mapInstance, hazards, isWheelchairEnabled, isShadedEnabled, isRainEnabled, fromCoords, toCoords]);

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

  const handleSaveEditedAddresses = async () => {
    if (!tempFromAddress.trim() || !tempToAddress.trim()) return;
    setIsGeocoding(true);
    try {
      const geocoder = new google.maps.Geocoder();

      // Geocode From Address
      const fromResult = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address: tempFromAddress }, (results, status) => {
          if (status === "OK" && results) resolve(results);
          else reject(new Error(`Failed to geocode origin: ${status}`));
        });
      });

      // Geocode To Address
      const toResult = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address: tempToAddress }, (results, status) => {
          if (status === "OK" && results) resolve(results);
          else reject(new Error(`Failed to geocode destination: ${status}`));
        });
      });

      const newFromCoords = {
        lat: fromResult[0].geometry.location.lat(),
        lng: fromResult[0].geometry.location.lng(),
      };
      const newToCoords = {
        lat: toResult[0].geometry.location.lat(),
        lng: toResult[0].geometry.location.lng(),
      };

      setFromCoords(newFromCoords);
      setToCoords(newToCoords);
      setFromAddress(fromResult[0].formatted_address);
      setToAddress(toResult[0].formatted_address);
      
      // Reset active pagination step to 0 for the new route
      setActiveStepIndex(0);
      setIsEditingAddresses(false);
    } catch (err) {
      alert("Error geocoding addresses. Please verify input names.");
      console.error(err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleReset = () => {
    setFromCoords(null);
    setToCoords(null);
    setCachedRoutesData(null);
    setLastRouteCoords(null);
    setActiveStepIndex(0);
    setIsEditingAddresses(false);
    if (activePolyline) {
      activePolyline.setMap(null);
    }
    if (activeBypassedPolyline) {
      activeBypassedPolyline.setMap(null);
    }
    activeWarningMarkers.forEach((m) => {
      m.map = null;
    });
    startEndMarkersRef.current.forEach((m) => {
      m.map = null;
    });
    setActivePolyline(null);
    setActiveBypassedPolyline(null);
    setActiveWarningMarkers([]);
    startEndMarkersRef.current = [];
    setRouteSteps([]);
    setIsVoiceActive(false);
    setCurrentStep(1);
  };

  return (
    <div className={`app-split-container ${isDarkMode ? "dark-theme" : ""}`}>
      {/* Left Panel: Directions & Controls */}
      <div className="left-text-panel" style={{ display: "flex", flexDirection: "column" }}>
        
        {/* Branding Header with Dark/Light Toggle */}
        {!showSplash && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
              borderBottom: "1.5px solid var(--border-subtle)",
              backgroundColor: "var(--bg-card)",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>🚀</span>
              <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>Ligtas-Larga</span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="btn-interactive"
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                border: "1.5px solid var(--border-subtle)",
                backgroundColor: "var(--bg-app-left)",
                color: "var(--text-primary)",
                fontWeight: 700,
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <span>{isDarkMode ? "☀️ Light" : "🌙 Dark"}</span>
            </button>
          </div>
        )}
        
        {/* Splash screen overlay inside Left Panel */}
        {showSplash && (
          <div
            style={{
              padding: "40px 30px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              flex: 1,
              opacity: currentStep === 0 ? 1 : 0,
              transition: "opacity 0.6s ease-in-out",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #1E513F, #0369A1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                boxShadow: "0 0 20px rgba(30, 81, 63, 0.2)",
              }}
            >
              🚀
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-1px", color: "var(--text-primary)" }}>Ligtas-Larga</h1>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Accessible Commuter Navigator
              </p>
            </div>
            <div style={{ marginTop: "10px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  border: "2px solid var(--accent-accessibility)",
                  borderTopColor: "transparent",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              />
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "12px" }}>
                Hydrating route safety states...
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Input stage */}
        {!showSplash && currentStep === 1 && (
          <>
            <LocationPicker isLoaded={isLoaded} onConfirmRoute={handleConfirmRoute} />
            <ProfileDrawer
              isWheelchairEnabled={isWheelchairEnabled}
              isShadedEnabled={isShadedEnabled}
              isRainEnabled={isRainEnabled}
              onToggleWheelchair={() => setIsWheelchairEnabled(!isWheelchairEnabled)}
              onToggleShaded={() => setIsShadedEnabled(!isShadedEnabled)}
              onToggleRain={() => setIsRainEnabled(!isRainEnabled)}
              onReportTrigger={() => setIsReportModalOpen(true)}
              avoidedCount={avoidedCount}
              routeInfo={undefined}
            />
          </>
        )}

        {/* Step 2: High-contrast split turn-by-turn feed */}
        {!showSplash && currentStep === 2 && (
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
                <button
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  className="btn-interactive"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "none",
                    backgroundColor: isVoiceActive ? "rgba(30, 81, 63, 0.1)" : "rgba(0, 0, 0, 0.05)",
                    color: isVoiceActive ? "var(--accent-accessibility)" : "var(--text-primary)",
                    fontWeight: 700,
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{isVoiceActive ? "🔊 Voice On" : "🔇 Voice Off"}</span>
                </button>
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

            {/* Immediate Next Turn Card with interactive pagination to utilize empty panel white space */}
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
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", color: "var(--accent-accessibility)" }}>
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
                        color: "var(--accent-accessibility)",
                      }}
                    >
                      {(() => {
                        const step = routeSteps[activeStepIndex];
                        let arrow = "➜";
                        if (step.maneuver?.includes("LEFT")) arrow = "◄";
                        if (step.maneuver?.includes("RIGHT")) arrow = "►";
                        if (step.maneuver?.includes("UTURN")) arrow = "⟲";
                        return arrow;
                      })()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3 }}>
                        {routeSteps[activeStepIndex].instruction}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        In {routeSteps[activeStepIndex].distance}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                      <span style={{ fontSize: "14px" }}>🚶</span>
                      <span>{routeSteps[activeStepIndex].surfaceInfo}</span>
                    </div>
                    {routeSteps[activeStepIndex].warnings && routeSteps[activeStepIndex].warnings.map((w, wIdx) => (
                      <div key={wIdx} className="warning-pill" style={{ marginTop: "4px", alignSelf: "flex-start" }}>
                        {w}
                      </div>
                    ))}
                  </div>

                  {/* UI/UX Step Pagination Navigation Controls */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "12px" }}>
                    <button
                      disabled={activeStepIndex === 0}
                      onClick={() => {
                        const nextIdx = activeStepIndex - 1;
                        setActiveStepIndex(nextIdx);
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
                        setActiveStepIndex(nextIdx);
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
                </div>
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
        )}
      </div>

      {/* Right Panel: Live Map (Width: 60% locked) */}
      <div className="right-map-panel">
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

        {/* Floating Map Zoom Controls (Always visible in split container) */}
        {mapInstance && (
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
        )}

        {!isLoaded && (
          <div className="glass-panel" style={{ position: "absolute", top: "20px", left: "20px", padding: "12px 20px", zIndex: 10 }}>
            <h3>Loading Map...</h3>
          </div>
        )}
      </div>

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
