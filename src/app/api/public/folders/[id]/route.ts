import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// GET /api/public/folders/[id] - Public read-only folder fetch (no auth)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    await connectDB();
    const { Folder, Bookmark } = await registerModels();

    const folder = await Folder.findById(id)
      .populate({
        path: "bookmarks",
        model: Bookmark,
        select:
          "title url description favicon metaImage createdAt updatedAt",
      })
      .select("name description color bookmarks createdAt updatedAt")
      .lean()
      .exec();

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(
      { folder },
      {
        status: 200,
        headers: {
          // Allow basic caching by CDNs/browsers for public data
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching public folder:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 },
    );
  }
}


