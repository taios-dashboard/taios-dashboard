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
  "search",
  "status",
  "location",
  "type",
  "minPrice",
  "maxPrice",
  "bedrooms",
  "bathrooms",
  "isFeatured",
  "page",
  "limit",
  "sort",
] as const;

const allowedCreateFields =
  new Set([
    "title",
    "description",
    "type",
    "location",
    "price",
    "bedrooms",
    "bathrooms",
    "status",
    "isFeatured",
  ]);

const allowedStatuses =
  new Set([
    "AVAILABLE",
    "RESERVED",
    "SOLD",
    "RENTED",
    "INACTIVE",
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
        `${getBackendApiUrl()}/api/properties`,
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
              "Unable to retrieve properties.",
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
          "Property service unavailable.",
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
          "Unsupported property field.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof input.title !== "string"
    || input.title.trim().length < 2
    || typeof input.type !== "string"
    || input.type.trim().length < 2
    || typeof input.location !== "string"
    || input.location.trim().length < 2
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Title, property type and location are required.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    input.description !== undefined
    && input.description !== null
    && typeof input.description
      !== "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Description must be text or null.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    input.price !== undefined
    && input.price !== null
    && typeof input.price
      !== "string"
    && typeof input.price
      !== "number"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Price must be a valid amount or null.",
      },
      {
        status: 400,
      },
    );
  }

  for (
    const field
    of [
      "bedrooms",
      "bathrooms",
    ] as const
  ) {
    const value =
      input[field];

    if (
      value !== undefined
      && value !== null
      && (
        typeof value !== "number"
        || !Number.isInteger(value)
        || value < 0
        || value > 100
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `${field} must be a whole number between 0 and 100 or null.`,
        },
        {
          status: 400,
        },
      );
    }
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
          "Invalid property status.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    input.isFeatured
      !== undefined
    && typeof input.isFeatured
      !== "boolean"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Featured status must be true or false.",
      },
      {
        status: 400,
      },
    );
  }

  const body:
    Record<string, unknown> = {
      title:
        input.title.trim(),
      type:
        input.type.trim(),
      location:
        input.location.trim(),
  };

  if (
    input.description !== undefined
  ) {
    body.description =
      input.description === null
        ? null
        : input.description.trim();
  }

  if (
    input.price !== undefined
  ) {
    body.price =
      input.price;
  }

  if (
    input.bedrooms !== undefined
  ) {
    body.bedrooms =
      input.bedrooms;
  }

  if (
    input.bathrooms !== undefined
  ) {
    body.bathrooms =
      input.bathrooms;
  }

  if (
    input.status !== undefined
  ) {
    body.status =
      input.status;
  }

  if (
    input.isFeatured !== undefined
  ) {
    body.isFeatured =
      input.isFeatured;
  }

  try {
    const response =
      await fetch(
        `${getBackendApiUrl()}/api/properties`,
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
              "Unable to create property.",
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
        status:
          response.status,
      },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Property service unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}
