import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TAIOS_SESSION_COOKIE } from "@/lib/auth/session";
import {
  getBackendApiUrl,
  getBackendErrorMessage,
  parseBackendJson,
} from "@/lib/server/backend";

type BackendLoginUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type BackendLoginData = {
  user: BackendLoginUser;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
};

type BackendLoginResponse = {
  success: true;
  message: string;
  data: BackendLoginData;
};

function isBackendLoginResponse(
  value: unknown,
): value is BackendLoginResponse {
  if (
    !value ||
    typeof value !== "object" ||
    !("success" in value) ||
    value.success !== true ||
    !("data" in value) ||
    !value.data ||
    typeof value.data !== "object"
  ) {
    return false;
  }

  const data =
    value.data as Record<
      string,
      unknown
    >;

  return (
    typeof data.accessToken ===
      "string" &&
    data.accessToken.length > 0 &&
    data.tokenType === "Bearer" &&
    typeof data.expiresIn ===
      "string" &&
    !!data.user &&
    typeof data.user === "object"
  );
}

export async function POST(
  request: Request,
) {
  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid request data.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("email" in body) ||
    !("password" in body) ||
    typeof body.email !==
      "string" ||
    typeof body.password !==
      "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Email and password are required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const backendResponse =
      await fetch(
        `${getBackendApiUrl()}/api/auth/login`,
        {
          method: "POST",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify({
              email:
                body.email,
              password:
                body.password,
            }),
          cache: "no-store",
        },
      );

    const payload =
      await parseBackendJson(
        backendResponse,
      );

    if (
      !backendResponse.ok
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            getBackendErrorMessage(
              payload,
              "Unable to sign in.",
            ),
        },
        {
          status:
            backendResponse.status,
        },
      );
    }

    if (
      !isBackendLoginResponse(
        payload,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication service returned an invalid response.",
        },
        {
          status: 502,
        },
      );
    }

    const cookieStore =
      await cookies();

    cookieStore.set({
      name:
        TAIOS_SESSION_COOKIE,
      value:
        payload.data.accessToken,
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Login successful.",
        data: {
          user:
            payload.data.user,
          expiresIn:
            payload.data.expiresIn,
        },
      },
      {
        status: 200,
      },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Authentication service is unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}
