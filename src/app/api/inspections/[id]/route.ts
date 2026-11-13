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

const allowedUpdateFields =
  new Set([
    "scheduledAt",
    "status",
    "notes",
  ]);

const allowedStatuses =
  new Set([
    "PENDING",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
  ]);

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object"
    && value !== null
    && !Array.isArray(value)
  );
}

async function getAccessToken() {
  const cookieStore =
    await cookies();

  return {
    cookieStore,
    accessToken:
      cookieStore.get(
        TAIOS_SESSION_COOKIE,
      )?.value,
  };
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const {
    cookieStore,
    accessToken,
  } =
    await getAccessToken();

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
        `${getBackendApiUrl()}/api/inspections/${encodeURIComponent(id)}`,
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
              "Unable to retrieve inspection.",
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
          "Inspection service unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const {
    cookieStore,
    accessToken,
  } =
    await getAccessToken();

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

  let input: unknown;

  try {
    input =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  if (!isRecord(input)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  const keys =
    Object.keys(input);

  if (
    keys.length === 0
    || keys.some(
      (key) =>
        !allowedUpdateFields.has(
          key,
        ),
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "At least one supported inspection field is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    input.scheduledAt !== undefined
    && (
      typeof input.scheduledAt
        !== "string"
      || input.scheduledAt.trim()
        .length === 0
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Scheduled date must be valid.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    input.status !== undefined
    && (
      typeof input.status
        !== "string"
      || !allowedStatuses.has(
        input.status,
      )
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Inspection status is invalid.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    input.notes !== undefined
    && input.notes !== null
    && typeof input.notes
      !== "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Inspection notes must be text or null.",
      },
      {
        status: 400,
      },
    );
  }

  const body:
    Record<string, unknown> = {};

  if (
    input.scheduledAt !== undefined
  ) {
    body.scheduledAt =
      input.scheduledAt.trim();
  }

  if (
    input.status !== undefined
  ) {
    body.status =
      input.status;
  }

  if (
    input.notes !== undefined
  ) {
    body.notes =
      input.notes === null
        ? null
        : input.notes.trim();
  }

  const {
    id,
  } =
    await context.params;

  try {
    const response =
      await fetch(
        `${getBackendApiUrl()}/api/inspections/${encodeURIComponent(id)}`,
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
            JSON.stringify(body),
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
              "Unable to update inspection.",
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
          "Inspection service unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}
