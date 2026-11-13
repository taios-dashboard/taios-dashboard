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
    followUpId: string;
  }>;
};

const ALLOWED_STATUSES =
  new Set([
    "PENDING",
    "COMPLETED",
    "CANCELLED",
  ]);

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
          "A valid follow-up update is required.",
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

  const allowedFields =
    new Set([
      "scheduledAt",
      "note",
      "status",
    ]);

  const keys =
    Object.keys(input);

  if (
    keys.length === 0
    || keys.some(
      (key) =>
        !allowedFields.has(key),
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "At least one valid follow-up field is required.",
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
      || input.scheduledAt
        .trim().length === 0
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "scheduledAt must be a valid date-time string.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    input.note !== undefined
    && input.note !== null
    && typeof input.note
      !== "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "note must be a string or null.",
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
      || !ALLOWED_STATUSES.has(
        input.status,
      )
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "status must be PENDING, COMPLETED, or CANCELLED.",
      },
      {
        status: 400,
      },
    );
  }

  const {
    id,
    followUpId,
  } =
    await context.params;

  const updateBody: {
    scheduledAt?: string;
    note?: string | null;
    status?:
      | "PENDING"
      | "COMPLETED"
      | "CANCELLED";
  } = {};

  if (
    input.scheduledAt
      !== undefined
  ) {
    updateBody.scheduledAt =
      input.scheduledAt as string;
  }

  if (input.note !== undefined) {
    updateBody.note =
      input.note as
        | string
        | null;
  }

  if (input.status !== undefined) {
    updateBody.status =
      input.status as
        | "PENDING"
        | "COMPLETED"
        | "CANCELLED";
  }

  try {
    const response =
      await fetch(
        `${getBackendApiUrl()}/api/leads/${encodeURIComponent(id)}/follow-ups/${encodeURIComponent(followUpId)}`,
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
            JSON.stringify(
              updateBody,
            ),
          cache:
            "no-store",
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
              "Unable to update lead follow-up.",
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
          "Lead follow-up service unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}
