import {
  NextRequest,
  NextResponse,
} from "next/server";
import { TAIOS_SESSION_COOKIE } from "@/lib/auth/session";

export function proxy(
  request: NextRequest,
) {
  const hasSession =
    Boolean(
      request.cookies.get(
        TAIOS_SESSION_COOKIE,
      )?.value,
    );

  if (!hasSession) {
    const loginUrl =
      new URL(
        "/login",
        request.url,
      );

    loginUrl.searchParams.set(
      "next",
      request.nextUrl.pathname,
    );

    return NextResponse.redirect(
      loginUrl,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leads/:path*",
    "/properties/:path*",
    "/inspections/:path*",
    "/content-generator/:path*",
    "/ads-generator/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
