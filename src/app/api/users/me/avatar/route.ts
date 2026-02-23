import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

const AVATAR_SIZE = 256;
const TARGET_MAX_BYTES = 80 * 1024;
const MAX_INPUT_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function compressAvatar(buffer: Buffer) {
  let webpBuffer: Buffer | null = null;

  for (const quality of [70, 65, 60, 55, 50]) {
    const candidate = await sharp(buffer)
      .rotate()
      .resize(AVATAR_SIZE, AVATAR_SIZE, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: false,
      })
      .webp({ quality, effort: 6 })
      .toBuffer();

    webpBuffer = candidate;
    if (candidate.length <= TARGET_MAX_BYTES) {
      return { buffer: candidate, extension: "webp", mimeType: "image/webp" };
    }
  }

  if (webpBuffer) {
    return { buffer: webpBuffer, extension: "webp", mimeType: "image/webp" };
  }

  const pngBuffer = await sharp(buffer)
    .rotate()
    .resize(AVATAR_SIZE, AVATAR_SIZE, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .png({ compressionLevel: 9, palette: true, effort: 10 })
    .toBuffer();

  return { buffer: pngBuffer, extension: "png", mimeType: "image/png" };
}

async function removeOldAvatar(imageUrl: string | null | undefined) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/avatars/")) {
    return;
  }

  if (imageUrl.endsWith("/alien.png")) {
    return;
  }

  const relativePath = imageUrl.replace(/^\/+/, "");
  if (relativePath.includes("..")) {
    return;
  }

  const filePath = join(process.cwd(), "public", relativePath);
  await unlink(filePath).catch(() => undefined);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG or WebP images are supported" },
        { status: 400 },
      );
    }

    if (file.size > MAX_INPUT_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(inputBuffer).metadata();
    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadsDir, { recursive: true });

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    const {
      buffer: outputBuffer,
      extension,
      mimeType,
    } = await compressAvatar(inputBuffer);

    const fileName = `${session.user.id}-${Date.now()}.${extension}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, outputBuffer);

    const imageUrl = `/uploads/avatars/${fileName}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    await removeOldAvatar(currentUser?.image);

    return NextResponse.json(
      {
        image: imageUrl,
        mimeType,
        fileSize: outputBuffer.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
