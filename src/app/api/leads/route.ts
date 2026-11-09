import {
  NextRequest,
  NextResponse,
} from "next/server";
import { cookies } from "next/headers";
import { TAIOS_SESSION_COOKIE } from "@/lib/auth/session";
import {
  getBackendApiUrl,
  getBackendErrorMessage,
  parseBackendJson,
} from "@/lib/server/backend";

const allowedQueryParameters = [
  "page",
  "limit",
  "search",
  "status",
  "temperature",
  "source",
  "assignedToId",
  "assignment",
  "scope",
  "followUp",
  "sort",
] as const;

export async function GET(
  request: NextRequest,
) {
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
    const backendUrl =
      new URL(
        `${getBackendApiUrl()}/api/leads`,
      );

    for (
      const parameter
      of allowedQueryParameters
    ) {
      const value =
        request.nextUrl.searchParams.get(
          parameter,
        );

      if (value !== null) {
        backendUrl.searchParams.set(
          parameter,
          value,
        );
      }
    }

    const response =
      await fetch(
        backendUrl,
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
        response,
      );

    if (
      response.status === 401
    ) {
      cookieStore.delete(
        TAIOS_SESSION_COOKIE,
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            getBackendErrorMessage(
              payload,
              "Unable to retrieve leads.",
            ),
        },
        {
          status:
            response.status,
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
          "Lead service unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}
