import { ConvexClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * E2E Database Helper
 *
 * Provides database seeding and cleanup utilities for Playwright E2E tests.
 * Works with a real Convex client connected to a running Convex backend.
 *
 * Usage in E2E Tests:
 * ```typescript
 * import { ConvexClient } from "convex/browser";
 *
 * // In your Playwright test setup
 * const client = new ConvexClient(process.env.CONVEX_URL!);
 *
 * // Seed data before tests
 * const testData = await seedTestData(client);
 *
 * // Clean up after tests
 * await clearDatabase(client);
 * ```
 *
 * Note: For backend unit tests, use the convex-test helpers instead.
 * These E2E helpers are specifically designed for Playwright tests that
 * interact with a real Convex deployment (dev or preview environment).
 *
 * @see tests/e2e/ (Playwright E2E tests)
 * @see convex/test.setup.ts (Backend unit test helpers)
 */

/**
 * Test user data interface
 */
export interface TestUserData {
  email: string;
  password: string;
  name?: string;
  slug?: string;
  role?: "user" | "admin";
}

/**
 * Test person data interface
 */
export interface TestPersonData {
  name: string;
  slug: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
}

/**
 * Test quote data interface
 */
export interface TestQuoteData {
  personId: Id<"people">;
  text: string;
  source?: string;
  sourceUrl?: string;
  verified?: boolean;
}

/**
 * Test image data interface
 */
export interface TestImageData {
  personId: Id<"people">;
  cloudinaryId: string;
  url: string;
  width?: number;
  height?: number;
  source?: string;
  license?: string;
}

/**
 * Seed database with test data for E2E tests
 *
 * Creates sample people, quotes, and images to enable realistic E2E testing.
 * Works with a real Convex client connected to a running backend.
 *
 * @param client - ConvexClient instance connected to Convex backend
 * @returns Object containing created IDs for use in tests
 *
 * @example
 * import { ConvexClient } from "convex/browser";
 *
 * const client = new ConvexClient(process.env.CONVEX_URL!);
 * const testData = await seedTestData(client);
 * // testData.people[0] = { id, name, slug }
 */
export async function seedTestData(client: ConvexClient) {
  // Create test people
  const einsteinId = await client.mutation(api.people.create, {
    name: "Albert Einstein",
    slug: "albert-einstein",
    bio: "Theoretical physicist who developed the theory of relativity",
    birthDate: "1879-03-14",
    deathDate: "1955-04-18",
  });

  const curieMariesId = await client.mutation(api.people.create, {
    name: "Marie Curie",
    slug: "marie-curie",
    bio: "Physicist and chemist who conducted pioneering research on radioactivity",
    birthDate: "1867-11-07",
    deathDate: "1934-07-04",
  });

  const mandalaId = await client.mutation(api.people.create, {
    name: "Nelson Mandela",
    slug: "nelson-mandela",
    bio: "Anti-apartheid revolutionary and former President of South Africa",
    birthDate: "1918-07-18",
    deathDate: "2013-12-05",
  });

  // Create test images
  const einsteinImageId = await client.mutation(api.images.create, {
    personId: einsteinId,
    cloudinaryId: "so-quotable/people/einstein-test",
    url: "https://res.cloudinary.com/test/image/upload/so-quotable/people/einstein-test.jpg",
    width: 800,
    height: 1000,
    source: "Wikimedia Commons",
    license: "Public Domain",
  });

  const curieImageId = await client.mutation(api.images.create, {
    personId: curieMariesId,
    cloudinaryId: "so-quotable/people/curie-test",
    url: "https://res.cloudinary.com/test/image/upload/so-quotable/people/curie-test.jpg",
    width: 800,
    height: 1000,
    source: "Wikimedia Commons",
    license: "Public Domain",
  });

  const mandalaImageId = await client.mutation(api.images.create, {
    personId: mandalaId,
    cloudinaryId: "so-quotable/people/mandela-test",
    url: "https://res.cloudinary.com/test/image/upload/so-quotable/people/mandela-test.jpg",
    width: 800,
    height: 1000,
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
  });

  // Create test quotes
  const einsteinQuote1Id = await client.mutation(api.quotes.create, {
    personId: einsteinId,
    text: "Imagination is more important than knowledge.",
    source: "Interview with George Sylvester Viereck",
    sourceUrl: "https://example.com/source",
    verified: true,
  });

  const einsteinQuote2Id = await client.mutation(api.quotes.create, {
    personId: einsteinId,
    text: "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    source: "Letter to his son Eduard",
    verified: true,
  });

  const curieQuoteId = await client.mutation(api.quotes.create, {
    personId: curieMariesId,
    text: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    verified: true,
  });

  const mandalaQuoteId = await client.mutation(api.quotes.create, {
    personId: mandalaId,
    text: "Education is the most powerful weapon which you can use to change the world.",
    source: "Speech at University of the Witwatersrand",
    verified: true,
  });

  return {
    people: [
      { id: einsteinId, name: "Albert Einstein", slug: "albert-einstein" },
      { id: curieMariesId, name: "Marie Curie", slug: "marie-curie" },
      { id: mandalaId, name: "Nelson Mandela", slug: "nelson-mandela" },
    ],
    images: [
      { id: einsteinImageId, personId: einsteinId },
      { id: curieImageId, personId: curieMariesId },
      { id: mandalaImageId, personId: mandalaId },
    ],
    quotes: [
      { id: einsteinQuote1Id, personId: einsteinId },
      { id: einsteinQuote2Id, personId: einsteinId },
      { id: curieQuoteId, personId: curieMariesId },
      { id: mandalaQuoteId, personId: mandalaId },
    ],
  };
}

/**
 * Clear all test data from database
 *
 * Deletes all people, quotes, images, and generatedImages.
 * Use this in afterEach/afterAll to ensure clean state between tests.
 *
 * Note: This clears ALL data in the database, so it should only be used
 * with a dedicated test database, not production or shared development databases.
 *
 * WARNING: images and generatedImages don't have list() API functions.
 * This function will only delete quotes and people. To fully clean the database,
 * you'll need to add list() queries to images.ts and generatedImages.ts, or
 * use a database reset strategy (like recreating the test database).
 *
 * @param client - ConvexClient instance connected to Convex backend
 *
 * @example
 * import { ConvexClient } from "convex/browser";
 *
 * const client = new ConvexClient(process.env.CONVEX_URL!);
 *
 * afterEach(async () => {
 *   await clearDatabase(client);
 * });
 */
export async function clearDatabase(client: ConvexClient) {
  // Delete all quotes first (references people)
  // Note: Using high limit to get all records; consider pagination for large datasets
  const quotes = await client.query(api.quotes.list, { limit: 10000 });
  for (const quote of quotes) {
    await client.mutation(api.quotes.remove, { id: quote._id });
  }

  // Delete all people (cascades to related images via Convex validation)
  const people = await client.query(api.people.list, { limit: 10000 });
  for (const person of people) {
    await client.mutation(api.people.remove, { id: person._id });
  }

  // Note: Images and generatedImages are not deleted here because they don't have
  // list() API functions. For E2E tests, consider:
  // 1. Adding list() queries to images.ts and generatedImages.ts
  // 2. Using a dedicated test database that's reset between test runs
  // 3. Deleting images when their parent person is deleted (via mutation logic)
}

/**
 * Create a test user with email/password authentication
 *
 * NOTE: For E2E tests, you should use the signup() helper from e2eAuth.ts instead,
 * which creates users through the actual UI flow and Convex Auth.
 *
 * This function is NOT suitable for E2E tests because:
 * 1. ConvexClient can't directly insert into the users table
 * 2. Convex Auth manages user creation through secure actions
 * 3. E2E tests should test the real authentication flow
 *
 * @deprecated Use signup() from e2eAuth.ts for E2E tests
 * @param client - ConvexClient instance connected to Convex backend
 * @param userData - User data (email, password, optional name/slug/role)
 * @returns Created user ID
 *
 * @example
 * // DON'T USE THIS IN E2E TESTS - Use signup() instead:
 * import { signup } from "./e2eAuth";
 * await signup(page, "test@example.com", "SecurePass123!");
 */
export async function createTestUser(
  _client: ConvexClient,
  _userData: TestUserData
): Promise<Id<"users">> {
  throw new Error(
    "createTestUser() is not supported for E2E tests with ConvexClient. " +
      "Use signup() from e2eAuth.ts to create users through the UI, " +
      "which properly integrates with Convex Auth."
  );
}

/**
 * Create a test person
 *
 * Wrapper around people.create mutation with sensible defaults.
 * Works with a real Convex client for E2E testing.
 *
 * @param client - ConvexClient instance connected to Convex backend
 * @param data - Person data
 * @returns Created person ID
 *
 * @example
 * import { ConvexClient } from "convex/browser";
 *
 * const client = new ConvexClient(process.env.CONVEX_URL!);
 * const personId = await createTestPerson(client, {
 *   name: "Test Person",
 *   slug: "test-person",
 * });
 */
export async function createTestPerson(
  client: ConvexClient,
  data: TestPersonData
): Promise<Id<"people">> {
  return await client.mutation(api.people.create, {
    name: data.name,
    slug: data.slug,
    bio: data.bio,
    birthDate: data.birthDate,
    deathDate: data.deathDate,
  });
}

/**
 * Create a test quote
 *
 * Wrapper around quotes.create mutation with sensible defaults.
 * Works with a real Convex client for E2E testing.
 *
 * @param client - ConvexClient instance connected to Convex backend
 * @param data - Quote data
 * @returns Created quote ID
 *
 * @example
 * import { ConvexClient } from "convex/browser";
 *
 * const client = new ConvexClient(process.env.CONVEX_URL!);
 * const quoteId = await createTestQuote(client, {
 *   personId: personId,
 *   text: "Test quote",
 * });
 */
export async function createTestQuote(
  client: ConvexClient,
  data: TestQuoteData
): Promise<Id<"quotes">> {
  return await client.mutation(api.quotes.create, {
    personId: data.personId,
    text: data.text,
    source: data.source,
    sourceUrl: data.sourceUrl,
    verified: data.verified ?? false,
  });
}

/**
 * Create a test image
 *
 * Wrapper around images.create mutation with sensible defaults.
 * Works with a real Convex client for E2E testing.
 *
 * @param client - ConvexClient instance connected to Convex backend
 * @param data - Image data
 * @returns Created image ID
 *
 * @example
 * import { ConvexClient } from "convex/browser";
 *
 * const client = new ConvexClient(process.env.CONVEX_URL!);
 * const imageId = await createTestImage(client, {
 *   personId: personId,
 *   cloudinaryId: "test-image",
 *   url: "https://example.com/test.jpg",
 * });
 */
export async function createTestImage(
  client: ConvexClient,
  data: TestImageData
): Promise<Id<"images">> {
  return await client.mutation(api.images.create, {
    personId: data.personId,
    cloudinaryId: data.cloudinaryId,
    url: data.url,
    width: data.width,
    height: data.height,
    source: data.source,
    license: data.license,
  });
}

/**
 * Get database statistics (for debugging tests)
 *
 * Returns counts of all entities in the database.
 * Useful for verifying cleanup and debugging test failures.
 *
 * Note: This only counts people and quotes. Images and generatedImages
 * are not counted because they don't have list() API functions.
 *
 * @param client - ConvexClient instance connected to Convex backend
 * @returns Object with entity counts
 *
 * @example
 * import { ConvexClient } from "convex/browser";
 *
 * const client = new ConvexClient(process.env.CONVEX_URL!);
 * const stats = await getDatabaseStats(client);
 * console.log(`People: ${stats.people}, Quotes: ${stats.quotes}`);
 */
export async function getDatabaseStats(client: ConvexClient) {
  const people = await client.query(api.people.list, { limit: 10000 });
  const quotes = await client.query(api.quotes.list, { limit: 10000 });

  return {
    people: people.length,
    quotes: quotes.length,
    // Note: images and generatedImages counts not available without list() API functions
  };
}
