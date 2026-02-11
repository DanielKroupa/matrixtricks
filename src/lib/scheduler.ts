import cron from "node-cron";
import prisma from "./prisma";

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
    } catch (error) {
      console.error("Error in scheduler:", error);
    }
  });

  console.log("Scheduler started");
}
