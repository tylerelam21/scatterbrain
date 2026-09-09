"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import { setAppSetting } from "@/lib/db/queries/settings";
import { SITE_CONTENT_KEYS } from "@/lib/site/content-keys";

export async function setSiteContent(formData: FormData) {
  const owner = await requireOwner();
  for (const key of SITE_CONTENT_KEYS) {
    const value = String(formData.get(key) ?? "").trim();
    await setAppSetting(owner.id, key, value);
  }
  revalidatePath("/");
  revalidatePath("/settings");
}
