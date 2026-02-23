import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; // For R2

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const postId = formData.get("postId") as string;

    if (!file || !postId) {
      return NextResponse.json(
        { error: "File and postId required" },
        { status: 400 },
      );
    }

    // Validate file type and size
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const maxSize = file.type.startsWith("image/")
      ? 10 * 1024 * 1024
      : 10 * 1024 * 1024 * 1024; // 10MB images, 10GB videos
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // For now, save to public/uploads (placeholder for R2)
    const uploadsDir = join(process.cwd(), "public", "uploads", "posts");
    await mkdir(uploadsDir, { recursive: true });

    let buffer = Buffer.from(await file.arrayBuffer());
    let fileName = `${Date.now()}-${file.name}`;

    // Optimize image
    if (file.type.startsWith("image/")) {
      // @ts-expect-error Sharp buffer type issue
      buffer = await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      fileName = fileName.replace(/\.[^/.]+$/, ".jpg");
    }
    // TODO: Optimize video with ffmpeg

    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    const url = `/uploads/posts/${fileName}`;
    const type = file.type.startsWith("image/") ? "image" : "video";

    // Save to DB
    const media = await prisma.media.create({
      data: {
        url,
        type,
        fileName: file.name,
        fileSize: buffer.length, // Use optimized size
        postId,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
