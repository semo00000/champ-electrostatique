/**
 * next-safe-action clients.
 *
 * Usage:
 *   import { actionClient, authActionClient } from "@/lib/safe-action";
 *
 *   // Public action (no auth required):
 *   export const myAction = actionClient
 *     .schema(z.object({ ... }))
 *     .action(async ({ parsedInput }) => { ... });
 *
 *   // Authenticated action (session verified server-side):
 *   export const myAuthAction = authActionClient
 *     .schema(z.object({ ... }))
 *     .action(async ({ parsedInput, ctx }) => {
 *       // ctx.user is the verified Appwrite user
 *     });
 */

import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { verifySession } from "@/lib/auth/verify-session";

// ── Base client ───────────────────────────────────────────────────────────────
export const actionClient = createSafeActionClient({
  handleServerError(e) {
    // Never leak raw error messages to the client in production
    if (process.env.NODE_ENV === "development") {
      console.error("[safe-action] Server error:", e.message);
    }
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

// ── Authenticated client ──────────────────────────────────────────────────────
// Verifies the Appwrite session cookie before executing the action.
// ctx.user is available in all actions that use authActionClient.
export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await verifySession();

  if (!user) {
    throw new Error("Unauthorized: valid session required.");
  }

  return next({ ctx: { user } });
});
