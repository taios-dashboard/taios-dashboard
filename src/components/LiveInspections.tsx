"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type InspectionStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

type InspectionSort =
  | "scheduled_asc"
  | "scheduled_desc"
  | "newest"
  | "oldest";

type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "INSPECTION_BOOKED"
  | "WON"
  | "LOST";

type LeadTemperature =
  | "HOT"
  | "WARM"
  | "COLD";

type PropertyStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD"
  | "RENTED"
  | "INACTIVE";

type InspectionLead = {
  id: string;
  fullName: string;
  status: LeadStatus;
  temperature: LeadTemperature;
};

type InspectionProperty = {
  id: string;
  title: string;
  type: string;
  location: string;
  status: PropertyStatus;
  isFeatured: boolean;
};

type Inspection = {
  id: string;
  leadId: string;
  propertyId: string | null;
  scheduledAt: string;
  status: InspectionStatus;
  notes: string | null;
  lead: InspectionLead;
  property:
    | InspectionProperty
    | null;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type InspectionsResponse = {
  success: boolean;
  message?: string;
  data?: Inspection[];
  pagination?: Pagination;
};

const statusOptions: Array<{
  value: InspectionStatus | "";
  label: string;
}> = [
  {
    value: "",
    label: "All statuses",
  },
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "CONFIRMED",
    label: "Confirmed",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

const sortOptions: Array<{
  value: InspectionSort;
  label: string;
}> = [
  {
    value: "scheduled_asc",
    label: "Scheduled: earliest first",
  },
  {
    value: "scheduled_desc",
    label: "Scheduled: latest first",
  },
  {
    value: "newest",
    label: "Recently created",
  },
  {
    value: "oldest",
    label: "Oldest created",
  },
];

function formatStatus(
  status: InspectionStatus,
) {
  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase()
        + word.slice(1),
    )
    .join(" ");
}

function statusClass(
  status: InspectionStatus,
) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";

    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "CANCELLED":
    default:
      return "bg-gray-200 text-gray-700";
  }
}

function temperatureClass(
  temperature: LeadTemperature,
) {
  switch (temperature) {
    case "HOT":
      return "bg-red-50 text-red-700";

    case "WARM":
      return "bg-yellow-50 text-yellow-700";

    case "COLD":
    default:
      return "bg-blue-50 text-blue-700";
  }
}

function formatScheduledAt(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}

