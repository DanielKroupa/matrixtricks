import { RubricParam } from "@/domain/social/types";
import { postRepository } from "@/infrastructure/social/post.repository";

export const postService = {
  async listByRubric(rubric: RubricParam, page = 1, limit = 12) {
    return postRepository.getRubricPosts(rubric, page, limit);
  },

  async getDetails(postId: string, userId?: string) {
    return postRepository.getPostDetails(postId, userId ?? undefined);
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

  async incrementShare(postId: string) {
    await postRepository.incrementShareCount(postId);
    return { success: true } as const;
  },
};
