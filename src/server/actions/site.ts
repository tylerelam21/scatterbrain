"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import { setAppSetting } from "@/lib/db/queries/settings";
import { SITE_CONTENT_KEYS, type SiteContentKey } from "@/lib/site/content-keys";

export async function setSiteContent(formData: FormData) {
  const owner = await requireOwner();
  for (const key of SITE_CONTENT_KEYS) {
    const value = String(formData.get(key) ?? "").trim();
    await setAppSetting(owner.id, key, value);
  }
  revalidatePath("/");
  revalidatePath("/settings");
}

// Same store as setSiteContent, but one field at a time — for inline
// editing directly on the live homepage (InlineEditable), where resending
// every key on every keystroke would be wasteful and would risk clobbering
// fields edited in another tab.
export async function setSiteContentField(key: SiteContentKey, value: string) {
  const owner = await requireOwner();
  await setAppSetting(owner.id, key, value.trim());
  revalidatePath("/");
  revalidatePath("/settings");
}
