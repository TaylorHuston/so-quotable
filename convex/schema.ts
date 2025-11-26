import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Auth tables with extended users table
  ...authTables,
  users: defineTable({
    // Base fields from authTables
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),

    // Email verification fields
    verificationToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),

    // Password reset fields
    passwordResetToken: v.optional(v.string()),
    passwordResetTokenExpiry: v.optional(v.number()),
    passwordResetRequests: v.optional(v.number()),
    lastPasswordResetRequest: v.optional(v.number()),

    // Extended fields for So Quotable
    slug: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_slug", ["slug"])
    .index("by_verificationToken", ["verificationToken"])
    .index("by_passwordResetToken", ["passwordResetToken"]),

  people: defineTable({
    // Required fields
    name: v.string(),
    slug: v.string(),

    // Optional fields
    bio: v.optional(v.string()),
    birthDate: v.optional(v.string()), // ISO format: "YYYY-MM-DD"
    deathDate: v.optional(v.string()), // ISO format: "YYYY-MM-DD"

    // Ownership tracking (required - all resources must have an owner)
    createdBy: v.id("users"),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_creator", ["createdBy"]),

  quotes: defineTable({
    // Required fields
    personId: v.id("people"),
    text: v.string(),

    // Optional fields
    source: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    verified: v.boolean(),

    // Ownership tracking (required - all resources must have an owner)
    createdBy: v.id("users"),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_person", ["personId"])
    .index("by_creator", ["createdBy"]),

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

    // Ownership tracking (required - all resources must have an owner)
    createdBy: v.id("users"),

    // Timestamp
    createdAt: v.number(),
  })
    .index("by_person", ["personId"])
    .index("by_creator", ["createdBy"]),

  generatedImages: defineTable({
    // Required fields
    quoteId: v.id("quotes"),
    imageId: v.id("images"),      // Base image used
    cloudinaryId: v.string(),      // Generated image ID in Cloudinary
    url: v.string(),               // Shareable URL
    transformation: v.string(),    // Transformation params for regeneration
    expiresAt: v.number(),         // When Cloudinary will delete (timestamp)

    // Ownership tracking (required - all resources must have an owner)
    createdBy: v.id("users"),

    // Timestamp
    createdAt: v.number(),
  })
    .index("by_quote", ["quoteId"])
    .index("by_expires", ["expiresAt"])
    .index("by_creator", ["createdBy"]),
});
