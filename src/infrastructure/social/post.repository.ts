import prisma from "@/lib/prisma";
import type { PostSortOption, RubricParam } from "@/domain/social/types";

const emptyUserId = "00000000-0000-0000-0000-000000000000";

type ViewerContext = {
  viewerUserId?: string;
  viewerRole?: string | null;
  viewerHasVip?: boolean;
};

function toPlainText(content: string | null | undefined) {
  if (!content) {
    return "";
  }

  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function createTeaser(content: string | null | undefined, maxLength = 220) {
  const plainText = toPlainText(content);

  if (!plainText) {
    return "";
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength)}...`;
}

function canAccessVipPost(
  post: { vipOnly: boolean; authorId: string },
  viewer: ViewerContext,
) {
  if (!post.vipOnly) {
    return true;
  }

  if (viewer.viewerRole === "admin") {
    return true;
  }

  if (viewer.viewerUserId && viewer.viewerUserId === post.authorId) {
    return true;
  }

  return Boolean(viewer.viewerHasVip);
}

export const postRepository = {
  async getRubricPosts(
    rubric: RubricParam,
    page = 1,
    limit = 12,
    sortBy: PostSortOption = "newest",
    viewer: ViewerContext = {},
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

    const mappedPosts = paginatedPosts.map((post) => {
      const canAccess = canAccessVipPost(post, viewer);

      if (canAccess) {
        return {
          ...post,
          isLocked: false,
        };
      }

      return {
        ...post,
        isLocked: true,
        content: createTeaser(post.content),
        media: post.media.map((item) => ({ ...item, isBlurred: true })),
      };
    });

    return {
      posts: mappedPosts,
      hasMore,
    };
  },

  async getPostDetails(postId: string, viewerContext: ViewerContext = {}) {
    const viewerUserId = viewerContext.viewerUserId ?? emptyUserId;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            role: true,
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
                role: true,
              },
            },
            likes: { where: { userId: viewerUserId } },
            _count: { select: { likes: true } },
          },
        },
        likes: { where: { userId: viewerUserId } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) {
      return null;
    }

    const canAccess = canAccessVipPost(post, viewerContext);

    if (canAccess) {
      return {
        ...post,
        isLocked: false,
      };
    }

    return {
      ...post,
      isLocked: true,
      comments: [],
      content: createTeaser(post.content, 320),
      media: post.media.map((item) => ({ ...item, isBlurred: true })),
    };
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

  async incrementShareCount(postId: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: { shareCount: { increment: 1 } },
      });

      if (userId) {
        await tx.postShare.create({
          data: {
            postId,
            userId,
          },
        });
      }

      return updatedPost;
    });
  },
};
