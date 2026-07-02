"use client";

import React, { useState, useEffect } from "react";

interface SavedPlace {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

interface SavedRoute {
  id: string;
  label: string;
  fromAddress: string;
  toAddress: string;
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  travelMode: string;
  createdAt: string;
}

interface UserProfileDashboardProps {
  user: { email: string; role: string } | null;
  onClose: () => void;
  onSelectPlace: (lat: number, lng: number, address: string, type: "from" | "to") => void;
  onSelectRoute: (
    fromC: google.maps.LatLngLiteral,
    toC: google.maps.LatLngLiteral,
    fromAdd: string,
    toAdd: string,
    travelMode: string
  ) => void;
  onAccountDeleted: () => void;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export default function UserProfileDashboard({
  user,
  onClose,
  onSelectPlace,
  onSelectRoute,
  onAccountDeleted,
  showToast,
  showConfirm,
}: UserProfileDashboardProps) {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedData = async () => {
    if (!user) return;
    try {
      const placesRes = await fetch("/api/saved-places");
      const routesRes = await fetch("/api/saved-routes");

      if (placesRes.ok) {
        const placesData = await placesRes.json();
        setSavedPlaces(placesData);
      }
      if (routesRes.ok) {
        const routesData = await routesRes.json();
        setSavedRoutes(routesData);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedData();
  }, [user]);

  const handleDeletePlace = (id: string, label: string) => {
    showConfirm(
      "Delete Saved Place",
      `Are you sure you want to permanently delete "${label}"?`,
      async () => {
        try {
          const res = await fetch(`/api/saved-places?id=${id}`, { method: "DELETE" });
          if (res.ok) {
            setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
            showToast(`Place "${label}" successfully removed.`, "info");
          } else {
            showToast("Failed to delete place.", "error");
          }
        } catch (err: any) {
          showToast(err.message || "Failed to delete place.", "error");
        }
      }
    );
  };

  const handleDeleteRoute = (id: string, label: string) => {
    showConfirm(
      "Delete Saved Route",
      `Are you sure you want to permanently delete route "${label}"?`,
      async () => {
        try {
          const res = await fetch(`/api/saved-routes?id=${id}`, { method: "DELETE" });
          if (res.ok) {
            setSavedRoutes((prev) => prev.filter((r) => r.id !== id));
            showToast(`Route "${label}" successfully removed.`, "info");
          } else {
            showToast("Failed to delete route.", "error");
          }
        } catch (err: any) {
          showToast(err.message || "Failed to delete route.", "error");
        }
      }
    );
  };

  const handleDeleteAccount = () => {
    showConfirm(
      "⚠️ Delete Account Permanent",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      () => {
        showConfirm(
          "⚠️ Final Confirmation Required",
          "This will delete your commuter profile, all saved places, and all saved routes. Proceed?",
          async () => {
            try {
              const res = await fetch("/api/auth/me", { method: "DELETE" });
              if (res.ok) {
                showToast("Account successfully deleted. Returning to planner.", "success");
                onAccountDeleted();
              } else {
                const data = await res.json();
                showToast(data.error || "Failed to delete account.", "error");
              }
            } catch (err: any) {
              showToast("Error deleting account: " + err.message, "error");
            }
          }
        );
      }
    );
  };

  if (!user) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <h3>Please log in to view your profile dashboard.</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "24px",
        height: "100%",
        backgroundColor: "var(--bg-primary)",
        overflowY: "auto",
        pointerEvents: "auto",
      }}
    >
      {/* Dashboard Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1.5px solid var(--border-subtle)",
          paddingBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "22px" }}>👤</span>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-on-app-left)" }}>My Commuter Profile</h2>
        </div>
        <button
          onClick={onClose}
          className="btn-interactive"
          style={{
            border: "none",
            background: "none",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            color: "var(--text-on-app-left-secondary)",
            padding: "4px 8px",
          }}
          title="Back to planner"
        >
          ✕
        </button>
      </div>

      {/* User Information Card */}
      <div
        className="glass-panel"
        style={{
          padding: "16px 20px",
          backgroundColor: "var(--bg-card)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.5px" }}>
            ACCOUNT DETAILS
          </span>
        </div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
          Email: <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{user.email}</span>
        </div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
          Role:{" "}
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              backgroundColor: user.role === "ADMIN" ? "#FFE4E6" : "#DCFCE7",
              color: user.role === "ADMIN" ? "#9F1239" : "#15803D",
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            {user.role}
          </span>
        </div>
      </div>

