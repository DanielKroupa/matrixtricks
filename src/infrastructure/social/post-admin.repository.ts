import type { RubricType } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

const MAX_PINNED_PER_RUBRIC = 5;

export const postAdminRepository = {
  async createPost(input: {
    title: string;
    content: string;
    type: "text" | "media";
    rubric: RubricType;
    scheduledAt?: string;
    vipOnly?: boolean;
    authorId: string;
  }) {
    return prisma.post.create({
      data: {
        title: input.title,
        content: input.content,
        type: input.type,
        rubric: input.rubric,
        scheduledAt: input.scheduledAt
          ? new Date(input.scheduledAt)
          : undefined,
        vipOnly: input.vipOnly,
        authorId: input.authorId,
        published: !input.scheduledAt,
      },
      include: {
        media: true,
      },
    });
  },

  async listPosts(input: {
    published: boolean;
    rubric?: string | null;
    viewerUserId?: string;
    viewerRole?: string | null;
    viewerHasVip: boolean;
  }) {
    return prisma.post.findMany({
      where: {
        published: input.published,
        ...(input.rubric
          ? { rubric: input.rubric.toUpperCase() as RubricType }
          : {}),
        ...(!input.viewerHasVip && input.viewerRole !== "admin"
          ? {
              OR: [
                { vipOnly: false },
                ...(input.viewerUserId
                  ? [{ authorId: input.viewerUserId }]
                  : []),
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
  },

  async findPostMetaById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, rubric: true, isPinned: true },
    });
  },

  async updatePost(
    id: string,
    data: {
      title?: string;
      content?: string;
      isPinned?: boolean;
    },
    rubric: RubricType,
  ) {
    if (data.isPinned === undefined) {
      return prisma.post.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.content !== undefined ? { content: data.content } : {}),
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

    const wantsPinned = data.isPinned;

    return prisma.$transaction(async (tx) => {
      if (wantsPinned) {
        const pinnedInRubric = await tx.post.findMany({
          where: {
            rubric,
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
            ...(data.title !== undefined ? { title: data.title } : {}),
            ...(data.content !== undefined ? { content: data.content } : {}),
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
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.content !== undefined ? { content: data.content } : {}),
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
  },

  async deletePost(id: string) {
    await prisma.post.delete({ where: { id } });
  },
};
