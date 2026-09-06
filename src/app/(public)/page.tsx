import { auth } from "@/lib/auth";

// PRD §1, §10 — same URL, two identities: an authenticated owner gets the
// private Home dashboard (today, Quick Capture, recent Brain, resurfaced
// thought); anyone else gets the public landing.
export default async function Home() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";

  if (isOwner) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-24">
        <h1 className="font-display text-4xl leading-tight tracking-tight text-ink">
          Home dashboard — foundation only.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
          Today, Quick Capture, recent Brain, and the resurfaced thought land
          here in Phase 4, once Brain, Journal, and Calendar exist.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-24">
      <h1 className="font-display max-w-xl text-4xl leading-tight tracking-tight text-ink">
        A personal hub, in progress.
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
        Public work, experiments, and photography will live here.
      </p>
    </main>
  );
}
