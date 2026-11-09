"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type PropertyStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD"
  | "RENTED"
  | "INACTIVE";

type PropertySort =
  | "newest"
  | "oldest"
  | "recently_updated"
  | "price_asc"
  | "price_desc"
  | "title_asc";

type FeaturedFilter =
  | ""
  | "true"
  | "false";

type Property = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  location: string;
  price: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: PropertyStatus;
  isFeatured: boolean;
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

type PropertiesResponse = {
  success: boolean;
  message?: string;
  data?: Property[];
  pagination?: Pagination;
};

const statusOptions: Array<{
  value: PropertyStatus | "";
  label: string;
}> = [
  {
    value: "",
    label: "All statuses",
  },
  {
    value: "AVAILABLE",
    label: "Available",
  },
  {
    value: "RESERVED",
    label: "Reserved",
  },
  {
    value: "SOLD",
    label: "Sold",
  },
  {
    value: "RENTED",
    label: "Rented",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
  },
];

const sortOptions: Array<{
  value: PropertySort;
  label: string;
}> = [
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "recently_updated",
    label: "Recently updated",
  },
  {
    value: "price_asc",
    label: "Price: low to high",
  },
  {
    value: "price_desc",
    label: "Price: high to low",
  },
  {
    value: "title_asc",
    label: "Title: A–Z",
  },
  {
    value: "oldest",
    label: "Oldest",
  },
];

function formatStatus(
  status: PropertyStatus,
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
  status: PropertyStatus,
) {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-100 text-green-700";

    case "RESERVED":
      return "bg-yellow-100 text-yellow-700";

    case "SOLD":
      return "bg-blue-100 text-blue-700";

    case "RENTED":
      return "bg-purple-100 text-purple-700";

    case "INACTIVE":
    default:
      return "bg-gray-200 text-gray-700";
  }
}

function formatPrice(
  price: string | null,
) {
  if (price === null) {
    return "Price not provided";
  }

  const amount =
    Number(price);

  if (!Number.isFinite(amount)) {
    return price;
  }

  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    },
  ).format(amount);
}

function roomLabel(
  value: number | null,
  singular: string,
) {
  if (value === null) {
    return "Not specified";
  }

  return `${value} ${
    value === 1
      ? singular
      : `${singular}s`
  }`;
}

export default function LiveProperties() {
  const router = useRouter();

  const [
    properties,
    setProperties,
  ] =
    useState<Property[]>([]);

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
    useState<PropertyStatus | "">(
      "",
    );

  const [
    featured,
    setFeatured,
  ] =
    useState<FeaturedFilter>("");

  const [
    sort,
    setSort,
  ] =
    useState<PropertySort>(
      "newest",
    );

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

    async function loadProperties() {
      try {
        const params =
          new URLSearchParams({
            page:
              String(page),
            limit: "25",
            sort,
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

        if (featured) {
          params.set(
            "isFeatured",
            featured,
          );
        }

        const response =
          await fetch(
            `/api/properties?${params.toString()}`,
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        let payload:
          | PropertiesResponse
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
            "/login?next=/properties",
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
            ?? "Unable to load properties.",
          );
        }

        setProperties(
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
            : "Unable to load properties.",
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setIsLoading(false);
        }
      }
    }

    void loadProperties();

    return () => {
      controller.abort();
    };
  }, [
    featured,
    page,
    requestVersion,
    router,
    search,
    sort,
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
    value: PropertyStatus | "",
  ) {
    setError("");
    setIsLoading(true);
    setPage(1);
    setStatus(value);
  }

  function handleFeaturedChange(
    value: FeaturedFilter,
  ) {
    setError("");
    setIsLoading(true);
    setPage(1);
    setFeatured(value);
  }

  function handleSortChange(
    value: PropertySort,
  ) {
    setError("");
    setIsLoading(true);
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
    ?? properties.length;

  return (
    <section>
      <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-950">
              Property Catalogue
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Live inventory from the TAIOS property catalogue.
            </p>
          </div>

          <div className="w-fit rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
            {isLoading
              ? "Loading..."
              : `${total} ${
                  total === 1
                    ? "property"
                    : "properties"
                }`}
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="grid gap-3 lg:grid-cols-[1fr_180px_170px_190px_auto]"
        >
          <div>
            <label
              htmlFor="property-search"
              className="sr-only"
            >
              Search properties
            </label>

            <input
              id="property-search"
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
              maxLength={200}
              placeholder="Search title, description, location or type"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="property-status"
              className="sr-only"
            >
              Property status
            </label>

            <select
              id="property-status"
              value={status}
              onChange={(event) =>
                handleStatusChange(
                  event.target.value as PropertyStatus | "",
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
              htmlFor="property-featured"
              className="sr-only"
            >
              Featured filter
            </label>

            <select
              id="property-featured"
              value={featured}
              onChange={(event) =>
                handleFeaturedChange(
                  event.target.value as FeaturedFilter,
                )
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500"
            >
              <option value="">
                All properties
              </option>

              <option value="true">
                Featured only
              </option>

              <option value="false">
                Not featured
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="property-sort"
              className="sr-only"
            >
              Sort properties
            </label>

            <select
              id="property-sort"
              value={sort}
              onChange={(event) =>
                handleSortChange(
                  event.target.value as PropertySort,
                )
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500"
            >
              {sortOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
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
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-700">
            Unable to load properties
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : null}

      {isLoading
        && properties.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-semibold text-gray-700">
            Loading property catalogue...
          </p>
        </div>
      ) : null}

      {!isLoading
        && !error
        && properties.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-semibold text-gray-800">
            No properties found
          </p>

          <p className="mt-2 text-sm text-gray-500">
            No property records match the current catalogue filters.
          </p>
        </div>
      ) : null}

      {properties.length > 0 ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {properties.map(
              (property) => (
                <article
                  key={property.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                            property.status,
                          )}`}
                        >
                          {formatStatus(
                            property.status,
                          )}
                        </span>

                        {property.isFeatured ? (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                            Featured
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-4 text-lg font-bold text-gray-950">
                        {property.title}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {property.location}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Price
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-950">
                      {formatPrice(
                        property.price,
                      )}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-gray-100 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Type
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-800">
                        {property.type}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Rooms
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-800">
                        {roomLabel(
                          property.bedrooms,
                          "bed",
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {roomLabel(
                          property.bathrooms,
                          "bath",
                        )}
                      </p>
                    </div>
                  </div>

                  {property.description ? (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                      {property.description}
                    </p>
                  ) : null}
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
