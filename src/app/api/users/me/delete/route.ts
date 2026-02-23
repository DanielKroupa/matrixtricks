import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { deleteAccountSchema } from "@/lib/schemas/authSchema/delete-account-schema";
import {
  AccountDeletionValidationError,
  accountDeletionService,
} from "@/services/account/account-deletion.service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = deleteAccountSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result = await accountDeletionService.requestDeletion({
      userId: session.user.id,
      currentPassword: parsed.data.currentPassword,
      confirmationText: parsed.data.confirmationText,
    });

    return NextResponse.json({
      scheduled: true,
      alreadyScheduled: result.alreadyScheduled,
      deleteAfterAt: result.deleteAfterAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AccountDeletionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Failed to schedule account deletion", error);
    return NextResponse.json(
      { error: "Failed to schedule account deletion" },
      { status: 500 },
    );
  }
}
