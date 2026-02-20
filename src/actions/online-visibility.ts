"use server";

import { revalidatePath } from "next/cache";
import {
  getCurrentUserOnlineVisibility,
  saveCurrentUserOnlineVisibility,
} from "@/app/helpers/online-visibility";

export async function getOnlineVisibilityPreferenceAction() {
  return getCurrentUserOnlineVisibility();
}

export async function saveOnlineVisibilityPreferenceAction(input: {
  enabled: boolean;
}) {
  const result = await saveCurrentUserOnlineVisibility(input);

  if (result.error) {
    return result;
  }

  revalidatePath("/settings");
  revalidatePath("/admin");
  revalidatePath("/", "layout");

  return { success: true, enabled: result.enabled };
}
