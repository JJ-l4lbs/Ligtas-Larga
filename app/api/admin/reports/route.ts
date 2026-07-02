import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

// GET: Retrieve all hazard reports (including unvalidated ones) for the admin queue
export async function GET() {
  try {
    const reports = await prisma.hazardReport.findMany({
      orderBy: {
        reportedAt: "desc",
      },
    });
    return NextResponse.json(reports);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// PUT: Update a hazard report's validation status, category, or description
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, isValidated, category, severity, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    const updatedReport = await prisma.hazardReport.update({
      where: { id },
      data: {
        ...(isValidated !== undefined && { isValidated }),
        ...(category !== undefined && { category }),
        ...(severity !== undefined && { severity }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update report" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a hazard report
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    await prisma.hazardReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Report deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete report" },
      { status: 500 }
    );
  }
}
