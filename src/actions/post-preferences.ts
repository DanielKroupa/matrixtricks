"use server";

import { revalidatePath } from "next/cache";
import {
  getEffectivePostPreference,
  savePostPreference,
} from "@/app/helpers/post-preferences";
import type { PostSortOption, RubricParam } from "@/domain/social/types";

export async function getPostPreferenceAction(rubric: RubricParam) {
  return getEffectivePostPreference(rubric);
}

export async function savePostPreferenceAction(input: {
  rubric: RubricParam;
  postsPerPage: number;
  sortBy: PostSortOption;
}) {
  const result = await savePostPreference(input);

  if (result.error) {
    return result;
  }

  revalidatePath("/", "layout");
  return { success: true };
}
