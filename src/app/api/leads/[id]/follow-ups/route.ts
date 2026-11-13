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

function authenticationRequired() {
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
    return authenticationRequired();
  }

  const {
    id,
  } =
    await context.params;

  try {
    const response =
      await fetch(
        `${getBackendApiUrl()}/api/leads/${encodeURIComponent(id)}/follow-ups`,
        {
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
              "Unable to retrieve lead follow-ups.",
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

export async function POST(
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
    return authenticationRequired();
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
          "A valid follow-up request is required.",
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
    ]);

  const keys =
    Object.keys(input);

  if (
    keys.some(
      (key) =>
        !allowedFields.has(key),
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Only scheduledAt and note can be supplied when creating a follow-up.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof input.scheduledAt
      !== "string"
    || input.scheduledAt.trim()
      .length === 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "scheduledAt is required.",
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

  const {
    id,
  } =
    await context.params;

  const followUpBody: {
    scheduledAt: string;
    note?: string | null;
  } = {
    scheduledAt:
      input.scheduledAt,
  };

  if (input.note !== undefined) {
    followUpBody.note =
      input.note as
        | string
        | null;
  }

  try {
    const response =
      await fetch(
        `${getBackendApiUrl()}/api/leads/${encodeURIComponent(id)}/follow-ups`,
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
            JSON.stringify(
              followUpBody,
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
              "Unable to create lead follow-up.",
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
          "Lead follow-up service unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}
