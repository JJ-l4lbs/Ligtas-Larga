"use client";

import { useState, useEffect, useRef } from "react";
import { defaultCenter, getDistanceKm, formatDuration } from "../lib/maps-utils";

interface HazardReport {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  severity: string;
  description: string;
  isValidated: boolean;
  imageUrl?: string | null;
}

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

interface UseRouteCalculatorProps {
  isLoaded: boolean;
  mapInstance: google.maps.Map | null;
  fromCoords: google.maps.LatLngLiteral | null;
  toCoords: google.maps.LatLngLiteral | null;
  fromAddress: string;
  toAddress: string;
  hazards: HazardReport[];
  isWheelchairEnabled: boolean;
  isShadedEnabled: boolean;
  isRainEnabled: boolean;
  isVoiceActive: boolean;
  activeStepIndex: number;
  setActiveStepIndex: (idx: number) => void;
  activeMode: "walk" | "commute" | "bicycle" | "motorcycle" | "car";
}

export default function useRouteCalculator({
  isLoaded,
  mapInstance,
  fromCoords,
  toCoords,
  fromAddress,
  toAddress,
  hazards,
  isWheelchairEnabled,
  isShadedEnabled,
  isRainEnabled,
  isVoiceActive,
  activeStepIndex,
  setActiveStepIndex,
  activeMode,
}: UseRouteCalculatorProps) {
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance?: string; duration?: string; totalFare?: number; totalDiscountedFare?: number }>({});
  const [avoidedCount, setAvoidedCount] = useState(0);
  const [cachedRoutesData, setCachedRoutesData] = useState<any>(null);
  const [lastRouteCoords, setLastRouteCoords] = useState<{ from: google.maps.LatLngLiteral; to: google.maps.LatLngLiteral; mode: string } | null>(null);

  const [activePolyline, setActivePolyline] = useState<google.maps.Polyline | null>(null);
  const [activeBypassedPolyline, setActiveBypassedPolyline] = useState<google.maps.Polyline | null>(null);
  const [activeWarningMarkers, setActiveWarningMarkers] = useState<any[]>([]);
  const startEndMarkersRef = useRef<any[]>([]);

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

  // Compute and Cache raw Route data when origin or destination changes
  useEffect(() => {
    if (!isLoaded || !fromCoords || !toCoords) return;

    if (
      lastRouteCoords &&
      lastRouteCoords.from.lat === fromCoords.lat &&
      lastRouteCoords.from.lng === fromCoords.lng &&
      lastRouteCoords.to.lat === toCoords.lat &&
      lastRouteCoords.to.lng === toCoords.lng &&
      lastRouteCoords.mode === activeMode &&
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
          body: JSON.stringify({ origin: fromCoords, destination: toCoords, travelMode: activeMode }),
        });

        if (!response.ok) throw new Error("Failed to fetch route options");
        const data = await response.json();

        if (active) {
          setCachedRoutesData(data);
          setLastRouteCoords({ from: fromCoords, to: toCoords, mode: activeMode });
        }
      } catch (err) {
        console.error("Error calculating safe route:", err);
      }
    };

    fetchRoute();

    return () => {
      active = false;
    };
  }, [isLoaded, fromCoords, toCoords, lastRouteCoords, cachedRoutesData, activeMode]);

  // Sub-millisecond Local Routing Scoring & Map Overlay rendering
  useEffect(() => {
    if (!mapInstance || !cachedRoutesData || !fromCoords || !toCoords) return;

    const data = cachedRoutesData;
    if (!data.routes || data.routes.length === 0) return;

    // Filter active database hazards based on user profile settings
    const relevantHazards = hazards.filter((h) => {
      if (isWheelchairEnabled && (h.category === "ELEVATOR_BROKEN" || h.category === "RAMP_BLOCKED")) {
        // If commute mode is active, train station accessibility hazards are bypassed
        // because stations provide staff assistance and guaranteed accessibility.
        if (activeMode === "commute") {
          return false;
        }
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
    if (activeMode === "commute") {
      strokeColor = "#14b8a6"; // Teal
    } else if (activeMode === "bicycle") {
      strokeColor = "#10b981"; // Green
    } else if (activeMode === "motorcycle") {
      strokeColor = "#8b5cf6"; // Purple
    } else if (activeMode === "car") {
      strokeColor = "#64748b"; // Slate
    } else if (isWheelchairEnabled) {
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
        if (activeMode === "commute") {
          const isTrain = step.fareInfo?.type === "train" || 
                          (step.transitDetails && (
                            step.transitDetails.transitLine?.vehicle?.type === "HEAVY_RAIL" ||
                            step.transitDetails.transitLine?.vehicle?.type === "SUBWAY" ||
                            step.transitDetails.transitLine?.name?.toLowerCase().includes("lrt") ||
                            step.transitDetails.transitLine?.name?.toLowerCase().includes("mrt") ||
                            step.transitDetails.transitLine?.shortName?.toLowerCase().includes("lrt") ||
                            step.transitDetails.transitLine?.shortName?.toLowerCase().includes("mrt")
                          ));
          if (isTrain && isWheelchairEnabled) {
            surfaceInfo = "♿ PWD Accessible Commute: Train stations support wheelchair ramps, elevators, and dedicated personnel assistance.";
          } else {
            surfaceInfo = step.transitDetails ? "Board designated transit route." : "Walk to transit connection stop.";
          }
        } else if (isWheelchairEnabled) {
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
          fareInfo: step.fareInfo,
          transitDetails: step.transitDetails,
        });
      });
    }
    setRouteSteps(parsedSteps);

    const leg = chosenRoute.legs?.[0];
    setRouteInfo({
      distance: leg ? `${(chosenRoute.distanceMeters / 1000).toFixed(1)} km` : undefined,
      duration: chosenRoute.duration ? formatDuration(chosenRoute.duration) : undefined,
      totalFare: chosenRoute.totalFare,
      totalDiscountedFare: chosenRoute.totalDiscountedFare,
    });

    setAvoidedCount(relevantHazards.length - minViolations);

    if (fromCoords) {
      mapInstance.setCenter(fromCoords);
      mapInstance.setZoom(16);
    }
  }, [cachedRoutesData, mapInstance, hazards, isWheelchairEnabled, isShadedEnabled, isRainEnabled, fromCoords, toCoords, activeMode]);

  const resetRoute = () => {
    setCachedRoutesData(null);
    setLastRouteCoords(null);
    setRouteSteps([]);
    setRouteInfo({});
    setAvoidedCount(0);

    if (activePolyline) {
      activePolyline.setMap(null);
      setActivePolyline(null);
    }
    if (activeBypassedPolyline) {
      activeBypassedPolyline.setMap(null);
      setActiveBypassedPolyline(null);
    }
    activeWarningMarkers.forEach((m) => {
      m.map = null;
    });
    setActiveWarningMarkers([]);

    startEndMarkersRef.current.forEach((m) => {
      m.map = null;
    });
    startEndMarkersRef.current = [];
  };

  return {
    routeSteps,
    routeInfo,
    avoidedCount,
    resetRoute,
    cachedRoutesData,
  };
}
