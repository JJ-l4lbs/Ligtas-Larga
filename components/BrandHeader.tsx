"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BrandHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: { email: string; role: string } | null;
  onLogout: () => void;
  onToggleDashboard?: () => void;
}

export default function BrandHeader({
  isDarkMode,
  onToggleDarkMode,
  user,
  onLogout,
  onToggleDashboard,
}: BrandHeaderProps) {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getShortEmail = (email: string) => {
    if (email.length <= 15) return email;
    return email.substring(0, 12) + "...";
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    
    // Initial state: Tiny circle at cursor
    setTransitionStyle({
      clipPath: `circle(0px at ${x}px ${y}px)`,
    });
    setIsTransitioning(true);

    // Next frame: Expand to cover the entire screen
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionStyle({
          clipPath: `circle(150vmax at ${x}px ${y}px)`,
        });
      });
    });

    // Wait for the expansion animation to finish before routing
    setTimeout(() => {
      router.push("/login");
      // Reset the transition state after route finishes
      setTimeout(() => setIsTransitioning(false), 500);
    }, 600); // Trigger the routing transition midway
  };

  return (
    <>
      {isTransitioning && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="splash-liquid-bg"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 999999,
            transition: "clip-path 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
            ...transitionStyle,
          }}
        />,
        document.body
      )}
      <div
        style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1.5px solid var(--border-subtle)",
        backgroundColor: "var(--bg-card)",
        zIndex: 10,
        gap: "12px",
      }}
    >
      <div 
        onClick={() => window.location.reload()}
        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
      >
        <img 
          src="/logo.svg" 
          alt="Ligtas-Larga Logo" 
          style={{ width: "24px", height: "24px", objectFit: "contain" }} 
        />
        <span style={{ fontWeight: 800, fontSize: "17px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Ligtas-Larga
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* User Session Indicators & Action Button */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span
                style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)" }}
                title={user.email}
              >
                {getShortEmail(user.email)}
              </span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  color: user.role === "ADMIN" ? "#9F1239" : "#15803D",
                  backgroundColor: user.role === "ADMIN" ? "#FFE4E6" : "#DCFCE7",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                {user.role}
              </span>
            </div>

            {onToggleDashboard && (
              <button
                onClick={onToggleDashboard}
                className="btn-interactive"
                style={{
                  padding: "6px 10px",
                  borderRadius: "12px",
                  border: "1.5px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-app-left)",
                  color: "var(--text-on-app-left)",
                  fontWeight: 700,
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                👤 Me
              </button>
            )}

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="btn-interactive"
                style={{
                  padding: "6px 10px",
                  borderRadius: "12px",
                  border: "1.5px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-app-left)",
                  color: "var(--text-on-app-left)",
                  fontWeight: 700,
                  fontSize: "10px",
                  textDecoration: "none",
                }}
              >
                🛠️ Admin
              </Link>
            )}

            <button
              onClick={onLogout}
              className="btn-interactive"
              style={{
                padding: "6px 10px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#FFE4E6",
                color: "#9F1239",
                fontWeight: 700,
                fontSize: "10px",
                cursor: "pointer",
              }}
            >
              Out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            onClick={handleLoginClick}
            className="btn-interactive"
            style={{
              padding: "6px 12px",
              borderRadius: "12px",
              border: "1.5px solid var(--border-subtle)",
              backgroundColor: "var(--bg-app-left)",
              color: "var(--text-on-app-left)",
              fontWeight: 700,
              fontSize: "10px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <img src="/log-in.svg" alt="Log In" style={{ width: "12px", height: "12px", filter: "invert(var(--theme-icon-invert, 0))" }} />
            <span>Log In</span>
          </Link>
        )}

        <button
          onClick={onToggleDarkMode}
          className="btn-interactive"
          style={{
            padding: "6px 12px",
            borderRadius: "20px",
            border: "1.5px solid var(--border-subtle)",
            backgroundColor: "var(--bg-app-left)",
            color: "var(--text-on-app-left)",
            fontWeight: 700,
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          <img 
            src={isDarkMode ? "/lightmode.svg" : "/darkmode.svg"} 
            alt={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} 
            style={{ width: "16px", height: "16px", filter: "invert(var(--theme-icon-invert, 0))" }}
          />
        </button>
      </div>
    </div>
    </>
  );
}
