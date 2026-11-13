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

const allowedStatuses =
  new Set([
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "INSPECTION_BOOKED",
    "WON",
    "LOST",
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
    keys.length < 1
    || keys.length > 2
    || keys.some(
      (key) =>
        key !== "status"
        && key !== "lossReason",
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Only pipeline status and loss reason may be updated here.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof input.status
      !== "string"
    || !allowedStatuses.has(
      input.status,
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "A valid lead pipeline status is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    input.status === "LOST"
  ) {
    if (
      typeof input.lossReason
        !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Loss reason is required when marking a lead as lost.",
        },
        {
          status: 400,
        },
      );
    }

    const reason =
      input.lossReason.trim();

    if (
      reason.length < 2
      || reason.length > 500
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Loss reason must be between 2 and 500 characters.",
        },
        {
          status: 400,
        },
      );
    }
  } else if (
    input.lossReason !== undefined
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Loss reason can only be provided when marking a lead as lost.",
      },
      {
        status: 400,
      },
    );
  }

  const body:
    Record<string, unknown> = {
      status:
        input.status,
  };

  if (
    input.status === "LOST"
    && typeof input.lossReason
      === "string"
  ) {
    body.lossReason =
      input.lossReason.trim();
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
              "Unable to update lead pipeline.",
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
