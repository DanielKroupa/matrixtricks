"use server";

import { revalidatePath } from "next/cache";
import { siteSettingsService } from "@/application/social/site-settings.service";
import {
  siteBioSchema,
  siteTitleSchema,
} from "@/interface/schemas/social/site-settings.schema";
import { getServerSession } from "@/lib/get-session";

type UpdateSiteSettingsInput = {
  title: string;
  bio: string;
};

export async function updateSiteSettings(input: UpdateSiteSettingsInput) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const titleValidation = siteTitleSchema.safeParse({ title: input.title });
  if (!titleValidation.success) {
    return {
      error: titleValidation.error.issues[0]?.message || "Invalid title",
    };
  }

  const bioValidation = siteBioSchema.safeParse({ bio: input.bio });
  if (!bioValidation.success) {
    return { error: bioValidation.error.issues[0]?.message || "Invalid bio" };
  }

  await siteSettingsService.updateGlobalSettings({
    title: input.title,
    bio: input.bio,
  });

  revalidatePath("/", "layout");
  return { success: true };
}
