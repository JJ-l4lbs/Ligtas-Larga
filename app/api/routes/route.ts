import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { origin, destination } = await request.json();

    if (!origin || !destination) {
      return Response.json({ error: "Missing origin or destination coordinates" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const response = await fetch("https://routes.googleapis.com/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs",
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

    if (!response.ok) {
      const errText = await response.text();
      console.error("Google Routes API returned error:", errText);
      return Response.json({ error: "Failed to fetch routes from Google" }, { status: 502 });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Failed to compute routes:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
