import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

// PRD §52 — every private mutation/query must verify an authenticated,
// authorized owner before touching data. Used in both server components and
// server actions; the domain user row (not just the session) is what
// foreign keys (BrainItem.userId, etc.) actually need.
export async function requireOwner() {
  const session = await auth();
  if (session?.user?.role !== "OWNER" || !session.user.email) {
    redirect("/login");
  }

  const owner = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });
  if (!owner) {
    redirect("/login");
  }

  return owner;
}
