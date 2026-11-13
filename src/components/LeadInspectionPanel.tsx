"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type InspectionStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

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
  property: InspectionProperty | null;
  createdAt: string;
  updatedAt: string;
};

type Lead = {
  id: string;
  fullName: string;
  status: LeadStatus;
};

type PropertyInterest = {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    type: string;
    location: string;
    status: PropertyStatus;
  };
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

type InspectionsResponse = {
  success: boolean;
  message?: string;
  data?: Inspection[];
};

type LeadInspectionPanelProps = {
  leadId: string;
};

function formatStatus(
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

function toLocalInputValue(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const local =
    new Date(
      date.getTime()
      - offset * 60_000,
    );

  return local
    .toISOString()
    .slice(0, 16);
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

function nextStatuses(
  status: InspectionStatus,
): InspectionStatus[] {
  switch (status) {
    case "PENDING":
      return [
        "CONFIRMED",
        "CANCELLED",
      ];

    case "CONFIRMED":
      return [
        "COMPLETED",
        "CANCELLED",
      ];

    case "COMPLETED":
    case "CANCELLED":
    default:
      return [];
  }
}

export default function LeadInspectionPanel({
  leadId,
}: LeadInspectionPanelProps) {
  const router =
    useRouter();

  const [
    inspections,
    setInspections,
  ] =
    useState<Inspection[]>([]);

  const [
    lead,
    setLead,
  ] =
    useState<Lead | null>(
      null,
    );

  const [
    interests,
    setInterests,
  ] =
    useState<PropertyInterest[]>(
      [],
    );

  const [
    canView,
    setCanView,
  ] =
    useState(true);

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
    scheduledAt,
    setScheduledAt,
  ] =
    useState("");

  const [
    propertyId,
    setPropertyId,
  ] =
    useState("");

  const [
    notes,
    setNotes,
  ] =
    useState("");

  const [
    pendingId,
    setPendingId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    editingId,
    setEditingId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    editScheduledAt,
    setEditScheduledAt,
  ] =
    useState("");

  const [
    editNotes,
    setEditNotes,
  ] =
    useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    async function load() {
      try {
        const [
          inspectionResponse,
          leadResponse,
          interestsResponse,
          manageProbeResponse,
        ] =
          await Promise.all([
            fetch(
              `/api/inspections?leadId=${encodeURIComponent(leadId)}&page=1&limit=100&sort=scheduled_asc`,
              {
                cache: "no-store",
                signal:
                  controller.signal,
              },
            ),
            fetch(
              `/api/leads/${encodeURIComponent(leadId)}`,
              {
                cache: "no-store",
                signal:
                  controller.signal,
              },
            ),
            fetch(
              `/api/leads/${encodeURIComponent(leadId)}/property-interests`,
              {
                cache: "no-store",
                signal:
                  controller.signal,
              },
            ),
            fetch(
              "/api/leads/assignees/eligible",
              {
                cache: "no-store",
                signal:
                  controller.signal,
              },
            ),
          ]);

        if (
          inspectionResponse.status
            === 401
          || leadResponse.status
            === 401
        ) {
          router.replace(
            `/login?next=/leads/${encodeURIComponent(leadId)}`,
          );

          return;
        }

        if (
          inspectionResponse.status
            === 403
        ) {
          setCanView(false);
          setLoading(false);
          return;
        }

        const inspectionPayload =
          await readJson<
            InspectionsResponse
          >(
            inspectionResponse,
          );

        const leadPayload =
          await readJson<
            ApiResponse<Lead>
          >(
            leadResponse,
          );

        const interestsPayload =
          await readJson<
            ApiResponse<PropertyInterest[]>
          >(
            interestsResponse,
          );

        if (
          !inspectionResponse.ok
          || !inspectionPayload?.success
          || !Array.isArray(
            inspectionPayload.data,
          )
        ) {
          throw new Error(
            inspectionPayload?.message
            ?? "Unable to load inspections.",
          );
        }

        if (
          !leadResponse.ok
          || !leadPayload?.success
          || !leadPayload.data
        ) {
          throw new Error(
            leadPayload?.message
            ?? "Unable to load lead.",
          );
        }

        setInspections(
          inspectionPayload.data,
        );

        setLead(
          leadPayload.data,
        );

        if (
          interestsResponse.ok
          && interestsPayload?.success
          && Array.isArray(
            interestsPayload.data,
          )
        ) {
          setInterests(
            interestsPayload.data,
          );
        }

        setCanManage(
          manageProbeResponse.status
            === 200,
        );

        setError("");
      } catch (loadError) {
        if (
          loadError instanceof DOMException
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
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, [
    leadId,
    router,
  ]);

  const canSchedule =
    canManage
    && (
      lead?.status === "QUALIFIED"
      || lead?.status
        === "INSPECTION_BOOKED"
    );

  const scheduleReason =
    useMemo(() => {
      if (!lead) {
        return "";
      }

      if (
        lead.status === "WON"
        || lead.status === "LOST"
      ) {
        return "Closed leads cannot receive new inspections.";
      }

      if (
        lead.status !== "QUALIFIED"
        && lead.status
          !== "INSPECTION_BOOKED"
      ) {
        return "The lead must reach Qualified before an inspection can be scheduled.";
      }

      return "";
    }, [
      lead,
    ]);

  async function handleCreate(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      !canSchedule
      || !scheduledAt
    ) {
      return;
    }

    setPendingId(
      "create",
    );

    setMutationError("");

    try {
      const date =
        new Date(scheduledAt);

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        throw new Error(
          "Choose a valid inspection date and time.",
        );
      }

      const body:
        Record<string, unknown> = {
          leadId,
          scheduledAt:
            date.toISOString(),
      };

      if (propertyId) {
        body.propertyId =
          propertyId;
      }

      if (notes.trim()) {
        body.notes =
          notes.trim();
      }

      const response =
        await fetch(
          "/api/inspections",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(body),
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
          ApiResponse<Inspection>
        >(
          response,
        );

      if (
        !response.ok
        || !payload?.success
      ) {
        throw new Error(
          payload?.message
          ?? "Unable to schedule inspection.",
        );
      }

      window.location.reload();
    } catch (createError) {
      setMutationError(
        createError instanceof Error
          ? createError.message
          : "Unable to schedule inspection.",
      );
    } finally {
      setPendingId(
        null,
      );
    }
  }

  function beginEdit(
    inspection: Inspection,
  ) {
    setEditingId(
      inspection.id,
    );

    setEditScheduledAt(
      toLocalInputValue(
        inspection.scheduledAt,
      ),
    );

    setEditNotes(
      inspection.notes ?? "",
    );

    setMutationError("");
  }

  async function saveEdit(
    inspection: Inspection,
  ) {
    if (!editScheduledAt) {
      setMutationError(
        "Choose a valid inspection date and time.",
      );
      return;
    }

    const nextDate =
      new Date(
        editScheduledAt,
      );

    if (
      Number.isNaN(
        nextDate.getTime(),
      )
    ) {
      setMutationError(
        "Choose a valid inspection date and time.",
      );
      return;
    }

    const currentDate =
      new Date(
        inspection.scheduledAt,
      );

    const body:
      Record<string, unknown> = {};

    if (
      nextDate.getTime()
      !== currentDate.getTime()
    ) {
      body.scheduledAt =
        nextDate.toISOString();
    }

    const normalizedNotes =
      editNotes.trim();

    const currentNotes =
      inspection.notes ?? "";

    if (
      normalizedNotes
      !== currentNotes
    ) {
      body.notes =
        normalizedNotes
          ? normalizedNotes
          : null;
    }

    if (
      Object.keys(body).length
        === 0
    ) {
      setMutationError(
        "No inspection changes detected.",
      );
      return;
    }

    await patchInspection(
      inspection.id,
      body,
    );
  }

  async function updateStatus(
    inspectionId: string,
    status: InspectionStatus,
  ) {
    await patchInspection(
      inspectionId,
      {
        status,
      },
    );
  }

  async function patchInspection(
    inspectionId: string,
    body: Record<string, unknown>,
  ) {
    setPendingId(
      inspectionId,
    );

    setMutationError("");

    try {
      const response =
        await fetch(
          `/api/inspections/${encodeURIComponent(inspectionId)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(body),
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
          ApiResponse<Inspection>
        >(
          response,
        );

      if (
        !response.ok
        || !payload?.success
      ) {
        throw new Error(
          payload?.message
          ?? "Unable to update inspection.",
        );
      }

      window.location.reload();
    } catch (updateError) {
      setMutationError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update inspection.",
      );
    } finally {
      setPendingId(
        null,
      );
    }
  }

  if (!canView) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
            CRM Appointments
          </p>

          <h2 className="mt-2 text-xl font-bold text-gray-950">
            Inspections
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Schedule and track property inspections for this lead.
          </p>
        </div>

        {!loading ? (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
            {inspections.length} inspection
            {inspections.length === 1
              ? ""
              : "s"}
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
          Loading inspections...
        </div>
      ) : (
        <>
          {inspections.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-6">
              <p className="font-semibold text-gray-900">
                No inspections scheduled
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Eligible leads can have their first inspection scheduled below.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {inspections.map(
                (inspection) => {
                  const transitions =
                    nextStatuses(
                      inspection.status,
                    );

                  const terminal =
                    inspection.status
                      === "COMPLETED"
                    || inspection.status
                      === "CANCELLED";

                  const pending =
                    pendingId
                      === inspection.id;

                  const editing =
                    editingId
                      === inspection.id;

                  return (
                    <article
                      key={inspection.id}
                      className="rounded-2xl border border-gray-200 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
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

                            {inspection.property ? (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                {inspection.property.title}
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-3 text-lg font-bold text-gray-950">
                            {formatDateTime(
                              inspection.scheduledAt,
                            )}
                          </p>

                          {inspection.property ? (
                            <p className="mt-1 text-sm text-gray-500">
                              {inspection.property.type}
                              {" • "}
                              {inspection.property.location}
                            </p>
                          ) : (
                            <p className="mt-1 text-sm text-gray-500">
                              No property attached
                            </p>
                          )}

                          <p className="mt-3 text-sm leading-6 text-gray-600">
                            {inspection.notes
                              ?? "No inspection notes provided."}
                          </p>
                        </div>

                        {canManage ? (
                          <div className="flex flex-wrap gap-2">
                            {!terminal ? (
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() => {
                                  if (editing) {
                                    setEditingId(
                                      null,
                                    );
                                  } else {
                                    beginEdit(
                                      inspection,
                                    );
                                  }
                                }}
                                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                              >
                                {editing
                                  ? "Cancel Edit"
                                  : "Edit"}
                              </button>
                            ) : null}

                            {transitions.map(
                              (status) => (
                                <button
                                  key={status}
                                  type="button"
                                  disabled={pending}
                                  onClick={() => {
                                    void updateStatus(
                                      inspection.id,
                                      status,
                                    );
                                  }}
                                  className="rounded-full bg-gray-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
                                >
                                  {pending
                                    ? "Updating..."
                                    : formatStatus(
                                        status,
                                      )}
                                </button>
                              ),
                            )}
                          </div>
                        ) : null}
                      </div>

                      {editing
                        && !terminal ? (
                        <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5">
                          <label className="grid gap-2">
                            <span className="text-sm font-bold text-gray-700">
                              Scheduled date and time
                            </span>

                            <input
                              type="datetime-local"
                              value={
                                editScheduledAt
                              }
                              onChange={(
                                event,
                              ) => {
                                setEditScheduledAt(
                                  event.target.value,
                                );
                              }}
                              className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>

                          <label className="grid gap-2">
                            <span className="text-sm font-bold text-gray-700">
                              Notes
                            </span>

                            <textarea
                              value={
                                editNotes
                              }
                              maxLength={5000}
                              rows={3}
                              onChange={(
                                event,
                              ) => {
                                setEditNotes(
                                  event.target.value,
                                );
                              }}
                              className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </label>

                          <div>
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => {
                                void saveEdit(
                                  inspection,
                                );
                              }}
                              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                              {pending
                                ? "Saving..."
                                : "Save Changes"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                },
              )}
            </div>
          )}

          {mutationError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {mutationError}
            </div>
          ) : null}

          {canManage ? (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="font-bold text-gray-950">
                Schedule Inspection
              </h3>

              {scheduleReason ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
                  {scheduleReason}
                </div>
              ) : null}

              <form
                onSubmit={handleCreate}
                className="mt-4 grid gap-4"
              >
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-gray-700">
                    Date and time
                  </span>

                  <input
                    type="datetime-local"
                    required
                    disabled={
                      !canSchedule
                    }
                    value={
                      scheduledAt
                    }
                    onChange={(
                      event,
                    ) => {
                      setScheduledAt(
                        event.target.value,
                      );
                    }}
                    className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-gray-700">
                    Linked property
                  </span>

                  <select
                    disabled={
                      !canSchedule
                    }
                    value={
                      propertyId
                    }
                    onChange={(
                      event,
                    ) => {
                      setPropertyId(
                        event.target.value,
                      );
                    }}
                    className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
                  >
                    <option value="">
                      No property attached
                    </option>

                    {interests.map(
                      (interest) => (
                        <option
                          key={
                            interest.id
                          }
                          value={
                            interest.propertyId
                          }
                        >
                          {
                            interest.property.title
                          }
                          {" — "}
                          {
                            interest.property.location
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-gray-700">
                    Notes
                  </span>

                  <textarea
                    disabled={
                      !canSchedule
                    }
                    value={notes}
                    maxLength={5000}
                    rows={4}
                    onChange={(
                      event,
                    ) => {
                      setNotes(
                        event.target.value,
                      );
                    }}
                    placeholder="Optional inspection notes"
                    className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
                  />
                </label>

                <div>
                  <button
                    type="submit"
                    disabled={
                      !canSchedule
                      || !scheduledAt
                      || pendingId
                        === "create"
                    }
                    className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pendingId
                      === "create"
                      ? "Scheduling..."
                      : "Schedule Inspection"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <p className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-400">
              You have read-only access to inspections.
            </p>
          )}
        </>
      )}
    </section>
  );
}
