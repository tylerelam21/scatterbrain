import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { getOrCreateOwnerUser } from "@/lib/db/queries/users";

// PRD §9.1 — V1 is single-user. Only the email in OWNER_EMAIL may sign in;
// everyone else is rejected before a session is ever created.
const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();

export const authConfig = {
  providers: [Google],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!ownerEmail || user.email?.toLowerCase() !== ownerEmail) return false;
      await getOrCreateOwnerUser({ email: user.email, name: user.name, image: user.image });
      return true;
    },
    async jwt({ token }) {
      if (token.email?.toLowerCase() === ownerEmail) {
        token.role = "OWNER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "OWNER" | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
