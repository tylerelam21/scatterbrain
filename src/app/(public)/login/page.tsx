import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role === "OWNER") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-24">
      <h1 className="font-display text-2xl tracking-tight">Sign in</h1>
      <p className="mt-2 text-muted">
        Owner access only.
      </p>
      <form
        className="mt-6"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-accent"
        >
          Continue with Google
        </button>
      </form>
    </main>
  );
}
