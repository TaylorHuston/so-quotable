/**
 * Tests for email normalization utility function
 *
 * This test suite validates email normalization used throughout
 * the authentication system for consistent email handling.
 *
 * Requirements:
 * - Convert email to lowercase
 * - Trim leading/trailing whitespace
 * - Handle edge cases (empty, special chars, Unicode)
 *
 * Target: 100% coverage of normalizeEmail function
 */

import { describe, it, expect } from "vitest";
import { normalizeEmail } from "./email-utils";

describe("email-utils", () => {
  describe("normalizeEmail", () => {
    describe("Success Cases", () => {
      it("should normalize standard email address", () => {
        const email = "User@Example.com";
        const result = normalizeEmail(email);
        expect(result).toBe("user@example.com");
      });

      it("should convert uppercase email to lowercase", () => {
        const email = "ADMIN@COMPANY.COM";
        const result = normalizeEmail(email);
        expect(result).toBe("admin@company.com");
      });

      it("should trim leading whitespace", () => {
        const email = "   user@example.com";
        const result = normalizeEmail(email);
        expect(result).toBe("user@example.com");
      });

      it("should trim trailing whitespace", () => {
        const email = "user@example.com   ";
        const result = normalizeEmail(email);
        expect(result).toBe("user@example.com");
      });

      it("should trim both leading and trailing whitespace", () => {
        const email = "  user@example.com  ";
        const result = normalizeEmail(email);
        expect(result).toBe("user@example.com");
      });

      it("should handle email with tabs", () => {
        const email = "\tuser@example.com\t";
        const result = normalizeEmail(email);
        expect(result).toBe("user@example.com");
      });

      it("should handle email with newlines", () => {
        const email = "\nuser@example.com\n";
        const result = normalizeEmail(email);
        expect(result).toBe("user@example.com");
      });

      it("should handle email with mixed whitespace", () => {
        const email = " \t\n user@example.com \n\t ";
        const result = normalizeEmail(email);
        expect(result).toBe("user@example.com");
      });

      it("should preserve special characters in email", () => {
        const email = "user.name+tag@example.com";
        const result = normalizeEmail(email);
        expect(result).toBe("user.name+tag@example.com");
      });

      it("should handle email with numbers", () => {
        const email = "User123@Example456.com";
        const result = normalizeEmail(email);
        expect(result).toBe("user123@example456.com");
      });

      it("should handle email with hyphens", () => {
        const email = "User@My-Company.com";
        const result = normalizeEmail(email);
        expect(result).toBe("user@my-company.com");
      });

      it("should handle email with underscores", () => {
        const email = "First_Last@Company.com";
        const result = normalizeEmail(email);
        expect(result).toBe("first_last@company.com");
      });

      it("should handle long email addresses", () => {
        const email =
          "ThisIsAVeryLongEmailAddressUsername@ThisIsAVeryLongDomainName.com";
        const result = normalizeEmail(email);
        expect(result).toBe(
          "thisisaverylongemailaddressusername@thisisaverylongdomainname.com"
        );
      });

      it("should handle subdomain emails", () => {
        const email = "User@Mail.Subdomain.Example.com";
        const result = normalizeEmail(email);
        expect(result).toBe("user@mail.subdomain.example.com");
      });

      it("should handle email with plus addressing", () => {
        const email = "User+Tag123@Example.com";
        const result = normalizeEmail(email);
        expect(result).toBe("user+tag123@example.com");
      });

      it("should handle email with dots in local part", () => {
        const email = "First.Middle.Last@Example.com";
        const result = normalizeEmail(email);
        expect(result).toBe("first.middle.last@example.com");
      });
    });

    describe("Edge Cases", () => {
      it("should throw error for empty string", () => {
        const email = "";
        expect(() => normalizeEmail(email)).toThrow("Email is required");
      });

      it("should throw error for whitespace-only string", () => {
        const email = "   ";
        expect(() => normalizeEmail(email)).toThrow("Email is required");
      });

      it("should throw error for tabs-only string", () => {
        const email = "\t\t\t";
        expect(() => normalizeEmail(email)).toThrow("Email is required");
      });

      it("should throw error for newlines-only string", () => {
        const email = "\n\n\n";
        expect(() => normalizeEmail(email)).toThrow("Email is required");
      });

      it("should throw error for mixed whitespace-only string", () => {
        const email = " \t\n\r ";
        expect(() => normalizeEmail(email)).toThrow("Email is required");
      });

      it("should handle already normalized email", () => {
        const email = "user@example.com";
        const result = normalizeEmail(email);
        expect(result).toBe("user@example.com");
      });

      it("should handle single character local part", () => {
        const email = "A@Example.com";
        const result = normalizeEmail(email);
        expect(result).toBe("a@example.com");
      });

      it("should handle TLD-only domain", () => {
        const email = "User@Example.io";
        const result = normalizeEmail(email);
        expect(result).toBe("user@example.io");
      });

      it("should handle international TLD", () => {
        const email = "User@Example.co.uk";
        const result = normalizeEmail(email);
        expect(result).toBe("user@example.co.uk");
      });

      it("should handle Unicode characters in email", () => {
        const email = "用户@例え.jp";
        const result = normalizeEmail(email);
        expect(result).toBe("用户@例え.jp");
      });
    });

    describe("Backend Compatibility", () => {
      it("should match backend normalization in convex/auth.ts Password provider", () => {
        const email = "  TestUser@Example.COM  ";
        const result = normalizeEmail(email);
        expect(result).toBe(email.toLowerCase().trim());
      });

      it("should match backend normalization in convex/auth.ts Google OAuth", () => {
        const email = "GoogleUser@GMAIL.com";
        const result = normalizeEmail(email);
        expect(result).toBe(email.toLowerCase().trim());
      });

      it("should match RegisterForm.tsx normalization", () => {
        const email = "NewUser@Test.COM";
        const result = normalizeEmail(email);
        expect(result).toBe(email.toLowerCase());
      });

      it("should be idempotent (normalizing twice gives same result)", () => {
        const email = "  User@EXAMPLE.com  ";
        const result1 = normalizeEmail(email);
        const result2 = normalizeEmail(result1);
        expect(result1).toBe(result2);
        expect(result2).toBe("user@example.com");
      });

      it("should normalize all test emails consistently", () => {
        const emails = [
          "user@example.com",
          "USER@EXAMPLE.COM",
          "  user@example.com  ",
          "User@Example.Com",
          "\tuser@example.com\n",
        ];
        const results = emails.map(normalizeEmail);
        results.forEach((result) => {
          expect(result).toBe("user@example.com");
        });
      });
    });

    describe("Special Characters", () => {
      it("should handle email with quotes (rare but valid)", () => {
        const email = '"user.name"@example.com';
        const result = normalizeEmail(email);
        expect(result).toBe('"user.name"@example.com');
      });

      it("should handle email with parentheses in domain", () => {
        const email = "user@(comment)example.com";
        const result = normalizeEmail(email);
        expect(result).toBe("user@(comment)example.com");
      });

      it("should handle email with percent encoding", () => {
        const email = "User%40Test@Example.com";
        const result = normalizeEmail(email);
        expect(result).toBe("user%40test@example.com");
      });
    });
  });
});
