import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { exchangeCodeForTokens, getGoogleUserInfo } from "@/lib/calendar/google";
import { syncCalendarConnection, upsertCalendarConnection } from "@/lib/db/queries/calendar";
import { CALENDAR_OAUTH_STATE_COOKIE } from "@/lib/calendar/constants";

// Route handlers don't share the redirect() semantics of Server
// Components/Actions, so the owner check here is inlined with a plain
// NextResponse.redirect rather than reusing requireOwner().
export async function GET(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "OWNER" || !session.user.email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const owner = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
  if (!owner) return NextResponse.redirect(new URL("/login", request.url));

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(CALENDAR_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(CALENDAR_OAUTH_STATE_COOKIE);

  if (error) {
    return NextResponse.redirect(new URL("/settings?calendar_error=access_denied", request.url));
  }
  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL("/settings?calendar_error=invalid_state", request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await getGoogleUserInfo(tokens.access_token);

    const connection = await upsertCalendarConnection({
      userId: owner.id,
      providerAccountId: userInfo.sub,
      email: userInfo.email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      scopes: tokens.scope.split(" "),
    });

    await syncCalendarConnection(connection.id);

    return NextResponse.redirect(new URL("/settings?calendar_connected=1", request.url));
  } catch (err) {
    console.error("[calendar-oauth-callback]", err);
    return NextResponse.redirect(new URL("/settings?calendar_error=exchange_failed", request.url));
  }
}
