import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TAIOS_SESSION_COOKIE } from "@/lib/auth/session";
import {
  getBackendApiUrl,
  getBackendErrorMessage,
  parseBackendJson,
} from "@/lib/server/backend";

export async function GET() {
  const cookieStore =
    await cookies();

  const accessToken =
    cookieStore.get(
      TAIOS_SESSION_COOKIE,
    )?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Authentication required.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const backendResponse =
      await fetch(
        `${getBackendApiUrl()}/api/dashboard/crm-summary`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
            Authorization:
              `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      );

    const payload =
      await parseBackendJson(
        backendResponse,
      );

    if (
      backendResponse.status ===
      401
    ) {
      cookieStore.delete(
        TAIOS_SESSION_COOKIE,
      );
    }

    if (
      !backendResponse.ok
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            getBackendErrorMessage(
              payload,
              "Unable to load dashboard data.",
            ),
        },
        {
          status:
            backendResponse.status,
        },
      );
    }

    return NextResponse.json(
      payload,
      {
        status: 200,
      },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Dashboard service is unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}
