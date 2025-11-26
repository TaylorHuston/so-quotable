import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";
import { createTestUser, asUser } from "./test.helpers";
import { AUTH_ERRORS } from "./lib/auth";

describe("images CRUD operations", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("images.get query", () => {
    it("should return image by ID", async () => {
      // Given: An image exists
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "test-cloud-id",
        url: "https://example.com/test.jpg",
      });

      // When: Getting image by ID
      const image = await t.query(api.images.get, { id: imageId });

      // Then: Should return the image
      expect(image).not.toBeNull();
      expect(image!._id).toBe(imageId);
      expect(image!.cloudinaryId).toBe("test-cloud-id");
      expect(image!.url).toBe("https://example.com/test.jpg");
    });

    it("should return null for non-existent image", async () => {
      // Given: A non-existent image ID
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "temp",
        url: "https://example.com/temp.jpg",
      });

      await authT.mutation(api.images.remove, { id: imageId });

      // When: Getting deleted image
      const image = await t.query(api.images.get, { id: imageId });

      // Then: Should return null
      expect(image).toBeNull();
    });
  });

  describe("images.getByPerson query", () => {
    it("should return all images for a person using index", async () => {
      // Given: A person with multiple images
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Albert Einstein",
        slug: "albert-einstein",
      });

      await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "einstein-1",
        url: "https://example.com/einstein1.jpg",
      });
      await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "einstein-2",
        url: "https://example.com/einstein2.jpg",
      });

      // When: Getting images by person
      const images = await t.query(api.images.getByPerson, { personId });

      // Then: Both images should be returned
      expect(images).toHaveLength(2);
      expect(images.every((img) => img.personId === personId)).toBe(true);
      expect(images[0]!.cloudinaryId).toBe("einstein-1");
      expect(images[1]!.cloudinaryId).toBe("einstein-2");
    });

    it("should return empty array for person with no images", async () => {
      // Given: A person with no images
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Person Without Images",
        slug: "no-images",
      });

      // When: Getting images by person
      const images = await t.query(api.images.getByPerson, { personId });

      // Then: Should return empty array
      expect(images).toHaveLength(0);
    });

    it("should not return images from other people", async () => {
      // Given: Two people with images
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const person1Id = await authT.mutation(api.people.create, {
        name: "Person 1",
        slug: "person-1",
      });
      const person2Id = await authT.mutation(api.people.create, {
        name: "Person 2",
        slug: "person-2",
      });

      await authT.mutation(api.images.create, {
        personId: person1Id,
        cloudinaryId: "person1-img",
        url: "https://example.com/person1.jpg",
      });
      await authT.mutation(api.images.create, {
        personId: person2Id,
        cloudinaryId: "person2-img",
        url: "https://example.com/person2.jpg",
      });

      // When: Getting images for person1
      const images = await t.query(api.images.getByPerson, {
        personId: person1Id,
      });

      // Then: Only person1's image should be returned
      expect(images).toHaveLength(1);
      expect(images[0]!.cloudinaryId).toBe("person1-img");
    });
  });

  describe("images.create mutation", () => {
    it("should create image with required fields only", async () => {
      // Given: A person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating image with minimal data
      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "test-cloud-id",
        url: "https://example.com/test.jpg",
      });

      // Then: Image should be created
      expect(imageId).toBeDefined();

      const images = await t.query(api.images.getByPerson, { personId });
      expect(images).toHaveLength(1);
      expect(images[0]!.cloudinaryId).toBe("test-cloud-id");
      expect(images[0]!.url).toBe("https://example.com/test.jpg");
      expect(images[0]!.createdAt).toBeGreaterThan(0);
    });

    it("should create image with all optional fields", async () => {
      // Given: A person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating image with full data
      const _imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "full-cloud-id",
        url: "https://example.com/full.jpg",
        width: 800,
        height: 600,
        source: "Wikimedia Commons",
        license: "CC BY 4.0",
      });

      // Then: All fields should be saved
      const images = await t.query(api.images.getByPerson, { personId });
      expect(images).toHaveLength(1);
      expect(images[0]!.width).toBe(800);
      expect(images[0]!.height).toBe(600);
      expect(images[0]!.source).toBe("Wikimedia Commons");
      expect(images[0]!.license).toBe("CC BY 4.0");
    });

    it("should trim whitespace from cloudinaryId and url", async () => {
      // Given: A person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating image with whitespace
      const _imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "  cloud-id-with-spaces  ",
        url: "  https://example.com/test.jpg  ",
      });

      // Then: Whitespace should be trimmed
      const images = await t.query(api.images.getByPerson, { personId });
      expect(images[0]!.cloudinaryId).toBe("cloud-id-with-spaces");
      expect(images[0]!.url).toBe("https://example.com/test.jpg");
    });

    it("should fail when cloudinaryId is empty", async () => {
      // Given: A person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating image with empty cloudinaryId should throw
      await expect(
        authT.mutation(api.images.create, {
          personId,
          cloudinaryId: "",
          url: "https://example.com/test.jpg",
        })
      ).rejects.toThrow("Cloudinary ID is required");
    });

    it("should fail when cloudinaryId is whitespace only", async () => {
      // Given: A person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating image with whitespace-only cloudinaryId should throw
      await expect(
        authT.mutation(api.images.create, {
          personId,
          cloudinaryId: "   ",
          url: "https://example.com/test.jpg",
        })
      ).rejects.toThrow("Cloudinary ID is required");
    });

    it("should fail when url is empty", async () => {
      // Given: A person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating image with empty url should throw
      await expect(
        authT.mutation(api.images.create, {
          personId,
          cloudinaryId: "test-id",
          url: "",
        })
      ).rejects.toThrow("Image URL is required");
    });

    it("should fail when person does not exist", async () => {
      // Given: Create and delete a person to get a valid but non-existent ID
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Temporary Person",
        slug: "temporary",
      });
      await authT.mutation(api.people.remove, { id: personId });

      // When/Then: Creating image for non-existent person should throw
      await expect(
        authT.mutation(api.images.create, {
          personId,
          cloudinaryId: "test-id",
          url: "https://example.com/test.jpg",
        })
      ).rejects.toThrow("Person not found");
    });

    it("should fail when user is not authenticated", async () => {
      // Given: A person (need user to create it)
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating image without auth should throw
      await expect(
        t.mutation(api.images.create, {
          personId,
          cloudinaryId: "test-id",
          url: "https://example.com/test.jpg",
        })
      ).rejects.toThrow(AUTH_ERRORS.NOT_AUTHENTICATED);
    });

    it("should set createdBy to authenticated user", async () => {
      // Given: An authenticated user and a person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating image
      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "test-id",
        url: "https://example.com/test.jpg",
      });

      // Then: createdBy should be set to the authenticated user
      const image = await t.query(api.images.get, { id: imageId });
      expect(image!.createdBy).toBe(userId);
    });
  });

  describe("images.remove mutation", () => {
    it("should delete image", async () => {
      // Given: An existing image
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "test-id",
        url: "https://example.com/test.jpg",
      });

      // Verify image exists
      let images = await t.query(api.images.getByPerson, { personId });
      expect(images).toHaveLength(1);

      // When: Removing image
      const removedId = await authT.mutation(api.images.remove, { id: imageId });

      // Then: Image should be deleted
      expect(removedId).toBe(imageId);
      images = await t.query(api.images.getByPerson, { personId });
      expect(images).toHaveLength(0);
    });

    it("should not delete person when image is deleted (no cascade)", async () => {
      // Given: A person with an image
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "test-id",
        url: "https://example.com/test.jpg",
      });

      // When: Removing image
      await authT.mutation(api.images.remove, { id: imageId });

      // Then: Person should still exist
      const person = await t.query(api.people.get, { id: personId });
      expect(person).not.toBeNull();
    });

    it("should fail when user is not authenticated", async () => {
      // Given: An image created by an authenticated user
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "test-id",
        url: "https://example.com/test.jpg",
      });

      // When/Then: Removing without auth should throw
      await expect(
        t.mutation(api.images.remove, { id: imageId })
      ).rejects.toThrow(AUTH_ERRORS.NOT_AUTHENTICATED);
    });

    it("should fail when user does not own image", async () => {
      // Given: An image created by user1
      const user1Id = await t.run(async (ctx) => createTestUser(ctx));
      const user1T = asUser(t, user1Id);

      const personId = await user1T.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const imageId = await user1T.mutation(api.images.create, {
        personId,
        cloudinaryId: "test-id",
        url: "https://example.com/test.jpg",
      });

      // When: User2 tries to delete user1's image
      const user2Id = await t.run(async (ctx) =>
        createTestUser(ctx, { email: "user2@example.com" })
      );
      const user2T = asUser(t, user2Id);

      // Then: Should throw authorization error
      await expect(
        user2T.mutation(api.images.remove, { id: imageId })
      ).rejects.toThrow(AUTH_ERRORS.NOT_AUTHORIZED);
    });

    it("should allow admin to delete any image", async () => {
      // Given: An image created by a regular user
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const imageId = await authT.mutation(api.images.create, {
        personId,
        cloudinaryId: "test-id",
        url: "https://example.com/test.jpg",
      });

      // When: Admin deletes the image
      const adminId = await t.run(async (ctx) =>
        createTestUser(ctx, { email: "admin@example.com", role: "admin" })
      );
      const adminT = asUser(t, adminId);

      const removedId = await adminT.mutation(api.images.remove, {
        id: imageId,
      });

      // Then: Image should be deleted
      expect(removedId).toBe(imageId);
      const image = await t.query(api.images.get, { id: imageId });
      expect(image).toBeNull();
    });
  });
});
