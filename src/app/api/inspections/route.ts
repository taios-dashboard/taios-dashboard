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
  "leadId",
  "propertyId",
  "status",
  "from",
  "to",
  "page",
  "limit",
  "sort",
] as const;

const allowedCreateFields =
  new Set([
    "leadId",
    "propertyId",
    "scheduledAt",
    "notes",
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
        `${getBackendApiUrl()}/api/inspections`,
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
              "Unable to retrieve inspections.",
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

export async function POST(
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
    keys.some(
      (key) =>
        !allowedCreateFields.has(
          key,
        ),
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Unsupported inspection field.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof input.leadId
      !== "string"
    || input.leadId.trim()
      .length === 0
    || typeof input.scheduledAt
      !== "string"
    || input.scheduledAt.trim()
      .length === 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Lead and scheduled date are required.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    input.propertyId !== undefined
    && input.propertyId !== null
    && (
      typeof input.propertyId
        !== "string"
      || input.propertyId.trim()
        .length === 0
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Property ID must be valid or null.",
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
    Record<string, unknown> = {
      leadId:
        input.leadId.trim(),
      scheduledAt:
        input.scheduledAt.trim(),
  };

  if (
    input.propertyId !== undefined
  ) {
    body.propertyId =
      input.propertyId === null
        ? null
        : input.propertyId.trim();
  }

  if (
    input.notes !== undefined
  ) {
    body.notes =
      input.notes === null
        ? null
        : input.notes.trim();
  }

  try {
    const response =
      await fetch(
        `${getBackendApiUrl()}/api/inspections`,
        {
          method: "POST",
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
              "Unable to schedule inspection.",
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
        status: 201,
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
