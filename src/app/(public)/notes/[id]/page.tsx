import Link from "next/link";
import { notFound } from "next/navigation";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { auth } from "@/lib/auth";
import { getOwnerUser } from "@/lib/db/queries/users";
import { getJournalEntryById } from "@/lib/db/queries/journal";
import type { JournalContent } from "@/lib/journal/constants";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const { id } = await params;

  const owner = await getOwnerUser();
  const entry = owner ? await getJournalEntryById(owner.id, id) : null;
  if (!entry) notFound();
  if (!isOwner && (entry.visibility !== "PUBLIC" || entry.status !== "COMPLETE")) notFound();

  const bodyHtml = entry.contentJson
    ? generateHTML(entry.contentJson as JournalContent, [StarterKit, Image])
    : "";

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link href="/notes" className="text-xs text-muted hover:text-ink">
        ← All notes
      </Link>

      <p className="mt-6 text-xs text-muted">
        {new Date(entry.journalDate).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <h1 className="font-display mt-2 text-4xl tracking-tight text-ink">
        {entry.title || "Untitled"}
      </h1>

      {bodyHtml && <div className="journal-editor mt-10" dangerouslySetInnerHTML={{ __html: bodyHtml }} />}
    </main>
  );
}
