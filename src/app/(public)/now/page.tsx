import { auth } from "@/lib/auth";
import { getOwnerUser } from "@/lib/db/queries/users";
import { getAppSettings } from "@/lib/db/queries/settings";
import { SITE_CONTENT_KEYS } from "@/lib/site/content-keys";
import { updateNowPage } from "@/server/actions/site";
import { InlineEditable } from "@/components/home/inline-editable";

const NOW_PLACEHOLDER =
  "What you're currently working on, reading, learning, and exploring — a periodically updated snapshot, not a polished update.";

// The classic "/now page" — a single owner-editable block, deliberately
// lighter-weight than Notes or Commonplace. No AI, no structured fields,
// just whatever's true right now.
export default async function NowPage() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const owner = await getOwnerUser();
  const content = owner
    ? await getAppSettings(owner.id, [...SITE_CONTENT_KEYS])
    : ({} as Record<string, string>);

  const body = content["now.body"] ?? "";
  const updatedAt = content["now.updatedAt"];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Now</h1>
      {updatedAt && (
        <p className="mt-2 text-xs text-muted">
          Last updated{" "}
          {new Date(updatedAt).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}

      <div className="mt-10 text-lg leading-8 text-ink">
        {(body || isOwner) && (
          <InlineEditable
            value={body}
            editable={isOwner}
            onSave={updateNowPage}
            as="textarea"
            rows={8}
            placeholder={NOW_PLACEHOLDER}
            className="block whitespace-pre-wrap"
          />
        )}
        {!isOwner && !body && <p className="text-sm text-muted">Nothing posted yet.</p>}
      </div>
    </main>
  );
}
