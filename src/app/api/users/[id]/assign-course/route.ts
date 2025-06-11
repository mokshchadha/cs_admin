import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongodb";
import User from "../../../../../lib/models/User";
import { verifyToken } from "../../../../../lib/auth";
import {
  createStudentId,
  formatPhoneNumber,
  formatDateOfBirth,
} from "../../../../../lib/externalApi";
import universities from "../../../../../lib/universities.json";
import { ExternalApiRequest } from "../../../../../lib/types";
import mongoose from "mongoose";

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

    const { university, course, specialization } = await request.json();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    if (!university || !course || !specialization) {
      return NextResponse.json(
        { message: "University, course, and specialization are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existingCourse = existingUser.assignedCourses?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (courseAssignment: any) =>
        courseAssignment.university === university &&
        courseAssignment.course === course &&
        courseAssignment.specialization === specialization
    );

    if (existingCourse) {
      return NextResponse.json(
        { message: "This course is already assigned to the user" },
        { status: 400 }
      );
    }

    // Validate required user data for external API
    if (!existingUser.name || !existingUser.email) {
      return NextResponse.json(
        { message: "User must have name and email to assign courses" },
        { status: 400 }
      );
    }

    // Check if university exists in our config
    const universityConfig =
      universities[university as keyof typeof universities];
    if (!universityConfig) {
      return NextResponse.json(
        { message: "University configuration not found" },
        { status: 400 }
      );
    }

    // Prepare external API request
    const externalApiData: ExternalApiRequest = {
      full_name: existingUser.name,
      email: existingUser.email,
      mobile: formatPhoneNumber(existingUser.phoneNumber),
      dob: formatDateOfBirth(existingUser.createdAt.toString()),
      interested_university: university,
      course: course,
      specialization: specialization,
      source: "CV Partner",
      sub_source: "API",
      lead_owner: "1369",
    };

    const externalApiResponse = await createStudentId(externalApiData);

    if (!externalApiResponse.status || !externalApiResponse.student_id) {
      console.error("External API failed:", externalApiResponse);
      return NextResponse.json(
        {
          message: `Failed to generate Student ID: ${
            externalApiResponse.message || "Unknown error"
          }`,
          apiError: true,
        },
        { status: 400 }
      );
    }

    const newCourseAssignment = {
      university,
      course,
      specialization,
      assignedAt: new Date(),
      studentId: externalApiResponse.student_id || null,
      externalApiStatus: Boolean(externalApiResponse.status),
      externalApiMessage: externalApiResponse.message || null,
      // Only include externalApiExists if it's a valid number
      ...(typeof externalApiResponse.exists === "number" && {
        externalApiExists: externalApiResponse.exists,
      }),
    };

    // Update user using Mongoose
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $push: {
          assignedCourses: newCourseAssignment,
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

    // Verify the last added course
    if (updatedUser.assignedCourses?.length) {
      const lastCourse =
        updatedUser.assignedCourses[updatedUser.assignedCourses.length - 1];
      console.log("Last added course verification:", {
        studentId: lastCourse.studentId,
        externalApiStatus: lastCourse.externalApiStatus,
        university: lastCourse.university,
        course: lastCourse.course,
        externalApiMessage: lastCourse.externalApiMessage,
      });
    }

    return NextResponse.json({
      message: "Course assigned successfully with Student ID",
      user: updatedUser,
      studentId: externalApiResponse.student_id,
      externalApiStatus: externalApiResponse.status,
      externalApiMessage: externalApiResponse.message,
    });
  } catch (error) {
    console.error("Error assigning course:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
