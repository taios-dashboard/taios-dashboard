import {
  NextRequest,
  NextResponse,
} from "next/server";
import { cookies } from "next/headers";
import {
  TAIOS_SESSION_COOKIE,
} from "@/lib/auth/session";
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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: NextRequest,
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

  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "A valid JSON request body is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    !body
    || typeof body !== "object"
    || Array.isArray(body)
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "A valid assignment request is required.",
      },
      {
        status: 400,
      },
    );
  }

  const input =
    body as Record<
      string,
      unknown
    >;

  const keys =
    Object.keys(input);

  if (
    keys.length !== 1
    || keys[0] !== "assignedToId"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Only assignedToId can be changed through this endpoint.",
      },
      {
        status: 400,
      },
    );
  }

  const assignedToId =
    input.assignedToId;

  if (
    assignedToId !== null
    && (
      typeof assignedToId
        !== "string"
      || !UUID_PATTERN.test(
        assignedToId,
      )
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "assignedToId must be a valid user ID or null.",
      },
      {
        status: 400,
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
        `${getBackendApiUrl()}/api/leads/${encodeURIComponent(id)}/assignment`,
        {
          method: "PATCH",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${accessToken}`,
          },
          body:
            JSON.stringify({
              assignedToId,
            }),
          cache: "no-store",
        },
      );

    const payload =
      await parseBackendJson(
        response,
      );

    if (response.status === 401) {
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
              "Unable to update lead assignment.",
            ),
        },
        {
          status: response.status,
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
          "Lead assignment service unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}
