import { Client, Databases, Storage, Users } from "node-appwrite";

let serverClient: Client | null = null;

export function getServerClient(): Client {
  if (serverClient) return serverClient;

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey) {
    throw new Error(
      "Missing Appwrite server config. Set NEXT_PUBLIC_APPWRITE_ENDPOINT, " +
        "NEXT_PUBLIC_APPWRITE_PROJECT_ID, and APPWRITE_API_KEY in .env.local"
    );
  }

  serverClient = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return serverClient;
}

export function getServerDatabases(): Databases {
  return new Databases(getServerClient());
}

export function getServerStorage(): Storage {
  return new Storage(getServerClient());
}

export function getServerUsers(): Users {
  return new Users(getServerClient());
}
