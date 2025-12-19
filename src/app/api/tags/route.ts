import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Tag from "../../../lib/models/Tag";
import { verifyToken } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const tags = await Tag.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
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

    const { name, definition } = await request.json();

    if (!name || !definition) {
      return NextResponse.json(
        { message: "Name and definition are required" },
        { status: 400 }
      );
    }

    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return NextResponse.json(
        { message: "Tag with this name already exists" },
        { status: 400 }
      );
    }

    const tag = await Tag.create({ name, definition });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
