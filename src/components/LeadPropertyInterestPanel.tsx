"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type PropertyStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD"
  | "RENTED"
  | "INACTIVE";

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
};

type InterestCreator = {
  id: string;
  fullName: string;
  role: string;
};

type PropertyInterest = {
  id: string;
  leadId: string;
  propertyId: string;
  property: Property;
  createdById: string | null;
  createdBy: InterestCreator | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

type PropertiesResponse = {
  success: boolean;
  message?: string;
  data?: Property[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type LeadPropertyInterestPanelProps = {
  leadId: string;
};

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

function formatDate(
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

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function roomSummary(
  property: Property,
) {
  const parts: string[] = [];

  if (
    property.bedrooms !== null
  ) {
    parts.push(
      `${property.bedrooms} bed${
        property.bedrooms === 1
          ? ""
          : "s"
      }`,
    );
  }

  if (
    property.bathrooms !== null
  ) {
    parts.push(
      `${property.bathrooms} bath${
        property.bathrooms === 1
          ? ""
          : "s"
      }`,
    );
  }

  return parts.length > 0
    ? parts.join(" • ")
    : "Rooms not specified";
}

async function readJson<T>(
  response: Response,
): Promise<T | null> {
  try {
    return await response.json() as T;
  } catch {
    return null;
  }
}

export default function LeadPropertyInterestPanel({
  leadId,
}: LeadPropertyInterestPanelProps) {
  const router =
    useRouter();

  const [
    interests,
    setInterests,
  ] =
    useState<PropertyInterest[]>([]);

  const [
    properties,
    setProperties,
  ] =
    useState<Property[]>([]);

  const [
    canManage,
    setCanManage,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    propertyLoading,
    setPropertyLoading,
  ] =
    useState(false);

  const [
    queryInput,
    setQueryInput,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    searchVersion,
    setSearchVersion,
  ] =
    useState(0);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    mutationError,
    setMutationError,
  ] =
    useState("");

  const [
    pendingPropertyId,
    setPendingPropertyId,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadInterests() {
      try {
        const [
          interestsResponse,
          manageProbeResponse,
        ] =
          await Promise.all([
            fetch(
              `/api/leads/${encodeURIComponent(leadId)}/property-interests`,
              {
                method: "GET",
                cache: "no-store",
                signal:
                  controller.signal,
              },
            ),
            fetch(
              "/api/leads/assignees/eligible",
              {
                method: "GET",
                cache: "no-store",
                signal:
                  controller.signal,
              },
            ),
          ]);

        if (
          interestsResponse.status
            === 401
          || manageProbeResponse.status
            === 401
        ) {
          router.replace(
            `/login?next=/leads/${encodeURIComponent(leadId)}`,
          );

          return;
        }

        const interestsPayload =
          await readJson<
            ApiResponse<PropertyInterest[]>
          >(
            interestsResponse,
          );

        if (
          !interestsResponse.ok
          || !interestsPayload?.success
          || !Array.isArray(
            interestsPayload.data,
          )
        ) {
          throw new Error(
            interestsPayload?.message
            ?? "Unable to load property interests.",
          );
        }

        const manageAllowed =
          manageProbeResponse.status
            === 200;

        setInterests(
          interestsPayload.data,
        );

        setCanManage(
          manageAllowed,
        );

        if (manageAllowed) {
          setPropertyLoading(
            true,
          );
        }

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
            : "Unable to load property interests.",
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    void loadInterests();

    return () => {
      controller.abort();
    };
  }, [
    leadId,
    router,
  ]);

  useEffect(() => {
    if (!canManage) {
      return;
    }

    const controller =
      new AbortController();

    async function loadProperties() {
      try {
        const params =
          new URLSearchParams({
            page: "1",
            limit: "25",
            sort: "title_asc",
          });

        if (search) {
          params.set(
            "search",
            search,
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

        if (
          response.status === 401
        ) {
          router.replace(
            `/login?next=/leads/${encodeURIComponent(leadId)}`,
          );

          return;
        }

        const payload =
          await readJson<
            PropertiesResponse
          >(
            response,
          );

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

        setMutationError("");
      } catch (loadError) {
        if (
          loadError instanceof
            DOMException
          && loadError.name
            === "AbortError"
        ) {
          return;
        }

        setMutationError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load properties.",
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setPropertyLoading(
            false,
          );
        }
      }
    }

    void loadProperties();

    return () => {
      controller.abort();
    };
  }, [
    canManage,
    leadId,
    router,
    search,
    searchVersion,
  ]);

  const linkedPropertyIds =
    useMemo(
      () =>
        new Set(
          interests.map(
            (interest) =>
              interest.propertyId,
          ),
        ),
      [
        interests,
      ],
    );

  const availableProperties =
    useMemo(
      () =>
        properties.filter(
          (property) =>
            !linkedPropertyIds.has(
              property.id,
            ),
        ),
      [
        linkedPropertyIds,
        properties,
      ],
    );

  function handleSearch(
    event: FormEvent,
  ) {
    event.preventDefault();

    setPropertyLoading(
      true,
    );

    setSearch(
      queryInput.trim(),
    );

    setSearchVersion(
      (current) =>
        current + 1,
    );
  }

  async function handleAdd(
    propertyId: string,
  ) {
    setPendingPropertyId(
      propertyId,
    );

    setMutationError("");

    try {
      const response =
        await fetch(
          `/api/leads/${encodeURIComponent(leadId)}/property-interests`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                propertyId,
              }),
          },
        );

      if (
        response.status === 401
      ) {
        router.replace(
          `/login?next=/leads/${encodeURIComponent(leadId)}`,
        );

        return;
      }

      const payload =
        await readJson<
          ApiResponse<PropertyInterest>
        >(
          response,
        );

      if (
        !response.ok
        || !payload?.success
      ) {
        throw new Error(
          payload?.message
          ?? "Unable to add property interest.",
        );
      }

      window.location.reload();
    } catch (addError) {
      setMutationError(
        addError instanceof Error
          ? addError.message
          : "Unable to add property interest.",
      );
    } finally {
      setPendingPropertyId(
        null,
      );
    }
  }

  async function handleRemove(
    propertyId: string,
  ) {
    setPendingPropertyId(
      propertyId,
    );

    setMutationError("");

    try {
      const response =
        await fetch(
          `/api/leads/${encodeURIComponent(leadId)}/property-interests/${encodeURIComponent(propertyId)}`,
          {
            method: "DELETE",
          },
        );

      if (
        response.status === 401
      ) {
        router.replace(
          `/login?next=/leads/${encodeURIComponent(leadId)}`,
        );

        return;
      }

      const payload =
        await readJson<
          ApiResponse<PropertyInterest>
        >(
          response,
        );

      if (
        !response.ok
        || !payload?.success
      ) {
        throw new Error(
          payload?.message
          ?? "Unable to remove property interest.",
        );
      }

      window.location.reload();
    } catch (removeError) {
      setMutationError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove property interest.",
      );
    } finally {
      setPendingPropertyId(
        null,
      );
    }
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
            CRM Property Matching
          </p>

          <h2 className="mt-2 text-xl font-bold text-gray-950">
            Property Interests
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Track the properties this lead is considering and keep the relationship visible in the CRM activity history.
          </p>
        </div>

        {!loading ? (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
            {interests.length} linked
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
          Loading property interests...
        </div>
      ) : (
        <>
          {interests.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-6">
              <p className="font-semibold text-gray-900">
                No property interests linked yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Add a property below when this lead shows interest in a listing.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {interests.map(
                (interest) => {
                  const property =
                    interest.property;

                  const isPending =
                    pendingPropertyId
                      === property.id;

                  return (
                    <article
                      key={interest.id}
                      className="rounded-2xl border border-gray-200 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-950">
                            {property.title}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {property.type}
                            {" • "}
                            {property.location}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                            property.status,
                          )}`}
                        >
                          {formatStatus(
                            property.status,
                          )}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Price
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {formatPrice(
                              property.price,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Configuration
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {roomSummary(
                              property,
                            )}
                          </p>
                        </div>
                      </div>

                      {property.description ? (
                        <p className="mt-4 text-sm leading-6 text-gray-600">
                          {property.description}
                        </p>
                      ) : null}

                      <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
                        Linked{" "}
                        {formatDate(
                          interest.createdAt,
                        )}
                        {interest.createdBy ? (
                          <>
                            {" "}
                            by{" "}
                            <span className="font-semibold text-gray-700">
                              {interest.createdBy.fullName}
                            </span>
                          </>
                        ) : null}
                      </div>

                      {canManage ? (
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              void handleRemove(
                                property.id,
                              );
                            }}
                            className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPending
                              ? "Removing..."
                              : "Remove Interest"}
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                },
              )}
            </div>
          )}

          {canManage ? (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div>
                <h3 className="font-bold text-gray-950">
                  Add Property Interest
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Search the property inventory and link the relevant listing to this lead.
                </p>
              </div>

              <form
                onSubmit={handleSearch}
                className="mt-4 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="search"
                  value={queryInput}
                  onChange={(event) => {
                    setQueryInput(
                      event.target.value,
                    );
                  }}
                  placeholder="Search property title, location or type"
                  className="min-w-0 flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />

                <button
                  type="submit"
                  disabled={propertyLoading}
                  className="rounded-2xl bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Search Properties
                </button>
              </form>

              {mutationError ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {mutationError}
                </div>
              ) : null}

              {propertyLoading ? (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-5 text-sm text-gray-500">
                  Loading property inventory...
                </div>
              ) : availableProperties.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-5 text-sm text-gray-500">
                  {properties.length > 0
                    ? "All returned properties are already linked to this lead."
                    : "No matching properties found."}
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {availableProperties.map(
                    (property) => {
                      const isPending =
                        pendingPropertyId
                          === property.id;

                      return (
                        <div
                          key={property.id}
                          className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-gray-950">
                                {property.title}
                              </p>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                                  property.status,
                                )}`}
                              >
                                {formatStatus(
                                  property.status,
                                )}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                              {property.type}
                              {" • "}
                              {property.location}
                              {" • "}
                              {formatPrice(
                                property.price,
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={
                              pendingPropertyId
                                !== null
                            }
                            onClick={() => {
                              void handleAdd(
                                property.id,
                              );
                            }}
                            className="shrink-0 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPending
                              ? "Adding..."
                              : "Add Interest"}
                          </button>
                        </div>
                      );
                    },
                  )}
                </div>
              )}

              <p className="mt-3 text-xs text-gray-400">
                Up to 25 matching inventory records are shown per search.
              </p>
            </div>
          ) : (
            <p className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-400">
              You have read-only access to this lead&apos;s property interests.
            </p>
          )}
        </>
      )}
    </section>
  );
}
