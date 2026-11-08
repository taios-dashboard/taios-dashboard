function normalizeBaseUrl(value: string) {
  const trimmed =
    value.trim().replace(/\/+$/, "");

  const parsed =
    new URL(trimmed);

  if (
    parsed.protocol !== "http:" &&
    parsed.protocol !== "https:"
  ) {
    throw new Error(
      "TAIOS backend URL must use http or https.",
    );
  }

  return trimmed;
}

export function getBackendApiUrl() {
  const configured =
    process.env.TAIOS_API_URL ??
    process.env.NEXT_PUBLIC_API_URL;

  if (configured) {
    return normalizeBaseUrl(
      configured,
    );
  }

  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    return "http://localhost:8000";
  }

  throw new Error(
    "TAIOS_API_URL is required in production.",
  );
}

export async function parseBackendJson(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  if (
    !contentType
      .toLowerCase()
      .includes(
        "application/json",
      )
  ) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function getBackendErrorMessage(
  payload: unknown,
  fallback: string,
) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message ===
      "string" &&
    payload.message.trim()
  ) {
    return payload.message;
  }

  return fallback;
}
