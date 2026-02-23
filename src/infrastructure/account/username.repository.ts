import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

type CandidateUserRow = {
  id: string;
};

type CandidateEmailRow = {
  email: string | null;
};

type UpdatedUserRow = {
  id: string;
  name: string;
  username: string | null;
  displayUsername: string | null;
};

export const usernameRepository = {
  async existsByComparableUsername(value: string, excludeUserId?: string) {
    try {
      const excludeCondition = excludeUserId
        ? Prisma.sql`AND "id" <> ${excludeUserId}`
        : Prisma.empty;

      const rows = await prisma.$queryRaw<CandidateUserRow[]>`
        SELECT "id"
        FROM "user"
        WHERE (
            ("username" IS NOT NULL AND lower(unaccent("username")) = lower(unaccent(${value})))
            OR ("displayUsername" IS NOT NULL AND lower(unaccent("displayUsername")) = lower(unaccent(${value})))
            OR ("name" IS NOT NULL AND lower(unaccent("name")) = lower(unaccent(${value})))
          )
          ${excludeCondition}
        LIMIT 1
      `;

      return rows.length > 0;
    } catch {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            {
              username: {
                equals: value,
                mode: "insensitive",
              },
            },
            {
              displayUsername: {
                equals: value,
                mode: "insensitive",
              },
            },
            {
              name: {
                equals: value,
                mode: "insensitive",
              },
            },
          ],
          ...(excludeUserId
            ? {
                id: {
                  not: excludeUserId,
                },
              }
            : {}),
        },
        select: {
          id: true,
        },
      });

      return Boolean(user);
    }
  },

  async findEmailByComparableUsername(value: string) {
    try {
      const rows = await prisma.$queryRaw<CandidateEmailRow[]>`
        SELECT "email"
        FROM "user"
        WHERE "username" IS NOT NULL
          AND lower(unaccent("username")) = lower(unaccent(${value}))
        LIMIT 1
      `;

      return rows[0]?.email ?? null;
    } catch {
      const user = await prisma.user.findFirst({
        where: {
          username: {
            equals: value,
            mode: "insensitive",
          },
        },
        select: {
          email: true,
        },
      });

      return user?.email ?? null;
    }
  },

  async updateUsernameFields(userId: string, nickname: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: nickname,
        displayUsername: nickname,
      },
      select: {
        id: true,
        name: true,
        username: true,
        displayUsername: true,
      },
    }) as Promise<UpdatedUserRow>;
  },
};
