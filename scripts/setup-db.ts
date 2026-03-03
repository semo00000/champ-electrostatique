import { Client, Databases, IndexType, Permission, Role } from "node-appwrite";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const DATABASE_ID = "bac-sciences";

const COLLECTIONS = {
  CURRICULUM: "curriculum",
  LESSONS: "lessons",
  QUIZZES: "quizzes",
  PROGRESS: "progress",
  GAMIFICATION: "gamification",
  PAYMENTS: "payments",
} as const;

async function main() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey || apiKey === "your-server-api-key") {
    console.error(
      "Set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, " +
        "and APPWRITE_API_KEY in .env.local before running this script."
    );
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const db = new Databases(client);

  // 1. Create database
  await tryCreate("database", () =>
    db.create(DATABASE_ID, "BAC Sciences")
  );

  // 2. Create collections + attributes + indexes
  await setupCurriculum(db);
  await setupLessons(db);
  await setupQuizzes(db);
  await setupProgress(db);
  await setupGamification(db);
  await setupPayments(db);

  console.log("\nDatabase setup complete.");
}

// ---------------------------------------------------------------------------
// curriculum — single document with full JSON tree
// ---------------------------------------------------------------------------
async function setupCurriculum(db: Databases) {
  const id = COLLECTIONS.CURRICULUM;
  console.log(`\nSetting up collection: ${id}`);

  await tryCreate("collection", () =>
    db.createCollection(
      DATABASE_ID,
      id,
      "Curriculum",
      [Permission.read(Role.any())],
      false
    )
  );

  await tryCreate("attr data", () =>
    db.createStringAttribute(DATABASE_ID, id, "data", 1000000, true)
  );
  await tryCreate("attr version", () =>
    db.createIntegerAttribute(DATABASE_ID, id, "version", true, 1)
  );
}

// ---------------------------------------------------------------------------
// lessons — one document per topic
// ---------------------------------------------------------------------------
async function setupLessons(db: Databases) {
  const id = COLLECTIONS.LESSONS;
  console.log(`\nSetting up collection: ${id}`);

  await tryCreate("collection", () =>
    db.createCollection(
      DATABASE_ID,
      id,
      "Lessons",
      [Permission.read(Role.any())],
      false
    )
  );

  await tryCreate("attr yearId", () =>
    db.createStringAttribute(DATABASE_ID, id, "yearId", 10, true)
  );
  await tryCreate("attr filiereId", () =>
    db.createStringAttribute(DATABASE_ID, id, "filiereId", 10, true)
  );
  await tryCreate("attr subjectId", () =>
    db.createStringAttribute(DATABASE_ID, id, "subjectId", 30, true)
  );
  await tryCreate("attr topicId", () =>
    db.createStringAttribute(DATABASE_ID, id, "topicId", 100, true)
  );
  await tryCreate("attr titleFr", () =>
    db.createStringAttribute(DATABASE_ID, id, "titleFr", 300, true)
  );
  await tryCreate("attr titleAr", () =>
    db.createStringAttribute(DATABASE_ID, id, "titleAr", 300, true)
  );
  await tryCreate("attr data", () =>
    db.createStringAttribute(DATABASE_ID, id, "data", 1000000, true)
  );

  await waitForAttributes(db, id);

  await tryCreate("idx topic_lookup", () =>
    db.createIndex(DATABASE_ID, id, "topic_lookup", IndexType.Unique, [
      "yearId",
      "filiereId",
      "subjectId",
      "topicId",
    ])
  );
  await tryCreate("idx by_year", () =>
    db.createIndex(DATABASE_ID, id, "by_year", IndexType.Key, ["yearId"])
  );
}

