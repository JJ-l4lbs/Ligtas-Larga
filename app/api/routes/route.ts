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

    let data: any = null;
    let fallbackNeeded = false;

    if (travelMode === "commute") {
      try {
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
            travelMode: "TRANSIT",
            computeAlternativeRoutes: false,
          }),
        });

        if (response.ok) {
          data = await response.json();
          const hasTransitSteps = data.routes?.some((route: any) =>
            route.legs?.some((leg: any) =>
              leg.steps?.some((step: any) => step.transitDetails)
            )
          );
          if (!hasTransitSteps) {
            fallbackNeeded = true;
          }
        } else {
          fallbackNeeded = true;
        }
      } catch (err) {
        console.error("Transit route calculation failed, seeking driving fallback:", err);
        fallbackNeeded = true;
      }

      if (fallbackNeeded) {
        const fallbackResponse = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.duration,routes.legs.distanceMeters,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration,routes.legs.steps.startLocation,routes.legs.steps.endLocation",
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
            travelMode: "DRIVE",
            computeAlternativeRoutes: false,
          }),
        });

        if (fallbackResponse.ok) {
          data = await fallbackResponse.json();
          if (data.routes) {
            data.routes.forEach((route: any) => {
              const totalDistanceMeters = route.distanceMeters || 0;
              const fareInfo = calculateLegFare(
                "TRAM",
                "Jeepney",
                "PUJ",
                totalDistanceMeters,
                "",
                ""
              );
              route.totalFare = fareInfo.fare;
              route.totalDiscountedFare = fareInfo.discountedFare;
              route.warning = "No direct transit route available. Displaying estimated road route and fare.";
            });
          }
        } else {
          const errText = await fallbackResponse.text();
          console.error("Google Routes API driving fallback returned error:", errText);
          return Response.json({ error: "Failed to fetch routes from Google" }, { status: 502 });
        }
      } else {
        // If travelMode is transit/commute, calculate and inject fares for all transit segments
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
    } else if (travelMode === "bicycle") {
      let fallbackNeeded = false;
      try {
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
            travelMode: "BICYCLE",
            computeAlternativeRoutes: true,
          }),
        });

        if (response.ok) {
          data = await response.json();
          if (!data.routes || data.routes.length === 0) {
            fallbackNeeded = true;
          }
        } else {
          fallbackNeeded = true;
        }
      } catch (err) {
        console.error("Bicycle route calculation failed, seeking walk fallback:", err);
        fallbackNeeded = true;
      }

      if (fallbackNeeded) {
        const fallbackResponse = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
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
            travelMode: "WALK",
            computeAlternativeRoutes: true,
          }),
        });

        if (fallbackResponse.ok) {
          data = await fallbackResponse.json();
          if (data.routes) {
            data.routes.forEach((route: any) => {
              route.warning = "Cycling routes are not supported in this region. Displaying walking path as estimate.";
            });
          }
        } else {
          const errText = await fallbackResponse.text();
          console.error("Google Routes API bicycle fallback returned error:", errText);
          return Response.json({ error: "Failed to fetch routes from Google" }, { status: 502 });
        }
      }
    } else {
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
          computeAlternativeRoutes: true,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Google Routes API returned error:", errText);
        return Response.json({ error: "Failed to fetch routes from Google" }, { status: 502 });
      }

      data = await response.json();
    }

    return Response.json(data);
  } catch (error) {
    console.error("Failed to compute routes:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
