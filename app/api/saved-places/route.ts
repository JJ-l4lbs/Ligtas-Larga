import { prisma } from "../../../lib/prisma";
import { getUserIdFromSession } from "../../../lib/auth-utils";
import { NextResponse } from "next/server";

// GET: Retrieve all saved places for the logged-in user
export async function GET() {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedPlaces = await prisma.savedPlace.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(savedPlaces);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve saved places" },
      { status: 500 }
    );
  }
}

// POST: Add a new saved place
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { label, address, latitude, longitude } = body;

    if (!label || !address || typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for duplicate label (strictly case sensitive)
    const existing = await prisma.savedPlace.findFirst({
      where: {
        userId,
        label,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `You have already saved a place with the label "${label}".` },
        { status: 400 }
      );
    }

    const newPlace = await prisma.savedPlace.create({
      data: {
        userId,
        label,
        address,
        latitude,
        longitude,
      },
    });

    return NextResponse.json(newPlace, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create saved place" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a saved place
export async function DELETE(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing place ID" }, { status: 400 });
    }

    // Verify ownership before deleting
    const place = await prisma.savedPlace.findFirst({
      where: { id, userId },
    });

    if (!place) {
      return NextResponse.json({ error: "Saved place not found or access denied" }, { status: 404 });
    }

    await prisma.savedPlace.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Saved place deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete saved place" },
      { status: 500 }
    );
  }
}
