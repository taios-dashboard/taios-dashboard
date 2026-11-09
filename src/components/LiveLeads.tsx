"use client";

import Link from "next/link";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

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

type LeadUser = {
  id: string;
  fullName: string;
  role: string;
  isActive?: boolean;
};

type Lead = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  interest: string | null;
  budget: string | null;
  location: string | null;
  notes: string | null;
  status: LeadStatus;
  temperature: LeadTemperature;
  aiScore: number | null;
  closedAt: string | null;
  lossReason: string | null;
  createdById: string | null;
  createdBy: LeadUser | null;
  assignedToId: string | null;
  assignedTo: LeadUser | null;
  assignedAt: string | null;
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

type LeadsResponse = {
  success: boolean;
  message?: string;
  data?: Lead[];
  pagination?: Pagination;
};

const statusOptions: Array<{
  value: LeadStatus | "";
  label: string;
}> = [
  {
    value: "",
    label: "All pipeline stages",
  },
  {
    value: "NEW",
    label: "New",
  },
  {
    value: "CONTACTED",
    label: "Contacted",
  },
  {
    value: "QUALIFIED",
    label: "Qualified",
  },
  {
    value: "INSPECTION_BOOKED",
    label: "Inspection Booked",
  },
  {
    value: "WON",
    label: "Won",
  },
  {
    value: "LOST",
    label: "Lost",
  },
];

function formatStatus(
  status: LeadStatus,
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
  status: LeadStatus,
) {
  switch (status) {
    case "WON":
      return "bg-green-100 text-green-700";

    case "LOST":
      return "bg-gray-200 text-gray-700";

    case "INSPECTION_BOOKED":
      return "bg-purple-100 text-purple-700";

    case "QUALIFIED":
      return "bg-blue-100 text-blue-700";

    case "CONTACTED":
      return "bg-yellow-100 text-yellow-700";

    case "NEW":
    default:
      return "bg-red-100 text-red-700";
  }
}

function temperatureClass(
  temperature: LeadTemperature,
) {
  switch (temperature) {
    case "HOT":
      return "bg-red-100 text-red-700";

    case "WARM":
      return "bg-yellow-100 text-yellow-700";

    case "COLD":
    default:
      return "bg-blue-100 text-blue-700";
  }
}

function displayValue(
  value: string | null,
) {
  return value?.trim()
    ? value
    : "Not provided";
}