      {/* Saved Places Manager */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-on-app-left-secondary)", letterSpacing: "0.5px" }}>
          SAVED PLACES ({savedPlaces.length})
        </h3>
        {loading ? (
          <p style={{ fontSize: "12px", color: "var(--text-on-app-left-muted)" }}>Loading places...</p>
        ) : savedPlaces.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: "24px 16px",
              textAlign: "center",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>No saved places yet.</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              Search locations on the main screen to save them!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="glass-panel"
                style={{
                  padding: "14px 16px",
                  backgroundColor: "var(--bg-card)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>📍 {place.label}</h4>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      marginTop: "2px",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                    title={place.address}
                  >
                    {place.address}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    onClick={() => onSelectPlace(place.latitude, place.longitude, place.address, "from")}
                    className="btn-interactive"
                    style={{
                      padding: "4px 8px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "rgba(21, 128, 61, 0.05)",
                      color: "#15803D",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Start
                  </button>
                  <button
                    onClick={() => onSelectPlace(place.latitude, place.longitude, place.address, "to")}
                    className="btn-interactive"
                    style={{
                      padding: "4px 8px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "rgba(239, 68, 68, 0.05)",
                      color: "#EF4444",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Dest
                  </button>
                  <button
                    onClick={() => handleDeletePlace(place.id, place.label)}
                    className="btn-interactive"
                    style={{
                      padding: "4px 8px",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "var(--text-muted)",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Routes Manager */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-on-app-left-secondary)", letterSpacing: "0.5px" }}>
          SAVED ROUTES ({savedRoutes.length})
        </h3>
        {loading ? (
          <p style={{ fontSize: "12px", color: "var(--text-on-app-left-muted)" }}>Loading routes...</p>
        ) : savedRoutes.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: "24px 16px",
              textAlign: "center",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>No saved routes yet.</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              Plan and calculate a route, then click "Save Route" to keep it!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {savedRoutes.map((route) => (
              <div
                key={route.id}
                className="glass-panel"
                style={{
                  padding: "14px 16px",
                  backgroundColor: "var(--bg-card)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  onClick={() =>
                    onSelectRoute(
                      { lat: route.fromLatitude, lng: route.fromLongitude },
                      { lat: route.toLatitude, lng: route.toLongitude },
                      route.fromAddress,
                      route.toAddress,
                      route.travelMode
                    )
                  }
                  style={{ flex: 1, cursor: "pointer", overflow: "hidden" }}
                >
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>⭐ {route.label}</h4>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      marginTop: "2px",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    From: {route.fromAddress.split(",")[0]}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      marginTop: "1px",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    To: {route.toAddress.split(",")[0]}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <button
                    onClick={() => handleDeleteRoute(route.id, route.label)}
                    className="btn-interactive"
                    style={{
                      padding: "4px 8px",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "var(--text-muted)",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone: Delete Account */}
      <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1.5px dashed rgba(239, 68, 68, 0.2)" }}>
        <button
          onClick={handleDeleteAccount}
          className="btn-interactive"
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1.5px solid rgba(239, 68, 68, 0.4)",
            backgroundColor: "rgba(239, 68, 68, 0.05)",
            color: "#EF4444",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>⚠️ Delete My Account Permanently</span>
        </button>
      </div>
    </div>
  );
}
