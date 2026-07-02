/// <reference types="google.maps" />
"use client";


import React, { useState } from "react";

interface HazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapCenter: google.maps.LatLngLiteral;
  onReportAdded: () => void;
  user: { email: string; role: string } | null;
}

export default function HazardModal({ isOpen, onClose, mapCenter, onReportAdded, user }: HazardModalProps) {
  const [category, setCategory] = useState("FLOOD");
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [base64Image, setBase64Image] = useState<string | null>(null);
  
  // App states
  const [step, setStep] = useState(1); // 1 = Form, 2 = Loading/Validating, 3 = Success, 4 = Error
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = user?.role === "ADMIN";
    if (!base64Image && !isAdmin) {
      setErrorMessage("Please select or snap a photo for verification.");
      setStep(4);
      return;
    }

    setStep(2);
    setLoadingMessage(base64Image ? "Verifying photo with Hugging Face Inference API..." : "Initializing direct placement...");

    try {
      let isValidated = user ? true : false;
      let visionLabels = "[]";

      if (base64Image) {
        // 1. Verify photo via Vision route
        const visionRes = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image, category }),
        });

        if (!visionRes.ok) {
          throw new Error("AI Verification service returned an error. Please try again.");
        }

        const visionData = await visionRes.json();

        if (!visionData.isValidated && !isAdmin) {
          setErrorMessage("Verification Failed: AI labels do not match selected category.");
          setStep(4);
          return;
        }

        isValidated = isAdmin || visionData.isValidated;
        visionLabels = JSON.stringify(visionData.labels);
      } else {
        isValidated = true;
        visionLabels = JSON.stringify(["admin_placed_directly"]);
      }

      setLoadingMessage("Saving hazard report to database...");

      // 2. Submit report (validated instantly only if user is logged in)
      const reportRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
          category,
          severity,
          description,
          imageUrl: base64Image || "/placeholder-hazard.png", // fallback image url for direct admin placement
          isValidated,
          visionLabels,
        }),
      });

      if (!reportRes.ok) {
        throw new Error("Failed to save report to database.");
      }

      setStep(3);
      onReportAdded();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during submission.");
      setStep(4);
    }
  };

  const handleResetForm = () => {
    setCategory("FLOOD");
    setSeverity("MEDIUM");
    setDescription("");
    setBase64Image(null);
    setStep(1);
    setErrorMessage("");
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        backgroundColor: "rgba(11, 15, 25, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        pointerEvents: "auto",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "450px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {step === 1 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Report Local Hazard</h2>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Report will be plotted at coordinates: {mapCenter.lat.toFixed(5)}, {mapCenter.lng.toFixed(5)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn-interactive"
                style={{
                  border: "none",
                  background: "none",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  padding: "4px 8px",
                  lineHeight: 1,
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Session Queue Warning Indicator */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "11px",
                lineHeight: "1.4",
                fontWeight: 600,
                backgroundColor: user ? "#DCFCE7" : "#FEF3C7",
                color: user ? "#15803D" : "#B45309",
                border: `1px solid ${user ? "rgba(21,128,61,0.2)" : "rgba(180,83,9,0.2)"}`,
              }}
            >
              {user ? (
                <span>
                  ✅ Posting as <strong>{user.email}</strong>. Your report will be instantly published if verified by the AI.
                </span>
              ) : (
                <span>
                  ℹ️ You are posting anonymously. Your report will go into the review queue and won't appear on the map until approved by an admin.
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>HAZARD TYPE</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-glass)",
                    backgroundColor: "var(--bg-primary)",
                    color: "#ffffff",
                    outline: "none",
                  }}
                >
                  <option value="FLOOD">Flooding / Water Blockage</option>
                  <option value="OBSTACLE">Construction / Sidewalk Obstacle</option>
                  <option value="ELEVATOR_BROKEN">Broken Elevator / Escalator</option>
                  <option value="RAMP_BLOCKED">Blocked Wheelchair Ramp</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>SEVERITY</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-glass)",
                    backgroundColor: "var(--bg-primary)",
                    color: "#ffffff",
                    outline: "none",
                  }}
                >
                  <option value="LOW">Low - Minor Inconvenience</option>
                  <option value="MEDIUM">Medium - Partial Obstruction</option>
                  <option value="HIGH">High - Fully Blocked / Dangerous</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>DESCRIPTION</label>
                <textarea
                  placeholder="Describe the hazard details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-glass)",
                    backgroundColor: "var(--bg-primary)",
                    color: "#ffffff",
                    height: "80px",
                    resize: "none",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>VERIFICATION PHOTO</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="hazard-image-file"
                />
                <label
                  htmlFor="hazard-image-file"
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px dashed var(--border-glass)",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    fontSize: "13px",
                  }}
                >
                  {base64Image ? "📸 Photo Attached" : "📁 Choose Photo / Take Picture"}
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-interactive"
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, var(--severity-medium), var(--severity-high))",
                    color: "#ffffff",
                    fontWeight: 700,
                  }}
                >
                  Verify & Post
                </button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div
              className="pulse-hazard"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "var(--severity-medium)",
                margin: "0 auto 24px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              🔄
            </div>
            <h3>AI Verification in Progress</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "8px" }}>{loadingMessage}</p>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center", padding: "45px 20px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: user ? "rgba(16, 185, 129, 0.2)" : "rgba(30, 144, 255, 0.2)",
                color: user ? "#10b981" : "#1e90ff",
                border: `2px solid ${user ? "#10b981" : "#1e90ff"}`,
                margin: "0 auto 24px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              {user ? "✓" : "📥"}
            </div>
            <h3>{user ? "Validated & Plotted!" : "Submitted for Review!"}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "8px" }}>
              {user 
                ? "The report successfully passed AI verification and is now active on the map."
                : "Your report passed AI verification and is queued for admin moderation before going live."
              }
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: "24px",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#10b981",
                color: "#ffffff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: "center", padding: "45px 20px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                color: "var(--severity-high)",
                border: "2px solid var(--severity-high)",
                margin: "0 auto 24px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              ❌
            </div>
            <h3>Verification Failed</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "8px" }}>{errorMessage}</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={handleResetForm}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  fontWeight: 600,
                }}
              >
                Adjust details
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "var(--severity-high)",
                  color: "#ffffff",
                  fontWeight: 700,
                }}
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
