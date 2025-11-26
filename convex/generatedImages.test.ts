import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";
import { createTestUser, asUser } from "./test.helpers";

describe("generatedImages CRUD operations", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("generatedImages.getByQuote query", () => {
    it("should return all generated images for a quote using index", async () => {
      // Given: A person with a quote and multiple generated images
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Albert Einstein",
        slug: "albert-einstein",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "einstein-base",
        url: "https://example.com/einstein.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Imagination is more important than knowledge.",
      });

      // Create multiple generated images for the same quote
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days from now

      await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "generated-1",
        url: "https://res.cloudinary.com/test/generated-1.jpg",
        transformation: "w_800,h_600,c_fill",
        expiresAt,
      });

      await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "generated-2",
        url: "https://res.cloudinary.com/test/generated-2.jpg",
        transformation: "w_1200,h_900,c_fill",
        expiresAt,
      });

      // When: Getting generated images by quote
      const images = await t.query(api.generatedImages.getByQuote, {
        quoteId,
      });

      // Then: Both images should be returned
      expect(images).toHaveLength(2);
      expect(images.every((img) => img.quoteId === quoteId)).toBe(true);
      expect(images[0]!.cloudinaryId).toBe("generated-1");
      expect(images[1]!.cloudinaryId).toBe("generated-2");
    });

    it("should return empty array for quote with no generated images", async () => {
      // Given: A quote with no generated images
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "A quote without generated images",
      });

      // When: Getting generated images for quote
      const images = await t.query(api.generatedImages.getByQuote, {
        quoteId,
      });

      // Then: Should return empty array
      expect(images).toHaveLength(0);
    });

    it("should not return generated images from other quotes", async () => {
      // Given: Two quotes with generated images
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quote1Id = await authT.mutation(api.quotes.create, {
        personId,
        text: "Quote 1",
      });

      const quote2Id = await authT.mutation(api.quotes.create, {
        personId,
        text: "Quote 2",
      });

      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

      await t.mutation(api.generatedImages.create, {
        quoteId: quote1Id,
        imageId,
        cloudinaryId: "quote1-generated",
        url: "https://res.cloudinary.com/test/quote1.jpg",
        transformation: "w_800,h_600",
        expiresAt,
      });

      await t.mutation(api.generatedImages.create, {
        quoteId: quote2Id,
        imageId,
        cloudinaryId: "quote2-generated",
        url: "https://res.cloudinary.com/test/quote2.jpg",
        transformation: "w_800,h_600",
        expiresAt,
      });

      // When: Getting images for quote1
      const images = await t.query(api.generatedImages.getByQuote, {
        quoteId: quote1Id,
      });

      // Then: Only quote1's image should be returned
      expect(images).toHaveLength(1);
      expect(images[0]!.cloudinaryId).toBe("quote1-generated");
    });
  });

  describe("generatedImages.getExpiringSoon query", () => {
    it("should return images expiring within specified days", async () => {
      // Given: Setup test data
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      const now = Date.now();
      const threeDaysFromNow = now + 3 * 24 * 60 * 60 * 1000;
      const tenDaysFromNow = now + 10 * 24 * 60 * 60 * 1000;
      const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;

      // Create images with different expiration times
      await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "expires-3-days",
        url: "https://res.cloudinary.com/test/expires-3.jpg",
        transformation: "w_800",
        expiresAt: threeDaysFromNow,
      });

      await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "expires-10-days",
        url: "https://res.cloudinary.com/test/expires-10.jpg",
        transformation: "w_800",
        expiresAt: tenDaysFromNow,
      });

      await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "expires-30-days",
        url: "https://res.cloudinary.com/test/expires-30.jpg",
        transformation: "w_800",
        expiresAt: thirtyDaysFromNow,
      });

      // When: Getting images expiring within 7 days
      const expiringImages = await t.query(
        api.generatedImages.getExpiringSoon,
        {
          days: 7,
        }
      );

      // Then: Only the 3-day image should be returned
      expect(expiringImages).toHaveLength(1);
      expect(expiringImages[0]!.cloudinaryId).toBe("expires-3-days");
    });

    it("should return multiple images if multiple are expiring soon", async () => {
      // Given: Setup with multiple images expiring soon
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      const now = Date.now();
      const twoDaysFromNow = now + 2 * 24 * 60 * 60 * 1000;
      const fiveDaysFromNow = now + 5 * 24 * 60 * 60 * 1000;

      await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "expires-2-days",
        url: "https://res.cloudinary.com/test/expires-2.jpg",
        transformation: "w_800",
        expiresAt: twoDaysFromNow,
      });

      await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "expires-5-days",
        url: "https://res.cloudinary.com/test/expires-5.jpg",
        transformation: "w_800",
        expiresAt: fiveDaysFromNow,
      });

      // When: Getting images expiring within 7 days
      const expiringImages = await t.query(
        api.generatedImages.getExpiringSoon,
        {
          days: 7,
        }
      );

      // Then: Both images should be returned
      expect(expiringImages).toHaveLength(2);
    });

    it("should return empty array if no images are expiring soon", async () => {
      // Given: Setup with image expiring far in the future
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;

      await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "expires-30-days",
        url: "https://res.cloudinary.com/test/expires-30.jpg",
        transformation: "w_800",
        expiresAt: thirtyDaysFromNow,
      });

      // When: Getting images expiring within 7 days
      const expiringImages = await t.query(
        api.generatedImages.getExpiringSoon,
        {
          days: 7,
        }
      );

      // Then: Should return empty array
      expect(expiringImages).toHaveLength(0);
    });

    it("should use default of 7 days when days parameter not provided", async () => {
      // Given: Setup with image expiring in 5 days
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      const fiveDaysFromNow = Date.now() + 5 * 24 * 60 * 60 * 1000;

      await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "expires-5-days",
        url: "https://res.cloudinary.com/test/expires-5.jpg",
        transformation: "w_800",
        expiresAt: fiveDaysFromNow,
      });

      // When: Getting images without days parameter (defaults to 7)
      const expiringImages = await t.query(
        api.generatedImages.getExpiringSoon,
        {}
      );

      // Then: Should return the 5-day image
      expect(expiringImages).toHaveLength(1);
      expect(expiringImages[0]!.cloudinaryId).toBe("expires-5-days");
    });
  });

  describe("generatedImages.create mutation", () => {
    it("should create generated image with all required fields", async () => {
      // Given: A person, image, and quote
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

      // When: Creating generated image
      const generatedImageId = await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "generated-test",
        url: "https://res.cloudinary.com/test/generated.jpg",
        transformation: "w_800,h_600,c_fill",
        expiresAt,
      });

      // Then: Generated image should be created
      expect(generatedImageId).toBeDefined();

      const images = await t.query(api.generatedImages.getByQuote, {
        quoteId,
      });
      expect(images).toHaveLength(1);
      expect(images[0]!.cloudinaryId).toBe("generated-test");
      expect(images[0]!.url).toBe(
        "https://res.cloudinary.com/test/generated.jpg"
      );
      expect(images[0]!.transformation).toBe("w_800,h_600,c_fill");
      expect(images[0]!.expiresAt).toBe(expiresAt);
      expect(images[0]!.createdAt).toBeGreaterThan(0);
    });

    it("should trim whitespace from cloudinaryId and url", async () => {
      // Given: Setup test data
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When: Creating with whitespace
      await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "  generated-with-spaces  ",
        url: "  https://res.cloudinary.com/test/generated.jpg  ",
        transformation: "w_800",
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });

      // Then: Whitespace should be trimmed
      const images = await t.query(api.generatedImages.getByQuote, {
        quoteId,
      });
      expect(images[0]!.cloudinaryId).toBe("generated-with-spaces");
      expect(images[0]!.url).toBe(
        "https://res.cloudinary.com/test/generated.jpg"
      );
    });

    it("should trim whitespace from transformation", async () => {
      // Given: Setup test data
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When: Creating with whitespace in transformation
      await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "generated-test",
        url: "https://res.cloudinary.com/test/generated.jpg",
        transformation: "  w_800,h_600  ",
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });

      // Then: Whitespace should be trimmed
      const images = await t.query(api.generatedImages.getByQuote, {
        quoteId,
      });
      expect(images[0]!.transformation).toBe("w_800,h_600");
    });

    it("should fail when cloudinaryId is empty", async () => {
      // Given: Setup test data
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When/Then: Creating with empty cloudinaryId should throw
      await expect(
        t.mutation(api.generatedImages.create, {
          quoteId,
          imageId,
          cloudinaryId: "",
          url: "https://res.cloudinary.com/test/generated.jpg",
          transformation: "w_800",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        })
      ).rejects.toThrow("Cloudinary ID is required");
    });

    it("should fail when cloudinaryId is whitespace only", async () => {
      // Given: Setup test data
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When/Then: Creating with whitespace-only cloudinaryId should throw
      await expect(
        t.mutation(api.generatedImages.create, {
          quoteId,
          imageId,
          cloudinaryId: "   ",
          url: "https://res.cloudinary.com/test/generated.jpg",
          transformation: "w_800",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        })
      ).rejects.toThrow("Cloudinary ID is required");
    });

    it("should fail when url is empty", async () => {
      // Given: Setup test data
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When/Then: Creating with empty url should throw
      await expect(
        t.mutation(api.generatedImages.create, {
          quoteId,
          imageId,
          cloudinaryId: "generated-test",
          url: "",
          transformation: "w_800",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        })
      ).rejects.toThrow("Image URL is required");
    });

    it("should fail when transformation is empty", async () => {
      // Given: Setup test data
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When/Then: Creating with empty transformation should throw
      await expect(
        t.mutation(api.generatedImages.create, {
          quoteId,
          imageId,
          cloudinaryId: "generated-test",
          url: "https://res.cloudinary.com/test/generated.jpg",
          transformation: "",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        })
      ).rejects.toThrow("Transformation is required");
    });

    it("should fail when quote does not exist", async () => {
      // Given: Create and delete a quote to get valid but non-existent ID
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Temporary quote",
      });
      await authT.mutation(api.quotes.remove, { id: quoteId });

      // When/Then: Creating with non-existent quote should throw
      await expect(
        t.mutation(api.generatedImages.create, {
          quoteId,
          imageId,
          cloudinaryId: "generated-test",
          url: "https://res.cloudinary.com/test/generated.jpg",
          transformation: "w_800",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        })
      ).rejects.toThrow("Quote not found");
    });

    it("should fail when image does not exist", async () => {
      // Given: Create and delete an image to get valid but non-existent ID
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });
      await authT.mutation(api.images.remove, { id: imageId });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When/Then: Creating with non-existent image should throw
      await expect(
        t.mutation(api.generatedImages.create, {
          quoteId,
          imageId,
          cloudinaryId: "generated-test",
          url: "https://res.cloudinary.com/test/generated.jpg",
          transformation: "w_800",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        })
      ).rejects.toThrow("Image not found");
    });
  });

  describe("generatedImages.remove mutation", () => {
    it("should delete generated image", async () => {
      // Given: An existing generated image
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      const generatedImageId = await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "generated-test",
        url: "https://res.cloudinary.com/test/generated.jpg",
        transformation: "w_800",
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });

      // Verify image exists
      let images = await t.query(api.generatedImages.getByQuote, { quoteId });
      expect(images).toHaveLength(1);

      // When: Removing generated image
      const removedId = await t.mutation(api.generatedImages.remove, {
        id: generatedImageId,
      });

      // Then: Generated image should be deleted
      expect(removedId).toBe(generatedImageId);
      images = await t.query(api.generatedImages.getByQuote, { quoteId });
      expect(images).toHaveLength(0);
    });

    it("should not delete quote or base image when generated image is deleted", async () => {
      // Given: A generated image
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "base-image",
        url: "https://example.com/base.jpg",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      const generatedImageId = await t.mutation(api.generatedImages.create, {
        quoteId,
        imageId,
        cloudinaryId: "generated-test",
        url: "https://res.cloudinary.com/test/generated.jpg",
        transformation: "w_800",
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });

      // When: Removing generated image
      await t.mutation(api.generatedImages.remove, { id: generatedImageId });

      // Then: Quote and base image should still exist
      const quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote).not.toBeNull();

      const baseImages = await t.query(api.images.getByPerson, { personId });
      expect(baseImages).toHaveLength(1);
    });
  });
});
