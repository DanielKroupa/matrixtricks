import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { postSchema } from "@/app/helpers/post-schema";
import { entitlementService } from "@/application/billing/entitlement.service";
import type { RubricType } from "@/app/generated/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Parse and validate
    const validatedData = postSchema.parse({
      title: data.title,
      content: data.content || "",
      type: data.type,
      rubric: data.rubric,
      scheduledAt: (data.scheduledAt as string) || undefined,
      vipOnly: data.vipOnly === "true",
    });

    // Create post
    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type,
        rubric: validatedData.rubric,
        scheduledAt: validatedData.scheduledAt
          ? new Date(validatedData.scheduledAt)
          : undefined,
        vipOnly: validatedData.vipOnly,
        authorId: session.user.id,
        published: !validatedData.scheduledAt, // Publish immediately if not scheduled
      },
      include: {
        media: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    const viewerUserId = session?.user?.id;
    const viewerRole = session?.user?.role;
    const vipStatus = await entitlementService.getUserVipStatus(viewerUserId);

    const { searchParams } = new URL(request.url);
    const rubric = searchParams.get("rubric");
    const published = searchParams.get("published") !== "false";

    const posts = await prisma.post.findMany({
      where: {
        published,
        ...(rubric && { rubric: rubric.toUpperCase() as RubricType }),
        ...(!vipStatus.isVipActive && viewerRole !== "admin"
          ? {
              OR: [
                { vipOnly: false },
                ...(viewerUserId ? [{ authorId: viewerUserId }] : []),
              ],
            }
          : {}),
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        media: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
