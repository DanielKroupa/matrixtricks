import type { PostSortOption, RubricParam } from "@/domain/social/types";
import {
  type DbSortOption,
  postPreferenceRepository,
} from "@/infrastructure/social/post-preference.repository";

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

export const postPreferenceService = {
  async getUserPreference(userId: string, rubric: RubricParam) {
    const row = await postPreferenceRepository.findUserPreference(
      userId,
      rubric,
    );

    if (!row) {
      return null;
    }

    return {
      postsPerPage: row.postsPerPage,
      sortBy: fromDbSortOption(row.sortBy),
    };
  },

  async saveUserPreference(input: {
    userId: string;
    rubric: RubricParam;
    postsPerPage: number;
    sortBy: PostSortOption;
  }) {
    await postPreferenceRepository.upsertUserPreference({
      userId: input.userId,
      rubric: input.rubric,
      postsPerPage: input.postsPerPage,
      sortBy: toDbSortOption(input.sortBy),
    });
  },
};