export default function LiveLeads() {
  const router = useRouter();

  const [leads, setLeads] =
    useState<Lead[]>([]);

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
    searchInput,
    setSearchInput,
  ] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState<LeadStatus | "">("");

  const [
    requestVersion,
    setRequestVersion,
  ] =
    useState(0);

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

    async function loadLeads() {
      try {
        const params =
          new URLSearchParams({
            page:
              String(page),
            limit: "25",
            sort: "newest",
          });

        if (search) {
          params.set(
            "search",
            search,
          );
        }

        if (status) {
          params.set(
            "status",
            status,
          );
        }

        const response =
          await fetch(
            `/api/leads?${params.toString()}`,
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        let payload:
          | LeadsResponse
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
            "/login?next=/leads",
          );

          return;
        }

        if (
          !response.ok ||
          !payload?.success ||
          !Array.isArray(
            payload.data,
          )
        ) {
          throw new Error(
            payload?.message ??
              "Unable to load leads.",
          );
        }

        setLeads(
          payload.data,
        );

        setPagination(
          payload.pagination ??
            null,
        );

        setError("");
      } catch (loadError) {
        if (
          loadError instanceof
            DOMException &&
          loadError.name ===
            "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load leads.",
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setIsLoading(false);
        }
      }
    }

    void loadLeads();

    return () => {
      controller.abort();
    };
  }, [
    page,
    requestVersion,
    router,
    search,
    status,
  ]);

  function handleSearch(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setIsLoading(true);
    setPage(1);
    setSearch(
      searchInput.trim(),
    );
    setRequestVersion(
      (value) => value + 1,
    );
  }

  function handleStatusChange(
    value: LeadStatus | "",
  ) {
    setError("");
    setIsLoading(true);
    setPage(1);
    setStatus(value);
  }

  function goToPreviousPage() {
    if (
      !pagination
      || !pagination.hasPreviousPage
    ) {
      return;
    }

    setError("");
    setIsLoading(true);
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
    setIsLoading(true);
    setPage(
      pagination.page + 1,
    );
  }

  const total =
    pagination?.total
    ?? leads.length;

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h2 className="text-xl font-bold text-gray-950">
            CRM Leads
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Live prospects from the TAIOS CRM pipeline.
          </p>
        </div>

        <div className="w-fit rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
          {isLoading
            ? "Loading..."
            : `${total} ${total === 1 ? "lead" : "leads"}`}
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="mb-6 grid gap-3 md:grid-cols-[1fr_220px_auto]"
      >
        <div>
          <label
            htmlFor="lead-search"
            className="sr-only"
          >
            Search leads
          </label>

          <input
            id="lead-search"
            type="search"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value,
              )
            }
            maxLength={120}
            placeholder="Search name, email, phone, location, interest or source"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500"
          />
        </div>

        <div>
          <label
            htmlFor="lead-status"
            className="sr-only"
          >
            Pipeline status
          </label>

          <select
            id="lead-status"
            value={status}
            onChange={(event) =>
              handleStatusChange(
                event.target.value as LeadStatus | "",
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

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
        >
          Search
        </button>
      </form>

      {error ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-700">
            Unable to load leads
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : null}

      {isLoading
        && leads.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 px-5 py-12 text-center">
          <p className="font-semibold text-gray-700">
            Loading CRM leads...
          </p>
        </div>
      ) : null}

      {!isLoading
        && !error
        && leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-12 text-center">
          <p className="font-semibold text-gray-800">
            No leads found
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Try changing the search or pipeline filter.
          </p>
        </div>
      ) : null}

      {leads.length > 0 ? (
        <>
          <div className="space-y-4 md:hidden">
            {leads.map(
              (lead) => (
                <article
                  key={lead.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-950">
                        <Link
                            href={`/leads/${lead.id}`}
                            className="font-bold text-gray-950 transition hover:text-red-600 hover:underline"
                          >
                            {lead.fullName}
                          </Link>
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {displayValue(
                          lead.interest,
                        )}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        lead.status,
                      )}`}
                    >
                      {formatStatus(
                        lead.status,
                      )}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Budget
                      </p>
                      <p className="mt-1 font-bold text-gray-950">
                        {displayValue(
                          lead.budget,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Location
                      </p>
                      <p className="mt-1 font-bold text-gray-950">
                        {displayValue(
                          lead.location,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Temperature
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${temperatureClass(
                          lead.temperature,
                        )}`}
                      >
                        {lead.temperature}
                      </span>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Assigned To
                      </p>

                      <p className="mt-1 font-bold text-gray-950">
                        {lead.assignedTo
                          ?.fullName
                          ?? "Unassigned"}
                      </p>
                    </div>

                    <div className="col-span-2 rounded-xl bg-white p-3">
                      <div className="mb-2 flex justify-between text-xs font-semibold text-gray-500">
                        <span>
                          AI Lead Score
                        </span>

                        <span>
                          {lead.aiScore
                            === null
                            ? "Not scored"
                            : `${lead.aiScore}%`}
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-red-600"
                          style={{
                            width:
                              `${Math.max(
                                0,
                                Math.min(
                                  100,
                                  lead.aiScore
                                  ?? 0,
                                ),
                              )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 md:block">
            <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-4">
                    Name
                  </th>
                  <th className="px-4 py-4">
                    Interest
                  </th>
                  <th className="px-4 py-4">
                    Budget
                  </th>
                  <th className="px-4 py-4">
                    Location
                  </th>
                  <th className="px-4 py-4">
                    Pipeline
                  </th>
                  <th className="px-4 py-4">
                    Temperature
                  </th>
                  <th className="px-4 py-4">
                    Assigned
                  </th>
                  <th className="px-4 py-4">
                    AI Score
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {leads.map(
                  (lead) => (
                    <tr
                      key={lead.id}
                      className="bg-white"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-950">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-bold text-gray-950 transition hover:text-red-600 hover:underline"
                          >
                            {lead.fullName}
                          </Link>
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {lead.email
                            ?? lead.phone
                            ?? "No contact supplied"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {displayValue(
                          lead.interest,
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {displayValue(
                          lead.budget,
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {displayValue(
                          lead.location,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                            lead.status,
                          )}`}
                        >
                          {formatStatus(
                            lead.status,
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${temperatureClass(
                            lead.temperature,
                          )}`}
                        >
                          {lead.temperature}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {lead.assignedTo
                          ?.fullName
                          ?? "Unassigned"}
                      </td>

                      <td className="px-4 py-4 font-bold text-gray-950">
                        {lead.aiScore
                          === null
                          ? "—"
                          : `${lead.aiScore}%`}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {pagination ? (
            <div className="mt-6 flex flex-col justify-between gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center">
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
