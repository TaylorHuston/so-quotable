import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";
import { createTestUser, asUser } from "./test.helpers";
import { AUTH_ERRORS } from "./lib/auth";

describe("quotes CRUD operations", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("quotes.list query", () => {
    it("should return all quotes", async () => {
      // Given: A user, person and two quotes
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Albert Einstein",
        slug: "albert-einstein",
      });

      await authT.mutation(api.quotes.create, {
        personId,
        text: "Imagination is more important than knowledge",
      });
      await authT.mutation(api.quotes.create, {
        personId,
        text: "Life is like riding a bicycle",
      });

      // When: Querying all quotes (no auth required for queries)
      const quotes = await t.query(api.quotes.list, {});

      // Then: Both quotes should be returned
      expect(quotes).toHaveLength(2);
    });

    it("should filter quotes by personId", async () => {
      // Given: Two people with quotes
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

      await authT.mutation(api.quotes.create, {
        personId: person1Id,
        text: "Quote from person 1",
      });
      await authT.mutation(api.quotes.create, {
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
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test-person",
      });

      for (let i = 1; i <= 3; i++) {
        await authT.mutation(api.quotes.create, {
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
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Marie Curie",
        slug: "marie-curie",
      });

      await authT.mutation(api.quotes.create, {
        personId,
        text: "Nothing in life is to be feared",
      });
      await authT.mutation(api.quotes.create, {
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
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
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
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
        source: "Test source",
      });

      // When: Getting quote by ID
      const quote = await t.query(api.quotes.get, { id: quoteId });

      // Then: Quote should be returned with createdBy set
      expect(quote).not.toBeNull();
      expect(quote!.text).toBe("Test quote");
      expect(quote!.source).toBe("Test source");
      expect(quote!.createdBy).toBe(userId);
    });

    it("should return null for non-existent ID", async () => {
      // Given: Create and delete a quote to get a valid but non-existent ID
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Temporary Person",
        slug: "temporary",
      });
      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Temporary quote",
      });
      await authT.mutation(api.quotes.remove, { id: quoteId });

      // When: Getting quote with deleted ID
      const quote = await t.query(api.quotes.get, { id: quoteId });

      // Then: Should return null
      expect(quote).toBeNull();
    });
  });

  describe("quotes.create mutation", () => {
    it("should create quote with required fields only", async () => {
      // Given: An authenticated user and a person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating quote with minimal data
      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Minimal quote",
      });

      // Then: Quote should be created with defaults and createdBy
      const quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote!.text).toBe("Minimal quote");
      expect(quote!.personId).toBe(personId);
      expect(quote!.verified).toBe(false);
      expect(quote!.createdBy).toBe(userId);
      expect(quote!.createdAt).toBeGreaterThan(0);
      expect(quote!.updatedAt).toBeGreaterThan(0);
    });

    it("should create quote with all optional fields", async () => {
      // Given: An authenticated user and a person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating quote with full data
      const quoteId = await authT.mutation(api.quotes.create, {
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
      // Given: An authenticated user and a person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When: Creating quote with whitespace
      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "  Quote with spaces  ",
      });

      // Then: Whitespace should be trimmed
      const quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote!.text).toBe("Quote with spaces");
    });

    it("should fail when text is empty", async () => {
      // Given: An authenticated user and a person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating quote with empty text should throw
      await expect(
        authT.mutation(api.quotes.create, {
          personId,
          text: "",
        })
      ).rejects.toThrow("Quote text is required");
    });

    it("should fail when text is whitespace only", async () => {
      // Given: An authenticated user and a person
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating quote with whitespace-only text should throw
      await expect(
        authT.mutation(api.quotes.create, {
          personId,
          text: "   ",
        })
      ).rejects.toThrow("Quote text is required");
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

      // When/Then: Creating quote for non-existent person should throw
      await expect(
        authT.mutation(api.quotes.create, {
          personId,
          text: "Test quote",
        })
      ).rejects.toThrow("Person not found");
    });

    it("should fail without authentication", async () => {
      // Given: A person exists but user is not authenticated
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      // When/Then: Creating quote without auth should throw
      await expect(
        t.mutation(api.quotes.create, {
          personId,
          text: "Test quote",
        })
      ).rejects.toThrow(AUTH_ERRORS.NOT_AUTHENTICATED);
    });
  });

  describe("quotes.update mutation", () => {
    it("should update quote fields when owner", async () => {
      // Given: An existing quote created by user
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Original text",
      });

      const originalQuote = await t.query(api.quotes.get, { id: quoteId });
      const originalUpdatedAt = originalQuote!.updatedAt;

      // Small delay to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      // When: Updating quote as owner
      await authT.mutation(api.quotes.update, {
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
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When: Updating verified flag
      await authT.mutation(api.quotes.update, {
        id: quoteId,
        verified: true,
      });

      // Then: Verified should be updated
      const quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote!.verified).toBe(true);
    });

    it("should fail when updating text to empty string", async () => {
      // Given: An existing quote
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When/Then: Updating to empty text should throw
      await expect(
        authT.mutation(api.quotes.update, {
          id: quoteId,
          text: "",
        })
      ).rejects.toThrow("Quote text cannot be empty");
    });

    it("should fail without authentication", async () => {
      // Given: An existing quote
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When/Then: Updating without auth should throw
      await expect(
        t.mutation(api.quotes.update, {
          id: quoteId,
          text: "Updated text",
        })
      ).rejects.toThrow(AUTH_ERRORS.NOT_AUTHENTICATED);
    });

    it("should fail when updating someone else's quote", async () => {
      // Given: A quote created by user1, trying to update as user2
      const user1Id = await t.run(async (ctx) => createTestUser(ctx));
      const user2Id = await t.run(async (ctx) => createTestUser(ctx));

      const auth1 = asUser(t, user1Id);
      const auth2 = asUser(t, user2Id);

      const personId = await auth1.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await auth1.mutation(api.quotes.create, {
        personId,
        text: "User1's quote",
      });

      // When/Then: User2 trying to update should throw
      await expect(
        auth2.mutation(api.quotes.update, {
          id: quoteId,
          text: "Hacked text",
        })
      ).rejects.toThrow(AUTH_ERRORS.NOT_AUTHORIZED);
    });

    it("should allow admin to update any quote", async () => {
      // Given: A quote created by regular user, admin user
      const regularUserId = await t.run(async (ctx) => createTestUser(ctx));
      const adminUserId = await t.run(async (ctx) =>
        createTestUser(ctx, { role: "admin" })
      );

      const regularAuth = asUser(t, regularUserId);
      const adminAuth = asUser(t, adminUserId);

      const personId = await regularAuth.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await regularAuth.mutation(api.quotes.create, {
        personId,
        text: "Regular user's quote",
      });

      // When: Admin updates the quote
      await adminAuth.mutation(api.quotes.update, {
        id: quoteId,
        text: "Admin updated this",
      });

      // Then: Quote should be updated
      const quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote!.text).toBe("Admin updated this");
    });
  });

  describe("quotes.remove mutation", () => {
    it("should delete quote when owner", async () => {
      // Given: An existing quote
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // Verify quote exists
      let quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote).not.toBeNull();

      // When: Removing quote as owner
      const removedId = await authT.mutation(api.quotes.remove, { id: quoteId });

      // Then: Quote should be deleted
      expect(removedId).toBe(quoteId);
      quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote).toBeNull();
    });

    it("should not delete person when quote is deleted (no cascade)", async () => {
      // Given: A person with a quote
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When: Removing quote
      await authT.mutation(api.quotes.remove, { id: quoteId });

      // Then: Person should still exist
      const person = await t.query(api.people.get, { id: personId });
      expect(person).not.toBeNull();
    });

    it("should fail without authentication", async () => {
      // Given: An existing quote
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      const personId = await authT.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await authT.mutation(api.quotes.create, {
        personId,
        text: "Test quote",
      });

      // When/Then: Removing without auth should throw
      await expect(
        t.mutation(api.quotes.remove, { id: quoteId })
      ).rejects.toThrow(AUTH_ERRORS.NOT_AUTHENTICATED);
    });

    it("should fail when deleting someone else's quote", async () => {
      // Given: A quote created by user1, trying to delete as user2
      const user1Id = await t.run(async (ctx) => createTestUser(ctx));
      const user2Id = await t.run(async (ctx) => createTestUser(ctx));

      const auth1 = asUser(t, user1Id);
      const auth2 = asUser(t, user2Id);

      const personId = await auth1.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await auth1.mutation(api.quotes.create, {
        personId,
        text: "User1's quote",
      });

      // When/Then: User2 trying to delete should throw
      await expect(
        auth2.mutation(api.quotes.remove, { id: quoteId })
      ).rejects.toThrow(AUTH_ERRORS.NOT_AUTHORIZED);
    });

    it("should allow admin to delete any quote", async () => {
      // Given: A quote created by regular user, admin user
      const regularUserId = await t.run(async (ctx) => createTestUser(ctx));
      const adminUserId = await t.run(async (ctx) =>
        createTestUser(ctx, { role: "admin" })
      );

      const regularAuth = asUser(t, regularUserId);
      const adminAuth = asUser(t, adminUserId);

      const personId = await regularAuth.mutation(api.people.create, {
        name: "Test Person",
        slug: "test",
      });

      const quoteId = await regularAuth.mutation(api.quotes.create, {
        personId,
        text: "Regular user's quote",
      });

      // When: Admin deletes the quote
      await adminAuth.mutation(api.quotes.remove, { id: quoteId });

      // Then: Quote should be deleted
      const quote = await t.query(api.quotes.get, { id: quoteId });
      expect(quote).toBeNull();
    });
  });
});
