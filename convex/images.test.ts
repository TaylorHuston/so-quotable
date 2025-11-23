import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("images CRUD operations", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("images.get query", () => {
    it("should return image by ID", async () => {
      // Given: An image exists
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await t.mutation(api.images.create, {
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
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      const imageId = await t.mutation(api.images.create, {
        personId,
        cloudinaryId: "temp",
        url: "https://example.com/temp.jpg",
      });

      await t.mutation(api.images.remove, { id: imageId });

      // When: Getting deleted image
      const image = await t.query(api.images.get, { id: imageId });

      // Then: Should return null
      expect(image).toBeNull();
    });
  });

  describe("images.getByPerson query", () => {
    it("should return all images for a person using index", async () => {
      // Given: A person with multiple images
      const personId = await t.mutation(api.people.create, {
        name: "Albert Einstein",
        slug: "albert-einstein",
      });

      await t.mutation(api.images.create, {
        personId,
        cloudinaryId: "einstein-1",
        url: "https://example.com/einstein1.jpg",
      });
      await t.mutation(api.images.create, {
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
      const personId = await t.mutation(api.people.create, {
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
      const person1Id = await t.mutation(api.people.create, {
        name: "Person 1",
        slug: "person-1",
      });
      const person2Id = await t.mutation(api.people.create, {
        name: "Person 2",
        slug: "person-2",
      });

      await t.mutation(api.images.create, {
        personId: person1Id,
        cloudinaryId: "person1-img",
        url: "https://example.com/person1.jpg",
      });
      await t.mutation(api.images.create, {
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
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating image with minimal data
      const imageId = await t.mutation(api.images.create, {
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
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating image with full data
      const _imageId = await t.mutation(api.images.create, {
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
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating image with whitespace
      const _imageId = await t.mutation(api.images.create, {
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
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating image with empty cloudinaryId should throw
      await expect(
        t.mutation(api.images.create, {
          personId,
          cloudinaryId: "",
          url: "https://example.com/test.jpg",
        })
      ).rejects.toThrow("Cloudinary ID is required");
    });

    it("should fail when cloudinaryId is whitespace only", async () => {
      // Given: A person
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating image with whitespace-only cloudinaryId should throw
      await expect(
        t.mutation(api.images.create, {
          personId,
          cloudinaryId: "   ",
          url: "https://example.com/test.jpg",
        })
      ).rejects.toThrow("Cloudinary ID is required");
    });

    it("should fail when url is empty", async () => {
      // Given: A person
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating image with empty url should throw
      await expect(
        t.mutation(api.images.create, {
          personId,
          cloudinaryId: "test-id",
          url: "",
        })
      ).rejects.toThrow("Image URL is required");
    });

    it("should fail when person does not exist", async () => {
      // Given: Create and delete a person to get a valid but non-existent ID
      const personId = await t.mutation(api.people.create, {
        name: "Temporary Person",
        slug: "temporary",
      });
      await t.mutation(api.people.remove, { id: personId });

      // When/Then: Creating image for non-existent person should throw
      await expect(
        t.mutation(api.images.create, {
          personId,
          cloudinaryId: "test-id",
          url: "https://example.com/test.jpg",
        })
      ).rejects.toThrow("Person not found");
    });
  });

  describe("images.remove mutation", () => {
    it("should delete image", async () => {
      // Given: An existing image
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const imageId = await t.mutation(api.images.create, {
        personId,
        cloudinaryId: "test-id",
        url: "https://example.com/test.jpg",
      });

      // Verify image exists
      let images = await t.query(api.images.getByPerson, { personId });
      expect(images).toHaveLength(1);

      // When: Removing image
      const removedId = await t.mutation(api.images.remove, { id: imageId });

      // Then: Image should be deleted
      expect(removedId).toBe(imageId);
      images = await t.query(api.images.getByPerson, { personId });
      expect(images).toHaveLength(0);
    });

    it("should not delete person when image is deleted (no cascade)", async () => {
      // Given: A person with an image
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const imageId = await t.mutation(api.images.create, {
        personId,
        cloudinaryId: "test-id",
        url: "https://example.com/test.jpg",
      });

      // When: Removing image
      await t.mutation(api.images.remove, { id: imageId });

      // Then: Person should still exist
      const person = await t.query(api.people.get, { id: personId });
      expect(person).not.toBeNull();
    });
  });
});
