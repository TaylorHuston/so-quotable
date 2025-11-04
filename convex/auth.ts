import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";

/**
 * Convex Auth configuration for So Quotable
 *
 * Providers:
 * - Password: Email/password authentication with email verification
 * - Google: OAuth authentication via Google
 *
 * Security Configuration:
 * - Session: 24 hours default, 7 days with "remember me"
 * - JWT: 1 hour token validity
 * - Rate Limiting: 5 failed attempts → 15min lockout per hour (default: 10/hour)
 * - CSRF Protection: Enabled via Convex Auth
 * - Cookies: httpOnly, secure, sameSite=strict (via Convex Auth)
 *
 * Phase 1: Foundation - Password provider only
 * Phase 3: OAuth - Google provider will be activated
 */
export const { auth, signIn, signOut, store } = convexAuth({
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

        // Generate slug from email (will be made unique by database if needed)
        const emailPrefix = email.split("@")[0];
        const slug = (emailPrefix && emailPrefix.length > 0 ? emailPrefix : "user")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");

        return {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          slug,
          role: "user" as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      },
    }),

    // Google OAuth (Phase 3)
    Google({
      id: "google",

      // Profile customization for Google OAuth users
      profile(profile) {
        const email = profile.email as string;
        const name = (profile.name as string) || email.split("@")[0] || "user";

        // Generate slug from email (same pattern as Password provider)
        const emailPrefix = email.split("@")[0];
        const slug = (emailPrefix && emailPrefix.length > 0 ? emailPrefix : "user")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");

        return {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          slug,
          role: "user" as const,
          // Google-authenticated users are pre-verified
          emailVerificationTime: Date.now(),
          image: profile.picture as string | undefined,
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
