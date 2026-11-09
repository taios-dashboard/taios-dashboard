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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext,
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

  const {
    id,
  } =
    await context.params;

  try {
    const response =
      await fetch(
        `${getBackendApiUrl()}/api/leads/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
            Authorization:
              `Bearer ${accessToken}`,
          },
          cache:
            "no-store",
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
              "Unable to retrieve lead.",
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
