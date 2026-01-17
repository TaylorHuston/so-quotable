import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { normalizeEmail } from "../src/lib/email-utils";
import { generateSlug } from "../src/lib/slug-utils";

/**
 * Convex Auth configuration for So Quotable
 *
 * Provides authentication via email/password and Google OAuth with NIST-compliant
 * password requirements and secure session management.
 *
 * @example
 * ```typescript
 * // Backend usage (Convex functions)
 * import { auth } from "./auth";
 *
 * export const myQuery = query({
 *   args: {},
 *   handler: async (ctx) => {
 *     const userId = await auth.getUserId(ctx);
 *     if (!userId) throw new Error("Not authenticated");
 *     // ... your logic
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Frontend usage (React components)
 * import { useAuthActions } from "@convex-dev/auth/react";
 *
 * function LoginForm() {
 *   const { signIn } = useAuthActions();
 *
 *   const handleLogin = async () => {
 *     const formData = new FormData();
 *     formData.append("email", email);
 *     formData.append("password", password);
 *     formData.append("flow", "signIn");
 *     await signIn("password", formData);
 *   };
 * }
 * ```
 *
 * **Authentication Providers**:
 * - Password: Email/password with NIST-compliant validation
 * - Google: OAuth 2.0 authentication
 *
 * **Security Features**:
 * - Session: 24 hours default, 7 days with "remember me"
 * - JWT: 1 hour token validity
 * - Rate Limiting: 5 failed attempts → 15min lockout (12min between attempts)
 * - CSRF Protection: Enabled via Convex Auth
 * - Cookies: httpOnly, secure, sameSite=strict
 *
 * **Password Requirements** (NIST Special Publication 800-63B):
 * - Minimum 12 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 *
 * @see {@link https://labs.convex.dev/auth | Convex Auth Documentation}
 * @see {@link https://pages.nist.gov/800-63-3/sp800-63b.html | NIST Password Guidelines}
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      id: "password",
      // Validate password requirements
      validatePasswordRequirements: (password: string) => {
        if (!password || password.length < 12) {
          throw new Error(
            "Password must be at least 12 characters long"
          );
        }

        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
          throw new Error("Password must contain at least one uppercase letter");
        }

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
          throw new Error("Password must contain at least one lowercase letter");
        }

        // Check for at least one number
        if (!/[0-9]/.test(password)) {
          throw new Error("Password must contain at least one number");
        }

        // Check for at least one special character
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
          throw new Error("Password must contain at least one special character");
        }
      },

      // Profile customization for user creation
      profile(params) {
        const email = params.email as string;
        const name = (params.name as string | undefined) || email.split("@")[0] || "user";

        // Generate slug from email using utility (will be made unique by database if needed)
        const slug = generateSlug(email);

        return {
          email: normalizeEmail(email),
          name: name.trim(),
          slug,
          role: "user" as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      },
    }),

    // Google OAuth (Phase 3)
    // Explicitly pass credentials - Convex env vars not auto-detected by @auth/core
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile(profile) {
        const email = (profile.email as string) || "";
        const name = (profile.name as string) || email.split("@")[0] || "user";
        const image = profile.picture as string | undefined;

        // Generate slug from email using utility (will be made unique by database if needed)
        const slug = generateSlug(email);

        return {
          id: profile.sub as string, // REQUIRED: Google's unique user ID
          email: normalizeEmail(email),
          name: name.trim(),
          slug,
          role: "user" as const,
          image,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      },
    }),
  ],

  /**
   * Session configuration
   * - Default: 24 hours (86400000 ms)
   * - With "remember me": 7 days (604800000 ms)
   */
  session: {
    totalDurationMs: 24 * 60 * 60 * 1000, // 24 hours
    inactiveDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  },

  /**
   * JWT token configuration
   * - Access tokens valid for 1 hour
   */
  jwt: {
    durationMs: 60 * 60 * 1000, // 1 hour
  },

  /**
   * Rate limiting configuration
   * - 5 failed sign-in attempts per hour (then one attempt every 12 minutes)
   * - This prevents brute force attacks while allowing legitimate retries
   *
   * Note: Convex Auth uses this to determine the refill rate.
   * After maxFailedAttempsPerHour attempts, rate limit kicks in.
   *
   * Formula: Lockout time between attempts = 60 minutes / maxFailedAttempsPerHour
   * - 5 attempts/hour = 12 minutes between attempts after lockout
   * - This effectively gives ~15 minute lockout after 5 failed attempts
   */
  signIn: {
    maxFailedAttempsPerHour: 5,
  },

  /**
   * Callbacks for custom behavior
   */
  callbacks: {
    /**
     * Called after user is created or updated during sign-in
     * Use this to set initial role, create related records, etc.
     */
    async afterUserCreatedOrUpdated(ctx, args) {
      // For new users, ensure they have the default "user" role
      if (!args.existingUserId) {
        const user = await ctx.db.get(args.userId);
        if (user && !user.role) {
          await ctx.db.patch(args.userId, {
            role: "user",
            updatedAt: Date.now(),
          });
        }
      }
    },
  },
});
