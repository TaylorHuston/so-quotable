/**
 * Cloudinary URL transformation helper functions
 *
 * These pure functions construct Cloudinary transformation URLs for image manipulation.
 * Cloudinary uses URL-based transformations - no server-side processing needed.
 *
 * URL Pattern: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
 *
 * Multiple transformations are separated by slashes (/) and applied in order.
 * Parameters within a transformation are separated by commas (,).
 *
 * @see https://cloudinary.com/documentation/image_transformations
 */

/**
 * Type for Cloudinary transformation strings
 * Examples: "w_800,h_600,c_fill" or "l_text:Arial_48:Hello"
 */
export type ImageTransformation = string;

/**
 * Crop modes supported by Cloudinary resize transformation
 */
export type CropMode =
  | "fill" // Resize to fill dimensions, cropping excess
  | "scale" // Resize to fit dimensions, may distort
  | "fit" // Resize to fit within dimensions, maintain aspect ratio
  | "crop" // Crop to dimensions
  | "thumb"; // Create thumbnail

/**
 * Gravity options for text and image positioning
 */
export type Gravity =
  | "north" // Top
  | "south" // Bottom
  | "east" // Right
  | "west" // Left
  | "center" // Center
  | "north_east" // Top right
  | "north_west" // Top left
  | "south_east" // Bottom right
  | "south_west"; // Bottom left

/**
 * Options for text overlay transformation
 */
export interface TextOverlayOptions {
  /**
   * Font family (default: "Arial")
   * Cloudinary supports: Arial, Times, Courier, Verdana, Helvetica, etc.
   */
  fontFamily?: string;

  /**
   * Font size in points (default: 48)
   */
  fontSize?: number;

  /**
   * Font weight (default: normal)
   */
  fontWeight?: "normal" | "bold";

  /**
   * Text color as RGB hex (default: white "ffffff")
   * Examples: "ffffff" (white), "000000" (black), "ff0000" (red)
   */
  color?: string;

  /**
   * Text positioning gravity (default: center)
   */
  gravity?: Gravity;

  /**
   * Y offset in pixels from gravity position
   * Positive = down, negative = up
   */
  yOffset?: number;

  /**
   * X offset in pixels from gravity position
   * Positive = right, negative = left
   */
  xOffset?: number;

  /**
   * Maximum width for text wrapping (pixels)
   * Text will wrap within this width
   */
  maxWidth?: number;
}

/**
 * Build a Cloudinary image URL with transformations
 *
 * @param cloudinaryId - Cloudinary public ID (e.g., "so-quotable/people/person-name")
 * @param transformations - Array of transformation strings to apply (order matters)
 * @param cloudName - Cloudinary cloud name
 * @returns Complete Cloudinary URL with transformations
 *
 * @example
 * ```ts
 * const url = buildImageUrl(
 *   "so-quotable/people/einstein",
 *   ["w_800,h_600,c_fill", "l_text:Arial_48:Hello", "f_auto,q_auto"],
 *   "my-cloud-name"
 * );
 * // Returns: https://res.cloudinary.com/my-cloud-name/image/upload/w_800,h_600,c_fill/l_text:Arial_48:Hello/f_auto,q_auto/so-quotable/people/einstein
 * ```
 */
export function buildImageUrl(
  cloudinaryId: string,
  transformations: ImageTransformation[],
  cloudName: string
): string {
  // Validate and trim inputs
  const trimmedId = cloudinaryId.trim();
  const trimmedCloudName = cloudName.trim();

  if (!trimmedId) {
    throw new Error("cloudinaryId is required");
  }

  if (!trimmedCloudName) {
    throw new Error("cloudName is required");
  }

  // Build base URL
  const baseUrl = `https://res.cloudinary.com/${trimmedCloudName}/image/upload`;

  // If no transformations, return base URL + ID
  if (transformations.length === 0) {
    return `${baseUrl}/${trimmedId}`;
  }

  // Join transformations with slashes
  const transformationString = transformations.join("/");

  return `${baseUrl}/${transformationString}/${trimmedId}`;
}

/**
 * Create a resize transformation
 *
 * @param width - Target width in pixels (must be positive)
 * @param height - Target height in pixels (must be positive)
 * @param crop - Crop mode (default: "fill")
 * @returns Cloudinary resize transformation string
 *
 * @example
 * ```ts
 * resizeImage(800, 600) // Returns: "w_800,h_600,c_fill"
 * resizeImage(800, 600, "scale") // Returns: "w_800,h_600,c_scale"
 * ```
 */
