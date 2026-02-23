import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createPostSchema } from "@/interface/schemas/social/post-admin.schema";
import { getServerSession } from "@/lib/get-session";
import { postAdminService } from "@/services/social/post-admin.service";

export async function handlePostsPost(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const validatedData = createPostSchema.parse({
      title: data.title,
      content: data.content || "",
      type: data.type,
      rubric: data.rubric,
      scheduledAt: (data.scheduledAt as string) || undefined,
      vipOnly: data.vipOnly === "true",
    });

    const post = await postAdminService.createPost({
      title: validatedData.title,
      content: validatedData.content ?? "",
      type: validatedData.type,
      rubric: validatedData.rubric,
      scheduledAt: validatedData.scheduledAt,
      vipOnly: validatedData.vipOnly,
      authorId: session.user.id,
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

export async function handlePostsGet(request: NextRequest) {
  try {
    const session = await getServerSession();
    const viewerUserId = session?.user?.id;
    const viewerRole = session?.user?.role;

    const { searchParams } = new URL(request.url);
    const rubric = searchParams.get("rubric");
    const published = searchParams.get("published") !== "false";

    const posts = await postAdminService.listPosts({
      rubric,
      published,
      viewerUserId,
      viewerRole,
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
