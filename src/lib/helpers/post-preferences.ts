import { cookies } from "next/headers";
import { postPreferenceService } from "@/services/social/post-preference.service";
import { getServerSession } from "@/lib/get-session";
import type {
  PostPreference,
  PostSortOption,
  RubricParam,
} from "@/types/social";
import { postPreferenceSchema } from "./post-preference-schema";

const PREFERENCE_COOKIE_KEY = "matrix_post_preferences";

const DEFAULT_PREFERENCE: PostPreference = {
  postsPerPage: 10,
  sortBy: "newest",
};

type CookiePreferenceMap = Partial<Record<RubricParam, PostPreference>>;

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
    const userPreference = await postPreferenceService.getUserPreference(
      session.user.id,
      rubric,
    );

    if (userPreference) {
      const result = postPreferenceSchema.safeParse({
        rubric,
        postsPerPage: userPreference.postsPerPage,
        sortBy: userPreference.sortBy,
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
    await postPreferenceService.saveUserPreference({
      userId: session.user.id,
      rubric,
      postsPerPage,
      sortBy,
    });

    return { success: true };
  }

  const cookiePreferences = await readCookiePreferences();
  cookiePreferences[rubric] = { postsPerPage, sortBy };
  await writeCookiePreferences(cookiePreferences);

  return { success: true };
}
