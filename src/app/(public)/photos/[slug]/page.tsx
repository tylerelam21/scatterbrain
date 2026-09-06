export default async function PhotoCollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight font-display">{slug}</h1>
      <p className="mt-2 text-muted">
        Placeholder — collection gallery to come.
      </p>
    </main>
  );
}
