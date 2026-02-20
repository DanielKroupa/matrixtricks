import type { PostSortOption, RubricParam } from "@/domain/social/types";
import { postRepository } from "@/infrastructure/social/post.repository";
import { entitlementService } from "@/application/billing/entitlement.service";

type ViewerContext = {
  viewerUserId?: string;
  viewerRole?: string | null;
  viewerHasVip?: boolean;
};

export const postService = {
  async listByRubric(
    rubric: RubricParam,
    page = 1,
    limit = 12,
    sortBy: PostSortOption = "newest",
    viewerContext: ViewerContext = {},
  ) {
    return postRepository.getRubricPosts(
      rubric,
      page,
      limit,
      sortBy,
      viewerContext,
    );
  },

  async getDetails(postId: string, viewerContext: ViewerContext = {}) {
    const post = await postRepository.getPostDetails(postId, viewerContext);

    if (!post) {
      return null;
    }

    const userIds = [
      post.authorId,
      ...post.comments
        .map((comment) => comment.user?.id || comment.userId)
        .filter((id): id is string => Boolean(id)),
    ];

    const vipStatusMap = await entitlementService.getVipStatusMap(userIds);

    return {
      ...post,
      author: post.author
        ? {
            ...post.author,
            isVipActive: vipStatusMap.get(post.authorId) ?? false,
          }
        : post.author,
      comments: post.comments.map((comment) => ({
        ...comment,
        user: comment.user
          ? {
              ...comment.user,
              isVipActive:
                vipStatusMap.get(comment.user.id || comment.userId || "") ??
                false,
            }
          : comment.user,
      })),
    };
  },

  async createComment(params: {
    content: string;
    postId: string;
    userId: string | null;
    nickname: string | null;
  }) {
    const { content, postId, userId, nickname } = params;
    return postRepository.createComment({
      content,
      postId,
      userId,
      nickname,
    });
  },

  async updateComment(params: { commentId: string; content: string }) {
    return postRepository.updateComment(params.commentId, params.content);
  },

  async deleteComment(params: { commentId: string }) {
    return postRepository.deleteComment(params.commentId);
  },

  async ensureCommentOwnerOrAdmin(
    commentId: string,
    userId: string,
    isAdmin: boolean,
  ) {
    const existing = await postRepository.findCommentOwner(commentId);
    if (!existing) {
      throw new Error("Comment not found");
    }
    const isOwner = existing.userId === userId;
    if (!isAdmin && !isOwner) {
      throw new Error("Forbidden");
    }
    return existing;
  },

  async togglePostLike(postId: string, userId: string) {
    const existingLike = await postRepository.findPostLike(userId, postId);
    if (existingLike) {
      await postRepository.deletePostLike(existingLike.id);
      return { liked: false };
    }
    await postRepository.createPostLike(userId, postId);
    return { liked: true };
  },

  async toggleCommentLike(commentId: string, userId: string) {
    const existingLike = await postRepository.findCommentLike(
      userId,
      commentId,
    );
    if (existingLike) {
      await postRepository.deleteCommentLike(existingLike.id);
      return { liked: false };
    }
    await postRepository.createCommentLike(userId, commentId);
    return { liked: true };
  },

  async incrementShare(postId: string, userId?: string) {
    await postRepository.incrementShareCount(postId, userId);
    return { success: true } as const;
  },
};
