// src/app/api/users/[id]/assign-internship/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongodb";
import User from "../../../../../lib/models/User";
import Company from "../../../../../lib/models/Company";
import { verifyToken } from "../../../../../lib/auth";
import mongoose from "mongoose";
import { Internship } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { companyId, internshipId } = await request.json();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    if (!companyId || !internshipId) {
      return NextResponse.json(
        { message: "Company and internship are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get company and internship details
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    const internship = company.internships.find(
      (int: Internship) => int._id.toString() === internshipId
    );
    if (!internship) {
      return NextResponse.json(
        { message: "Internship not found" },
        { status: 404 }
      );
    }

    if (!internship.isActive) {
      return NextResponse.json(
        { message: "Cannot assign inactive internship" },
        { status: 400 }
      );
    }

    // Check if internship is already assigned to the user
    const existingAssignment = existingUser.assignedInternships?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (assignment: any) =>
        assignment.companyId.toString() === companyId &&
        assignment.internshipId.toString() === internshipId
    );

    if (existingAssignment) {
      return NextResponse.json(
        { message: "This internship is already assigned to the user" },
        { status: 400 }
      );
    }

    const newInternshipAssignment = {
      companyId: new mongoose.Types.ObjectId(companyId),
      companyName: company.name,
      internshipId: new mongoose.Types.ObjectId(internshipId),
      designation: internship.designation,
      duration: internship.duration,
      stipend: internship.stipend,
      location: internship.location,
      details: internship.details,
      assignedAt: new Date(),
      status: "assigned" as const,
    };

    // Update user using Mongoose
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $push: {
          assignedInternships: newInternshipAssignment,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -forgotPasswordToken -verifyToken");

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Internship assigned successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error assigning internship:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
