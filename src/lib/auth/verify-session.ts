/**
 * Server-side Appwrite session verifier.
 * Reads the Appwrite session cookie set by the browser SDK and validates it
 * against the Appwrite API using the node-appwrite SDK.
 */

import { cookies } from "next/headers";
import { Client, Account } from "node-appwrite";
import type { Models } from "node-appwrite";

/**
 * Returns the authenticated Appwrite user or null if the session is missing/invalid.
 * Safe to call in Server Components, Server Actions, and API Routes.
 */
export async function verifySession(): Promise<Models.User<Models.Preferences> | null> {
  const cookieStore = await cookies();

  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;

  if (!projectId || !endpoint) return null;

  // Appwrite web SDK stores the session JWT in a cookie named:
  //   a_session_{projectId}          (current SDK)
  //   a_session_{projectId}_legacy   (older SDK compat)
  const sessionValue =
    cookieStore.get(`a_session_${projectId}`)?.value ??
    cookieStore.get(`a_session_${projectId}_legacy`)?.value;

  if (!sessionValue) return null;

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setSession(sessionValue);

  const account = new Account(client);

  try {
    return await account.get();
  } catch {
    return null;
  }
}

/**
 * Like verifySession() but throws a 401-style Error if the session is invalid.
 * Useful in API routes so you can call it at the top and early-exit.
 */
export async function requireSession(): Promise<Models.User<Models.Preferences>> {
  const user = await verifySession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
