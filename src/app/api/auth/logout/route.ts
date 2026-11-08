import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TAIOS_SESSION_COOKIE } from "@/lib/auth/session";

export async function POST() {
  const cookieStore =
    await cookies();

  cookieStore.delete(
    TAIOS_SESSION_COOKIE,
  );

  return NextResponse.json({
    success: true,
    message:
      "Logged out successfully.",
  });
}
