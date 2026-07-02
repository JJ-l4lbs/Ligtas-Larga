import { prisma } from "../../../lib/prisma";
import { getUserIdFromSession } from "../../../lib/auth-utils";
import { NextResponse } from "next/server";

// GET: Retrieve all saved routes for the logged-in user
export async function GET() {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedRoutes = await prisma.savedRoute.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(savedRoutes);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve saved routes" },
      { status: 500 }
    );
  }
}

// POST: Add a new saved route
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      label,
      fromAddress,
      toAddress,
      fromLatitude,
      fromLongitude,
      toLatitude,
      toLongitude,
      travelMode,
    } = body;

    if (
      !label ||
      !fromAddress ||
      !toAddress ||
      typeof fromLatitude !== "number" ||
      typeof fromLongitude !== "number" ||
      typeof toLatitude !== "number" ||
      typeof toLongitude !== "number" ||
      !travelMode
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newRoute = await prisma.savedRoute.create({
      data: {
        userId,
        label,
        fromAddress,
        toAddress,
        fromLatitude,
        fromLongitude,
        toLatitude,
        toLongitude,
        travelMode,
      },
    });

    return NextResponse.json(newRoute, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create saved route" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a saved route
export async function DELETE(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing route ID" }, { status: 400 });
    }

    // Verify ownership before deleting
    const route = await prisma.savedRoute.findFirst({
      where: { id, userId },
    });

    if (!route) {
      return NextResponse.json({ error: "Saved route not found or access denied" }, { status: 404 });
    }

    await prisma.savedRoute.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Saved route deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete saved route" },
      { status: 500 }
    );
  }
}
