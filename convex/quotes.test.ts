import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("quotes CRUD operations", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("quotes.list query", () => {
    it("should return all quotes", async () => {
      // Given: A person and two quotes
      const personId = await t.mutation(api.people.create, {
        name: "Albert Einstein",
        slug: "albert-einstein",
      });

      await t.mutation(api.quotes.create, {
        personId,
        text: "Imagination is more important than knowledge",
      });
      await t.mutation(api.quotes.create, {
        personId,
        text: "Life is like riding a bicycle",
      });

      // When: Querying all quotes
      const quotes = await t.query(api.quotes.list, {});

      // Then: Both quotes should be returned
      expect(quotes).toHaveLength(2);
    });

    it("should filter quotes by personId", async () => {
      // Given: Two people with quotes
      const person1Id = await t.mutation(api.people.create, {
        name: "Person 1",
        slug: "person-1",
      });
      const person2Id = await t.mutation(api.people.create, {
        name: "Person 2",
        slug: "person-2",
      });

      await t.mutation(api.quotes.create, {
        personId: person1Id,
        text: "Quote from person 1",
      });
      await t.mutation(api.quotes.create, {
        personId: person2Id,
        text: "Quote from person 2",
      });

      // When: Filtering by person1Id
      const quotes = await t.query(api.quotes.list, { personId: person1Id });

      // Then: Only person1's quote should be returned
      expect(quotes).toHaveLength(1);
      expect(quotes[0]!.text).toBe("Quote from person 1");
    });

    it("should respect pagination limit", async () => {
      // Given: Three quotes
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      for (let i = 1; i <= 3; i++) {
        await t.mutation(api.quotes.create, {
          personId,
          text: `Quote ${i}`,
        });
      }

      // When: Querying with limit of 2
      const quotes = await t.query(api.quotes.list, { limit: 2 });

      // Then: Only 2 quotes should be returned
      expect(quotes).toHaveLength(2);
    });
  });

  describe("quotes.getByPerson query", () => {
    it("should return all quotes for a person using index", async () => {
      // Given: A person with multiple quotes
      const personId = await t.mutation(api.people.create, {
        name: "Marie Curie",
        slug: "marie-curie",
      });

      await t.mutation(api.quotes.create, {
        personId,
        text: "Nothing in life is to be feared",
      });
      await t.mutation(api.quotes.create, {
        personId,
        text: "Be less curious about people",
      });

      // When: Getting quotes by person
      const quotes = await t.query(api.quotes.getByPerson, { personId });

      // Then: Both quotes should be returned
      expect(quotes).toHaveLength(2);
      expect(quotes.every((q) => q.personId === personId)).toBe(true);
    });

    it("should return empty array for person with no quotes", async () => {
      // Given: A person with no quotes
      const personId = await t.mutation(api.people.create, {
        name: "Person Without Quotes",
        slug: "no-quotes",
      });

      // When: Getting quotes by person
      const quotes = await t.query(api.quotes.getByPerson, { personId });

      // Then: Should return empty array
      expect(quotes).toHaveLength(0);
    });
  });

  describe("quotes.get query", () => {
    it("should return quote by ID", async () => {
      // Given: A quote in the database
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
        source: "Test source",
      });

      // When: Getting quote by ID
      const quote = await t.query(api.quotes.get, { id: quoteId });

      // Then: Quote should be returned
      expect(quote).not.toBeNull();
      expect(quote!.text).toBe("Test quote");
      expect(quote!.source).toBe("Test source");
    });

    it("should return null for non-existent ID", async () => {
      // Given: Create and delete a quote to get a valid but non-existent ID
      const personId = await t.mutation(api.people.create, {
        name: "Temporary Person",
        slug: "temporary",
      });
      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Temporary quote",
      });
      await t.mutation(api.quotes.remove, { id: quoteId });

      // When: Getting quote with deleted ID
      const quote = await t.query(api.quotes.get, { id: quoteId });

      // Then: Should return null
      expect(quote).toBeNull();
    });
  });

  describe("quotes.create mutation", () => {
    it("should create quote with required fields only", async () => {
      // Given: A person
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating quote with minimal data
      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Minimal quote",
      });

      // Then: Quote should be created with defaults
      const quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote!.text).toBe("Minimal quote");
      expect(quote!.personId).toBe(personId);
      expect(quote!.verified).toBe(false); // Default value
      expect(quote!.createdAt).toBeGreaterThan(0);
      expect(quote!.updatedAt).toBeGreaterThan(0);
    });

    it("should create quote with all optional fields", async () => {
      // Given: A person
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating quote with full data
      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Full quote",
        source: "Book Title",
        sourceUrl: "https://example.com/source",
        verified: true,
      });

      // Then: All fields should be saved
      const quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote!.source).toBe("Book Title");
      expect(quote!.sourceUrl).toBe("https://example.com/source");
      expect(quote!.verified).toBe(true);
    });

    it("should trim whitespace from text", async () => {
      // Given: A person
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating quote with whitespace
      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "  Quote with spaces  ",
      });

      // Then: Whitespace should be trimmed
      const quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote!.text).toBe("Quote with spaces");
    });

    it("should fail when text is empty", async () => {
      // Given: A person
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating quote with empty text should throw
      await expect(
        t.mutation(api.quotes.create, {
          personId,
          text: "",
        })
      ).rejects.toThrow("Quote text is required");
    });

    it("should fail when text is whitespace only", async () => {
      // Given: A person
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating quote with whitespace-only text should throw
      await expect(
        t.mutation(api.quotes.create, {
          personId,
          text: "   ",
        })
      ).rejects.toThrow("Quote text is required");
    });

    it("should fail when person does not exist", async () => {
      // Given: Create and delete a person to get a valid but non-existent ID
      const personId = await t.mutation(api.people.create, {
        name: "Temporary Person",
        slug: "temporary",
      });
      await t.mutation(api.people.remove, { id: personId });

      // When/Then: Creating quote for non-existent person should throw
      await expect(
        t.mutation(api.quotes.create, {
          personId,
          text: "Test quote",
        })
      ).rejects.toThrow("Person not found");
    });
  });

  describe("quotes.update mutation", () => {
    it("should update quote fields", async () => {
      // Given: An existing quote
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Original text",
      });

      const originalQuote = await t.query(api.quotes.get, { id: quoteId });
      const originalUpdatedAt = originalQuote!.updatedAt;

      // Small delay to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      // When: Updating quote
      await t.mutation(api.quotes.update, {
        id: quoteId,
        text: "Updated text",
        source: "New source",
      });

      // Then: Fields should be updated and updatedAt should change
      const updatedQuote = await t.query(api.quotes.get, { id: quoteId });
      expect(updatedQuote!.text).toBe("Updated text");
      expect(updatedQuote!.source).toBe("New source");
      expect(updatedQuote!.updatedAt).toBeGreaterThan(originalUpdatedAt);
    });

    it("should update verified flag", async () => {
      // Given: An unverified quote
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When: Updating verified flag
      await t.mutation(api.quotes.update, {
        id: quoteId,
        verified: true,
      });

      // Then: Verified should be updated
      const quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote!.verified).toBe(true);
    });

    it("should fail when updating text to empty string", async () => {
      // Given: An existing quote
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When/Then: Updating to empty text should throw
      await expect(
        t.mutation(api.quotes.update, {
          id: quoteId,
          text: "",
        })
      ).rejects.toThrow("Quote text cannot be empty");
    });
  });

  describe("quotes.remove mutation", () => {
    it("should delete quote", async () => {
      // Given: An existing quote
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // Verify quote exists
      let quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote).not.toBeNull();

      // When: Removing quote
      const removedId = await t.mutation(api.quotes.remove, { id: quoteId });

      // Then: Quote should be deleted
      expect(removedId).toBe(quoteId);
      quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote).toBeNull();
    });

    it("should not delete person when quote is deleted (no cascade)", async () => {
      // Given: A person with a quote
      const personId = await t.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await t.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When: Removing quote
      await t.mutation(api.quotes.remove, { id: quoteId });

      // Then: Person should still exist
      const person = await t.query(api.people.get, { id: personId });
      expect(person).not.toBeNull();
    });
  });
});
