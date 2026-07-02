/// <reference types="google.maps" />
"use client";

import React, { useEffect, useState, useRef } from "react";
import LocationPicker from "./LocationPicker";
import ProfileDrawer from "./ProfileDrawer";
import HazardModal from "./HazardModal";
import BrandHeader from "./BrandHeader";
import SplashLoader from "./SplashLoader";
import MapControls from "./MapControls";
import ActiveRoutePanel from "./ActiveRoutePanel";
import UserProfileDashboard from "./UserProfileDashboard";

import useHazardMarkers from "./useHazardMarkers";
import useRouteCalculator from "./useRouteCalculator";

import {
  defaultCenter,
  useGoogleMapsLoader,
  lightMapStyle,
  darkMapStyle,
} from "../lib/maps-utils";

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
  const [showAllPins, setShowAllPins] = useState(false);

  // User session state
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  // Route state
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromCoords, setFromCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [toCoords, setToCoords] = useState<google.maps.LatLngLiteral | null>(null);

  // User Dashboard State
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [selectedStartPlace, setSelectedStartPlace] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [selectedDestPlace, setSelectedDestPlace] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Toast Notification State
  interface ToastMessage {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (message: string, type: ToastMessage["type"] = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Custom Confirmation Dialog State
  interface ConfirmDialogState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Profile toggle states (Independent modifiers)
  const [isWheelchairEnabled, setIsWheelchairEnabled] = useState(true);
  const [isShadedEnabled, setIsShadedEnabled] = useState(false);
  const [isRainEnabled, setIsRainEnabled] = useState(false);

  // Admin map direct pinning state
  const [isAdminPinning, setIsAdminPinning] = useState(false);

  // Navigation steps state
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Inline address editing states
  const [isEditingAddresses, setIsEditingAddresses] = useState(false);
  const [tempFromAddress, setTempFromAddress] = useState("");
  const [tempToAddress, setTempToAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  // UI/UX Theme and Active Step Tracking states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch session
  const fetchSession = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Failed to fetch user session:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        setUser(null);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

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
    fetchSession();
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
  }, [currentStep, isSidebarOpen, mapInstance, fromCoords, toCoords]);

  // Initialize Map Instance with desaturated accessibility map styles
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance) return;

    const map = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      minZoom: 5,
      restriction: {
        latLngBounds: {
          north: 21.2,
          south: 4.6,
          east: 126.6,
          west: 116.6,
        },
        strictBounds: false,
      },
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
  }, [isLoaded, mapInstance, isDarkMode]);

  // Admin map click handler to drop hazard pins
  useEffect(() => {
    if (!mapInstance) return;

    const clickListener = mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (user?.role === "ADMIN" && isAdminPinning && e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMapCenter({ lat, lng });
        setIsReportModalOpen(true);
        addToast(`Admin Mode: Clicked coordinates loaded for reporting.`, "info");
      }
    });

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [mapInstance, user, isAdminPinning]);

  // Update map style when theme changes dynamically
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setOptions({
        styles: isDarkMode ? darkMapStyle : lightMapStyle,
      });
    }
  }, [isDarkMode, mapInstance]);

  // Toggle base map pins (POIs) visibility based on user choice
  useEffect(() => {
    if (!mapInstance) return;

    const hideAllPinsStyles = [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
      },
    ];

    mapInstance.setOptions({
      styles: showAllPins ? [] : hideAllPinsStyles,
    });
  }, [mapInstance, showAllPins]);

  // Render Hazard Pins custom overlay controller hook
  useHazardMarkers(mapInstance, hazards);

  // Compute and Render Safe Route custom controller hook
  const {
    routeSteps,
    routeInfo,
    avoidedCount,
    resetRoute,
  } = useRouteCalculator({
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
  });

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
        geocoder.geocode({ address: tempFromAddress, componentRestrictions: { country: "PH" } }, (results, status) => {
          if (status === "OK" && results) resolve(results);
          else reject(new Error(`Failed to geocode origin: ${status}`));
        });
      });

      // Geocode To Address
      const toResult = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address: tempToAddress, componentRestrictions: { country: "PH" } }, (results, status) => {
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
    setActiveStepIndex(0);
    setIsEditingAddresses(false);
    setIsVoiceActive(false);
    resetRoute();
    setCurrentStep(1);
  };

  return (
    <div className={`app-split-container ${isDarkMode ? "dark-theme" : ""} ${!isSidebarOpen ? "sidebar-collapsed" : ""}`}>
      {showSplash && (
        <SplashLoader currentStep={currentStep} />
      )}

      {/* Left Panel: Directions & Controls */}
      <div className={`left-text-panel ${!isSidebarOpen ? "sidebar-collapsed" : ""}`} style={{ display: "flex", flexDirection: "column" }}>
        
        {!showSplash && (
          <BrandHeader
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            user={user}
            onLogout={handleLogout}
            onToggleDashboard={() => setShowUserDashboard(!showUserDashboard)}
          />
        )}

        {showUserDashboard ? (
          <UserProfileDashboard
            user={user}
            onClose={() => setShowUserDashboard(false)}
            onSelectPlace={(lat, lng, address, type) => {
              if (type === "from") {
                setSelectedStartPlace({ lat, lng, address });
              } else {
                setSelectedDestPlace({ lat, lng, address });
              }
              setShowUserDashboard(false);
            }}
            onSelectRoute={(fromC, toC, fromAdd, toAdd, travelMode) => {
              setIsWheelchairEnabled(travelMode.includes("wheelchair"));
              setIsShadedEnabled(travelMode.includes("shaded"));
              setIsRainEnabled(travelMode.includes("rain"));
              handleConfirmRoute(fromC, toC, fromAdd, toAdd);
              setShowUserDashboard(false);
            }}
            onAccountDeleted={async () => {
              await handleLogout();
              setShowUserDashboard(false);
            }}
            showToast={addToast}
            showConfirm={showConfirm}
          />
        ) : (
          <>
            {/* Step 1: Input stage */}
            {!showSplash && currentStep === 1 && (
              <>
                <LocationPicker
                  isLoaded={isLoaded}
                  onConfirmRoute={handleConfirmRoute}
                  user={user}
                  onConfirmSavedRoute={(fromC, toC, fromAdd, toAdd, travelMode) => {
                    setIsWheelchairEnabled(travelMode.includes("wheelchair"));
                    setIsShadedEnabled(travelMode.includes("shaded"));
                    setIsRainEnabled(travelMode.includes("rain"));
                    handleConfirmRoute(fromC, toC, fromAdd, toAdd);
                  }}
                  selectedStartPlace={selectedStartPlace}
                  selectedDestPlace={selectedDestPlace}
                  showToast={addToast}
                  showConfirm={showConfirm}
                />
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
              <ActiveRoutePanel
                routeInfo={routeInfo}
                isVoiceActive={isVoiceActive}
                setIsVoiceActive={setIsVoiceActive}
                fromAddress={fromAddress}
                toAddress={toAddress}
                isEditingAddresses={isEditingAddresses}
                setIsEditingAddresses={setIsEditingAddresses}
                tempFromAddress={tempFromAddress}
                setTempFromAddress={setTempFromAddress}
                tempToAddress={tempToAddress}
                setTempToAddress={setTempToAddress}
                isGeocoding={isGeocoding}
                handleSaveEditedAddresses={handleSaveEditedAddresses}
                isWheelchairEnabled={isWheelchairEnabled}
                setIsWheelchairEnabled={setIsWheelchairEnabled}
                isShadedEnabled={isShadedEnabled}
                setIsShadedEnabled={setIsShadedEnabled}
                isRainEnabled={isRainEnabled}
                setIsRainEnabled={setIsRainEnabled}
                routeSteps={routeSteps}
                activeStepIndex={activeStepIndex}
                setActiveStepIndex={setActiveStepIndex}
                mapInstance={mapInstance}
                handleReset={handleReset}
                user={user}
                fromCoords={fromCoords}
                toCoords={toCoords}
                showToast={addToast}
              />
            )}
          </>
        )}
      </div>

      <div className="right-map-panel">
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

        {/* Sidebar Toggle Button */}
        {!showSplash && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="btn-interactive"
            title={isSidebarOpen ? "Collapse panel" : "Expand panel"}
            style={{
              position: "absolute",
              left: "20px",
              top: "20px",
              zIndex: 20,
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              border: "1.5px solid var(--border-subtle)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "var(--shadow-glass)",
            }}
          >
            {isSidebarOpen ? "◄" : "☰"}
          </button>
        )}

        {isAdminPinning && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 16px",
              borderRadius: "10px",
              backgroundColor: "rgba(239, 68, 68, 0.95)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1.5px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
              fontSize: "12px",
              fontWeight: 700,
              pointerEvents: "auto",
              whiteSpace: "nowrap",
            }}
          >
            <span>📍 Admin Pinning Active. Click on map to drop hazard.</span>
            <button
              onClick={() => setIsAdminPinning(false)}
              className="btn-interactive"
              style={{
                border: "none",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 800,
              }}
            >
              Exit
            </button>
          </div>
        )}

        <MapControls
          mapInstance={mapInstance}
          fromCoords={fromCoords}
          defaultCenter={defaultCenter}
          showAllPins={showAllPins}
          setShowAllPins={setShowAllPins}
          isAdmin={user?.role === "ADMIN"}
          isAdminPinning={isAdminPinning}
          setIsAdminPinning={setIsAdminPinning}
        />

        {!isLoaded && (
          <div className="glass-panel" style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10, padding: "12px 20px" }}>
            <h3>Loading Map...</h3>
          </div>
        )}
      </div>

      <HazardModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setIsAdminPinning(false);
        }}
        mapCenter={mapCenter}
        onReportAdded={fetchHazards}
        user={user}
      />

      {/* Custom Toast Container */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              backgroundColor:
                t.type === "success"
                  ? "rgba(16, 185, 129, 0.9)"
                  : t.type === "error"
                  ? "rgba(239, 68, 68, 0.9)"
                  : t.type === "warning"
                  ? "rgba(245, 158, 11, 0.9)"
                  : "rgba(30, 144, 255, 0.9)",
              pointerEvents: "auto",
              minWidth: "220px",
              maxWidth: "350px",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100000,
          }}
        >
          <div
            className="glass-panel"
            style={{
              padding: "24px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "var(--shadow-glass)",
              border: "1px solid var(--border-glass)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              pointerEvents: "auto",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
              {confirmDialog.title}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1.5px solid var(--border-subtle)",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: confirmDialog.title.toLowerCase().includes("delete") ? "#EF4444" : "var(--accent-accessibility)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
