import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// PRD §9, §59 Phase 0 exit criteria — every route under this group requires
// an authenticated owner session; everyone else is redirected to /login.
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session?.user?.role !== "OWNER") {
    redirect("/login");
  }

  return <>{children}</>;
}
