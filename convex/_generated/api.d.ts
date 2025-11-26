/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as cleanupTestUsers from "../cleanupTestUsers.js";
import type * as cloudinary from "../cloudinary.js";
import type * as debugUsers from "../debugUsers.js";
import type * as emailVerification from "../emailVerification.js";
import type * as emailVerificationActions from "../emailVerificationActions.js";
import type * as generatedImages from "../generatedImages.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as lib_auth from "../lib/auth.js";
import type * as migrations_backfillCreatedBy from "../migrations/backfillCreatedBy.js";
import type * as passwordReset from "../passwordReset.js";
import type * as passwordResetActions from "../passwordResetActions.js";
import type * as people from "../people.js";
import type * as quotes from "../quotes.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  cleanupTestUsers: typeof cleanupTestUsers;
  cloudinary: typeof cloudinary;
  debugUsers: typeof debugUsers;
  emailVerification: typeof emailVerification;
  emailVerificationActions: typeof emailVerificationActions;
  generatedImages: typeof generatedImages;
  health: typeof health;
  http: typeof http;
  images: typeof images;
  "lib/auth": typeof lib_auth;
  "migrations/backfillCreatedBy": typeof migrations_backfillCreatedBy;
  passwordReset: typeof passwordReset;
  passwordResetActions: typeof passwordResetActions;
  people: typeof people;
  quotes: typeof quotes;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
