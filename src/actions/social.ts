"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { CreateCommentSchema } from "@/app/helpers/social-schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getVideoPosts(page: number = 1, limit: number = 12) {
  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    where: {
      rubric: "VIDEOS",
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
    include: {
      media: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  return posts;
}

export async function getPostDetails(postId: string) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      media: true,
      author: {
        select: {
          name: true,
          image: true,
          username: true,
        },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: {
              name: true,
              image: true,
              username: true,
            },
          },
          likes: {
            where: {
              userId: userId ?? "00000000-0000-0000-0000-000000000000", // Empty string is not valid CUID usually or just to filter empty result
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
      },
      likes: {
        where: {
          userId: userId ?? "00000000-0000-0000-0000-000000000000",
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  return post;
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

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId: userId || null,
      nickname: userId ? null : nickname,
    },
  });

  revalidatePath("/");
  return { success: true, comment };
}

export async function togglePostLike(postId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  const existingLike = await prisma.postLike.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingLike) {
    await prisma.postLike.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.postLike.create({
      data: {
        userId,
        postId,
      },
    });
  }

  revalidatePath("/");
  return { success: true };
}

export async function toggleCommentLike(commentId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
  });

  if (existingLike) {
    await prisma.commentLike.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.commentLike.create({
      data: {
        userId,
        commentId,
      },
    });
  }

  revalidatePath("/");
  return { success: true };
}

export async function incrementShareCount(postId: string) {
  await prisma.post.update({
    where: { id: postId },
    data: {
      shareCount: {
        increment: 1,
      },
    },
  });
  return { success: true };
}
