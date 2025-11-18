/**
 * Tests for password validation helper function
 *
 * This test suite validates password requirements matching backend specification
 * from convex/auth.ts:27-52 (validatePasswordRequirements function).
 *
 * Backend Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&*()_+-=[]{};':"\\|,.<>/?)
 *
 * Target: 100% coverage of all password validation logic
 * Phase: TDD RED - tests written first, function implementation in Phase 5.2
 */

import { describe, it, expect } from "vitest";
import { validatePassword } from "./password-validation";

describe("password-validation", () => {
  describe("Success Cases", () => {
    it("should validate password meeting all requirements", () => {
      // Arrange: Password with all requirements met
      const password = "MySecure123!";

      // Act: Validate the password
      const result = validatePassword(password);

      // Assert: Should be valid with no errors
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate password with minimum 12 characters and all requirements", () => {
      // Arrange: Password with exactly 12 characters
      const password = "Password123!";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate password with multiple special characters", () => {
      // Arrange: Password using various special characters
      const password = "Abc123!@#$%^";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate long password with all requirements", () => {
      // Arrange: Very long password (30+ chars)
      const password = "ThisIsAVeryLongPassword123!@#";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("Individual Requirement Failures", () => {
    it("should fail validation for password shorter than 12 characters", () => {
      // Arrange: Password with only 11 characters (all other requirements met)
      const password = "Short12!Aa";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must be at least 12 characters long"
      );
      expect(result.errors.length).toBe(1);
    });

    it("should fail validation for password without uppercase letter", () => {
      // Arrange: Password without uppercase (all other requirements met)
      const password = "lowercase123!";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
      expect(result.errors.length).toBe(1);
    });

    it("should fail validation for password without lowercase letter", () => {
      // Arrange: Password without lowercase (all other requirements met)
      const password = "UPPERCASE123!";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one lowercase letter"
      );
      expect(result.errors.length).toBe(1);
    });

    it("should fail validation for password without number", () => {
      // Arrange: Password without number (all other requirements met)
      const password = "NoNumbersHere!";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one number"
      );
      expect(result.errors.length).toBe(1);
    });

    it("should fail validation for password without special character", () => {
      // Arrange: Password without special char (all other requirements met)
      const password = "NoSpecialChar123";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one special character"
      );
      expect(result.errors.length).toBe(1);
    });
  });

  describe("Multiple Requirement Failures", () => {
    it("should return multiple errors when multiple requirements not met", () => {
      // Arrange: Password violating 3 requirements (length, uppercase, special char)
      const password = "short123";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must be at least 12 characters long"
      );
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
      expect(result.errors).toContain(
        "Password must contain at least one special character"
      );
      expect(result.errors.length).toBe(3);
    });

    it("should return all errors for completely invalid password", () => {
      // Arrange: Password violating all requirements (only 3 chars, no requirements met)
      const password = "abc";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must be at least 12 characters long"
      );
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
      expect(result.errors).toContain(
        "Password must contain at least one number"
      );
      expect(result.errors).toContain(
        "Password must contain at least one special character"
      );
      expect(result.errors.length).toBeGreaterThanOrEqual(4); // At least 4 errors
    });

    it("should return errors for password missing uppercase, number, and special char", () => {
      // Arrange: Password with length and lowercase only
      const password = "lowercaseonly";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
      expect(result.errors).toContain(
        "Password must contain at least one number"
      );
      expect(result.errors).toContain(
        "Password must contain at least one special character"
      );
      expect(result.errors.length).toBe(3);
    });
  });

  describe("Edge Cases", () => {
    it("should fail validation for empty string", () => {
      // Arrange: Empty password
      const password = "";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must be at least 12 characters long"
      );
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });

    it("should fail validation for whitespace-only password", () => {
      // Arrange: Password with only spaces
      const password = "            ";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
      expect(result.errors).toContain(
        "Password must contain at least one lowercase letter"
      );
      expect(result.errors).toContain(
        "Password must contain at least one number"
      );
      expect(result.errors).toContain(
        "Password must contain at least one special character"
      );
      expect(result.errors.length).toBe(4);
    });

    it("should validate password with spaces in the middle", () => {
      // Arrange: Password with spaces (still valid if requirements met)
      const password = "My Pass 123!";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate password with all special characters from regex", () => {
      // Arrange: Password testing full special character set
      const password = "Test123!@#$%";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate password with underscore special character", () => {
      // Arrange: Underscore is a valid special character
      const password = "Test_Pass123";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate password with hyphen special character", () => {
      // Arrange: Hyphen is a valid special character
      const password = "Test-Pass123";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate password with bracket special characters", () => {
      // Arrange: Brackets are valid special characters
      const password = "Test[Pass]123";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("Regex Pattern Validation", () => {
    it("should match backend uppercase regex pattern", () => {
      // Arrange: Passwords testing uppercase boundary
      const validPasswords = ["Abc123!@test", "ABC123!@test", "abcZ123!test"];
      const invalidPasswords = ["abc123!@test", "abc123!@test"];

      // Act & Assert
      validPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.errors).not.toContain(
          "Password must contain at least one uppercase letter"
        );
      });

      invalidPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.errors).toContain(
          "Password must contain at least one uppercase letter"
        );
      });
    });

    it("should match backend lowercase regex pattern", () => {
      // Arrange: Passwords testing lowercase boundary
      const validPasswords = ["Abc123!@TEST", "ABc123!@TEST", "ABCz123!TEST"];
      const invalidPasswords = ["ABC123!@TEST", "ABC123!@TEST"];

      // Act & Assert
      validPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.errors).not.toContain(
          "Password must contain at least one lowercase letter"
        );
      });

      invalidPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.errors).toContain(
          "Password must contain at least one lowercase letter"
        );
      });
    });

    it("should match backend number regex pattern", () => {
      // Arrange: Passwords testing number boundary
      const validPasswords = ["Abc0test!@#", "Abc5test!@#", "Abc9test!@#"];
      const invalidPasswords = ["Abctest!@#$", "AbcOtest!@#"];

      // Act & Assert
      validPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.errors).not.toContain(
          "Password must contain at least one number"
        );
      });

      invalidPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.errors).toContain(
          "Password must contain at least one number"
        );
      });
    });

    it("should match backend special character regex pattern", () => {
      // Arrange: Testing all special characters from backend regex
      const specialChars = "!@#$%^&*()_+-=[]{};<>':\"|,./?\\";
      const validPasswords = specialChars
        .split("")
        .map((char) => `Abc123test${char}`);
      const invalidPassword = "Abc123testNOSPECIAL";

      // Act & Assert
      validPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.errors).not.toContain(
          "Password must contain at least one special character"
        );
      });

      const invalidResult = validatePassword(invalidPassword);
      expect(invalidResult.errors).toContain(
        "Password must contain at least one special character"
      );
    });
  });

  describe("Exact Backend Behavior Match", () => {
    it("should match backend error message for length failure", () => {
      // Arrange: Password exactly matching backend test case
      const password = "Short1!";

      // Act
      const result = validatePassword(password);

      // Assert: Error message must match backend exactly
      expect(result.errors).toContain(
        "Password must be at least 12 characters long"
      );
    });

    it("should match backend error message for uppercase failure", () => {
      // Arrange
      const password = "lowercase123!";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
    });

    it("should match backend error message for lowercase failure", () => {
      // Arrange
      const password = "UPPERCASE123!";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.errors).toContain(
        "Password must contain at least one lowercase letter"
      );
    });

    it("should match backend error message for number failure", () => {
      // Arrange
      const password = "NoNumbers!Ab";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.errors).toContain(
        "Password must contain at least one number"
      );
    });

    it("should match backend error message for special character failure", () => {
      // Arrange
      const password = "NoSpecial123Abc";

      // Act
      const result = validatePassword(password);

      // Assert
      expect(result.errors).toContain(
        "Password must contain at least one special character"
      );
    });
  });
});
