// src/app/api/companies/[id]/internships/[internshipId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../../../lib/mongodb";
import Company from "../../../../../../lib/models/Company";
import { verifyToken } from "../../../../../../lib/auth";
import { Internship } from "@/lib/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; internshipId: string }> }
) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id, internshipId } = await params;
    const { designation, duration, stipend, location, details, isActive } =
      await request.json();

    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    const internshipIndex = company.internships.findIndex(
      (internship: Internship) => internship._id.toString() === internshipId
    );

    if (internshipIndex === -1) {
      return NextResponse.json(
        { message: "Internship not found" },
        { status: 404 }
      );
    }

    // Update internship fields
    if (designation !== undefined)
      company.internships[internshipIndex].designation = designation;
    if (duration !== undefined)
      company.internships[internshipIndex].duration = duration;
    if (stipend !== undefined)
      company.internships[internshipIndex].stipend = Number(stipend);
    if (location !== undefined)
      company.internships[internshipIndex].location = location;
    if (details !== undefined)
      company.internships[internshipIndex].details = details;
    if (isActive !== undefined)
      company.internships[internshipIndex].isActive = Boolean(isActive);

    await company.save();

    return NextResponse.json({
      message: "Internship updated successfully",
      company,
      internship: company.internships[internshipIndex],
    });
  } catch (error) {
    console.error("Error updating internship:", error);
    return NextResponse.json(
      { message: String(error) || "Internal server error" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; internshipId: string }> }
) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id, internshipId } = await params;

    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    const internshipIndex = company.internships.findIndex(
      (internship: Internship) => internship._id.toString() === internshipId
    );

    if (internshipIndex === -1) {
      return NextResponse.json(
        { message: "Internship not found" },
        { status: 404 }
      );
    }

    company.internships.splice(internshipIndex, 1);
    await company.save();

    return NextResponse.json({
      message: "Internship deleted successfully",
      company,
    });
  } catch (error) {
    console.error("Error deleting internship:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
