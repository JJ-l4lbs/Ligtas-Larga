/// <reference types="google.maps" />
"use client";

import React, { useState, useEffect, useRef } from "react";

interface LocationPickerProps {
  isLoaded: boolean;
  onConfirmRoute: (
    fromCoords: google.maps.LatLngLiteral,
    toCoords: google.maps.LatLngLiteral,
    fromAddress: string,
    toAddress: string
  ) => void;
  user: { email: string; role: string } | null;
  onConfirmSavedRoute?: (
    fromCoords: google.maps.LatLngLiteral,
    toCoords: google.maps.LatLngLiteral,
    fromAddress: string,
    toAddress: string,
    travelMode: string
  ) => void;
  selectedStartPlace?: { lat: number; lng: number; address: string } | null;
  selectedDestPlace?: { lat: number; lng: number; address: string } | null;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  activeMode: "walk" | "commute" | "bicycle" | "motorcycle" | "car";
  setActiveMode: (mode: "walk" | "commute" | "bicycle" | "motorcycle" | "car") => void;
}

export default function LocationPicker({
  isLoaded,
  onConfirmRoute,
  user,
  onConfirmSavedRoute,
  selectedStartPlace,
  selectedDestPlace,
  showToast,
  showConfirm,
  activeMode,
  setActiveMode,
}: LocationPickerProps) {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromCoords, setFromCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [toCoords, setToCoords] = useState<google.maps.LatLngLiteral | null>(null);

  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");

  useEffect(() => {
    if (selectedStartPlace) {
      setFromText(selectedStartPlace.address);
      setFromAddress(selectedStartPlace.address);
      setFromCoords({ lat: selectedStartPlace.lat, lng: selectedStartPlace.lng });
    }
  }, [selectedStartPlace]);

  useEffect(() => {
    if (selectedDestPlace) {
      setToText(selectedDestPlace.address);
      setToAddress(selectedDestPlace.address);
      setToCoords({ lat: selectedDestPlace.lat, lng: selectedDestPlace.lng });
    }
  }, [selectedDestPlace]);

  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);

  const [isLocating, setIsLocating] = useState(false);

  // Saved places and routes states
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);

  // Inline saving states
  const [isSavingFrom, setIsSavingFrom] = useState(false);
  const [isSavingTo, setIsSavingTo] = useState(false);
  const [saveLabelFrom, setSaveLabelFrom] = useState("");
  const [saveLabelTo, setSaveLabelTo] = useState("");

  const sessionTokenRef = useRef<any>(null);

  const fetchSavedData = async () => {
    if (!user) return;
    try {
      const placesRes = await fetch("/api/saved-places");
      if (placesRes.ok) {
        const placesData = await placesRes.json();
        setSavedPlaces(placesData);
      }

      const routesRes = await fetch("/api/saved-routes");
      if (routesRes.ok) {
        const routesData = await routesRes.json();
        setSavedRoutes(routesData);
      }
    } catch (e) {
      console.error("Failed to load saved places/routes:", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedData();
    } else {
      setSavedPlaces([]);
      setSavedRoutes([]);
    }
  }, [user]);

  // Fetch suggestions for Start Location
  const fetchFromSuggestions = async (val: string) => {
    if (!val.trim() || !(window as any).google) {
      setFromSuggestions([]);
      return;
    }
    if (val === fromAddress) {
      setFromSuggestions([]);
      return;
    }
    try {
      const { AutocompleteService, PlacesServiceStatus } = (await google.maps.importLibrary("places")) as any;
      const service = new AutocompleteService();
      service.getPlacePredictions(
        {
          input: val,
          componentRestrictions: { country: "PH" },
        },
        (predictions: any, status: any) => {
          if (status === PlacesServiceStatus.OK && predictions) {
            setFromSuggestions(predictions);
          } else {
            setFromSuggestions([]);
          }
        }
      );
    } catch (e) {
      console.error("Error fetching start suggestions:", e);
    }
  };

  // Fetch suggestions for Destination
  const fetchToSuggestions = async (val: string) => {
    if (!val.trim() || !(window as any).google) {
      setToSuggestions([]);
      return;
    }
    if (val === toAddress) {
      setToSuggestions([]);
      return;
    }
    try {
      const { AutocompleteService, PlacesServiceStatus } = (await google.maps.importLibrary("places")) as any;
      const service = new AutocompleteService();
      service.getPlacePredictions(
        {
          input: val,
          componentRestrictions: { country: "PH" },
        },
        (predictions: any, status: any) => {
          if (status === PlacesServiceStatus.OK && predictions) {
            setToSuggestions(predictions);
          } else {
            setToSuggestions([]);
          }
        }
      );
    } catch (e) {
      console.error("Error fetching destination suggestions:", e);
    }
  };

  // Debounced search trigger for start input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFromSuggestions(fromText);
    }, 300);
    return () => clearTimeout(timer);
  }, [fromText]);

  // Debounced search trigger for destination input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchToSuggestions(toText);
    }, 300);
    return () => clearTimeout(timer);
  }, [toText]);

  // Handle selecting start location suggestion
  const handleSelectFrom = async (suggestion: any) => {
    const text = suggestion.description;
    setFromText(text);
    setFromAddress(text);
    setFromSuggestions([]);

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          setFromCoords({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        }
      });
    } catch (e) {
      console.error("Error fetching details for start location:", e);
    }
  };

  // Handle selecting destination suggestion
  const handleSelectTo = async (suggestion: any) => {
    const text = suggestion.description;
    setToText(text);
    setToAddress(text);
    setToSuggestions([]);

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          setToCoords({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        }
      });
    } catch (e) {
      console.error("Error fetching details for destination:", e);
    }
  };

  // HTML5 Geolocation logic
  const handleLocateMe = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFromCoords({ lat, lng });

        if ((window as any).google) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              setFromText(address);
              setFromAddress(address);
            } else {
              const simpleAddress = `My Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
              setFromText(simpleAddress);
              setFromAddress(simpleAddress);
            }
            setIsLocating(false);
          });
        } else {
          const simpleAddress = `My Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          setFromText(simpleAddress);
          setFromAddress(simpleAddress);
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        showToast("Unable to retrieve your location. Please type it manually.", "warning");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Swap locations logic
  const handleSwap = (e: React.MouseEvent) => {
    e.preventDefault();
    const tempText = fromText;
    const tempAddress = fromAddress;
    const tempCoords = fromCoords;

    setFromText(toText);
    setFromAddress(toAddress);
    setFromCoords(toCoords);

    setToText(tempText);
    setToAddress(tempAddress);
    setToCoords(tempCoords);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(window as any).google) return;

    let finalFromCoords = fromCoords;
    let finalToCoords = toCoords;
    let finalFromAddress = fromAddress || fromText;
    let finalToAddress = toAddress || toText;

    const geocoder = new google.maps.Geocoder();

    const geocodeAddress = (address: string): Promise<google.maps.LatLngLiteral | null> => {
      return new Promise((resolve) => {
        geocoder.geocode({ address, componentRestrictions: { country: "PH" } }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]?.geometry?.location) {
            resolve({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            });
          } else {
            resolve(null);
          }
        });
      });
    };

    if (!finalFromCoords && fromText) {
      const coords = await geocodeAddress(fromText);
      if (coords) {
        finalFromCoords = coords;
        finalFromAddress = fromText;
      }
    }

    if (!finalToCoords && toText) {
      const coords = await geocodeAddress(toText);
      if (coords) {
        finalToCoords = coords;
        finalToAddress = toText;
      }
    }

    if (!finalFromCoords && fromText) {
      finalFromCoords = { lat: 14.5995, lng: 120.9842 }; // Manila City Hall fallback
      finalFromAddress = fromText;
    }
    if (!finalToCoords && toText) {
      finalToCoords = { lat: 14.5674, lng: 120.9932 }; // DLSU Taft fallback
      finalToAddress = toText;
    }

    if (finalFromCoords && finalToCoords) {
      sessionTokenRef.current = null;
      onConfirmRoute(finalFromCoords, finalToCoords, finalFromAddress, finalToAddress);
    }
  };

  if (!isLoaded) return null;

  const isSubmitDisabled = !fromText.trim() || !toText.trim();

  return (
    <div
      style={{
        padding: "24px 24px 12px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text-on-app-left)" }}>Where are you heading?</h2>
        <p style={{ fontSize: "12px", color: "var(--text-on-app-left-secondary)" }}>Plan a route bypassing active local hazards</p>
      </div>

      {/* Travel Mode Selector Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "var(--bg-input-light)",
          borderRadius: "12px",
          padding: "4px",
          border: "1.5px solid var(--border-subtle)",
        }}
      >
        {[
          { id: "walk", label: "Walk", icon: "/mode-walk.svg" },
          { id: "commute", label: "Commute", icon: "/mode-commute.svg" },
          { id: "bicycle", label: "Cycle", icon: "/mode-bicycle.svg" },
          { id: "motorcycle", label: "Moto", icon: "/mode-motorcycle.svg" },
          { id: "car", label: "Car", icon: "/mode-car.svg" },
        ].map((mode) => {
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveMode(mode.id as any)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "8px 4px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isActive ? "var(--accent-accessibility)" : "transparent",
                color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              <div style={{
                width: "16px",
                height: "16px",
                backgroundColor: isActive ? "#FFFFFF" : "var(--text-secondary)",
                WebkitMaskImage: `url(${mode.icon})`,
                maskImage: `url(${mode.icon})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                transition: "background-color 0.2s",
              }} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Start Location Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-on-app-left-secondary)" }}>START LOCATION</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search start address..."
              value={fromText}
              onChange={(e) => {
                const val = e.target.value;
                setFromText(val);
                if (val !== fromAddress) {
                  setFromCoords(null);
                }
              }}
              style={{
                width: "100%",
                borderRadius: "10px",
                border: "1.5px solid var(--border-subtle)",
                backgroundColor: "var(--bg-input-light)",
                color: "var(--text-input-typed)",
                padding: "12px 42px 12px 14px",
                outline: "none",
                fontSize: "14px",
              }}
            />
            <button
              type="button"
              onClick={handleLocateMe}
              className="btn-interactive"
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: isLocating ? "var(--accent-accessibility)" : "var(--text-secondary)",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
              }}
              title="Use current location"
              disabled={isLocating}
            >
              {isLocating ? (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "2.5px solid var(--accent-accessibility)",
                    borderTopColor: "transparent",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
              ) : (
                <img src="/current-loc.svg" alt="Current Location" style={{ width: "24px", height: "24px", filter: "invert(var(--theme-icon-invert, 0))" }} />
              )}
            </button>
          </div>

          {/* Inline Save Place widget for origin */}
          {fromCoords && user && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px" }}>
              {!isSavingFrom ? (
                <button
                  type="button"
                  onClick={() => setIsSavingFrom(true)}
                  className="btn-interactive"
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--accent-accessibility)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "2px 0",
                  }}
                >
                  ⭐ Save this location to profile
                </button>
              ) : (
                <div style={{ display: "flex", gap: "6px", alignItems: "center", width: "100%" }}>
                  <input
                    type="text"
                    placeholder="e.g. Home, School"
                    value={saveLabelFrom}
                    onChange={(e) => setSaveLabelFrom(e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1.5px solid var(--border-subtle)",
                      fontSize: "11px",
                      backgroundColor: "var(--bg-input-light)",
                      color: "var(--text-input-typed)",
                      flex: 1,
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!saveLabelFrom.trim()) return;
                      try {
                        const res = await fetch("/api/saved-places", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            label: saveLabelFrom,
                            address: fromText,
                            latitude: fromCoords.lat,
                            longitude: fromCoords.lng,
                          }),
                        });
                        if (res.ok) {
                          showToast(`Location "${saveLabelFrom}" successfully saved!`, "success");
                          setSaveLabelFrom("");
                          setIsSavingFrom(false);
                          fetchSavedData();
                        } else {
                          const errData = await res.json();
                          showToast(errData.error || "Failed to save location.", "error");
                        }
                      } catch (err: any) {
                        showToast(`Error saving location: ${err.message}`, "error");
                      }
                    }}
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "var(--accent-accessibility)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSavingFrom(false)}
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "rgba(0,0,0,0.05)",
                      color: "var(--text-secondary)",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {fromSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "4px",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "10px",
                zIndex: 1000,
                maxHeight: "180px",
                overflowY: "auto",
                boxShadow: "var(--shadow-glass)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              {fromSuggestions.map((s: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleSelectFrom(s)}
                  style={{
                    padding: "12px 14px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    borderBottom: idx === fromSuggestions.length - 1 ? "none" : "1px solid var(--border-glass)",
                    transition: "background-color 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>📍</span>
                  <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {s.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Swap Button Row */}
        <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0" }}>
          <button
            type="button"
            onClick={handleSwap}
            className="btn-interactive"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1.5px solid var(--border-subtle)",
              backgroundColor: "var(--bg-input-light)",
              color: "var(--accent-accessibility)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "var(--shadow-glass)",
              fontSize: "16px",
              zIndex: 5,
            }}
            title="Swap locations"
          >
            ⇅
          </button>
        </div>

        {/* Destination Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-on-app-left-secondary)" }}>DESTINATION</label>
          <input
            type="text"
            placeholder="Search destination..."
            value={toText}
            onChange={(e) => {
              const val = e.target.value;
              setToText(val);
              if (val !== toAddress) {
                setToCoords(null);
              }
            }}
            style={{
              width: "100%",
              borderRadius: "10px",
              border: "1.5px solid var(--border-subtle)",
              backgroundColor: "var(--bg-input-light)",
              color: "var(--text-input-typed)",
              padding: "12px 14px",
              outline: "none",
              fontSize: "14px",
            }}
          />

          {/* Inline Save Place widget for destination */}
          {toCoords && user && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px" }}>
              {!isSavingTo ? (
                <button
                  type="button"
                  onClick={() => setIsSavingTo(true)}
                  className="btn-interactive"
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--accent-accessibility)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "2px 0",
                  }}
                >
                  ⭐ Save this destination to profile
                </button>
              ) : (
                <div style={{ display: "flex", gap: "6px", alignItems: "center", width: "100%" }}>
                  <input
                    type="text"
                    placeholder="e.g. Work, Gym"
                    value={saveLabelTo}
                    onChange={(e) => setSaveLabelTo(e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1.5px solid var(--border-subtle)",
                      fontSize: "11px",
                      backgroundColor: "var(--bg-input-light)",
                      color: "var(--text-input-typed)",
                      flex: 1,
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!saveLabelTo.trim()) return;
                      try {
                        const res = await fetch("/api/saved-places", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            label: saveLabelTo,
                            address: toText,
                            latitude: toCoords.lat,
                            longitude: toCoords.lng,
                          }),
                        });
                        if (res.ok) {
                          showToast(`Destination "${saveLabelTo}" successfully saved!`, "success");
                          setSaveLabelTo("");
                          setIsSavingTo(false);
                          fetchSavedData();
                        } else {
                          const errData = await res.json();
                          showToast(errData.error || "Failed to save destination.", "error");
                        }
                      } catch (err: any) {
                        showToast(`Error saving destination: ${err.message}`, "error");
                      }
                    }}
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "var(--accent-accessibility)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSavingTo(false)}
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "rgba(0,0,0,0.05)",
                      color: "var(--text-secondary)",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {toSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "4px",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "10px",
                zIndex: 1000,
                maxHeight: "180px",
                overflowY: "auto",
                boxShadow: "var(--shadow-glass)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              {toSuggestions.map((s: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleSelectTo(s)}
                  style={{
                    padding: "12px 14px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    borderBottom: idx === toSuggestions.length - 1 ? "none" : "1px solid var(--border-glass)",
                    transition: "background-color 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>📍</span>
                  <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {s.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Places Quick Actions Row */}
        {user && savedPlaces.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-on-app-left-secondary)" }}>SAVED PLACES</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {savedPlaces.map((place) => (
                <div
                  key={place.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: "var(--bg-input-light)",
                    border: "1.5px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "4px 8px",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)" }}>
                    📍 {place.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFromText(place.address);
                      setFromAddress(place.address);
                      setFromCoords({ lat: place.latitude, lng: place.longitude });
                    }}
                    style={{
                      border: "none",
                      backgroundColor: "rgba(21, 128, 61, 0.1)",
                      color: "#15803D",
                      fontSize: "9px",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setToText(place.address);
                      setToAddress(place.address);
                      setToCoords({ lat: place.latitude, lng: place.longitude });
                    }}
                    style={{
                      border: "none",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      color: "#EF4444",
                      fontSize: "9px",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Dest
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showConfirm(
                        "Delete Saved Place",
                        `Are you sure you want to remove your saved place "${place.label}"?`,
                        async () => {
                          try {
                            const res = await fetch(`/api/saved-places?id=${place.id}`, { method: "DELETE" });
                            if (res.ok) {
                              showToast(`Removed saved place "${place.label}".`, "info");
                              fetchSavedData();
                            } else {
                              showToast("Failed to delete place.", "error");
                            }
                          } catch (err: any) {
                            showToast(err.message, "error");
                          }
                        }
                      );
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      padding: "0 2px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Routes Section */}
        {user && savedRoutes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-on-app-left-secondary)" }}>SAVED ROUTES</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {savedRoutes.map((route) => (
                <div
                  key={route.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "var(--bg-input-light)",
                    border: "1.5px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                  }}
                >
                  <div
                    onClick={() => {
                      if (onConfirmSavedRoute) {
                        onConfirmSavedRoute(
                          { lat: route.fromLatitude, lng: route.fromLongitude },
                          { lat: route.toLatitude, lng: route.toLongitude },
                          route.fromAddress,
                          route.toAddress,
                          route.travelMode
                        );
                      } else {
                        setFromText(route.fromAddress);
                        setFromAddress(route.fromAddress);
                        setFromCoords({ lat: route.fromLatitude, lng: route.fromLongitude });
                        setToText(route.toAddress);
                        setToAddress(route.toAddress);
                        setToCoords({ lat: route.toLatitude, lng: route.toLongitude });
                      }
                    }}
                    style={{ cursor: "pointer", flex: 1, overflow: "hidden" }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block" }}>
                      ⭐ {route.label}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {route.fromAddress.split(",")[0]} → {route.toAddress.split(",")[0]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showConfirm(
                        "Delete Saved Route",
                        `Are you sure you want to remove your saved route "${route.label}"?`,
                        async () => {
                          try {
                            const res = await fetch(`/api/saved-routes?id=${route.id}`, { method: "DELETE" });
                            if (res.ok) {
                              showToast(`Removed saved route "${route.label}".`, "info");
                              fetchSavedData();
                            } else {
                              showToast("Failed to delete route.", "error");
                            }
                          } catch (err: any) {
                            showToast(err.message, "error");
                          }
                        }
                      );
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--text-muted)",
                      fontSize: "14px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      padding: "0 6px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="btn-interactive"
          style={{
            marginTop: "8px",
            padding: "14px",
            borderRadius: "10px",
            border: "none",
            background: isSubmitDisabled
              ? "rgba(255, 255, 255, 0.05)"
              : "linear-gradient(135deg, var(--accent-accessibility), var(--accent-rain))",
            color: isSubmitDisabled ? "var(--text-secondary)" : "#ffffff",
            fontWeight: 700,
            fontSize: "14px",
            cursor: isSubmitDisabled ? "not-allowed" : "pointer",
            boxShadow: "var(--shadow-glass)",
          }}
        >
          Calculate Safe Route
        </button>
      </form>
    </div>
  );
}
