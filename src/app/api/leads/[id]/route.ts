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

const allowedLeadPatchFields =
  new Set([
    "fullName",
    "email",
    "phone",
    "source",
    "interest",
    "budget",
    "location",
    "notes",
    "temperature",
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
          "A valid lead update object is required.",
      },
      {
        status: 400,
      },
    );
  }

  const keys =
    Object.keys(body);

  if (keys.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message:
          "At least one lead field must be provided.",
      },
      {
        status: 400,
      },
    );
  }

  const unsupportedFields =
    keys.filter(
      (key) =>
        !allowedLeadPatchFields.has(
          key,
        ),
    );

  if (
    unsupportedFields.length > 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "One or more lead fields cannot be changed from this workspace.",
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
            JSON.stringify(
              body,
            ),
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
              "Unable to update lead.",
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
          "Lead update service unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}
