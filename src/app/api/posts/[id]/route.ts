import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

const updatePostSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().optional(),
    isPinned: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.content !== undefined ||
      data.isPinned !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

const MAX_PINNED_PER_RUBRIC = 5;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updatePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, rubric: true, isPinned: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin";
    const isOwner = existingPost.authorId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (parsed.data.isPinned !== undefined && !isAdmin) {
      return NextResponse.json(
        { error: "Only admin can pin or unpin posts" },
        { status: 403 },
      );
    }

    if (parsed.data.isPinned !== undefined) {
      const wantsPinned = parsed.data.isPinned;

      const updatedPost = await prisma.$transaction(async (tx) => {
        if (wantsPinned) {
          const pinnedInRubric = await tx.post.findMany({
            where: {
              rubric: existingPost.rubric,
              isPinned: true,
              id: { not: id },
            },
            orderBy: [{ pinnedAt: "asc" }, { createdAt: "asc" }],
            select: { id: true },
          });

          if (pinnedInRubric.length >= MAX_PINNED_PER_RUBRIC) {
            const toUnpinCount =
              pinnedInRubric.length - MAX_PINNED_PER_RUBRIC + 1;
            const idsToUnpin = pinnedInRubric
              .slice(0, toUnpinCount)
              .map((post) => post.id);

            if (idsToUnpin.length > 0) {
              await tx.post.updateMany({
                where: { id: { in: idsToUnpin } },
                data: { isPinned: false, pinnedAt: null },
              });
            }
          }

          return tx.post.update({
            where: { id },
            data: {
              ...(parsed.data.title !== undefined
                ? { title: parsed.data.title }
                : {}),
              ...(parsed.data.content !== undefined
                ? { content: parsed.data.content }
                : {}),
              isPinned: true,
              pinnedAt: new Date(),
            },
            select: {
              id: true,
              title: true,
              content: true,
              isPinned: true,
              pinnedAt: true,
              updatedAt: true,
            },
          });
        }

        return tx.post.update({
          where: { id },
          data: {
            ...(parsed.data.title !== undefined
              ? { title: parsed.data.title }
              : {}),
            ...(parsed.data.content !== undefined
              ? { content: parsed.data.content }
              : {}),
            isPinned: false,
            pinnedAt: null,
          },
          select: {
            id: true,
            title: true,
            content: true,
            isPinned: true,
            pinnedAt: true,
            updatedAt: true,
          },
        });
      });

      return NextResponse.json(updatedPost);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined
          ? { title: parsed.data.title }
          : {}),
        ...(parsed.data.content !== undefined
          ? { content: parsed.data.content }
          : {}),
      },
      select: {
        id: true,
        title: true,
        content: true,
        isPinned: true,
        pinnedAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin";
    const isOwner = existingPost.authorId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
