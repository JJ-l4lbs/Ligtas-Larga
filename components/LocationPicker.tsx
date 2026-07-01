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

  const fromContainerRef = useRef<HTMLDivElement | null>(null);
  const toContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLoaded || !(window as any).google) return;

    let fromEl: any = null;
    let toEl: any = null;

    const setupAutocomplete = async () => {
      const { PlaceAutocompleteElement } = (await google.maps.importLibrary(
        "places"
      )) as any;

      // 1. Setup Start Autocomplete using the new Places API (New) Autocomplete element
      fromEl = new PlaceAutocompleteElement();
      fromEl.style.width = "100%";
      fromEl.style.display = "block";
      
      const fromInput = document.createElement("input");
      fromInput.setAttribute("slot", "input");
      fromInput.placeholder = "Search start address...";
      fromInput.style.width = "100%";
      fromInput.style.borderRadius = "10px";
      fromInput.style.border = "none";
      fromInput.style.backgroundColor = "transparent";
      fromInput.style.color = "#ffffff";
      fromInput.style.padding = "12px 14px";
      fromInput.style.outline = "none";
      fromEl.appendChild(fromInput);
      
      if (fromContainerRef.current) {
        fromContainerRef.current.innerHTML = "";
        fromContainerRef.current.appendChild(fromEl);
      }

      fromEl.addEventListener("gmp-placeselect", async (e: any) => {
        const place = e.place;
        if (place) {
          try {
            await place.fetchFields({
              fields: ["displayName", "formattedAddress", "location"],
            });
            if (place.location) {
              const coords = {
                lat: place.location.lat(),
                lng: place.location.lng(),
              };
              setFromCoords(coords);
              const addr = place.formattedAddress || place.displayName || "";
              setFromAddress(addr);
              setFromText(addr);
            }
          } catch (err) {
            console.error("Error fetching start location place fields:", err);
          }
        }
      });

      // 2. Setup Destination Autocomplete using the new Places API (New) Autocomplete element
      toEl = new PlaceAutocompleteElement();
      toEl.style.width = "100%";
      toEl.style.display = "block";

      const toInput = document.createElement("input");
      toInput.setAttribute("slot", "input");
      toInput.placeholder = "Search destination...";
      toInput.style.width = "100%";
      toInput.style.borderRadius = "10px";
      toInput.style.border = "none";
      toInput.style.backgroundColor = "transparent";
      toInput.style.color = "#ffffff";
      toInput.style.padding = "12px 14px";
      toInput.style.outline = "none";
      toEl.appendChild(toInput);

      if (toContainerRef.current) {
        toContainerRef.current.innerHTML = "";
        toContainerRef.current.appendChild(toEl);
      }

      toEl.addEventListener("gmp-placeselect", async (e: any) => {
        const place = e.place;
        if (place) {
          try {
            await place.fetchFields({
              fields: ["displayName", "formattedAddress", "location"],
            });
            if (place.location) {
              const coords = {
                lat: place.location.lat(),
                lng: place.location.lng(),
              };
              setToCoords(coords);
              const addr = place.formattedAddress || place.displayName || "";
              setToAddress(addr);
              setToText(addr);
            }
          } catch (err) {
            console.error("Error fetching destination location place fields:", err);
          }
        }
      });
    };

    setupAutocomplete();
  }, [isLoaded]);

  // Listen to input text bubbling up from custom elements shadow DOM
  useEffect(() => {
    const handleFromInput = (e: any) => {
      const val = e.target.value || "";
      setFromText(val);
      if (val !== fromAddress) {
        setFromCoords(null);
      }
    };

    const handleToInput = (e: any) => {
      const val = e.target.value || "";
      setToText(val);
      if (val !== toAddress) {
        setToCoords(null);
      }
    };

    const fromDiv = fromContainerRef.current;
    const toDiv = toContainerRef.current;

    if (fromDiv) fromDiv.addEventListener("input", handleFromInput);
    if (toDiv) toDiv.addEventListener("input", handleToInput);

    return () => {
      if (fromDiv) fromDiv.removeEventListener("input", handleFromInput);
      if (toDiv) toDiv.removeEventListener("input", handleToInput);
    };
  }, [fromAddress, toAddress]);

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

    // local testing fallback
    if (!finalFromCoords && fromText) {
      finalFromCoords = { lat: 14.5995, lng: 120.9842 }; // Manila City Hall
      finalFromAddress = fromText;
    }
    if (!finalToCoords && toText) {
      finalToCoords = { lat: 14.5674, lng: 120.9932 }; // DLSU Taft
      finalToAddress = toText;
    }

    if (finalFromCoords && finalToCoords) {
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>START LOCATION</label>
          <div
            ref={fromContainerRef}
            className="autocomplete-container"
            style={{
              borderRadius: "10px",
              border: "1px solid var(--border-glass)",
              backgroundColor: "rgba(11, 15, 25, 0.5)",
              color: "#ffffff",
              fontSize: "14px",
              overflow: "hidden",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>DESTINATION</label>
          <div
            ref={toContainerRef}
            className="autocomplete-container"
            style={{
              borderRadius: "10px",
              border: "1px solid var(--border-glass)",
              backgroundColor: "rgba(11, 15, 25, 0.5)",
              color: "#ffffff",
              fontSize: "14px",
              overflow: "hidden",
            }}
          />
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
