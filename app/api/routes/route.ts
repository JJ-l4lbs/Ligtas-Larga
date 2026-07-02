import { NextRequest } from "next/server";
import { calculateLegFare } from "../../../lib/commute-calculator";

export async function POST(request: NextRequest) {
  try {
    const { origin, destination, travelMode } = await request.json();

    if (!origin || !destination) {
      return Response.json({ error: "Missing origin or destination coordinates" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    // Map frontend travel mode formats to Google Routes API travelMode
    let mappedMode = "WALK";
    let fieldMask = "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.duration,routes.legs.distanceMeters,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration,routes.legs.steps.startLocation,routes.legs.steps.endLocation";

    if (travelMode === "commute") {
      mappedMode = "TRANSIT";
      // Append transit details to the field mask for commute/transit legs
      fieldMask += ",routes.legs.steps.transitDetails,routes.legs.steps.travelMode";
    } else if (travelMode === "bicycle") {
      mappedMode = "BICYCLE";
    } else if (travelMode === "motorcycle") {
      mappedMode = "TWO_WHEELER";
    } else if (travelMode === "car") {
      mappedMode = "DRIVE";
    }

    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: origin.lat,
              longitude: origin.lng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng,
            },
          },
        },
        travelMode: mappedMode,
        computeAlternativeRoutes: mappedMode !== "TRANSIT", // Google Routes API does not support computeAlternativeRoutes for TRANSIT
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Google Routes API returned error:", errText);
      return Response.json({ error: "Failed to fetch routes from Google" }, { status: 502 });
    }

    const data = await response.json();

    // If travelMode is transit/commute, calculate and inject fares for all transit segments
    if (mappedMode === "TRANSIT" && data.routes) {
      data.routes.forEach((route: any) => {
        let routeFare = 0;
        let routeDiscountedFare = 0;
        
        if (route.legs) {
          route.legs.forEach((leg: any) => {
            if (leg.steps) {
              leg.steps.forEach((step: any) => {
                if (step.transitDetails) {
                  const details = step.transitDetails;
                  const vehicleType = details.transitLine?.vehicle?.type || "";
                  const lineName = details.transitLine?.name || details.transitLine?.shortName || "";
                  const agencyName = details.transitLine?.agencies?.[0]?.name || "";
                  const distanceMeters = step.distanceMeters || 0;
                  const originStop = details.stopDetails?.departureStop?.name || "";
                  const destinationStop = details.stopDetails?.arrivalStop?.name || "";
                  
                  const fareInfo = calculateLegFare(
                    vehicleType,
                    lineName,
                    agencyName,
                    distanceMeters,
                    originStop,
                    destinationStop
                  );
                  
                  step.fareInfo = fareInfo;
                  routeFare += fareInfo.fare;
                  routeDiscountedFare += fareInfo.discountedFare;
                }
              });
            }
          });
        }
        
        route.totalFare = routeFare;
        route.totalDiscountedFare = routeDiscountedFare;
      });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Failed to compute routes:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
