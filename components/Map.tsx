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

  // Route state
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromCoords, setFromCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [toCoords, setToCoords] = useState<google.maps.LatLngLiteral | null>(null);

  // Profile toggle states (Independent modifiers)
  const [isWheelchairEnabled, setIsWheelchairEnabled] = useState(true);
  const [isShadedEnabled, setIsShadedEnabled] = useState(false);
  const [isRainEnabled, setIsRainEnabled] = useState(false);

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
  }, [currentStep, isSidebarOpen, mapInstance, fromCoords, toCoords]);

  // Initialize Map Instance with desaturated accessibility map styles
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance) return;

    const map = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
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
          <BrandHeader isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
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
          />
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

        {/* Floating Map Zoom Controls (Always visible in split container) */}
        <MapControls
          mapInstance={mapInstance}
          fromCoords={fromCoords}
          defaultCenter={defaultCenter}
          showAllPins={showAllPins}
          setShowAllPins={setShowAllPins}
        />

        {!isLoaded && (
          <div className="glass-panel" style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10, padding: "12px 20px" }}>
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