export function resizeImage(
  width: number,
  height: number,
  crop: CropMode = "fill"
): ImageTransformation {
  if (width <= 0) {
    throw new Error("Width must be positive");
  }

  if (height <= 0) {
    throw new Error("Height must be positive");
  }

  return `w_${width},h_${height},c_${crop}`;
}

/**
 * Create an image optimization transformation
 *
 * Uses Cloudinary's automatic format and quality optimization.
 * f_auto serves WebP to Chrome, JPEG to Safari, etc. based on browser support.
 * q_auto adjusts quality based on image content and viewing context.
 *
 * @param format - Image format (default: "auto" for automatic selection)
 * @param quality - Quality level 1-100 or "auto" (default: "auto")
 * @returns Cloudinary optimization transformation string
 *
 * @example
 * ```ts
 * optimizeImage() // Returns: "f_auto,q_auto"
 * optimizeImage("webp", 80) // Returns: "f_webp,q_80"
 * ```
 */
export function optimizeImage(
  format: string = "auto",
  quality: number | "auto" = "auto"
): ImageTransformation {
  // Validate quality if it's a number
  if (typeof quality === "number") {
    if (quality < 1 || quality > 100) {
      throw new Error("Quality must be between 1 and 100");
    }
  }

  const qualityStr = typeof quality === "number" ? quality.toString() : quality;

  return `f_${format},q_${qualityStr}`;
}

/**
 * Create a semi-transparent background overlay for text readability
 *
 * Adds a colored layer behind text to improve contrast and readability.
 *
 * @param opacity - Opacity percentage 0-100 (0=transparent, 100=opaque)
 * @param color - Color name or RGB (default: "black")
 * @returns Cloudinary background overlay transformation string
 *
 * @example
 * ```ts
 * addBackgroundOverlay(50) // Returns: "l_black,e_colorize:50,fl_layer_apply"
 * addBackgroundOverlay(70, "white") // Returns: "l_white,e_colorize:70,fl_layer_apply"
 * addBackgroundOverlay(60, "rgb:333333") // Returns: "l_rgb:333333,e_colorize:60,fl_layer_apply"
 * ```
 */
export function addBackgroundOverlay(
  opacity: number,
  color: string = "black"
): ImageTransformation {
  if (opacity < 0 || opacity > 100) {
    throw new Error("Opacity must be between 0 and 100");
  }

  return `l_${color},e_colorize:${opacity},fl_layer_apply`;
}

/**
 * Create a text overlay transformation
 *
 * Adds text to an image with customizable font, size, color, and positioning.
 * Special characters are automatically URL-encoded (spaces, quotes, commas, etc.).
 *
 * @param text - Text to overlay on the image
 * @param options - Text styling and positioning options
 * @returns Cloudinary text overlay transformation string
 *
 * @example
 * ```ts
 * // Basic text overlay
 * addTextOverlay("Hello World")
 * // Returns: "l_text:Arial_48:Hello%20World"
 *
 * // Styled text overlay
 * addTextOverlay("Quote text here", {
 *   fontFamily: "Times",
 *   fontSize: 64,
 *   fontWeight: "bold",
 *   color: "ffffff",
 *   gravity: "center",
 *   maxWidth: 800
 * })
 * // Returns: "l_text:Times_64_bold:Quote%20text%20here,co_rgb:ffffff,g_center,w_800,c_fit"
 * ```
 */
export function addTextOverlay(
  text: string,
  options: TextOverlayOptions = {}
): ImageTransformation {
  const {
    fontFamily = "Arial",
    fontSize = 48,
    fontWeight,
    color,
    gravity,
    yOffset,
    xOffset,
    maxWidth,
  } = options;

  // Build font specification
  let fontSpec = `${fontFamily}_${fontSize}`;
  if (fontWeight && fontWeight !== "normal") {
    fontSpec += `_${fontWeight}`;
  }

  // URL-encode text (handles spaces, quotes, commas, Unicode, etc.)
  const encodedText = encodeURIComponent(text.trim());

  // Start building transformation parts
  const parts: string[] = [`l_text:${fontSpec}:${encodedText}`];

  // Add color if specified
  if (color) {
    parts.push(`co_rgb:${color}`);
  }

  // Add gravity if specified
  if (gravity) {
    parts.push(`g_${gravity}`);
  }

  // Add Y offset if specified
  if (yOffset !== undefined) {
    parts.push(`y_${yOffset}`);
  }

  // Add X offset if specified
  if (xOffset !== undefined) {
    parts.push(`x_${xOffset}`);
  }

  // Add max width for text wrapping if specified
  if (maxWidth !== undefined) {
    parts.push(`w_${maxWidth}`);
    parts.push("c_fit");
  }

  // Join all parts with commas
  return parts.join(",");
}
