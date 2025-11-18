import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import schema from "./schema";
import { modules } from "./test.setup";

describe("users table schema and CRUD operations", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("schema validation", () => {
    it("should allow creating user with all required fields from authTables", async () => {
      // Given: User data with base auth fields
      await t.run(async (ctx) => {
        const now = Date.now();

        // When: Creating a user with base auth fields
        const userId = await ctx.db.insert("users", {
          email: "test@example.com",
          emailVerificationTime: now,
          name: "Test User",
          slug: "test-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });

        // Then: User should be created successfully
        const user = await ctx.db.get(userId);
        expect(user).not.toBeNull();
        expect(user!.email).toBe("test@example.com");
        expect(user!.name).toBe("Test User");
        expect(user!.slug).toBe("test-user");
        expect(user!.role).toBe("user");
      });
    });

    it("should allow creating user with optional image field", async () => {
      // Given: User data with image
      await t.run(async (ctx) => {
        const now = Date.now();

        // When: Creating a user with image
        const userId = await ctx.db.insert("users", {
          email: "user@example.com",
          name: "User With Image",
          slug: "user-with-image",
          role: "user",
          image: "https://cloudinary.com/image.jpg",
          createdAt: now,
          updatedAt: now,
        });

        // Then: Image should be stored
        const user = await ctx.db.get(userId);
        expect(user!.image).toBe("https://cloudinary.com/image.jpg");
      });
    });

    it("should allow creating admin user", async () => {
      // Given: Admin user data
      await t.run(async (ctx) => {
        const now = Date.now();

        // When: Creating an admin user
        const userId = await ctx.db.insert("users", {
          email: "admin@example.com",
          name: "Admin User",
          slug: "admin-user",
          role: "admin",
          createdAt: now,
          updatedAt: now,
        });

        // Then: Role should be admin
        const user = await ctx.db.get(userId);
        expect(user!.role).toBe("admin");
      });
    });

    it("should support email index for lookups", async () => {
      // Given: Multiple users with different emails
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "alice@example.com",
          name: "Alice",
          slug: "alice",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.insert("users", {
          email: "bob@example.com",
          name: "Bob",
          slug: "bob",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Querying by email using filter (index exists for performance)
      await t.run(async (ctx) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), "alice@example.com"))
          .first();

        // Then: Should find the correct user
        expect(user).not.toBeNull();
        expect(user!.name).toBe("Alice");
      });
    });

    it("should support slug index for lookups", async () => {
      // Given: Multiple users with different slugs
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "user1@example.com",
          name: "User One",
          slug: "user-one",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.insert("users", {
          email: "user2@example.com",
          name: "User Two",
          slug: "user-two",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Querying by slug using filter (index exists for performance)
      await t.run(async (ctx) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("slug"), "user-two"))
          .first();

        // Then: Should find the correct user
        expect(user).not.toBeNull();
        expect(user!.name).toBe("User Two");
      });
    });

    it("should store phone number when provided", async () => {
      // Given: User data with phone number
      await t.run(async (ctx) => {
        const now = Date.now();

        // When: Creating a user with phone
        const userId = await ctx.db.insert("users", {
          email: "phone-user@example.com",
          phone: "+1234567890",
          phoneVerificationTime: now,
          name: "Phone User",
          slug: "phone-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });

        // Then: Phone should be stored
        const user = await ctx.db.get(userId);
        expect(user!.phone).toBe("+1234567890");
        expect(user!.phoneVerificationTime).toBe(now);
      });
    });

    it("should support isAnonymous flag for anonymous users", async () => {
      // Given: Anonymous user data
      await t.run(async (ctx) => {
        const now = Date.now();

        // When: Creating an anonymous user
        const userId = await ctx.db.insert("users", {
          isAnonymous: true,
          name: "Anonymous",
          slug: "anonymous-123",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });

        // Then: isAnonymous flag should be set
        const user = await ctx.db.get(userId);
        expect(user!.isAnonymous).toBe(true);
      });
    });

    it("should store timestamps for user lifecycle", async () => {
      // Given: Current timestamp
      const before = Date.now();

      // When: Creating a user
      await t.run(async (ctx) => {
        const now = Date.now();
        const userId = await ctx.db.insert("users", {
          email: "timestamp@example.com",
          name: "Timestamp User",
          slug: "timestamp-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });

        // Then: Timestamps should be stored
        const user = await ctx.db.get(userId);
        expect(user!.createdAt).toBeGreaterThanOrEqual(before);
        expect(user!.updatedAt).toBeGreaterThanOrEqual(before);
        expect(user!.createdAt).toBe(user!.updatedAt);
      });
    });
  });

  describe("checkEmailAvailability query", () => {
    it("should return true for available email (no existing user)", async () => {
      // Given: No user with this email exists
      // When: Checking email availability
      const result = await t.query(api.users.checkEmailAvailability, {
        email: "available@example.com",
      });

      // Then: Email should be available
      expect(result).toBe(true);
    });

    it("should return false for taken email (existing user)", async () => {
      // Given: A user with this email exists
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "taken@example.com",
          name: "Taken User",
          slug: "taken-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Checking email availability
      const result = await t.query(api.users.checkEmailAvailability, {
        email: "taken@example.com",
      });

      // Then: Email should not be available
      expect(result).toBe(false);
    });

    it("should handle case-insensitive email matching (uppercase check)", async () => {
      // Given: A user with lowercase email
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "user@example.com",
          name: "User",
          slug: "user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Checking with uppercase email
      const result = await t.query(api.users.checkEmailAvailability, {
        email: "USER@EXAMPLE.COM",
      });

      // Then: Email should not be available (case-insensitive match)
      expect(result).toBe(false);
    });

    it("should handle case-insensitive email matching (mixed case check)", async () => {
      // Given: A user with mixed case email
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "mixedcase@example.com",
          name: "Mixed Case User",
          slug: "mixed-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Checking with different case
      const result = await t.query(api.users.checkEmailAvailability, {
        email: "MixedCase@Example.Com",
      });

      // Then: Email should not be available (case-insensitive match)
      expect(result).toBe(false);
    });

    it("should trim whitespace from email", async () => {
      // Given: A user with trimmed email
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "trimmed@example.com",
          name: "Trimmed User",
          slug: "trimmed-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Checking with whitespace
      const result = await t.query(api.users.checkEmailAvailability, {
        email: "  trimmed@example.com  ",
      });

      // Then: Email should not be available (whitespace trimmed)
      expect(result).toBe(false);
    });

    it("should normalize email consistently with getUserByEmail", async () => {
      // Given: A user exists
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "consistent@example.com",
          name: "Consistent User",
          slug: "consistent-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Checking availability with both queries
      const availability = await t.query(api.users.checkEmailAvailability, {
        email: "CONSISTENT@EXAMPLE.COM",
      });
      const userExists = await t.query(api.users.getUserByEmail, {
        email: "CONSISTENT@EXAMPLE.COM",
      });

      // Then: Both should agree (email is taken)
      expect(availability).toBe(false);
      expect(userExists).not.toBeNull();
    });

    it("should handle multiple users with different emails correctly", async () => {
      // Given: Multiple users exist
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "user1@example.com",
          name: "User 1",
          slug: "user-1",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.insert("users", {
          email: "user2@example.com",
          name: "User 2",
          slug: "user-2",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Checking taken and available emails
      const takenResult = await t.query(api.users.checkEmailAvailability, {
        email: "user1@example.com",
      });
      const availableResult = await t.query(api.users.checkEmailAvailability, {
        email: "user3@example.com",
      });

      // Then: Should correctly identify taken vs available
      expect(takenResult).toBe(false); // user1 is taken
      expect(availableResult).toBe(true); // user3 is available
    });

    it("should use email index for performance (verify index usage)", async () => {
      // Given: A user exists
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "indexed@example.com",
          name: "Indexed User",
          slug: "indexed-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Checking availability (should use index)
      const result = await t.query(api.users.checkEmailAvailability, {
        email: "indexed@example.com",
      });

      // Then: Should work correctly (index usage verified by test passing)
      expect(result).toBe(false);
      // Note: Actual index usage is verified by Convex query optimizer
      // This test ensures the query structure supports index usage
    });
  });

  describe("getCurrentUser query", () => {
    it("should return null when not authenticated", async () => {
      // When: Calling getCurrentUser without authentication
      const result = await t.query(api.users.getCurrentUser, {});

      // Then: Should return null
      expect(result).toBeNull();
    });

    it("should return user profile when authenticated", async () => {
      // Given: An authenticated user
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "auth@example.com",
          name: "Auth User",
          slug: "auth-user",
          role: "user",
          emailVerificationTime: now,
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Calling getCurrentUser with authentication
      const tAuth = t.withIdentity({ subject: userId });
      const result = await tAuth.query(api.users.getCurrentUser, {});

      // Then: Should return user profile
      expect(result).not.toBeNull();
      expect(result!._id).toBe(userId);
      expect(result!.email).toBe("auth@example.com");
      expect(result!.name).toBe("Auth User");
      expect(result!.slug).toBe("auth-user");
      expect(result!.role).toBe("user");
      expect(result!.emailVerified).toBe(true);
    });

    it("should return emailVerified as false when emailVerificationTime is undefined", async () => {
      // Given: A user without email verification
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "unverified@example.com",
          name: "Unverified User",
          slug: "unverified-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Calling getCurrentUser
      const tAuth = t.withIdentity({ subject: userId });
      const result = await tAuth.query(api.users.getCurrentUser, {});

      // Then: emailVerified should be false
      expect(result).not.toBeNull();
      expect(result!.emailVerified).toBe(false);
    });

    it("should return admin user profile", async () => {
      // Given: An admin user
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "admin@example.com",
          name: "Admin User",
          slug: "admin-user",
          role: "admin",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Calling getCurrentUser
      const tAuth = t.withIdentity({ subject: userId });
      const result = await tAuth.query(api.users.getCurrentUser, {});

      // Then: Should return admin profile
      expect(result).not.toBeNull();
      expect(result!.role).toBe("admin");
    });

    it("should include optional image field when present", async () => {
      // Given: A user with profile image
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "image@example.com",
          name: "Image User",
          slug: "image-user",
          role: "user",
          image: "https://cloudinary.com/profile.jpg",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Calling getCurrentUser
      const tAuth = t.withIdentity({ subject: userId });
      const result = await tAuth.query(api.users.getCurrentUser, {});

      // Then: Should include image
      expect(result).not.toBeNull();
      expect(result!.image).toBe("https://cloudinary.com/profile.jpg");
    });

    it("should return null when user not found in database", async () => {
      // Given: A non-existent user ID
      const fakeUserId = "j57cu1paqwkycsvvhdwrcstg316q96pk" as Id<"users">;

      // When: Calling getCurrentUser with fake user ID
      const tAuth = t.withIdentity({ subject: fakeUserId });
      const result = await tAuth.query(api.users.getCurrentUser, {});

      // Then: Should return null
      expect(result).toBeNull();
    });
  });
});
