"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type ActivityType =
  | "CREATED"
  | "UPDATED"
  | "ASSIGNMENT_CHANGED"
  | "FOLLOW_UP_CREATED"
  | "FOLLOW_UP_UPDATED"
  | "PROPERTY_INTEREST_ADDED"
  | "PROPERTY_INTEREST_REMOVED"
  | "INSPECTION_CREATED"
  | "INSPECTION_UPDATED"
  | "PIPELINE_STATUS_CHANGED";

type ActivityActor = {
  id: string;
  fullName: string;
  role: string;
};

type Activity = {
  id: string;
  type: ActivityType;
  summary: string;
  actor: ActivityActor | null;
  details:
    | Record<string, unknown>
    | null;
  occurredAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type ActivityResponse = {
  success?: boolean;
  message?: string;
  data?: Activity[];
  pagination?: Pagination;
};

type LeadActivityTimelineProps = {
  leadId: string;
};

const PAGE_SIZE = 10;

function formatLabel(
  value: string,
) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase()
        + part.slice(1),
    )
    .join(" ");
}

function formatDateTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function activityBadgeClass(
  type: ActivityType,
) {
  switch (type) {
    case "CREATED":
      return "bg-green-50 text-green-700";
    case "UPDATED":
      return "bg-blue-50 text-blue-700";
    case "ASSIGNMENT_CHANGED":
      return "bg-violet-50 text-violet-700";
    case "FOLLOW_UP_CREATED":
    case "FOLLOW_UP_UPDATED":
      return "bg-amber-50 text-amber-700";
    case "PROPERTY_INTEREST_ADDED":
    case "PROPERTY_INTEREST_REMOVED":
      return "bg-cyan-50 text-cyan-700";
    case "INSPECTION_CREATED":
    case "INSPECTION_UPDATED":
      return "bg-orange-50 text-orange-700";
    case "PIPELINE_STATUS_CHANGED":
      return "bg-red-50 text-red-700";
  }
}

