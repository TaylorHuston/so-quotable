/**
 * Tests for Cloudinary upload action
 *
 * Testing Strategy:
 * - Unit tests for validation logic (these tests)
 * - Integration tests require Cloudinary credentials in Convex environment
 * - Manual verification via scripts/test-cloudinary-upload.ts
 * - Target: 80%+ coverage for validation and error handling logic
 *
 * Note: Actual Cloudinary uploads are tested manually because:
 * - Convex actions with "use node" require env vars from Convex dashboard
 * - convex-test doesn't support loading .env.local for Node runtime actions
 * - Integration testing is done via manual verification script
 */

import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("cloudinary.uploadToCloudinary action validation", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("parameter validation for base-images preset", () => {
    it("should fail when file is empty", async () => {
      // Given: A person exists
      const personId = await t.mutation(api.people.create, {
        name: "Error Test Person",
        slug: "error-test",
      });

      // When/Then: Uploading empty file should throw
      await expect(
        t.action(api.cloudinary.uploadToCloudinary, {
          file: "",
          personId,
          preset: "base-images",
        })
      ).rejects.toThrow("File is required");
    });

    it("should fail when file is whitespace only", async () => {
      // Given: A person exists
      const personId = await t.mutation(api.people.create, {
        name: "Whitespace Test",
        slug: "whitespace",
      });

      // When/Then: Uploading whitespace-only file should throw
      await expect(
        t.action(api.cloudinary.uploadToCloudinary, {
          file: "   ",
          personId,
          preset: "base-images",
        })
      ).rejects.toThrow("File is required");
    });

    it("should fail when personId is missing", async () => {
      // When/Then: Should fail without personId
      await expect(
        t.action(api.cloudinary.uploadToCloudinary, {
          file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          preset: "base-images",
        } as any)
      ).rejects.toThrow("personId is required");
    });

    it("should fail when personId does not exist", async () => {
      // Given: A non-existent person ID
      const personId = await t.mutation(api.people.create, {
        name: "Temporary",
        slug: "temp",
      });
      await t.mutation(api.people.remove, { id: personId });

      // When/Then: Should fail when person doesn't exist
      await expect(
        t.action(api.cloudinary.uploadToCloudinary, {
          file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          personId,
          preset: "base-images",
        })
      ).rejects.toThrow("Person not found");
    });

    it("should fail when preset is invalid", async () => {
      // Given: A person exists
      const personId = await t.mutation(api.people.create, {
        name: "Invalid Preset Person",
        slug: "invalid-preset",
      });

      // When/Then: Invalid preset should throw validation error
      await expect(
        t.action(api.cloudinary.uploadToCloudinary, {
          file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          personId,
          preset: "invalid-preset" as any,
        })
      ).rejects.toThrow();
    });
  });

  describe("parameter validation for generated-images preset", () => {
    it("should fail when quoteId is missing", async () => {
      // Given: Required entities
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const imageId = await t.mutation(api.images.create, {
        personId,
        cloudinaryId: "test",
        url: "https://example.com/test.jpg",
      });

      // When/Then: Should fail without quoteId
      await expect(
        t.action(api.cloudinary.uploadToCloudinary, {
          file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          imageId,
          preset: "generated-images",
          transformation: "test",
        } as any)
      ).rejects.toThrow("quoteId and imageId are required");
    });

    it("should fail when imageId is missing", async () => {
      // Given: Required entities
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
        verified: true,
      });

      // When/Then: Should fail without imageId
      await expect(
        t.action(api.cloudinary.uploadToCloudinary, {
          file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          quoteId,
          preset: "generated-images",
          transformation: "test",
        } as any)
      ).rejects.toThrow("quoteId and imageId are required");
    });

    it("should fail when transformation is missing", async () => {
      // Given: All required entities exist
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
        verified: true,
      });

      const imageId = await t.mutation(api.images.create, {
        personId,
        cloudinaryId: "test",
        url: "https://example.com/test.jpg",
      });

      // When/Then: Should fail when transformation is missing
      await expect(
        t.action(api.cloudinary.uploadToCloudinary, {
          file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          quoteId,
          imageId,
          preset: "generated-images",
          // transformation missing
        } as any)
      ).rejects.toThrow("transformation is required");
    });

    it("should fail when quoteId does not exist", async () => {
      // Given: Non-existent quote
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Temporary quote",
        verified: true,
      });

      const imageId = await t.mutation(api.images.create, {
        personId,
        cloudinaryId: "test",
        url: "https://example.com/test.jpg",
      });

      await t.mutation(api.quotes.remove, { id: quoteId });

      // When/Then: Should fail when quote doesn't exist
      await expect(
        t.action(api.cloudinary.uploadToCloudinary, {
          file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          quoteId,
          imageId,
          preset: "generated-images",
          transformation: "test",
        })
      ).rejects.toThrow("Quote not found");
    });

    it("should fail when imageId does not exist", async () => {
      // Given: Non-existent base image
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
        verified: true,
      });

      const imageId = await t.mutation(api.images.create, {
        personId,
        cloudinaryId: "temp",
        url: "https://example.com/temp.jpg",
      });

      await t.mutation(api.images.remove, { id: imageId });

      // When/Then: Should fail when base image doesn't exist
      await expect(
        t.action(api.cloudinary.uploadToCloudinary, {
          file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          quoteId,
          imageId,
          preset: "generated-images",
          transformation: "test",
        })
      ).rejects.toThrow("Image not found");
    });
  });
});

/**
 * Integration tests (manual verification required)
 *
 * These tests require valid Cloudinary credentials and are meant to be run manually
 * via scripts/test-cloudinary-upload.ts
 *
 * What to test manually:
 * 1. Upload base image (base-images preset)
 *    - Verify image appears in Cloudinary dashboard in so-quotable/people folder
 *    - Verify metadata stored in images table
 *    - Verify returned cloudinaryId, url, width, height
 *
 * 2. Upload generated image (generated-images preset)
 *    - Verify image appears in Cloudinary dashboard in so-quotable/generated folder
 *    - Verify metadata stored in generatedImages table
 *    - Verify expiresAt is ~30 days from now
 *    - Verify unique_filename setting works
 *
 * 3. Test with different file formats
 *    - Base64 data URI
 *    - Public image URL
 *    - Different image formats (PNG, JPG, WebP)
 *
 * 4. Test optional metadata
 *    - Source and license for base images
 *    - Transformation params for generated images
 */
