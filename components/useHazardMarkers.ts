"use client";

import { useEffect } from "react";

interface HazardReport {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  severity: string;
  description: string;
  isValidated: boolean;
  imageUrl?: string | null;
}

export default function useHazardMarkers(
  mapInstance: google.maps.Map | null,
  hazards: HazardReport[]
) {
  useEffect(() => {
    if (!mapInstance || !hazards) return;

    const newMarkers: any[] = [];
    const clickedInfoWindows = new Map<string, google.maps.InfoWindow>();
    let highestZIndex = 1000;

    const hoverInfoWindow = new google.maps.InfoWindow({
      disableAutoPan: true,
      zIndex: 999, // Render hover tooltips below permanently open windows
    });

    hazards.forEach((hazard) => {
      let color = "#ef4444";
      if (hazard.severity === "MEDIUM") {
        color = "#f59e0b";
      } else if (hazard.severity === "LOW") {
        color = "#10b981";
      }

      let iconUrl = "";
      if (hazard.category === "FLOOD") {
        iconUrl = "/triangle-rocket/2.svg";
      } else if (hazard.category === "RAMP_BLOCKED") {
        iconUrl = "/triangle-rocket/1.svg";
      } else if (hazard.category === "ELEVATOR_BROKEN") {
        iconUrl = "/triangle-rocket/3.svg";
      }

      const initialZoom = mapInstance.getZoom() || 13;
      const initialSize = Math.max(16, Math.min(80, (initialZoom - 13) * 6 + 32));

      let iconConfig: google.maps.Icon | string;
      if (iconUrl) {
        iconConfig = {
          url: iconUrl,
          scaledSize: new google.maps.Size(initialSize, initialSize),
          anchor: new google.maps.Point(initialSize / 2, initialSize / 2),
        };
      } else {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${initialSize}" height="${initialSize}" viewBox="0 0 36 36">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
            </filter>
          </defs>
          <circle cx="18" cy="18" r="12" fill="rgba(11, 15, 25, 0.6)" stroke="${color}" stroke-width="2.5" filter="url(#shadow)"/>
          <circle cx="18" cy="18" r="6" fill="${color}"/>
          <circle cx="18" cy="18" r="2" fill="#ffffff"/>
        </svg>`;
        iconConfig = {
          url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
          anchor: new google.maps.Point(initialSize / 2, initialSize / 2),
        };
      }

      let iconConfig: any;

      if (hazard.category === "CONSTRUCTION") {
        iconConfig = {
          url: "/construction-tools-svgrepo-com.svg",
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16),
        };
      } else if (hazard.category === "PATHWAY_OBSTACLE") {
        iconConfig = {
          url: "/no-pedestrians-svgrepo-com.svg",
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16),
        };
      } else {
        iconConfig = {
          url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
          anchor: new google.maps.Point(18, 18),
        };
      }

      const marker = new google.maps.Marker({
        map: mapInstance,
        position: { lat: hazard.latitude, lng: hazard.longitude },
        icon: iconConfig,
        title: "", // Prevent default tooltip
        zIndex: 1, // Base zIndex for all hazard markers
      });

      // HTML content generator for this hazard
      const getHtmlContent = () => {
        let severityColor = "#ef4444";
        let severityBg = "rgba(239, 68, 68, 0.1)";
        if (hazard.severity === "MEDIUM") {
          severityColor = "#d97706";
          severityBg = "rgba(217, 119, 6, 0.1)";
        } else if (hazard.severity === "LOW") {
          severityColor = "#059669";
          severityBg = "rgba(5, 150, 105, 0.1)";
        }

        let categoryEmoji = "⚠️";
        let logoHtml = `<span style="font-size: 16px;">${categoryEmoji}</span>`;
        if (hazard.category === "FLOOD") {
          categoryEmoji = "🌧️";
          logoHtml = `<img src="/triangle-rocket/2.svg" style="width: 20px; height: 20px; object-fit: contain;" />`;
        } else if (hazard.category === "CONSTRUCTION") {
          categoryEmoji = "🚧";
          logoHtml = `<img src="/construction-tools-svgrepo-com.svg" style="width: 20px; height: 20px; object-fit: contain;" />`;
        } else if (hazard.category === "PATHWAY_OBSTACLE") {
          categoryEmoji = "🚫";
          logoHtml = `<img src="/no-pedestrians-svgrepo-com.svg" style="width: 20px; height: 20px; object-fit: contain;" />`;
        } else if (hazard.category === "ACCIDENT") {
          categoryEmoji = "🚗";
          logoHtml = `<span style="font-size: 16px;">🚗</span>`;
        } else if (hazard.category === "ROAD_BLOCK") {
          categoryEmoji = "🚧";
          logoHtml = `<span style="font-size: 16px;">🚧</span>`;
        } else if (hazard.category === "ELEVATOR_BROKEN") {
          categoryEmoji = "🛗";
          logoHtml = `<img src="/triangle-rocket/3.svg" style="width: 20px; height: 20px; object-fit: contain;" />`;
        } else if (hazard.category === "RAMP_BLOCKED") {
          categoryEmoji = "♿";
          logoHtml = `<img src="/triangle-rocket/1.svg" style="width: 20px; height: 20px; object-fit: contain;" />`;
        }

        return `
          <div style="
            font-family: 'Outfit', sans-serif;
            padding: 12px 14px;
            max-width: 250px;
            color: var(--text-primary, #0f172a);
          ">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                ${logoHtml}
                <span style="font-weight: 700; font-size: 13px; letter-spacing: -0.01em; color: inherit;">
                  ${hazard.category.replace(/_/g, " ")}
                </span>
              </div>
              <span style="
                font-size: 9px;
                font-weight: 800;
                padding: 2px 6px;
                border-radius: 20px;
                background-color: ${severityBg};
                color: ${severityColor};
                letter-spacing: 0.05em;
              ">${hazard.severity}</span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary, #475569); line-height: 1.45; font-weight: 500;">
              ${hazard.description}
            </div>
            ${hazard.imageUrl ? `
              <div style="margin-top: 8px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-glass, #e2e8f0); max-height: 120px;">
                <img src="${hazard.imageUrl}" alt="${hazard.category}" style="width: 100%; height: auto; display: block; object-fit: cover;" />
              </div>
            ` : ""}
          </div>
        `;
      };

      // Hover open handler
      marker.addListener("mouseover", () => {
        // If this hazard is already permanently open (clicked), don't show the hover info window
        if (clickedInfoWindows.has(hazard.id)) return;
        
        const hoverZIndex = highestZIndex + 100;
        marker.setZIndex(hoverZIndex); // Temporarily elevate marker above everything, including clicked ones
        hoverInfoWindow.setOptions({ zIndex: hoverZIndex }); // Bring hover window above everything
        hoverInfoWindow.setContent(getHtmlContent());
        hoverInfoWindow.open(mapInstance, marker);
      });

      // Hover close handler
      marker.addListener("mouseout", () => {
        if (clickedInfoWindows.has(hazard.id)) return;
        marker.setZIndex(1); // Reset back to base
        hoverInfoWindow.close();
      });

      // Click permanent open handler
      marker.addListener("click", () => {
        // Close hover window first
        hoverInfoWindow.close();

        // If already open, close it (toggle behavior)
        if (clickedInfoWindows.has(hazard.id)) {
          clickedInfoWindows.get(hazard.id)?.close();
          clickedInfoWindows.delete(hazard.id);
          marker.setZIndex(1); // Reset back to base
          return;
        }

        highestZIndex++;
        marker.setZIndex(highestZIndex); // Elevate clicked marker above all others

        const clickInfoWindow = new google.maps.InfoWindow({
          content: getHtmlContent(),
          zIndex: highestZIndex, // Render this info window above hover and other clicked windows
        });

        // Track when it gets closed via standard close button
        clickInfoWindow.addListener("closeclick", () => {
          clickedInfoWindows.delete(hazard.id);
          marker.setZIndex(1); // Reset back to base
        });

        clickInfoWindow.open(mapInstance, marker);
        clickedInfoWindows.set(hazard.id, clickInfoWindow);
      });

      newMarkers.push(marker);
    });

    // Function to calculate and update marker icon sizes based on map zoom
    const updateMarkerSizes = () => {
      const zoom = mapInstance.getZoom() || 13;
      const size = Math.max(16, Math.min(80, (zoom - 13) * 6 + 32));

      newMarkers.forEach((marker, index) => {
        const hazard = hazards[index];
        if (!hazard) return;

        let iconUrl = "";
        if (hazard.category === "FLOOD") {
          iconUrl = "/triangle-rocket/2.svg";
        } else if (hazard.category === "RAMP_BLOCKED") {
          iconUrl = "/triangle-rocket/1.svg";
        } else if (hazard.category === "ELEVATOR_BROKEN") {
          iconUrl = "/triangle-rocket/3.svg";
        }

        let color = "#ef4444";
        if (hazard.severity === "MEDIUM") {
          color = "#f59e0b";
        } else if (hazard.severity === "LOW") {
          color = "#10b981";
        }

        if (iconUrl) {
          marker.setIcon({
            url: iconUrl,
            scaledSize: new google.maps.Size(size, size),
            anchor: new google.maps.Point(size / 2, size / 2),
          });
        } else {
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36">
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
              </filter>
            </defs>
            <circle cx="18" cy="18" r="12" fill="rgba(11, 15, 25, 0.6)" stroke="${color}" stroke-width="2.5" filter="url(#shadow)"/>
            <circle cx="18" cy="18" r="6" fill="${color}"/>
            <circle cx="18" cy="18" r="2" fill="#ffffff"/>
          </svg>`;
          marker.setIcon({
            url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
            anchor: new google.maps.Point(size / 2, size / 2),
          });
        }
      });
    };

    // Attach map zoom listener
    const zoomListener = mapInstance.addListener("zoom_changed", updateMarkerSizes);

    return () => {
      google.maps.event.removeListener(zoomListener);
      newMarkers.forEach((m) => {
        m.setMap(null);
      });
      clickedInfoWindows.forEach((iw) => {
        iw.close();
      });
      hoverInfoWindow.close();
    };
  }, [mapInstance, hazards]);
}