function formatDetailKey(
  key: string,
) {
  return key
    .replace(
      /([A-Z])/g,
      " $1",
    )
    .trim()
    .replace(
      /^./,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatDetailValue(
  key: string,
  value: unknown,
): string | null {
  if (
    value === null
    || value === undefined
  ) {
    return null;
  }

  if (
    Array.isArray(value)
  ) {
    const values =
      value
        .filter(
          (
            item,
          ): item is string =>
            typeof item === "string",
        )
        .map(formatLabel);

    return values.length > 0
      ? values.join(", ")
      : null;
  }

  if (
    typeof value === "string"
  ) {
    if (
      key.endsWith("At")
      || key === "scheduledAt"
      || key === "completedAt"
      || key === "closedAt"
    ) {
      const date =
        new Date(value);

      if (
        !Number.isNaN(
          date.getTime(),
        )
      ) {
        return formatDateTime(
          value,
        );
      }
    }

    if (
      key === "status"
      || key === "previousStatus"
      || key === "temperature"
      || key === "previousTemperature"
      || key === "trigger"
    ) {
      return formatLabel(
        value,
      );
    }

    return value;
  }

  if (
    typeof value === "number"
    || typeof value === "boolean"
  ) {
    return String(value);
  }

  return null;
}

function getVisibleDetails(
  details:
    | Record<string, unknown>
    | null,
) {
  if (!details) {
    return [];
  }

  return Object.entries(
    details,
  )
    .filter(
      ([key]) =>
        !key.endsWith("Id"),
    )
    .map(
      ([key, value]) => ({
        key,
        label:
          formatDetailKey(key),
        value:
          formatDetailValue(
            key,
            value,
          ),
      }),
    )
    .filter(
      (
        item,
      ): item is {
        key: string;
        label: string;
        value: string;
      } =>
        item.value !== null,
    );
}

export default function LeadActivityTimeline({
  leadId,
}: LeadActivityTimelineProps) {
  const router =
    useRouter();

  const [
    page,
    setPage,
  ] =
    useState(1);

  const [
    activities,
    setActivities,
  ] =
    useState<Activity[]>([]);

  const [
    pagination,
    setPagination,
  ] =
    useState<Pagination | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(
    () => {
      const controller =
        new AbortController();

      async function loadActivity() {
        setIsLoading(true);
        setError("");

        try {
          const response =
            await fetch(
              `/api/leads/${encodeURIComponent(leadId)}/activity?page=${page}&limit=${PAGE_SIZE}`,
              {
                cache:
                  "no-store",
                signal:
                  controller.signal,
              },
            );

          if (
            response.status
            === 401
          ) {
            router.replace(
              `/login?next=/leads/${encodeURIComponent(leadId)}`,
            );

            return;
          }

          let payload:
            | ActivityResponse
            | null = null;

          try {
            payload =
              await response.json();
          } catch {
            payload = null;
          }

          if (
            !response.ok
            || !payload?.success
            || !Array.isArray(
              payload.data,
            )
            || !payload.pagination
          ) {
            throw new Error(
              payload?.message
              ?? "Unable to retrieve lead activity.",
            );
          }

          setActivities(
            payload.data,
          );

          setPagination(
            payload.pagination,
          );
        } catch (
          loadError
        ) {
          if (
            loadError
              instanceof DOMException
            && loadError.name
              === "AbortError"
          ) {
            return;
          }

          setError(
            loadError
              instanceof Error
              ? loadError.message
              : "Unable to retrieve lead activity.",
          );
        } finally {
          setIsLoading(false);
        }
      }

      void loadActivity();

      return () => {
        controller.abort();
      };
    },
    [
      leadId,
      page,
      router,
    ],
  );

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h3 className="text-lg font-bold text-gray-950">
            Activity timeline
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Newest-first history of recorded CRM activity for this lead.
          </p>
        </div>

        {pagination ? (
          <p className="text-sm font-semibold text-gray-500">
            {pagination.total}{" "}
            {pagination.total === 1
              ? "activity"
              : "activities"}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-4">
          {Array.from(
            {
              length: 3,
            },
          ).map(
            (
              _,
              index,
            ) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-gray-100 p-5"
              >
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="mt-3 h-5 w-64 max-w-full rounded bg-gray-100" />
                <div className="mt-3 h-4 w-44 rounded bg-gray-100" />
              </div>
            ),
          )}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-bold text-red-700">
            Activity could not be loaded
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : null}

      {!isLoading
      && !error
      && activities.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <p className="font-bold text-gray-900">
            No CRM activity recorded yet.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Recorded lead actions will appear here as the CRM workflow progresses.
          </p>
        </div>
      ) : null}

      {!isLoading
      && !error
      && activities.length > 0 ? (
        <ol className="mt-6 space-y-4">
          {activities.map(
            (activity) => {
              const details =
                getVisibleDetails(
                  activity.details,
                );

              return (
                <li
                  key={activity.id}
                  className="rounded-2xl border border-gray-100 p-5"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${activityBadgeClass(
                          activity.type,
                        )}`}
                      >
                        {formatLabel(
                          activity.type,
                        )}
                      </span>

                      <p className="mt-3 font-bold text-gray-950">
                        {activity.summary}
                      </p>
                    </div>

                    <time
                      dateTime={
                        activity.occurredAt
                      }
                      className="shrink-0 text-xs font-semibold text-gray-400"
                    >
                      {formatDateTime(
                        activity.occurredAt,
                      )}
                    </time>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {activity.actor
                      ? `By ${activity.actor.fullName} · ${formatLabel(
                          activity.actor.role,
                        )}`
                      : "Recorded by the system"}
                  </p>

                  {details.length > 0 ? (
                    <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                      {details.map(
                        (detail) => (
                          <div
                            key={
                              detail.key
                            }
                            className="rounded-xl bg-gray-50 px-3 py-2"
                          >
                            <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">
                              {detail.label}
                            </dt>

                            <dd className="mt-1 break-words text-sm font-semibold text-gray-700">
                              {detail.value}
                            </dd>
                          </div>
                        ),
                      )}
                    </dl>
                  ) : null}
                </li>
              );
            },
          )}
        </ol>
      ) : null}

      {!isLoading
      && !error
      && pagination
      && pagination.totalPages > 1 ? (
        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center">
          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-bold text-gray-900">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-bold text-gray-900">
              {Math.max(
                pagination.totalPages,
                1,
              )}
            </span>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setPage(
                  (
                    current,
                  ) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                )
              }
              disabled={
                !pagination
                  .hasPreviousPage
              }
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setPage(
                  (
                    current,
                  ) =>
                    current + 1,
                )
              }
              disabled={
                !pagination
                  .hasNextPage
              }
              className="rounded-full bg-gray-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
