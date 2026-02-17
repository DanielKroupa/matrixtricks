import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { postPreferenceSchema } from "./post-preference-schema";
import type {
  PostPreference,
  PostSortOption,
  RubricParam,
} from "@/domain/social/types";

const PREFERENCE_COOKIE_KEY = "matrix_post_preferences";

const DEFAULT_PREFERENCE: PostPreference = {
  postsPerPage: 10,
  sortBy: "newest",
};

type DbSortOption =
  | "NEWEST"
  | "OLDEST"
  | "SHARE_COUNT"
  | "LIKE_COUNT"
  | "COMMENT_COUNT";

type CookiePreferenceMap = Partial<Record<RubricParam, PostPreference>>;

function toDbSortOption(sortBy: PostSortOption): DbSortOption {
  switch (sortBy) {
    case "oldest":
      return "OLDEST";
    case "shareCount":
      return "SHARE_COUNT";
    case "likeCount":
      return "LIKE_COUNT";
    case "commentCount":
      return "COMMENT_COUNT";
    case "newest":
    default:
      return "NEWEST";
  }
}

function fromDbSortOption(sortBy: DbSortOption): PostSortOption {
  switch (sortBy) {
    case "OLDEST":
      return "oldest";
    case "SHARE_COUNT":
      return "shareCount";
    case "LIKE_COUNT":
      return "likeCount";
    case "COMMENT_COUNT":
      return "commentCount";
    default:
      return "newest";
  }
}

async function readCookiePreferences() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PREFERENCE_COOKIE_KEY)?.value;

  if (!raw) {
    return {} as CookiePreferenceMap;
  }

  try {
    const parsed = JSON.parse(raw) as CookiePreferenceMap;
    return parsed;
  } catch {
    return {} as CookiePreferenceMap;
  }
}

async function writeCookiePreferences(preferences: CookiePreferenceMap) {
  const cookieStore = await cookies();
  cookieStore.set(PREFERENCE_COOKIE_KEY, JSON.stringify(preferences), {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax",
  });
}

export async function getEffectivePostPreference(
  rubric: RubricParam,
): Promise<PostPreference> {
  const session = await getServerSession();

  if (session?.user?.id) {
    const rows = await prisma.$queryRaw<
      Array<{ postsPerPage: number; sortBy: DbSortOption }>
    >`
      SELECT "postsPerPage", "sortBy"
      FROM "user_post_preference"
      WHERE "userId" = ${session.user.id} AND "rubric" = ${rubric}::"RubricType"
      LIMIT 1
    `;

    const row = rows[0];
    if (row) {
      const result = postPreferenceSchema.safeParse({
        rubric,
        postsPerPage: row.postsPerPage,
        sortBy: fromDbSortOption(row.sortBy),
      });

      if (result.success) {
        return {
          postsPerPage: result.data.postsPerPage,
          sortBy: result.data.sortBy,
        };
      }
    }
  }

  const cookiePreferences = await readCookiePreferences();
  const cookiePreference = cookiePreferences[rubric];

  if (!cookiePreference) {
    return DEFAULT_PREFERENCE;
  }

  const result = postPreferenceSchema.safeParse({
    rubric,
    postsPerPage: cookiePreference.postsPerPage,
    sortBy: cookiePreference.sortBy,
  });

  if (!result.success) {
    return DEFAULT_PREFERENCE;
  }

  return {
    postsPerPage: result.data.postsPerPage,
    sortBy: result.data.sortBy,
  };
}

export async function savePostPreference(input: {
  rubric: RubricParam;
  postsPerPage: number;
  sortBy: PostSortOption;
}) {
  const result = postPreferenceSchema.safeParse(input);

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message || "Invalid preference settings",
    };
  }

  const { rubric, postsPerPage, sortBy } = result.data;
  const session = await getServerSession();

  if (session?.user?.id) {
    const dbSortBy = toDbSortOption(sortBy);

    await prisma.$queryRaw`
      INSERT INTO "user_post_preference" ("id", "userId", "rubric", "postsPerPage", "sortBy", "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${session.user.id}, ${rubric}::"RubricType", ${postsPerPage}, ${dbSortBy}::"PostSortOption", NOW(), NOW())
      ON CONFLICT ("userId", "rubric")
      DO UPDATE SET
        "postsPerPage" = EXCLUDED."postsPerPage",
        "sortBy" = EXCLUDED."sortBy",
        "updatedAt" = NOW()
    `;

    return { success: true };
  }

  const cookiePreferences = await readCookiePreferences();
  cookiePreferences[rubric] = { postsPerPage, sortBy };
  await writeCookiePreferences(cookiePreferences);

  return { success: true };
}
