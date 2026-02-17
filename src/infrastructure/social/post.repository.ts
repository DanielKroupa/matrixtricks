import prisma from "@/lib/prisma";
import type { PostSortOption, RubricParam } from "@/domain/social/types";

const emptyUserId = "00000000-0000-0000-0000-000000000000";

export const postRepository = {
  async getRubricPosts(
    rubric: RubricParam,
    page = 1,
    limit = 12,
    sortBy: PostSortOption = "newest",
  ) {
    const skip = (page - 1) * limit;

    const sortOrderBy =
      sortBy === "oldest"
        ? [{ createdAt: "asc" as const }]
        : sortBy === "shareCount"
          ? [{ shareCount: "desc" as const }, { createdAt: "desc" as const }]
          : sortBy === "likeCount"
            ? [
                { likes: { _count: "desc" as const } },
                { createdAt: "desc" as const },
              ]
            : sortBy === "commentCount"
              ? [
                  { comments: { _count: "desc" as const } },
                  { createdAt: "desc" as const },
                ]
              : [{ createdAt: "desc" as const }];

    const posts = await prisma.post.findMany({
      where: { rubric, published: true },
      orderBy: [{ isPinned: "desc" }, { pinnedAt: "desc" }, ...sortOrderBy],
      skip,
      take: limit + 1,
      include: {
        media: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    const hasMore = posts.length > limit;
    const paginatedPosts = hasMore ? posts.slice(0, limit) : posts;

    return {
      posts: paginatedPosts,
      hasMore,
    };
  },

  async getPostDetails(postId: string, userId?: string) {
    const viewer = userId ?? emptyUserId;
    return prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: true,
        author: { select: { name: true, image: true, username: true } },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, image: true, username: true } },
            likes: { where: { userId: viewer } },
            _count: { select: { likes: true } },
          },
        },
        likes: { where: { userId: viewer } },
        _count: { select: { likes: true, comments: true } },
      },
    });
  },

  async createComment(data: {
    content: string;
    postId: string;
    userId: string | null;
    nickname: string | null;
  }) {
    return prisma.comment.create({ data });
  },

  async updateComment(commentId: string, content: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
  },

  async findCommentOwner(commentId: string) {
    return prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });
  },

  async deleteComment(commentId: string) {
    return prisma.comment.delete({ where: { id: commentId } });
  },

  async findPostLike(userId: string, postId: string) {
    return prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
  },

  async createPostLike(userId: string, postId: string) {
    return prisma.postLike.create({ data: { userId, postId } });
  },

  async deletePostLike(id: string) {
    return prisma.postLike.delete({ where: { id } });
  },

  async findCommentLike(userId: string, commentId: string) {
    return prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
  },

  async createCommentLike(userId: string, commentId: string) {
    return prisma.commentLike.create({ data: { userId, commentId } });
  },

  async deleteCommentLike(id: string) {
    return prisma.commentLike.delete({ where: { id } });
  },

  async incrementShareCount(postId: string) {
    return prisma.post.update({
      where: { id: postId },
      data: { shareCount: { increment: 1 } },
    });
  },
};
