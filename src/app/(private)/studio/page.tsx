import { requireOwner } from "@/lib/auth/require-owner";
import { StudioSpaces } from "@/components/studio/studio-spaces";
import { WorkSpaceContent } from "@/components/studio/work-space-content";
import { FunSpaceContent } from "@/components/studio/fun-space-content";

interface StudioPageProps {
  searchParams: Promise<{ space?: string }>;
}

// Two spaces sharing one page: Work (pegboard, Brainstorm, project
// portfolio) and Just for Fun (Ideas, Journal, Lab). Both are fully
// server-rendered up front and handed to StudioSpaces as ready-made JSX —
// the toggle between them is a client-side visibility swap, never a
// re-fetch or navigation.
export default async function StudioPage({ searchParams }: StudioPageProps) {
  const owner = await requireOwner();
  const params = await searchParams;
  const initialSpace = params.space === "fun" ? "fun" : "work";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <StudioSpaces
        initialSpace={initialSpace}
        workContent={<WorkSpaceContent ownerId={owner.id} />}
        funContent={<FunSpaceContent ownerId={owner.id} />}
      />
    </main>
  );
}
