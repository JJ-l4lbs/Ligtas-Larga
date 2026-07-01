import React from "react";

interface SplashLoaderProps {
  currentStep: number;
}

export default function SplashLoader({ currentStep }: SplashLoaderProps) {
  return (
    <div
      className="splash-liquid-bg"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 500,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        padding: "8%",
        pointerEvents: "auto",
        opacity: currentStep === 0 ? 1 : 0,
        transition: "opacity 0.6s ease-in-out",
      }}
    >
      <div>
        <h1 style={{ fontSize: "48px", fontWeight: 300, letterSpacing: "1px", color: "white" }}>Ligtas Larga</h1>
      </div>
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "5px" }}>
        <p style={{ fontSize: "16px", color: "white", fontWeight: 500 }}>
          Lalarga na...
        </p>
        <div style={{ width: '200px', height: '2px', backgroundColor: 'rgba(255,255,255,0.2)', position: 'relative', marginTop: '20px' }}>
          {/* Destination Marker */}
          <div className="marker-anim" style={{ position: 'absolute', right: '-8px', top: '-18px', color: 'rgba(255,255,255,0.9)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          
          {/* Walking Person Sprite Animation */}
          <div className="walking-progress-anim" style={{ position: 'absolute', left: '-12px', top: '-28px', width: '24px', height: '36px', overflow: 'hidden' }}>
            <div className="walking-sprite" style={{ display: 'flex', color: 'white' }}>
              <svg width="120" height="36" viewBox="0 0 120 36" fill="white" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <g transform="translate(0, 0)">
                   <circle cx="12" cy="7" r="3.5" stroke="none" />
                   <path d="M12 12 L9 18" />
                   <path d="M12 21 L8 27 L6 31" />
                   <path d="M12 11 L12 21" />
                   <path d="M12 21 L16 27 L16 32" />
                   <path d="M12 12 L15 18" />
                </g>
                <g transform="translate(24, 0)">
                   <circle cx="12" cy="7.5" r="3.5" stroke="none" />
                   <path d="M12 12.5 L10 18" />
                   <path d="M12 21.5 L9 26 L8 31" />
                   <path d="M12 11.5 L12 21.5" />
                   <path d="M12 21.5 L14 26 L14 32" />
                   <path d="M12 12.5 L14 18" />
                </g>
                <g transform="translate(48, 0)">
                   <circle cx="12" cy="6.5" r="3.5" stroke="none" />
                   <path d="M12 11.5 L11 18" />
                   <path d="M12 20.5 L12 26 L14 28" />
                   <path d="M12 10.5 L12 20.5" />
                   <path d="M12 20.5 L12 27 L12 33" />
                   <path d="M12 11.5 L13 18" />
                </g>
                <g transform="translate(72, 0)">
                   <circle cx="12" cy="6" r="3.5" stroke="none" />
                   <path d="M12 11 L14 17" />
                   <path d="M12 20 L15 25 L15 31" />
                   <path d="M12 10 L12 20" />
                   <path d="M12 20 L10 26 L8 28" />
                   <path d="M12 11 L10 17" />
                </g>
                <g transform="translate(96, 0)">
                   <circle cx="12" cy="7" r="3.5" stroke="none" />
                   <path d="M12 12 L15 18" />
                   <path d="M12 21 L16 27 L16 32" />
                   <path d="M12 11 L12 21" />
                   <path d="M12 21 L8 27 L6 31" />
                   <path d="M12 12 L9 18" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