// ---------------------------------------------------------------------------
// quizzes — one document per topic
// ---------------------------------------------------------------------------
async function setupQuizzes(db: Databases) {
  const id = COLLECTIONS.QUIZZES;
  console.log(`\nSetting up collection: ${id}`);

  await tryCreate("collection", () =>
    db.createCollection(
      DATABASE_ID,
      id,
      "Quizzes",
      [Permission.read(Role.any())],
      false
    )
  );

  await tryCreate("attr yearId", () =>
    db.createStringAttribute(DATABASE_ID, id, "yearId", 10, true)
  );
  await tryCreate("attr filiereId", () =>
    db.createStringAttribute(DATABASE_ID, id, "filiereId", 10, true)
  );
  await tryCreate("attr subjectId", () =>
    db.createStringAttribute(DATABASE_ID, id, "subjectId", 30, true)
  );
  await tryCreate("attr topicId", () =>
    db.createStringAttribute(DATABASE_ID, id, "topicId", 100, true)
  );
  await tryCreate("attr questionCount", () =>
    db.createIntegerAttribute(DATABASE_ID, id, "questionCount", true)
  );
  await tryCreate("attr data", () =>
    db.createStringAttribute(DATABASE_ID, id, "data", 1000000, true)
  );

  await waitForAttributes(db, id);

  await tryCreate("idx topic_lookup", () =>
    db.createIndex(DATABASE_ID, id, "topic_lookup", IndexType.Unique, [
      "yearId",
      "filiereId",
      "subjectId",
      "topicId",
    ])
  );
  await tryCreate("idx by_year", () =>
    db.createIndex(DATABASE_ID, id, "by_year", IndexType.Key, ["yearId"])
  );
}

// ---------------------------------------------------------------------------
// progress — per-user per-topic, document-level security
// ---------------------------------------------------------------------------
async function setupProgress(db: Databases) {
  const id = COLLECTIONS.PROGRESS;
  console.log(`\nSetting up collection: ${id}`);

  await tryCreate("collection", () =>
    db.createCollection(
      DATABASE_ID,
      id,
      "Progress",
      [],
      true // documentSecurity enabled
    )
  );

  await tryCreate("attr userId", () =>
    db.createStringAttribute(DATABASE_ID, id, "userId", 36, true)
  );
  await tryCreate("attr topicKey", () =>
    db.createStringAttribute(DATABASE_ID, id, "topicKey", 200, true)
  );
  await tryCreate("attr lessonRead", () =>
    db.createBooleanAttribute(DATABASE_ID, id, "lessonRead", true)
  );
  await tryCreate("attr quizScore", () =>
    db.createIntegerAttribute(DATABASE_ID, id, "quizScore", false)
  );
  await tryCreate("attr quizTotal", () =>
    db.createIntegerAttribute(DATABASE_ID, id, "quizTotal", false)
  );
  await tryCreate("attr lastVisit", () =>
    db.createIntegerAttribute(DATABASE_ID, id, "lastVisit", false)
  );
  await tryCreate("attr lastQuiz", () =>
    db.createIntegerAttribute(DATABASE_ID, id, "lastQuiz", false)
  );

  await waitForAttributes(db, id);

  await tryCreate("idx user_progress", () =>
    db.createIndex(DATABASE_ID, id, "user_progress", IndexType.Unique, [
      "userId",
      "topicKey",
    ])
  );
  await tryCreate("idx by_user", () =>
    db.createIndex(DATABASE_ID, id, "by_user", IndexType.Key, ["userId"])
  );
}

// ---------------------------------------------------------------------------
// gamification — one document per user, document-level security
// ---------------------------------------------------------------------------
async function setupGamification(db: Databases) {
  const id = COLLECTIONS.GAMIFICATION;
  console.log(`\nSetting up collection: ${id}`);

  await tryCreate("collection", () =>
    db.createCollection(
      DATABASE_ID,
      id,
      "Gamification",
      [],
      true // documentSecurity enabled
    )
  );

  await tryCreate("attr userId", () =>
    db.createStringAttribute(DATABASE_ID, id, "userId", 36, true)
  );
  await tryCreate("attr xp", () =>
    db.createIntegerAttribute(DATABASE_ID, id, "xp", true)
  );
  await tryCreate("attr level", () =>
    db.createIntegerAttribute(DATABASE_ID, id, "level", true)
  );
  await tryCreate("attr streakDays", () =>
    db.createIntegerAttribute(DATABASE_ID, id, "streakDays", true)
  );
  await tryCreate("attr lastActiveDate", () =>
    db.createStringAttribute(DATABASE_ID, id, "lastActiveDate", 10, false)
  );
  await tryCreate("attr activityMap", () =>
    db.createStringAttribute(DATABASE_ID, id, "activityMap", 100000, true)
  );

  await waitForAttributes(db, id);

  await tryCreate("idx by_user", () =>
    db.createIndex(DATABASE_ID, id, "by_user", IndexType.Unique, ["userId"])
  );
}

