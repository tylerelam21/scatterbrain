import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

// Auth.js runs on JWT sessions (PRD §9.2 single-owner, no adapter needed),
// but domain tables (BrainItem, JournalEntry, ...) still need a real user
// row to reference. Ensure it exists at sign-in time.
export async function getOrCreateOwnerUser(input: { email: string; name?: string | null; image?: string | null }) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({ email: input.email, name: input.name, image: input.image })
    .returning();
  return created;
}
