// src/app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Company from "../../../lib/models/Company";
import { verifyToken } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          name: { $regex: search, $options: "i" },
        }
      : {};

    const [companies, total] = await Promise.all([
      Company.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(searchQuery),
    ]);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: "Company name is required" },
        { status: 400 }
      );
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return NextResponse.json(
        { message: "Company with this name already exists" },
        { status: 400 }
      );
    }

    const company = new Company({ name });
    await company.save();

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { message: String(error) || "Internal server error" },
      { status: 400 }
    );
  }
}
