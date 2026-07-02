/// <reference types="google.maps" />
"use client";

import React from "react";
import BrandHeader from "./BrandHeader";
import UserProfileDashboard from "./UserProfileDashboard";
import LocationPicker from "./LocationPicker";
import ProfileDrawer from "./ProfileDrawer";
import ActiveRoutePanel from "./ActiveRoutePanel";

interface LeftPanelProps {
  isSidebarOpen: boolean;
  showSplash: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  user: { email: string; role: string } | null;
  handleLogout: () => Promise<void>;
  showUserDashboard: boolean;
  setShowUserDashboard: (val: boolean) => void;
  setSelectedStartPlace: React.Dispatch<React.SetStateAction<{ lat: number; lng: number; address: string } | null>>;
  setSelectedDestPlace: React.Dispatch<React.SetStateAction<{ lat: number; lng: number; address: string } | null>>;
  setIsWheelchairEnabled: (val: boolean) => void;
  setIsShadedEnabled: (val: boolean) => void;
  setIsRainEnabled: (val: boolean) => void;
  handleConfirmRoute: (fromC: google.maps.LatLngLiteral, toC: google.maps.LatLngLiteral, fromAdd: string, toAdd: string) => void;
  addToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  currentStep: number;
  isLoaded: boolean;
  selectedStartPlace: { lat: number; lng: number; address: string } | null;
  selectedDestPlace: { lat: number; lng: number; address: string } | null;
  isWheelchairEnabled: boolean;
  isShadedEnabled: boolean;
  isRainEnabled: boolean;
  setIsReportModalOpen: (val: boolean) => void;
  avoidedCount: number;
  routeInfo: any;
  isVoiceActive: boolean;
  setIsVoiceActive: (val: boolean) => void;
  fromAddress: string;
  toAddress: string;
  isEditingAddresses: boolean;
  setIsEditingAddresses: (val: boolean) => void;
  tempFromAddress: string;
  setTempFromAddress: (val: string) => void;
  tempToAddress: string;
  setTempToAddress: (val: string) => void;
  isGeocoding: boolean;
  handleSaveEditedAddresses: () => Promise<void>;
  routeSteps: any[];
  activeStepIndex: number;
  setActiveStepIndex: (val: number) => void;
  mapInstance: google.maps.Map | null;
  handleReset: () => void;
  fromCoords: google.maps.LatLngLiteral | null;
  toCoords: google.maps.LatLngLiteral | null;
  activeMode: "walk" | "commute" | "bicycle" | "motorcycle" | "car";
  setActiveMode: (mode: "walk" | "commute" | "bicycle" | "motorcycle" | "car") => void;
  isDiscounted: boolean;
  setIsDiscounted: (val: boolean) => void;
}

export default function LeftPanel({
  isSidebarOpen,
  showSplash,
  isDarkMode,
  setIsDarkMode,
  user,
  handleLogout,
  showUserDashboard,
  setShowUserDashboard,
  setSelectedStartPlace,
  setSelectedDestPlace,
  setIsWheelchairEnabled,
  setIsShadedEnabled,
  setIsRainEnabled,
  handleConfirmRoute,
  addToast,
  showConfirm,
  currentStep,
  isLoaded,
  selectedStartPlace,
  selectedDestPlace,
  isWheelchairEnabled,
  isShadedEnabled,
  isRainEnabled,
  setIsReportModalOpen,
  avoidedCount,
  routeInfo,
  isVoiceActive,
  setIsVoiceActive,
  fromAddress,
  toAddress,
  isEditingAddresses,
  setIsEditingAddresses,
  tempFromAddress,
  setTempFromAddress,
  tempToAddress,
  setTempToAddress,
  isGeocoding,
  handleSaveEditedAddresses,
  routeSteps,
  activeStepIndex,
  setActiveStepIndex,
  mapInstance,
  handleReset,
  fromCoords,
  toCoords,
  activeMode,
  setActiveMode,
  isDiscounted,
  setIsDiscounted,
}: LeftPanelProps) {
  return (
    <div
      className={`left-text-panel ${!isSidebarOpen ? "sidebar-collapsed" : ""}`}
      style={{ display: "flex", flexDirection: "column" }}
    >
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
                activeMode={activeMode}
                setActiveMode={setActiveMode}
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
                activeMode={activeMode}
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
              activeMode={activeMode}
              setActiveMode={setActiveMode}
              isDiscounted={isDiscounted}
              setIsDiscounted={setIsDiscounted}
            />
          )}
        </>
      )}
    </div>
  );
}
