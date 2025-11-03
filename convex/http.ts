import { httpRouter } from "convex/server";
import { auth } from "./auth";

/**
 * HTTP Router for Convex Auth
 *
 * This sets up the necessary HTTP endpoints for:
 * - JWT verification (/.well-known/openid-configuration, /.well-known/jwks.json)
 * - OAuth sign-in (/api/auth/signin/*)
 * - OAuth callbacks (/api/auth/callback/*)
 */
const http = httpRouter();

auth.addHttpRoutes(http);

export default http;
