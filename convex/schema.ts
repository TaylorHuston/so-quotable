import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  people: defineTable({
    // Required fields
    name: v.string(),
    slug: v.string(),

    // Optional fields
    bio: v.optional(v.string()),
    birthDate: v.optional(v.string()), // ISO format: "YYYY-MM-DD"
    deathDate: v.optional(v.string()), // ISO format: "YYYY-MM-DD"

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]),

  quotes: defineTable({
    // Required fields
    personId: v.id("people"),
    text: v.string(),

    // Optional fields
    source: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    verified: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_person", ["personId"]),

  images: defineTable({
    // Required fields
    personId: v.id("people"),
    cloudinaryId: v.string(),
    url: v.string(),

    // Optional dimensions
    width: v.optional(v.number()),
    height: v.optional(v.number()),

    // Optional attribution
    source: v.optional(v.string()),
    license: v.optional(v.string()),

    // Timestamp
    createdAt: v.number(),
  })
    .index("by_person", ["personId"]),

  generatedImages: defineTable({
    // Required fields
    quoteId: v.id("quotes"),
    imageId: v.id("images"),      // Base image used
    cloudinaryId: v.string(),      // Generated image ID in Cloudinary
    url: v.string(),               // Shareable URL
    transformation: v.string(),    // Transformation params for regeneration
    expiresAt: v.number(),         // When Cloudinary will delete (timestamp)

    // Timestamp
    createdAt: v.number(),
  })
    .index("by_quote", ["quoteId"])
    .index("by_expires", ["expiresAt"]),
});