// ---------------------------------------------------------------------------
// payments — Stripe payment records, document-level security
// ---------------------------------------------------------------------------
async function setupPayments(db: Databases) {
  const id = COLLECTIONS.PAYMENTS;
  console.log(`\nSetting up collection: ${id}`);

  await tryCreate("collection", () =>
    db.createCollection(
      DATABASE_ID,
      id,
      "Payments",
      [],
      true // documentSecurity enabled
    )
  );

  await tryCreate("attr userId", () =>
    db.createStringAttribute(DATABASE_ID, id, "userId", 36, true)
  );
  await tryCreate("attr stripeSessionId", () =>
    db.createStringAttribute(DATABASE_ID, id, "stripeSessionId", 255, true)
  );
  await tryCreate("attr stripeCustomerId", () =>
    db.createStringAttribute(DATABASE_ID, id, "stripeCustomerId", 255, false)
  );
  await tryCreate("attr status", () =>
    db.createEnumAttribute(
      DATABASE_ID,
      id,
      "status",
      ["pending", "active", "cancelled", "expired"],
      true
    )
  );
  await tryCreate("attr plan", () =>
    db.createStringAttribute(DATABASE_ID, id, "plan", 50, true)
  );
  await tryCreate("attr createdAt", () =>
    db.createStringAttribute(DATABASE_ID, id, "createdAt", 30, true)
  );
  await tryCreate("attr expiresAt", () =>
    db.createStringAttribute(DATABASE_ID, id, "expiresAt", 30, false)
  );
  await tryCreate("attr stripeSubscriptionId", () =>
    db.createStringAttribute(DATABASE_ID, id, "stripeSubscriptionId", 255, false)
  );

  await waitForAttributes(db, id);

  await tryCreate("idx by_user", () =>
    db.createIndex(DATABASE_ID, id, "by_user", IndexType.Key, ["userId"])
  );
  await tryCreate("idx by_stripe_session", () =>
    db.createIndex(
      DATABASE_ID,
      id,
      "by_stripe_session",
      IndexType.Unique,
      ["stripeSessionId"]
    )
  );
  await tryCreate("idx by_status", () =>
    db.createIndex(DATABASE_ID, id, "by_status", IndexType.Key, [
      "userId",
      "status",
    ])
  );
  await tryCreate("idx by_subscription", () =>
    db.createIndex(DATABASE_ID, id, "by_subscription", IndexType.Key, [
      "stripeSubscriptionId",
    ])
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function tryCreate(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    console.log(`  [OK] ${label}`);
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 409) {
      console.log(`  [SKIP] ${label} (already exists)`);
    } else {
      console.error(`  [FAIL] ${label}`, err);
      throw err;
    }
  }
}

async function waitForAttributes(db: Databases, collectionId: string) {
  process.stdout.write("  Waiting for attributes...");
  for (let i = 0; i < 60; i++) {
    const { attributes } = await db.listAttributes(DATABASE_ID, collectionId);
    const allReady = attributes.every(
      (a: { status?: string }) => a.status === "available"
    );
    if (allReady) {
      console.log(" ready.");
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));
    process.stdout.write(".");
  }
  throw new Error(
    `Attributes for ${collectionId} did not become available in 60s`
  );
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
