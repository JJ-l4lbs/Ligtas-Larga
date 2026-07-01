/// <reference types="google.maps" />
import { useEffect, useState } from "react";

export const defaultCenter = {
  lat: 14.5995,
  lng: 120.9842,
};

// Custom Google Maps Loader Hook (Singleton to prevent double-injection warnings)
let globalLoadPromise: Promise<void> | null = null;

export function useGoogleMapsLoader(apiKey: string) {
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

// Distance helper (Haversine)
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
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

export function formatDuration(durationStr: string) {
  const seconds = parseInt(durationStr.replace("s", ""), 10);
  if (isNaN(seconds)) return "";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return remMins > 0 ? `${hours} hr ${remMins} mins` : `${hours} hr`;
}

export const lightMapStyle = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#F1F5F9" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#E2E8F0" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#CBD5E1" }]
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

export const darkMapStyle = [
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
