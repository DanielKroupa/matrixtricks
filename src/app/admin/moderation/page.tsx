import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { forbidden, unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import prisma from "@/lib/prisma";
import { userBlockService } from "@/services/moderation/user-block.service";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { metadata } = getMessages(locale);

  return {
    title: metadata.adminModerationTitle,
    description: metadata.description,
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  const { admin } = getMessages(locale);
  const dateLocale = locale === "cs" ? "cs-CZ" : "en-US";
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    unauthorized();
  }
  if (user?.role !== "admin") {
    forbidden();
  }

  const _adminUserId = user?.id;

  async function unblockAction(formData: FormData) {
    "use server";

    const actionSession = await getServerSession();
    const actionUser = actionSession?.user;
    if (!actionUser) {
      unauthorized();
    }
    if (actionUser.role !== "admin") {
      forbidden();
    }

    const targetUserId = String(formData.get("targetUserId") ?? "");
    if (!targetUserId) {
      return;
    }

    await userBlockService.unblockUserByAdmin(targetUserId, actionUser.id);
    revalidatePath("/admin/moderation");
  }

  const userWriteBlockDelegate = (
    prisma as typeof prisma & {
      userWriteBlock?: {
        findMany: typeof prisma.userWriteBlock.findMany;
      };
    }
  ).userWriteBlock;

  const activeBlocks = await userWriteBlockDelegate.findMany({
    where: {
      isActive: true,
      startsAt: { lte: new Date() },
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      targetUser: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
        },
      },
      createdByUser: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });

  return (
    <div>
      <h3 className="text-lg font-medium">{admin.moderationTitle}</h3>
      <p className="mt-2 text-neutral-400 dark:text-neutral-300">
        {admin.moderationDescription}
      </p>

      <div className="mt-6 space-y-3">
        {activeBlocks.length === 0 ? (
          <p className="text-sm text-neutral-300">{admin.noActiveBlocks}</p>
        ) : (
          activeBlocks.map((block) => (
            <div
              key={block.id}
              className="rounded-md border-2 border-neutral-300 bg-transparent p-3 dark:border-neutral-600"
            >
              <div className="mb-2 flex items-center gap-2">
                {block.targetUser?.image && (
                  <Image
                    src={block.targetUser.image}
                    width={20}
                    height={20}
                    alt={block.targetUser?.name ?? admin.avatarAlt}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <p className="text-sm font-medium">
                  {(block.targetUser?.name ||
                    block.targetUser?.username ||
                    block.targetUser?.email ||
                    admin.unknownUser) +
                    " — " +
                    block.reason}
                </p>
              </div>
              <p className="mt-1 text-xs text-neutral-400">
                {admin.blocked}
                {block.endsAt
                  ? ` ${admin.until} ${block.endsAt.toLocaleString(dateLocale)}`
                  : ` ${admin.permanently}`}
              </p>

              {block.targetUserId ? (
                <form action={unblockAction} className="mt-3">
                  <input
                    type="hidden"
                    name="targetUserId"
                    value={block.targetUserId}
                  />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-md bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-600"
                  >
                    {admin.unblockUser}
                  </button>
                </form>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
