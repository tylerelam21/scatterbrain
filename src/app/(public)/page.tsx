import { auth } from "@/lib/auth";
import { requireOwner } from "@/lib/auth/require-owner";
import { QuickCapture } from "@/components/brain/quick-capture";
import { RecentBrain } from "@/components/brain/recent-brain";

// PRD §1, §10 — same URL, two identities: an authenticated owner gets the
// private Home dashboard (today, Quick Capture, recent Brain, resurfaced
// thought); anyone else gets the public landing.
export default async function Home() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";

  if (isOwner) {
    const owner = await requireOwner();
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-24">
        <h1 className="font-display text-3xl leading-tight tracking-tight text-ink">
          What&apos;s on your mind?
        </h1>
        <div className="mt-6">
          <QuickCapture />
        </div>
        <div className="mt-16">
          <h2 className="text-sm font-medium text-muted">Recent</h2>
          <div className="mt-3">
            <RecentBrain userId={owner.id} />
          </div>
        </div>
        <p className="mt-16 text-sm text-muted">
          Today, Upcoming, and the resurfaced thought land here in Phase 4,
          once Calendar exists.
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
