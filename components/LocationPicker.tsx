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
}

export default function LocationPicker({ isLoaded, onConfirmRoute }: LocationPickerProps) {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromCoords, setFromCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [toCoords, setToCoords] = useState<google.maps.LatLngLiteral | null>(null);

  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");

  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);

  const sessionTokenRef = useRef<any>(null);

  // Fetch suggestions for Start Location
  const fetchFromSuggestions = async (val: string) => {
    if (!val.trim() || !(window as any).google) {
      setFromSuggestions([]);
      return;
    }
    // If the input exactly matches the selected address, don't query
    if (val === fromAddress) {
      setFromSuggestions([]);
      return;
    }
    try {
      const { AutocompleteSessionToken, AutocompleteSuggestion } = (await google.maps.importLibrary(
        "places"
      )) as any;
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }
      const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: val,
        sessionToken: sessionTokenRef.current,
      });
      setFromSuggestions(response.suggestions || []);
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
    // If the input exactly matches the selected address, don't query
    if (val === toAddress) {
      setToSuggestions([]);
      return;
    }
    try {
      const { AutocompleteSessionToken, AutocompleteSuggestion } = (await google.maps.importLibrary(
        "places"
      )) as any;
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }
      const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: val,
        sessionToken: sessionTokenRef.current,
      });
      setToSuggestions(response.suggestions || []);
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
    const text = suggestion.placePrediction.text.text;
    setFromText(text);
    setFromAddress(text);
    setFromSuggestions([]);

    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({ fields: ["location"] });
      if (place.location) {
        setFromCoords({
          lat: place.location.lat(),
          lng: place.location.lng(),
        });
      }
    } catch (e) {
      console.error("Error fetching details for start location:", e);
    }
  };

  // Handle selecting destination suggestion
  const handleSelectTo = async (suggestion: any) => {
    const text = suggestion.placePrediction.text.text;
    setToText(text);
    setToAddress(text);
    setToSuggestions([]);

    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({ fields: ["location"] });
      if (place.location) {
        setToCoords({
          lat: place.location.lat(),
          lng: place.location.lng(),
        });
      }
    } catch (e) {
      console.error("Error fetching details for destination:", e);
    }
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
        geocoder.geocode({ address }, (results, status) => {
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

    // Local testing fallback
    if (!finalFromCoords && fromText) {
      finalFromCoords = { lat: 14.5995, lng: 120.9842 }; // Manila City Hall
      finalFromAddress = fromText;
    }
    if (!finalToCoords && toText) {
      finalToCoords = { lat: 14.5674, lng: 120.9932 }; // DLSU Taft
      finalToAddress = toText;
    }

    if (finalFromCoords && finalToCoords) {
      // Clear session token for the next route search
      sessionTokenRef.current = null;
      onConfirmRoute(finalFromCoords, finalToCoords, finalFromAddress, finalToAddress);
    }
  };

  if (!isLoaded) return null;

  const isSubmitDisabled = !fromText.trim() || !toText.trim();

  return (
    <div
      className="glass-panel"
      style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        right: "5%",
        zIndex: 100,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        pointerEvents: "auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px" }}>Where are you heading?</h2>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Plan a route bypassing active local hazards</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Start Location Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>START LOCATION</label>
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
              border: "1px solid var(--border-glass)",
              backgroundColor: "rgba(11, 15, 25, 0.5)",
              color: "#ffffff",
              padding: "12px 14px",
              outline: "none",
              fontSize: "14px",
            }}
          />
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
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    borderBottom: idx === fromSuggestions.length - 1 ? "none" : "1px solid var(--border-glass)",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {s.placePrediction.text.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Destination Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>DESTINATION</label>
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
              border: "1px solid var(--border-glass)",
              backgroundColor: "rgba(11, 15, 25, 0.5)",
              color: "#ffffff",
              padding: "12px 14px",
              outline: "none",
              fontSize: "14px",
            }}
          />
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
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    borderBottom: idx === toSuggestions.length - 1 ? "none" : "1px solid var(--border-glass)",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {s.placePrediction.text.text}
                </div>
              ))}
            </div>
          )}
        </div>

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
          }}
        >
          Calculate Safe Route
        </button>
      </form>
    </div>
  );
}
