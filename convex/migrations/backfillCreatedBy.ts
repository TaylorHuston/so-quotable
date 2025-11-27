import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Backfill migration to populate missing `createdBy` fields.
 *
 * SECURITY: Internal mutation only - not callable from client.
 * Should be executed once from Convex dashboard or CLI before making
 * `createdBy` required in schema.
 *
 * @param adminUserId - The admin user ID to assign as owner of legacy data
 * @returns Statistics about the backfill operation
 */
export const backfillCreatedBy = internalMutation({
  args: {
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { adminUserId }) => {
    // Verify the provided user exists and is an admin
    const adminUser = await ctx.db.get(adminUserId);
    if (!adminUser) {
      throw new Error("Admin user not found");
    }
    if (adminUser.role !== "admin") {
      throw new Error("Provided user is not an admin");
    }

    const stats = {
      people: { checked: 0, updated: 0 },
      quotes: { checked: 0, updated: 0 },
      images: { checked: 0, updated: 0 },
      generatedImages: { checked: 0, updated: 0 },
    };

    // Backfill people table
    const people = await ctx.db.query("people").collect();
    for (const person of people) {
      stats.people.checked++;
      if (!person.createdBy) {
        await ctx.db.patch(person._id, { createdBy: adminUserId });
        stats.people.updated++;
      }
    }

    // Backfill quotes table
    const quotes = await ctx.db.query("quotes").collect();
    for (const quote of quotes) {
      stats.quotes.checked++;
      if (!quote.createdBy) {
        await ctx.db.patch(quote._id, { createdBy: adminUserId });
        stats.quotes.updated++;
      }
    }

    // Backfill images table
    const images = await ctx.db.query("images").collect();
    for (const image of images) {
      stats.images.checked++;
      if (!image.createdBy) {
        await ctx.db.patch(image._id, { createdBy: adminUserId });
        stats.images.updated++;
      }
    }

    // Backfill generatedImages table
    const generatedImages = await ctx.db.query("generatedImages").collect();
    for (const genImage of generatedImages) {
      stats.generatedImages.checked++;
      if (!genImage.createdBy) {
        await ctx.db.patch(genImage._id, { createdBy: adminUserId });
        stats.generatedImages.updated++;
      }
    }

    const totalChecked =
      stats.people.checked +
      stats.quotes.checked +
      stats.images.checked +
      stats.generatedImages.checked;
    const totalUpdated =
      stats.people.updated +
      stats.quotes.updated +
      stats.images.updated +
      stats.generatedImages.updated;

    return {
      success: true,
      adminUserId,
      stats,
      summary: `Backfilled ${totalUpdated} of ${totalChecked} documents with createdBy field`,
    };
  },
});

/**
 * Promote a user to admin role.
 *
 * SECURITY: Internal mutation only - not callable from client.
 * Should be used carefully for initial admin setup or in dashboard.
 *
 * @param userId - The user ID to promote to admin
 * @returns Confirmation of the promotion
 */
export const promoteToAdmin = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "admin") {
      return {
        success: true,
        message: `User ${user.email} is already an admin`,
        userId,
      };
    }

    await ctx.db.patch(userId, {
      role: "admin",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: `User ${user.email} promoted to admin`,
      userId,
    };
  },
});
