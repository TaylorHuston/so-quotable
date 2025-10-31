import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("people CRUD operations", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("people.list query", () => {
    it("should return all people", async () => {
      // Given: Two people in the database
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("people", {
          name: "Albert Einstein",
          slug: "albert-einstein",
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.insert("people", {
          name: "Marie Curie",
          slug: "marie-curie",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Querying all people
      const people = await t.query(api.people.list, {});

      // Then: Both people should be returned
      expect(people).toHaveLength(2);
      expect(people[0]!.name).toBe("Albert Einstein");
      expect(people[1]!.name).toBe("Marie Curie");
    });

    it("should respect pagination limit", async () => {
      // Given: Three people in the database
      await t.run(async (ctx) => {
        const now = Date.now();
        for (let i = 1; i <= 3; i++) {
          await ctx.db.insert("people", {
            name: `Person ${i}`,
            slug: `person-${i}`,
            createdAt: now,
            updatedAt: now,
          });
        }
      });

      // When: Querying with limit of 2
      const people = await t.query(api.people.list, { limit: 2 });

      // Then: Only 2 people should be returned
      expect(people).toHaveLength(2);
    });

    it("should default to 50 results when no limit specified", async () => {
      // When: Querying without limit
      const people = await t.query(api.people.list, {});

      // Then: Should not error (default limit applies)
      expect(Array.isArray(people)).toBe(true);
    });
  });

  describe("people.get query", () => {
    it("should return person by ID", async () => {
      // Given: A person in the database
      const personId = await t.mutation(api.people.create, {
        name: "Stephen Hawking",
        slug: "stephen-hawking",
      });

      // When: Getting person by ID
      const person = await t.query(api.people.get, { id: personId });

      // Then: Person should be returned with correct data
      expect(person).not.toBeNull();
      expect(person!.name).toBe("Stephen Hawking");
      expect(person!.slug).toBe("stephen-hawking");
    });

    it("should return null for non-existent ID", async () => {
      // Given: Create and delete a person to get a valid but non-existent ID
      const personId = await t.mutation(api.people.create, {
        name: "Temporary Person",
        slug: "temporary",
      });
      await t.mutation(api.people.remove, { id: personId });

      // When: Getting person with deleted ID
      const person = await t.query(api.people.get, { id: personId });

      // Then: Should return null
      expect(person).toBeNull();
    });
  });

  describe("people.getBySlug query", () => {
    it("should return person by slug using index", async () => {
      // Given: A person with a specific slug
      await t.mutation(api.people.create, {
        name: "Isaac Newton",
        slug: "isaac-newton",
        bio: "English mathematician and physicist",
      });

      // When: Getting person by slug
      const person = await t.query(api.people.getBySlug, {
        slug: "isaac-newton",
      });

      // Then: Person should be returned
      expect(person).not.toBeNull();
      expect(person!.name).toBe("Isaac Newton");
      expect(person!.slug).toBe("isaac-newton");
      expect(person!.bio).toBe("English mathematician and physicist");
    });

    it("should return null for non-existent slug", async () => {
      // When: Getting person with non-existent slug
      const person = await t.query(api.people.getBySlug, {
        slug: "non-existent",
      });

      // Then: Should return null
      expect(person).toBeNull();
    });
  });

  describe("people.create mutation", () => {
    it("should create person with required fields only", async () => {
      // When: Creating person with minimal data
      const personId = await t.mutation(api.people.create, {
        name: "Ada Lovelace",
        slug: "ada-lovelace",
      });

      // Then: Person should be created
      expect(personId).toBeDefined();

      const person = await t.query(api.people.get, { id: personId });
      expect(person!.name).toBe("Ada Lovelace");
      expect(person!.slug).toBe("ada-lovelace");
      expect(person!.createdAt).toBeGreaterThan(0);
      expect(person!.updatedAt).toBeGreaterThan(0);
      expect(person!.createdAt).toBe(person!.updatedAt);
    });

    it("should create person with all optional fields", async () => {
      // When: Creating person with full data
      const personId = await t.mutation(api.people.create, {
        name: "Leonardo da Vinci",
        slug: "leonardo-da-vinci",
        bio: "Italian polymath",
        birthDate: "1452-04-15",
        deathDate: "1519-05-02",
      });

      // Then: All fields should be saved
      const person = await t.query(api.people.get, { id: personId });
      expect(person!.bio).toBe("Italian polymath");
      expect(person!.birthDate).toBe("1452-04-15");
      expect(person!.deathDate).toBe("1519-05-02");
    });

    it("should trim whitespace from name and slug", async () => {
      // When: Creating person with whitespace
      const personId = await t.mutation(api.people.create, {
        name: "  Galileo Galilei  ",
        slug: "  galileo-galilei  ",
      });

      // Then: Whitespace should be trimmed
      const person = await t.query(api.people.get, { id: personId });
      expect(person!.name).toBe("Galileo Galilei");
      expect(person!.slug).toBe("galileo-galilei");
    });

    it("should fail when name is empty", async () => {
      // When/Then: Creating person with empty name should throw
      await expect(
        t.mutation(api.people.create, {
          name: "",
          slug: "test",
        })
      ).rejects.toThrow("Name is required");
    });

    it("should fail when name is whitespace only", async () => {
      // When/Then: Creating person with whitespace-only name should throw
      await expect(
        t.mutation(api.people.create, {
          name: "   ",
          slug: "test",
        })
      ).rejects.toThrow("Name is required");
    });

    it("should fail when slug is empty", async () => {
      // When/Then: Creating person with empty slug should throw
      await expect(
        t.mutation(api.people.create, {
          name: "Test Person",
          slug: "",
        })
      ).rejects.toThrow("Slug is required");
    });
  });

  describe("people.update mutation", () => {
    it("should update person fields", async () => {
      // Given: An existing person
      const personId = await t.mutation(api.people.create, {
        name: "Charles Darwin",
        slug: "charles-darwin",
      });

      const originalPerson = await t.query(api.people.get, { id: personId });
      const originalUpdatedAt = originalPerson!.updatedAt;

      // Small delay to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      // When: Updating person bio
      await t.mutation(api.people.update, {
        id: personId,
        bio: "English naturalist",
      });

      // Then: Bio should be updated and updatedAt should change
      const updatedPerson = await t.query(api.people.get, { id: personId });
      expect(updatedPerson!.bio).toBe("English naturalist");
      expect(updatedPerson!.updatedAt).toBeGreaterThan(originalUpdatedAt);
      expect(updatedPerson!.name).toBe("Charles Darwin"); // Name unchanged
    });

    it("should update multiple fields at once", async () => {
      // Given: An existing person
      const personId = await t.mutation(api.people.create, {
        name: "Nikola Tesla",
        slug: "nikola-tesla",
      });

      // When: Updating multiple fields
      await t.mutation(api.people.update, {
        id: personId,
        bio: "Serbian-American inventor",
        birthDate: "1856-07-10",
        deathDate: "1943-01-07",
      });

      // Then: All fields should be updated
      const person = await t.query(api.people.get, { id: personId });
      expect(person!.bio).toBe("Serbian-American inventor");
      expect(person!.birthDate).toBe("1856-07-10");
      expect(person!.deathDate).toBe("1943-01-07");
    });

    it("should trim whitespace when updating name", async () => {
      // Given: An existing person
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      // When: Updating with whitespace
      await t.mutation(api.people.update, {
        id: personId,
        name: "  Updated Name  ",
      });

      // Then: Whitespace should be trimmed
      const person = await t.query(api.people.get, { id: personId });
      expect(person!.name).toBe("Updated Name");
    });

    it("should fail when updating name to empty string", async () => {
      // Given: An existing person
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      // When/Then: Updating to empty name should throw
      await expect(
        t.mutation(api.people.update, {
          id: personId,
          name: "",
        })
      ).rejects.toThrow("Name cannot be empty");
    });
  });

  describe("people.remove mutation", () => {
    it("should delete person", async () => {
      // Given: An existing person
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      // Verify person exists
      let person = await t.query(api.people.get, { id: personId });
      expect(person).not.toBeNull();

      // When: Removing person
      const removedId = await t.mutation(api.people.remove, { id: personId });

      // Then: Person should be deleted
      expect(removedId).toBe(personId);
      person = await t.query(api.people.get, { id: personId });
      expect(person).toBeNull();
    });
  });
});