export default function LiveInspections() {
  const router = useRouter();

  const [
    inspections,
    setInspections,
  ] =
    useState<Inspection[]>([]);

  const [
    pagination,
    setPagination,
  ] =
    useState<Pagination | null>(
      null,
    );

  const [page, setPage] =
    useState(1);

  const [
    status,
    setStatus,
  ] =
    useState<
      InspectionStatus | ""
    >("");

  const [
    sort,
    setSort,
  ] =
    useState<InspectionSort>(
      "scheduled_asc",
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadInspections() {
      setIsLoading(true);

      try {
        const params =
          new URLSearchParams({
            page:
              String(page),
            limit: "25",
            sort,
          });

        if (status) {
          params.set(
            "status",
            status,
          );
        }

        const response =
          await fetch(
            `/api/inspections?${params.toString()}`,
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        let payload:
          | InspectionsResponse
          | null = null;

        try {
          payload =
            await response.json();
        } catch {
          payload = null;
        }

        if (
          response.status === 401
        ) {
          router.replace(
            "/login?next=/inspections",
          );

          return;
        }

        if (
          !response.ok
          || !payload?.success
          || !Array.isArray(
            payload.data,
          )
        ) {
          throw new Error(
            payload?.message
            ?? "Unable to load inspections.",
          );
        }

        setInspections(
          payload.data,
        );

        setPagination(
          payload.pagination
          ?? null,
        );

        setError("");
      } catch (loadError) {
        if (
          loadError instanceof
            DOMException
          && loadError.name
            === "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load inspections.",
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setIsLoading(false);
        }
      }
    }

    void loadInspections();

    return () => {
      controller.abort();
    };
  }, [
    page,
    router,
    sort,
    status,
  ]);

  function handleStatusChange(
    value:
      InspectionStatus | "",
  ) {
    setError("");
    setPage(1);
    setStatus(value);
  }

  function handleSortChange(
    value: InspectionSort,
  ) {
    setError("");
    setPage(1);
    setSort(value);
  }

  function goToPreviousPage() {
    if (
      !pagination
      || !pagination.hasPreviousPage
    ) {
      return;
    }

    setError("");

    setPage(
      pagination.page - 1,
    );
  }

  function goToNextPage() {
    if (
      !pagination
      || !pagination.hasNextPage
    ) {
      return;
    }

    setError("");

    setPage(
      pagination.page + 1,
    );
  }

  const total =
    pagination?.total
    ?? inspections.length;

  return (
    <section>
      <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-xl font-bold text-gray-950">
              Inspection Schedule
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Live inspection appointments from the TAIOS CRM.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[480px]">
            <div>
              <label
                htmlFor="inspection-status"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Status
              </label>

              <select
                id="inspection-status"
                value={status}
                onChange={(event) =>
                  handleStatusChange(
                    event.target.value as InspectionStatus | "",
                  )
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500"
              >
                {statusOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
                        || "ALL"
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="inspection-sort"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Sort
              </label>

              <select
                id="inspection-sort"
                value={sort}
                onChange={(event) =>
                  handleSortChange(
                    event.target.value as InspectionSort,
                  )
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500"
              >
                {sortOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-5 w-fit rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
          {isLoading
            ? "Loading..."
            : `${total} ${
                total === 1
                  ? "inspection"
                  : "inspections"
              }`}
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-700">
            Unable to load inspections
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : null}

      {isLoading
        && inspections.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-semibold text-gray-700">
            Loading inspection schedule...
          </p>
        </div>
      ) : null}

      {!isLoading
        && !error
        && inspections.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-semibold text-gray-800">
            No inspections found
          </p>

          <p className="mt-2 text-sm text-gray-500">
            There are no inspection appointments matching the current filter.
          </p>
        </div>
      ) : null}

      {inspections.length > 0 ? (
        <>
          <div className="space-y-4">
            {inspections.map(
              (inspection) => (
                <article
                  key={inspection.id}
                  className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                            inspection.status,
                          )}`}
                        >
                          {formatStatus(
                            inspection.status,
                          )}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${temperatureClass(
                            inspection.lead.temperature,
                          )}`}
                        >
                          {
                            inspection
                              .lead
                              .temperature
                          }{" "}
                          lead
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-gray-950">
                        {
                          inspection
                            .lead
                            .fullName
                        }
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Lead stage:{" "}
                        <span className="font-semibold text-gray-700">
                          {inspection.lead.status
                            .toLowerCase()
                            .replaceAll(
                              "_",
                              " ",
                            )}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 px-5 py-4 lg:min-w-[230px]">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Scheduled
                      </p>

                      <p className="mt-2 font-bold text-gray-950">
                        {formatScheduledAt(
                          inspection.scheduledAt,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Property
                      </p>

                      {inspection.property ? (
                        <>
                          <p className="mt-2 font-bold text-gray-900">
                            {
                              inspection
                                .property
                                .title
                            }
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {
                              inspection
                                .property
                                .type
                            }{" "}
                            •{" "}
                            {
                              inspection
                                .property
                                .location
                            }
                          </p>

                          {inspection
                            .property
                            .isFeatured ? (
                            <p className="mt-2 text-xs font-bold text-red-600">
                              Featured property
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <p className="mt-2 text-sm font-medium text-gray-500">
                          No property attached
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Notes
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {inspection.notes
                          ?? "No inspection notes provided."}
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>

          {pagination ? (
            <div className="mt-6 flex flex-col justify-between gap-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
              <p className="text-sm text-gray-500">
                Page{" "}
                <span className="font-semibold text-gray-800">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {Math.max(
                    pagination.totalPages,
                    1,
                  )}
                </span>
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={
                    goToPreviousPage
                  }
                  disabled={
                    isLoading
                    || !pagination
                      .hasPreviousPage
                  }
                  className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={
                    goToNextPage
                  }
                  disabled={
                    isLoading
                    || !pagination
                      .hasNextPage
                  }
                  className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
