"use server";

import { getServerSession } from "@/lib/get-session";
import {
  CreateCommentSchema,
  UpdateCommentSchema,
} from "@/app/helpers/social-schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { postService } from "@/application/social/post.service";
import { RubricParam } from "@/domain/social/types";

export async function getRubricPosts(
  rubric: RubricParam,
  page: number = 1,
  limit: number = 12,
) {
  return postService.listByRubric(rubric, page, limit);
}

export async function getVideoPosts(page: number = 1, limit: number = 12) {
  return getRubricPosts("VIDEOS", page, limit);
}

export async function getPostDetails(postId: string) {
  const session = await getServerSession();
  const userId = session?.user?.id;
  return postService.getDetails(postId, userId ?? undefined);
}

export async function createComment(data: z.infer<typeof CreateCommentSchema>) {
  const validation = CreateCommentSchema.safeParse(data);
  if (!validation.success) {
    return { error: "Invalid data" };
  }

  const { content, postId, nickname } = validation.data;
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId && !nickname) {
    return { error: "Nickname required for anonymous users" };
  }

  const comment = await postService.createComment({
    content,
    postId,
    userId: userId || null,
    nickname: userId ? null : (nickname ?? null),
  });

  revalidatePath("/");
  return { success: true, comment };
}

export async function updateComment(data: z.infer<typeof UpdateCommentSchema>) {
  const validation = UpdateCommentSchema.safeParse(data);
  if (!validation.success) {
    return { error: "Invalid data" };
  }

  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "Unauthorized" };
  }

  const { commentId, content } = validation.data;

  try {
    const existingComment = await postService.ensureCommentOwnerOrAdmin(
      commentId,
      userId,
      false,
    );

    if (!existingComment.userId || existingComment.userId !== userId) {
      return { error: "Forbidden" };
    }

    const updatedComment = await postService.updateComment({
      commentId,
      content,
    });

    revalidatePath("/");
    return { success: true, comment: updatedComment };
  } catch (error: any) {
    const message = error?.message ?? "Forbidden";
    return { error: message };
  }
}

export async function deleteComment(commentId: string) {
  if (!commentId) {
    return { error: "Invalid comment id" };
  }

  const session = await getServerSession();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "admin";

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await postService.ensureCommentOwnerOrAdmin(commentId, userId, isAdmin);
    await postService.deleteComment({ commentId });
  } catch (error: any) {
    const message = error?.message ?? "Forbidden";
    return { error: message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function togglePostLike(postId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  await postService.togglePostLike(postId, userId);

  revalidatePath("/");
  return { success: true };
}

export async function toggleCommentLike(commentId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  await postService.toggleCommentLike(commentId, userId);

  revalidatePath("/");
  return { success: true };
}

export async function incrementShareCount(postId: string) {
  await postService.incrementShare(postId);
  return { success: true };
}
