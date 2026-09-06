export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight font-display">{slug}</h1>
      <p className="mt-2 text-muted">
        Placeholder — project case study to come.
      </p>
    </main>
  );
}
