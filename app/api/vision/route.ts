import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { image, category } = await request.json();

    if (!image) {
      return Response.json({ error: "Missing image data" }, { status: 400 });
    }

    // Expect base64 format: "data:image/jpeg;base64,..." or raw base64
    let base64Data = image;
    if (image.startsWith("data:")) {
      base64Data = image.split(",")[1];
    }

    const buffer = Buffer.from(base64Data, "base64");

    // Call Hugging Face Inference API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        body: buffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", errorText);
      return Response.json(
        { error: "Verification API failed to process the image" },
        { status: 502 }
      );
    }

    const data = await response.json(); // Array of { label: string, score: number }
    
    // Check if the image contains labels related to the hazard category
    let isValidated = false;
    const labels = data.map((item: { label: string; score: number }) => item.label.toLowerCase());

    const targetCategory = (category || "").toUpperCase();

    if (targetCategory === "FLOOD") {
      isValidated = labels.some(
        (l: string) =>
          l.includes("water") ||
          l.includes("lake") ||
          l.includes("river") ||
          l.includes("puddle") ||
          l.includes("flood") ||
          l.includes("sea") ||
          l.includes("ocean") ||
          l.includes("stream") ||
          l.includes("rain")
      );
    } else if (targetCategory === "OBSTACLE" || targetCategory === "RAMP_BLOCKED") {
      isValidated = labels.some(
        (l: string) =>
          l.includes("barrier") ||
          l.includes("fence") ||
          l.includes("construction") ||
          l.includes("debris") ||
          l.includes("rock") ||
          l.includes("stone") ||
          l.includes("block") ||
          l.includes("wall") ||
          l.includes("rubble") ||
          l.includes("obstacle")
      );
    } else if (targetCategory === "ELEVATOR_BROKEN") {
      isValidated = labels.some(
        (l: string) =>
          l.includes("elevator") ||
          l.includes("escalator") ||
          l.includes("lift") ||
          l.includes("door") ||
          l.includes("mechanical")
      );
    } else {
      isValidated = data.some((item: { label: string; score: number }) => item.score > 0.3);
    }

    return Response.json({
      isValidated,
      labels: data,
    });
  } catch (error) {
    console.error("Failed to verify image:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
