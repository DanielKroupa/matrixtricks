"use server";

import { revalidatePath } from "next/cache";
import { siteBioSchema } from "@/app/helpers/site-bio-schema";
import { siteTitleSchema } from "@/app/helpers/site-title-schema";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

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

  await prisma.siteSetting.upsert({
    where: { id: "global" },
    update: { mainTitle: input.title, mainBio: input.bio },
    create: {
      id: "global",
      mainTitle: input.title,
      mainBio: input.bio,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
