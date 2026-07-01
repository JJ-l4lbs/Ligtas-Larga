import React from "react";

interface SplashLoaderProps {
  currentStep: number;
}

export default function SplashLoader({ currentStep }: SplashLoaderProps) {
  return (
    <div
      style={{
        padding: "40px 30px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        flex: 1,
        opacity: currentStep === 0 ? 1 : 0,
        transition: "opacity 0.6s ease-in-out",
      }}
    >
      <div
        style={{
          width: "70px",
          height: "70px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #1E513F, #0369A1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          boxShadow: "0 0 20px rgba(30, 81, 63, 0.2)",
        }}
      >
        🚀
      </div>
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-1px", color: "var(--text-primary)" }}>Ligtas-Larga</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Accessible Commuter Navigator
        </p>
      </div>
      <div style={{ marginTop: "10px" }}>
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: "2px solid var(--accent-accessibility)",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite",
            margin: "0 auto",
          }}
        />
        <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "12px" }}>
          Hydrating route safety states...
        </p>
      </div>
    </div>
  );
}
