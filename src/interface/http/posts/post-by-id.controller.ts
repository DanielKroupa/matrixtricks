import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updatePostSchema } from "@/interface/schemas/social/post-admin.schema";
import { getServerSession } from "@/lib/get-session";
import { postAdminService } from "@/services/social/post-admin.service";

export async function handlePostByIdPatch(request: NextRequest, id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updatePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const existingPost = await postAdminService.getPostMetaById(id);

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

    const updatedPost = await postAdminService.updatePost(
      id,
      {
        ...(parsed.data.title !== undefined
          ? { title: parsed.data.title }
          : {}),
        ...(parsed.data.content !== undefined
          ? { content: parsed.data.content }
          : {}),
        ...(parsed.data.isPinned !== undefined
          ? { isPinned: parsed.data.isPinned }
          : {}),
      },
      existingPost.rubric,
    );

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function handlePostByIdDelete(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingPost = await postAdminService.getPostMetaById(id);

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin";
    const isOwner = existingPost.authorId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await postAdminService.deletePost(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
