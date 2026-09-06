import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { appSettings } from "@/lib/db/schema";

export async function getAppSetting(userId: string, key: string): Promise<string | null> {
  const row = await db.query.appSettings.findFirst({
    where: and(eq(appSettings.userId, userId), eq(appSettings.key, key)),
  });
  return row?.value ?? null;
}

export async function getAppSettings(userId: string, keys: string[]): Promise<Record<string, string>> {
  const rows = await db.query.appSettings.findMany({
    where: eq(appSettings.userId, userId),
  });
  const result: Record<string, string> = {};
  for (const row of rows) {
    if (keys.includes(row.key)) result[row.key] = row.value;
  }
  return result;
}

export async function setAppSetting(userId: string, key: string, value: string) {
  await db
    .insert(appSettings)
    .values({ userId, key, value })
    .onConflictDoUpdate({
      target: [appSettings.userId, appSettings.key],
      set: { value, updatedAt: new Date() },
    });
}
