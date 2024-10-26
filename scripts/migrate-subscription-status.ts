import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateSubscriptionStatus() {
  try {
    // Update all users with TRIAL status to NOT_SUBSCRIBED if they don't have an active subscription
    const updated = await prisma.user.updateMany({
      where: {
        AND: [{ subscriptionStatus: "TRIAL" }, { stripePriceId: null }, { currentPeriodEnd: null }],
      },
      data: {
        subscriptionStatus: "NOT_SUBSCRIBED",
      },
    });

    console.log(`Updated ${updated.count} users to NOT_SUBSCRIBED status`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateSubscriptionStatus()
  .then(() => console.log("Migration completed"))
  .catch(console.error);
