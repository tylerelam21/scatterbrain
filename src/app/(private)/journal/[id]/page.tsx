export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight font-display">{id}</h1>
      <p className="mt-2 text-muted">
        Placeholder — journal entry editor to come.
      </p>
    </main>
  );
}
