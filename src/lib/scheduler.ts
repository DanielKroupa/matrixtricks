import cron from "node-cron";
import prisma from "./prisma";
import { accountDeletionService } from "@/services/account/account-deletion.service";
import { chatService } from "@/services/chat/chat.service";

export function startScheduler() {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const postsToPublish = await prisma.post.findMany({
        where: {
          published: false,
          scheduledAt: {
            lte: now,
          },
        },
      });

      for (const post of postsToPublish) {
        await prisma.post.update({
          where: { id: post.id },
          data: { published: true },
        });
        console.log(`Published post: ${post.title}`);
      }

      const deletedUsersCount =
        await accountDeletionService.deleteExpiredAccounts();
      if (deletedUsersCount > 0) {
        console.log(`Deleted ${deletedUsersCount} expired pending account(s)`);
      }

      const deletedChatMessagesCount =
        await chatService.cleanupExpiredMessages();
      if (deletedChatMessagesCount > 0) {
        console.log(
          `Deleted ${deletedChatMessagesCount} expired chat message(s)`,
        );
      }
    } catch (error) {
      console.error("Error in scheduler:", error);
    }
  });

  console.log("Scheduler started");
}

startScheduler();
