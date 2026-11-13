"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type FollowUpStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";

type FollowUpCreator = {
  id: string;
  fullName: string;
  role: string;
};

type LeadFollowUp = {
  id: string;
  leadId: string;
  scheduledAt: string;
  note: string | null;
  status: FollowUpStatus;
  completedAt: string | null;
  createdById: string | null;
  createdBy: FollowUpCreator | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type LeadFollowUpPanelProps = {
  leadId: string;
};

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
  value: string | null,
) {
  if (!value) {
    return "—";
  }

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
      dateStyle:
        "medium",
      timeStyle:
        "short",
    },
  ).format(date);
}

function toDateTimeLocal(
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

  const localDate =
    new Date(
      date.getTime()
      - offset * 60_000,
    );

  return localDate
    .toISOString()
    .slice(0, 16);
}

function statusClass(
  status: FollowUpStatus,
) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700";
    case "COMPLETED":
      return "bg-green-50 text-green-700";
    case "CANCELLED":
      return "bg-gray-100 text-gray-600";
  }
}

function isOverdue(
  followUp: LeadFollowUp,
) {
  return (
    followUp.status
      === "PENDING"
    && new Date(
      followUp.scheduledAt,
    ).getTime() < Date.now()
  );
}

async function parseJson<T>(
  response: Response,
): Promise<
  ApiResponse<T> | null
> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function LeadFollowUpPanel({
  leadId,
}: LeadFollowUpPanelProps) {
  const router =
    useRouter();

  const [
    followUps,
    setFollowUps,
  ] =
    useState<LeadFollowUp[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    canManage,
    setCanManage,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    createScheduledAt,
    setCreateScheduledAt,
  ] =
    useState("");

  const [
    createNote,
    setCreateNote,
  ] =
    useState("");

  const [
    creating,
    setCreating,
  ] =
    useState(false);

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
    editNote,
    setEditNote,
  ] =
    useState("");

  const [
    mutatingId,
    setMutatingId,
  ] =
    useState<string | null>(
      null,
    );

  const redirectToLogin =
    useCallback(() => {
      router.replace(
        `/login?next=/leads/${encodeURIComponent(leadId)}`,
      );
    }, [
      leadId,
      router,
    ]);

  const load =
    useCallback(async () => {
      try {
        const [
          followUpsResponse,
          manageProbeResponse,
        ] =
          await Promise.all([
            fetch(
              `/api/leads/${encodeURIComponent(leadId)}/follow-ups`,
              {
                cache:
                  "no-store",
              },
            ),
            fetch(
              "/api/leads/assignees/eligible",
              {
                cache:
                  "no-store",
              },
            ),
          ]);

        if (
          followUpsResponse.status
            === 401
          || manageProbeResponse.status
            === 401
        ) {
          redirectToLogin();
          return;
        }

        const followUpsPayload =
          await parseJson<
            LeadFollowUp[]
          >(
            followUpsResponse,
          );

        if (
          !followUpsResponse.ok
          || !followUpsPayload
            ?.success
          || !Array.isArray(
            followUpsPayload.data,
          )
        ) {
          setError(
            followUpsPayload
              ?.message
            ?? "Unable to load lead follow-ups.",
          );

          return;
        }

        setFollowUps(
          followUpsPayload.data,
        );

        if (
          manageProbeResponse.ok
        ) {
          setCanManage(true);
        } else if (
          manageProbeResponse.status
            === 403
        ) {
          setCanManage(false);
        } else {
          setCanManage(false);
        }
      } catch {
        setError(
          "Unable to load lead follow-ups.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      leadId,
      redirectToLogin,
    ]);

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void load();
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [load]);

  async function handleCreate(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      creating
      || !canManage
    ) {
      return;
    }

    setError(null);

    if (
      !createScheduledAt
    ) {
      setError(
        "Choose a follow-up date and time.",
      );
      return;
    }

    const scheduledDate =
      new Date(
        createScheduledAt,
      );

    if (
      Number.isNaN(
        scheduledDate.getTime(),
      )
    ) {
      setError(
        "Choose a valid follow-up date and time.",
      );
      return;
    }

    const trimmedNote =
      createNote.trim();

    if (
      trimmedNote.length > 2000
    ) {
      setError(
        "Follow-up note must not exceed 2000 characters.",
      );
      return;
    }

    setCreating(true);

    try {
      const response =
        await fetch(
          `/api/leads/${encodeURIComponent(leadId)}/follow-ups`,
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                scheduledAt:
                  scheduledDate.toISOString(),
                note:
                  trimmedNote
                    ? trimmedNote
                    : null,
              }),
          },
        );

      if (
        response.status === 401
      ) {
        redirectToLogin();
        return;
      }

      if (
        response.status === 403
      ) {
        setCanManage(false);
      }

      const payload =
        await parseJson<
          LeadFollowUp
        >(
          response,
        );

      if (
        !response.ok
        || !payload?.success
      ) {
        setError(
          payload?.message
          ?? "Unable to create follow-up.",
        );
        return;
      }

      window.location.reload();
    } catch {
      setError(
        "Unable to create follow-up.",
      );
    } finally {
      setCreating(false);
    }
  }

  function beginEdit(
    followUp: LeadFollowUp,
  ) {
    setError(null);

    setEditingId(
      followUp.id,
    );

    setEditScheduledAt(
      toDateTimeLocal(
        followUp.scheduledAt,
      ),
    );

    setEditNote(
      followUp.note ?? "",
    );
  }

  function cancelEdit() {
    setEditingId(null);
    setEditScheduledAt("");
    setEditNote("");
  }

  async function updateFollowUp(
    followUp: LeadFollowUp,
    update: Record<
      string,
      unknown
    >,
  ) {
    if (
      mutatingId
      || !canManage
    ) {
      return;
    }

    if (
      Object.keys(update)
        .length === 0
    ) {
      setError(
        "No follow-up changes to save.",
      );
      return;
    }

    setMutatingId(
      followUp.id,
    );
    setError(null);

    try {
      const response =
        await fetch(
          `/api/leads/${encodeURIComponent(leadId)}/follow-ups/${encodeURIComponent(followUp.id)}`,
          {
            method:
              "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                update,
              ),
          },
        );

      if (
        response.status === 401
      ) {
        redirectToLogin();
        return;
      }

      if (
        response.status === 403
      ) {
        setCanManage(false);
      }

      const payload =
        await parseJson<
          LeadFollowUp
        >(
          response,
        );

      if (
        !response.ok
        || !payload?.success
      ) {
        setError(
          payload?.message
          ?? "Unable to update follow-up.",
        );
        return;
      }

      window.location.reload();
    } catch {
      setError(
        "Unable to update follow-up.",
      );
    } finally {
      setMutatingId(null);
    }
  }

  async function handleEditSubmit(
    event: FormEvent,
    followUp: LeadFollowUp,
  ) {
    event.preventDefault();

    if (!editScheduledAt) {
      setError(
        "Choose a follow-up date and time.",
      );
      return;
    }

    const scheduledDate =
      new Date(
        editScheduledAt,
      );

    if (
      Number.isNaN(
        scheduledDate.getTime(),
      )
    ) {
      setError(
        "Choose a valid follow-up date and time.",
      );
      return;
    }

    const trimmedNote =
      editNote.trim();

    if (
      trimmedNote.length > 2000
    ) {
      setError(
        "Follow-up note must not exceed 2000 characters.",
      );
      return;
    }

    const update: {
      scheduledAt?: string;
      note?: string | null;
    } = {};

    const nextScheduledAt =
      scheduledDate.toISOString();

    if (
      nextScheduledAt
      !== followUp.scheduledAt
    ) {
      update.scheduledAt =
        nextScheduledAt;
    }

    const currentNote =
      followUp.note ?? "";

    if (
      trimmedNote
      !== currentNote
    ) {
      update.note =
        trimmedNote
          ? trimmedNote
          : null;
    }

    if (
      Object.keys(update)
        .length === 0
    ) {
      setError(
        "No follow-up changes to save.",
      );
      return;
    }

    await updateFollowUp(
      followUp,
      update,
    );
  }

  async function changeStatus(
    followUp: LeadFollowUp,
    status: FollowUpStatus,
  ) {
    if (
      followUp.status
      === status
    ) {
      setError(
        "Follow-up already has that status.",
      );
      return;
    }

    await updateFollowUp(
      followUp,
      {
        status,
      },
    );
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
            Sales follow-up
          </p>

          <h3 className="mt-2 text-xl font-bold text-gray-950">
            Follow-ups
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Schedule and track the next actions required to move this lead forward.
          </p>
        </div>

        {!loading ? (
          <span className="text-xs font-semibold text-gray-500">
            {followUps.length}{" "}
            {followUps.length === 1
              ? "follow-up"
              : "follow-ups"}
          </span>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {canManage ? (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4"
        >
          <h4 className="font-bold text-gray-950">
            Schedule follow-up
          </h4>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">
              Date and time
              <input
                type="datetime-local"
                value={createScheduledAt}
                onChange={(event) =>
                  setCreateScheduledAt(
                    event.target.value,
                  )
                }
                required
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500"
              />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Note
              <input
                type="text"
                value={createNote}
                onChange={(event) =>
                  setCreateNote(
                    event.target.value,
                  )
                }
                maxLength={2000}
                placeholder="Call, WhatsApp, send brochure..."
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating
                ? "Scheduling..."
                : "Schedule Follow-up"}
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-gray-200 px-4 py-6 text-sm text-gray-500">
          Loading follow-ups...
        </div>
      ) : followUps.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center">
          <p className="font-semibold text-gray-700">
            No follow-ups scheduled
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {canManage
              ? "Schedule the next action for this lead above."
              : "No follow-up activity has been recorded for this lead."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {followUps.map(
            (followUp) => {
              const overdue =
                isOverdue(
                  followUp,
                );

              const busy =
                mutatingId
                  === followUp.id;

              const editing =
                editingId
                  === followUp.id;

              return (
                <article
                  key={followUp.id}
                  className="rounded-2xl border border-gray-200 p-4 md:p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                            followUp.status,
                          )}`}
                        >
                          {formatLabel(
                            followUp.status,
                          )}
                        </span>

                        {overdue ? (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                            Overdue
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-3 font-bold text-gray-950">
                        {formatDateTime(
                          followUp.scheduledAt,
                        )}
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {followUp.note
                          ?? "No note added."}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>
                          Created by:{" "}
                          {followUp.createdBy
                            ?.fullName
                            ?? "Unknown user"}
                        </span>

                        {followUp.completedAt ? (
                          <span>
                            Completed:{" "}
                            {formatDateTime(
                              followUp.completedAt,
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {canManage ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            editing
                              ? cancelEdit()
                              : beginEdit(
                                  followUp,
                                )
                          }
                          className="rounded-full border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                          {editing
                            ? "Close Edit"
                            : "Edit"}
                        </button>

                        {followUp.status
                          === "PENDING" ? (
                          <>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void changeStatus(
                                  followUp,
                                  "COMPLETED",
                                )
                              }
                              className="rounded-full bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
                            >
                              Complete
                            </button>

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void changeStatus(
                                  followUp,
                                  "CANCELLED",
                                )
                              }
                              className="rounded-full border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void changeStatus(
                                followUp,
                                "PENDING",
                              )
                            }
                            className="rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {editing
                    && canManage ? (
                    <form
                      onSubmit={(event) =>
                        void handleEditSubmit(
                          event,
                          followUp,
                        )
                      }
                      className="mt-5 border-t border-gray-200 pt-5"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Date and time
                          <input
                            type="datetime-local"
                            value={editScheduledAt}
                            onChange={(event) =>
                              setEditScheduledAt(
                                event.target.value,
                              )
                            }
                            required
                            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-950 outline-none focus:border-red-500"
                          />
                        </label>

                        <label className="text-sm font-semibold text-gray-700">
                          Note
                          <input
                            type="text"
                            value={editNote}
                            onChange={(event) =>
                              setEditNote(
                                event.target.value,
                              )
                            }
                            maxLength={2000}
                            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-950 outline-none focus:border-red-500"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={busy}
                          className="rounded-full bg-gray-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
                        >
                          {busy
                            ? "Saving..."
                            : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  ) : null}
                </article>
              );
            },
          )}
        </div>
      )}

      {!loading
        && !canManage ? (
        <p className="mt-5 text-xs text-gray-500">
          You have read-only access to lead follow-ups.
        </p>
      ) : null}
    </section>
  );
}
