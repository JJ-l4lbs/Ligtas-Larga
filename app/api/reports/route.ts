import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const reports = await prisma.hazardReport.findMany({
      where: {
        isValidated: true,
      },
      orderBy: {
        reportedAt: "desc",
      },
    });
    return Response.json(reports, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Failed to fetch hazard reports:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, category, severity, description, imageUrl, isValidated, visionLabels } = body;

    // Basic validation
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !category ||
      !severity ||
      !description
    ) {
      return Response.json(
        { error: "Invalid request payload. Required fields are missing or of incorrect type." },
        { status: 400 }
      );
    }

    const report = await prisma.hazardReport.create({
      data: {
        latitude,
        longitude,
        category,
        severity,
        description,
        imageUrl: imageUrl || null,
        isValidated: typeof isValidated === "boolean" ? isValidated : false,
        visionLabels: visionLabels || null,
      },
    });

    return Response.json(report, { status: 201 });
  } catch (error) {
    console.error("Failed to create hazard report:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
