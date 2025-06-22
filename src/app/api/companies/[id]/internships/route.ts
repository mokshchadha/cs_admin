// src/app/api/companies/[id]/internships/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongodb";
import Company from "../../../../../lib/models/Company";
import { verifyToken } from "../../../../../lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const {
      designation,
      duration,
      stipend,
      location,
      details,
      isActive = true,
    } = await request.json();

    if (
      !designation ||
      !duration ||
      stipend === undefined ||
      !location ||
      !details
    ) {
      return NextResponse.json(
        { message: "All internship fields are required" },
        { status: 400 }
      );
    }

    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    const newInternship = {
      designation,
      duration,
      stipend: Number(stipend),
      location,
      details,
      isActive: Boolean(isActive),
    };

    company.internships.push(newInternship);
    await company.save();

    return NextResponse.json(
      {
        message: "Internship added successfully",
        company,
        internship: company.internships[company.internships.length - 1],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding internship:", error);
    return NextResponse.json(
      { message: String(error) || "Internal server error" },
      { status: 400 }
    );
  }
}
