"use server";

import { getServerSession } from "@/lib/get-session";
import {
  CreateCommentSchema,
  UpdateCommentSchema,
} from "@/app/helpers/social-schema";
import type { z } from "zod";
import { revalidatePath } from "next/cache";
import { postService } from "@/application/social/post.service";
import type { PostSortOption, RubricParam } from "@/domain/social/types";
import { entitlementService } from "@/application/billing/entitlement.service";

export async function getRubricPostsPage(
  rubric: RubricParam,
  page: number = 1,
  limit: number = 10,
  sortBy: PostSortOption = "newest",
) {
  const session = await getServerSession();
  const viewerUserId = session?.user?.id;
  const viewerRole = session?.user?.role;
  const vipStatus = await entitlementService.getUserVipStatus(viewerUserId);

  return postService.listByRubric(rubric, page, limit, sortBy, {
    viewerUserId: viewerUserId ?? undefined,
    viewerRole,
    viewerHasVip: vipStatus.isVipActive,
  });
}

export async function getRubricPosts(
  rubric: RubricParam,
  page: number = 1,
  limit: number = 10,
  sortBy: PostSortOption = "newest",
) {
  const result = await getRubricPostsPage(rubric, page, limit, sortBy);
  return result.posts;
}
// Get posts
export async function getVideoPostsPage(
  page: number = 1,
  limit: number = 10,
  sortBy: PostSortOption = "newest",
) {
  return getRubricPostsPage("VIDEOS", page, limit, sortBy);
}

export async function getVideoPosts(
  page: number = 1,
  limit: number = 10,
  sortBy: PostSortOption = "newest",
) {
  return getRubricPosts("VIDEOS", page, limit, sortBy);
}
// Get post details
export async function getPostDetails(postId: string) {
  const session = await getServerSession();
  const viewerUserId = session?.user?.id;
  const viewerRole = session?.user?.role;
  const vipStatus = await entitlementService.getUserVipStatus(viewerUserId);

  return postService.getDetails(postId, {
    viewerUserId: viewerUserId ?? undefined,
    viewerRole,
    viewerHasVip: vipStatus.isVipActive,
  });
}

// Create comment
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

// Update comment
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return { error: message };
  }
}

// Delete comment
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return { error: message };
  }

  revalidatePath("/");
  return { success: true };
}

// Like/unlike post
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

// Like/unlike comment
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

// share count
export async function incrementShareCount(postId: string) {
  await postService.incrementShare(postId);
  return { success: true };
}
