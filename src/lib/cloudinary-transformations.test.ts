/**
 * Tests for Cloudinary URL transformation helper functions
 *
 * These are pure functions that construct Cloudinary transformation URLs.
 * Target: 95%+ test coverage (all functions are pure, easy to test comprehensively)
 */

import { describe, it, expect } from "vitest";
import {
  buildImageUrl,
  addTextOverlay,
  addBackgroundOverlay,
  optimizeImage,
  resizeImage,
  type ImageTransformation,
  type TextOverlayOptions,
} from "./cloudinary-transformations";

describe("cloudinary-transformations", () => {
  const cloudName = "test-cloud-name";
  const cloudinaryId = "so-quotable/people/example-person";

  describe("buildImageUrl", () => {
    it("should build basic URL with no transformations", () => {
      const url = buildImageUrl(cloudinaryId, [], cloudName);
      expect(url).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/${cloudinaryId}`
      );
    });

    it("should build URL with single transformation", () => {
      const transformations: ImageTransformation[] = ["w_800,h_600,c_fill"];
      const url = buildImageUrl(cloudinaryId, transformations, cloudName);
      expect(url).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/w_800,h_600,c_fill/${cloudinaryId}`
      );
    });

    it("should build URL with multiple transformations (slash-separated)", () => {
      const transformations: ImageTransformation[] = [
        "w_800,h_600,c_fill",
        "l_text:Arial_48:Hello",
        "f_auto,q_auto",
      ];
      const url = buildImageUrl(cloudinaryId, transformations, cloudName);
      expect(url).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/w_800,h_600,c_fill/l_text:Arial_48:Hello/f_auto,q_auto/${cloudinaryId}`
      );
    });

    it("should trim whitespace from cloudinaryId", () => {
      const url = buildImageUrl(
        "  so-quotable/people/person  ",
        [],
        cloudName
      );
      expect(url).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/so-quotable/people/person`
      );
    });

    it("should trim whitespace from cloudName", () => {
      const url = buildImageUrl(cloudinaryId, [], "  test-cloud  ");
      expect(url).toBe(
        `https://res.cloudinary.com/test-cloud/image/upload/${cloudinaryId}`
      );
    });

    it("should handle empty transformations array", () => {
      const url = buildImageUrl(cloudinaryId, [], cloudName);
      expect(url).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/${cloudinaryId}`
      );
    });

    it("should throw error for empty cloudinaryId", () => {
      expect(() => buildImageUrl("", [], cloudName)).toThrow(
        "cloudinaryId is required"
      );
    });

    it("should throw error for whitespace-only cloudinaryId", () => {
      expect(() => buildImageUrl("   ", [], cloudName)).toThrow(
        "cloudinaryId is required"
      );
    });

    it("should throw error for empty cloudName", () => {
      expect(() => buildImageUrl(cloudinaryId, [], "")).toThrow(
        "cloudName is required"
      );
    });

    it("should throw error for whitespace-only cloudName", () => {
      expect(() => buildImageUrl(cloudinaryId, [], "   ")).toThrow(
        "cloudName is required"
      );
    });
  });

  describe("resizeImage", () => {
    it("should create resize transformation with width and height", () => {
      const transformation = resizeImage(800, 600);
      expect(transformation).toBe("w_800,h_600,c_fill");
    });

    it("should create resize transformation with custom crop mode", () => {
      const transformation = resizeImage(800, 600, "scale");
      expect(transformation).toBe("w_800,h_600,c_scale");
    });

    it("should default to fill crop mode", () => {
      const transformation = resizeImage(1200, 900);
      expect(transformation).toBe("w_1200,h_900,c_fill");
    });

    it("should handle small dimensions", () => {
      const transformation = resizeImage(100, 100);
      expect(transformation).toBe("w_100,h_100,c_fill");
    });

    it("should handle large dimensions", () => {
      const transformation = resizeImage(4000, 3000);
      expect(transformation).toBe("w_4000,h_3000,c_fill");
    });

    it("should throw error for zero width", () => {
      expect(() => resizeImage(0, 600)).toThrow("Width must be positive");
    });

    it("should throw error for negative width", () => {
      expect(() => resizeImage(-800, 600)).toThrow("Width must be positive");
    });

    it("should throw error for zero height", () => {
      expect(() => resizeImage(800, 0)).toThrow("Height must be positive");
    });

    it("should throw error for negative height", () => {
      expect(() => resizeImage(800, -600)).toThrow("Height must be positive");
    });
  });

  describe("optimizeImage", () => {
    it("should create optimization transformation with auto format and quality", () => {
      const transformation = optimizeImage();
      expect(transformation).toBe("f_auto,q_auto");
    });

    it("should create optimization transformation with specific format", () => {
      const transformation = optimizeImage("webp");
      expect(transformation).toBe("f_webp,q_auto");
    });

    it("should create optimization transformation with specific quality", () => {
      const transformation = optimizeImage("auto", 80);
      expect(transformation).toBe("f_auto,q_80");
    });

    it("should create optimization transformation with format and quality", () => {
      const transformation = optimizeImage("jpg", 90);
      expect(transformation).toBe("f_jpg,q_90");
    });

    it("should handle minimum quality (1)", () => {
      const transformation = optimizeImage("auto", 1);
      expect(transformation).toBe("f_auto,q_1");
    });

    it("should handle maximum quality (100)", () => {
      const transformation = optimizeImage("auto", 100);
      expect(transformation).toBe("f_auto,q_100");
    });

    it("should throw error for quality below 1", () => {
      expect(() => optimizeImage("auto", 0)).toThrow(
        "Quality must be between 1 and 100"
      );
    });

    it("should throw error for quality above 100", () => {
      expect(() => optimizeImage("auto", 101)).toThrow(
        "Quality must be between 1 and 100"
      );
    });

    it("should throw error for negative quality", () => {
      expect(() => optimizeImage("auto", -50)).toThrow(
        "Quality must be between 1 and 100"
      );
    });
  });

  describe("addBackgroundOverlay", () => {
    it("should create background overlay with default black color", () => {
      const transformation = addBackgroundOverlay(50);
      expect(transformation).toBe("l_black,e_colorize:50,fl_layer_apply");
    });

    it("should create background overlay with custom color", () => {
      const transformation = addBackgroundOverlay(70, "white");
      expect(transformation).toBe("l_white,e_colorize:70,fl_layer_apply");
    });

    it("should handle hex color codes", () => {
      const transformation = addBackgroundOverlay(60, "rgb:333333");
      expect(transformation).toBe("l_rgb:333333,e_colorize:60,fl_layer_apply");
    });

    it("should handle minimum opacity (0)", () => {
      const transformation = addBackgroundOverlay(0);
      expect(transformation).toBe("l_black,e_colorize:0,fl_layer_apply");
    });

    it("should handle maximum opacity (100)", () => {
      const transformation = addBackgroundOverlay(100);
      expect(transformation).toBe("l_black,e_colorize:100,fl_layer_apply");
    });

    it("should throw error for negative opacity", () => {
      expect(() => addBackgroundOverlay(-10)).toThrow(
        "Opacity must be between 0 and 100"
      );
    });

    it("should throw error for opacity above 100", () => {
      expect(() => addBackgroundOverlay(150)).toThrow(
        "Opacity must be between 0 and 100"
      );
    });
  });

  describe("addTextOverlay", () => {
    it("should create basic text overlay with default options", () => {
      const transformation = addTextOverlay("Hello World");
      expect(transformation).toContain("l_text:Arial_48");
      expect(transformation).toContain("Hello%20World");
    });

    it("should URL-encode spaces in text", () => {
      const transformation = addTextOverlay("Hello World");
      expect(transformation).toContain("Hello%20World");
    });

    it("should URL-encode special characters (quotes)", () => {
      const transformation = addTextOverlay('She said "Hello"');
      expect(transformation).toContain("%22");
    });

    it("should handle apostrophes in text (not encoded by encodeURIComponent)", () => {
      const transformation = addTextOverlay("It's a test");
      expect(transformation).toContain("It's%20a%20test");
      // Note: encodeURIComponent doesn't encode apostrophes, which is fine for Cloudinary
    });

    it("should URL-encode commas (important: comma is transformation separator)", () => {
      const transformation = addTextOverlay("Hello, World");
      expect(transformation).toContain("Hello%2C%20World");
    });

    it("should handle empty string text", () => {
      const transformation = addTextOverlay("");
      expect(transformation).toContain("l_text:Arial_48");
    });

    it("should use custom font family", () => {
      const options: TextOverlayOptions = { fontFamily: "Times" };
      const transformation = addTextOverlay("Test", options);
      expect(transformation).toContain("l_text:Times_48");
    });

    it("should use custom font size", () => {
      const options: TextOverlayOptions = { fontSize: 72 };
      const transformation = addTextOverlay("Test", options);
      expect(transformation).toContain("l_text:Arial_72");
    });

    it("should use custom font family and size", () => {
      const options: TextOverlayOptions = {
        fontFamily: "Helvetica",
        fontSize: 36,
      };
      const transformation = addTextOverlay("Test", options);
      expect(transformation).toContain("l_text:Helvetica_36");
    });

    it("should include text color", () => {
      const options: TextOverlayOptions = { color: "ffffff" };
      const transformation = addTextOverlay("Test", options);
      expect(transformation).toContain("co_rgb:ffffff");
    });

    it("should include gravity (positioning)", () => {
      const options: TextOverlayOptions = { gravity: "north" };
      const transformation = addTextOverlay("Test", options);
      expect(transformation).toContain("g_north");
    });

    it("should include Y offset", () => {
      const options: TextOverlayOptions = { yOffset: 50 };
      const transformation = addTextOverlay("Test", options);
      expect(transformation).toContain("y_50");
    });

    it("should include X offset", () => {
      const options: TextOverlayOptions = { xOffset: 100 };
      const transformation = addTextOverlay("Test", options);
      expect(transformation).toContain("x_100");
    });

    it("should include max width for text wrapping", () => {
      const options: TextOverlayOptions = { maxWidth: 700 };
      const transformation = addTextOverlay("Test", options);
      expect(transformation).toContain("w_700");
      expect(transformation).toContain("c_fit");
    });

    it("should include font weight (bold)", () => {
      const options: TextOverlayOptions = { fontWeight: "bold" };
      const transformation = addTextOverlay("Test", options);
      expect(transformation).toContain("l_text:Arial_48_bold");
    });

    it("should include all options together", () => {
      const options: TextOverlayOptions = {
        fontFamily: "Times",
        fontSize: 64,
        fontWeight: "bold",
        color: "ffffff",
        gravity: "center",
        yOffset: 100,
        xOffset: 50,
        maxWidth: 800,
      };
      const transformation = addTextOverlay("Complete Test", options);

      expect(transformation).toContain("l_text:Times_64_bold");
      expect(transformation).toContain("Complete%20Test");
      expect(transformation).toContain("co_rgb:ffffff");
      expect(transformation).toContain("g_center");
      expect(transformation).toContain("y_100");
      expect(transformation).toContain("x_50");
      expect(transformation).toContain("w_800");
      expect(transformation).toContain("c_fit");
    });

    it("should handle very long text", () => {
      const longText =
        "This is a very long quote that might span multiple lines when displayed on an image. It should be properly URL-encoded.";
      const transformation = addTextOverlay(longText);
      expect(transformation).toContain("l_text:Arial_48");
      expect(transformation).toContain("%20");
    });

    it("should handle Unicode characters", () => {
      const unicodeText = "Hello 世界 🌍";
      const transformation = addTextOverlay(unicodeText);
      expect(transformation).toContain("l_text:Arial_48");
      // Unicode should be encoded by encodeURIComponent
      expect(transformation.length).toBeGreaterThan(20);
    });

    it("should handle bottom positioning", () => {
      const options: TextOverlayOptions = { gravity: "south" };
      const transformation = addTextOverlay("Bottom Text", options);
      expect(transformation).toContain("g_south");
    });

    it("should handle center positioning", () => {
      const options: TextOverlayOptions = { gravity: "center" };
      const transformation = addTextOverlay("Centered", options);
      expect(transformation).toContain("g_center");
    });

    it("should handle negative Y offset (move up)", () => {
      const options: TextOverlayOptions = { yOffset: -50 };
      const transformation = addTextOverlay("Test", options);
      expect(transformation).toContain("y_-50");
    });

    it("should handle negative X offset (move left)", () => {
      const options: TextOverlayOptions = { xOffset: -100 };
      const transformation = addTextOverlay("Test", options);
      expect(transformation).toContain("x_-100");
    });

    it("should trim whitespace from text", () => {
      const transformation = addTextOverlay("  Hello World  ");
      expect(transformation).toContain("Hello%20World");
      expect(transformation).not.toContain("%20%20");
    });
  });

  describe("integration: complete quote image URL", () => {
    it("should build complete quote image URL with all transformations", () => {
      const cloudinaryId = "so-quotable/people/albert-einstein";
      const cloudName = "test-cloud";

      // Build a complete quote image URL
      const transformations: ImageTransformation[] = [
        resizeImage(1200, 630), // Social media size
        addBackgroundOverlay(60), // Semi-transparent background
        addTextOverlay("The only source of knowledge is experience.", {
          fontFamily: "Arial",
          fontSize: 48,
          fontWeight: "bold",
          color: "ffffff",
          gravity: "center",
          maxWidth: 1000,
        }),
        addTextOverlay("- Albert Einstein", {
          fontFamily: "Arial",
          fontSize: 32,
          color: "ffffff",
          gravity: "south",
          yOffset: 50,
        }),
        optimizeImage(), // Auto format and quality
      ];

      const url = buildImageUrl(cloudinaryId, transformations, cloudName);

      // Verify URL structure
      expect(url).toContain(
        "https://res.cloudinary.com/test-cloud/image/upload"
      );
      expect(url).toContain("w_1200,h_630,c_fill");
      expect(url).toContain("l_black,e_colorize:60,fl_layer_apply");
      expect(url).toContain("l_text:Arial_48_bold");
      expect(url).toContain("The%20only%20source%20of%20knowledge%20is%20experience.");
      expect(url).toContain("co_rgb:ffffff");
      expect(url).toContain("g_center");
      expect(url).toContain("w_1000");
      expect(url).toContain("l_text:Arial_32");
      expect(url).toContain("-%20Albert%20Einstein");
      expect(url).toContain("g_south");
      expect(url).toContain("y_50");
      expect(url).toContain("f_auto,q_auto");
      expect(url).toContain(cloudinaryId);
    });

    it("should build simple quote image URL with minimal transformations", () => {
      const cloudinaryId = "so-quotable/people/maya-angelou";
      const cloudName = "minimal-cloud";

      const transformations: ImageTransformation[] = [
        resizeImage(800, 600),
        addTextOverlay("Be yourself.", { gravity: "center" }),
        optimizeImage(),
      ];

      const url = buildImageUrl(cloudinaryId, transformations, cloudName);

      expect(url).toContain("w_800,h_600,c_fill");
      expect(url).toContain("Be%20yourself");
      expect(url).toContain("g_center");
      expect(url).toContain("f_auto,q_auto");
    });
  });
});
