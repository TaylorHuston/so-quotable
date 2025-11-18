/**
 * Tests for slug generation utility function
 *
 * This test suite validates slug generation used throughout
 * the authentication system for creating URL-friendly user slugs.
 *
 * Requirements:
 * - Extract local part from email (before @)
 * - Convert to lowercase
 * - Replace non-alphanumeric with hyphens
 * - Handle edge cases (empty, special chars, Unicode)
 *
 * Target: 100% coverage of generateSlug function
 */

import { describe, it, expect } from "vitest";
import { generateSlug } from "./slug-utils";

describe("slug-utils", () => {
  describe("generateSlug", () => {
    describe("Success Cases", () => {
      it("should generate slug from standard email", () => {
        const email = "john.doe@example.com";
        const result = generateSlug(email);
        expect(result).toBe("john-doe");
      });

      it("should convert uppercase to lowercase", () => {
        const email = "JohnDoe@example.com";
        const result = generateSlug(email);
        expect(result).toBe("johndoe");
      });

      it("should replace special characters with hyphens", () => {
        const email = "john.doe+test@example.com";
        const result = generateSlug(email);
        expect(result).toBe("john-doe-test");
      });

      it("should handle underscores", () => {
        const email = "first_last@example.com";
        const result = generateSlug(email);
        expect(result).toBe("first-last");
      });

      it("should handle numbers in email", () => {
        const email = "user123@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user123");
      });

      it("should handle mixed alphanumeric", () => {
        const email = "user123test@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user123test");
      });

      it("should handle single character email prefix", () => {
        const email = "a@example.com";
        const result = generateSlug(email);
        expect(result).toBe("a");
      });

      it("should handle long email prefix", () => {
        const email = "thisisaverylongemailprefix@example.com";
        const result = generateSlug(email);
        expect(result).toBe("thisisaverylongemailprefix");
      });

      it("should handle email with multiple dots", () => {
        const email = "first.middle.last@example.com";
        const result = generateSlug(email);
        expect(result).toBe("first-middle-last");
      });

      it("should handle email with hyphens (preserve as alphanumeric)", () => {
        const email = "john-doe@example.com";
        const result = generateSlug(email);
        expect(result).toBe("john-doe");
      });
    });

    describe("Edge Cases", () => {
      it("should return fallback for empty string", () => {
        const email = "";
        const result = generateSlug(email);
        expect(result).toBe("user");
      });

      it("should return input for string without @ sign", () => {
        const email = "notanemail";
        const result = generateSlug(email);
        expect(result).toBe("notanemail");
      });

      it("should return fallback for @ at start (no prefix)", () => {
        const email = "@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user");
      });

      it("should use custom fallback", () => {
        const email = "@example.com";
        const result = generateSlug(email, "anonymous");
        expect(result).toBe("anonymous");
      });

      it("should handle email with only special characters in prefix", () => {
        const email = "!!!@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user"); // All chars removed, uses fallback
      });

      it("should remove leading hyphens", () => {
        const email = "-user@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user");
      });

      it("should remove trailing hyphens", () => {
        const email = "user-@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user");
      });

      it("should keep consecutive hyphens (converted from special chars)", () => {
        const email = "user...test@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user---test"); // Dots become hyphens
      });

      it("should handle whitespace in email prefix", () => {
        const email = "user name@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user-name");
      });

      it("should handle tabs in email prefix", () => {
        const email = "user\tname@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user-name");
      });
    });

    describe("Backend Compatibility", () => {
      it("should match backend slug generation in convex/auth.ts Password provider", () => {
        const email = "test.user@example.com";
        const result = generateSlug(email);

        // Backend logic from lines 61-64
        const emailPrefix = email.split("@")[0];
        const backendSlug = (
          emailPrefix && emailPrefix.length > 0 ? emailPrefix : "user"
        )
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");

        // Our function should match backend (with enhanced hyphen removal)
        expect(result).toBe(backendSlug.replace(/^-+|-+$/g, ""));
      });

      it("should match backend slug generation in convex/auth.ts Google OAuth", () => {
        const email = "GoogleUser@gmail.com";
        const result = generateSlug(email);

        // Backend logic from lines 86-89
        const emailPrefix = email.split("@")[0];
        const backendSlug = (
          emailPrefix && emailPrefix.length > 0 ? emailPrefix : "user"
        )
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");

        expect(result).toBe(backendSlug.replace(/^-+|-+$/g, ""));
      });

      it("should handle empty prefix same as backend", () => {
        const email = "@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user"); // Backend falls back to "user"
      });

      it("should be deterministic (same input, same output)", () => {
        const email = "test.user+tag@example.com";
        const result1 = generateSlug(email);
        const result2 = generateSlug(email);
        expect(result1).toBe(result2);
        expect(result1).toBe("test-user-tag");
      });
    });

    describe("Special Characters", () => {
      it("should handle parentheses", () => {
        const email = "user(test)@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user-test");
      });

      it("should handle brackets", () => {
        const email = "user[test]@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user-test");
      });

      it("should handle ampersand", () => {
        const email = "user&company@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user-company");
      });

      it("should handle percent sign", () => {
        const email = "user%test@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user-test");
      });

      it("should handle dollar sign", () => {
        const email = "user$test@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user-test");
      });

      it("should handle hash/pound sign", () => {
        const email = "user#test@example.com";
        const result = generateSlug(email);
        expect(result).toBe("user-test");
      });

      it("should handle at sign in local part (quoted)", () => {
        const email = '"user@test"@example.com';
        const result = generateSlug(email);
        // When splitting on @, we get '"user' as first part (quotes around @ make this complex)
        // This becomes 'user' after special char replacement and hyphen trimming
        expect(result).toBe("user");
      });

      it("should handle Unicode characters", () => {
        const email = "用户名@example.com";
        const result = generateSlug(email);
        // Unicode chars replaced with hyphens, then trimmed
        expect(result).toBe("user"); // Falls back after all non-alphanumeric removed
      });
    });

    describe("Real-World Examples", () => {
      it("should handle Gmail plus addressing", () => {
        const email = "john.doe+work@gmail.com";
        const result = generateSlug(email);
        expect(result).toBe("john-doe-work");
      });

      it("should handle corporate email", () => {
        const email = "john.doe@company.com";
        const result = generateSlug(email);
        expect(result).toBe("john-doe");
      });

      it("should handle email with department", () => {
        const email = "john.doe.engineering@company.com";
        const result = generateSlug(email);
        expect(result).toBe("john-doe-engineering");
      });

      it("should handle numbered email", () => {
        const email = "john.doe123@company.com";
        const result = generateSlug(email);
        expect(result).toBe("john-doe123");
      });

      it("should handle simple username", () => {
        const email = "johndoe@example.com";
        const result = generateSlug(email);
        expect(result).toBe("johndoe");
      });
    });
  });
});
