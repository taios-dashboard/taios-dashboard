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
        `${getBackendApiUrl()}/api/leads/${encodeURIComponent(id)}/property-interests`,
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
              "Unable to retrieve property interests.",
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
          "Property interest service unavailable.",
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
    keys.length !== 1
    || keys[0] !== "propertyId"
    || typeof input.propertyId
      !== "string"
    || input.propertyId.trim()
      .length === 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "A valid property ID is required.",
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
        `${getBackendApiUrl()}/api/leads/${encodeURIComponent(id)}/property-interests`,
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
            JSON.stringify({
              propertyId:
                input.propertyId.trim(),
            }),
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
              "Unable to add property interest.",
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
          "Property interest service unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}
