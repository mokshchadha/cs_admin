// src/app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Company from "../../../../lib/models/Company";
import { verifyToken } from "../../../../lib/auth";

export async function GET(
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
    const company = await Company.findById(id);

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: "Company name is required" },
        { status: 400 }
      );
    }

    const company = await Company.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { message: error || "Internal server error" },
      { status: 400 }
    );
  }
}

export async function DELETE(
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
    const company = await Company.findByIdAndDelete(id);

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
