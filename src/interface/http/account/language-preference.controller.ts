import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { updateLanguageSchema } from "@/lib/schemas/userSchema/update-language-schema";
import { languagePreferenceService } from "@/services/account/language-preference.service";

export async function handleMyLanguagePatch(request: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = updateLanguageSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const updatedUser = await languagePreferenceService.updateUserLanguage(
      session.user.id,
      parsed.data.preferredLanguage,
    );

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update preferred language" },
      { status: 500 },
    );
  }
}
