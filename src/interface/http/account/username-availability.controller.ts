import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { updateNicknameSchema } from "@/lib/schemas/userSchema/update-nickname-schema";
import {
  RESERVED_NICKNAME_MESSAGE,
  UsernameConflictError,
  UsernameValidationError,
  usernameService,
} from "@/services/account/username.service";

export async function handleUsernameAvailabilityGet(request: Request) {
  const url = new URL(request.url);
  const value = url.searchParams.get("value")?.trim() ?? "";

  if (!value) {
    return NextResponse.json(
      { available: false, error: "Nickname is required" },
      { status: 400 },
    );
  }

  const session = await getServerSession();
  const isTaken = await usernameService.isRegisteredUsername(value, {
    excludeUserId: session?.user?.id,
  });

  if (isTaken) {
    return NextResponse.json(
      {
        available: false,
        error: RESERVED_NICKNAME_MESSAGE,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ available: true });
}

export async function handleMyNicknamePatch(request: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = updateNicknameSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const updatedUser = await usernameService.updateNicknameForUser(
      session.user.id,
      parsed.data.nickname,
    );

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    if (error instanceof UsernameConflictError) {
      return NextResponse.json(
        {
          error: {
            nickname: [error.message || RESERVED_NICKNAME_MESSAGE],
          },
        },
        { status: 409 },
      );
    }

    if (error instanceof UsernameValidationError) {
      return NextResponse.json(
        {
          error: {
            nickname: [error.message],
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update nickname" },
      { status: 500 },
    );
  }
}
