import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongodb";
import User from "../../../../../lib/models/User";
import { verifyToken } from "../../../../../lib/auth";

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

    const newCourseAssignment = {
      university,
      course,
      specialization,
      assignedAt: new Date(),
    };

    const user = await User.findByIdAndUpdate(
      id,
      {
        $push: { assignedCourses: newCourseAssignment },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -forgotPasswordToken -verifyToken");

    return NextResponse.json({
      message: "Course assigned successfully",
      user,
    });
  } catch (error) {
    console.error("Error assigning course:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { courseId } = await request.json();
    const { id } = await params;

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        $pull: { assignedCourses: { _id: courseId } },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -forgotPasswordToken -verifyToken");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Course removed successfully",
      user,
    });
  } catch (error) {
    console.error("Error removing course:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
