"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

type EligibleAssignee = {
  id: string;
  fullName: string;
  role: string;
  isActive: boolean;
};

type AssignedLeadUser = {
  id: string;
  fullName: string;
  role: string;
  isActive: boolean;
};

type LeadAssignmentState = {
  assignedToId: string | null;
  assignedTo: AssignedLeadUser | null;
  assignedAt: string | null;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type LeadAssignmentPanelProps = {
  leadId: string;
};

function formatRole(
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
    return "Not assigned";
  }

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

export default function LeadAssignmentPanel({
  leadId,
}: LeadAssignmentPanelProps) {
  const router =
    useRouter();

  const [
    assignees,
    setAssignees,
  ] =
    useState<
      EligibleAssignee[]
    >([]);

  const [
    lead,
    setLead,
  ] =
    useState<
      LeadAssignmentState | null
    >(null);

  const [
    selectedAssigneeId,
    setSelectedAssigneeId,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    canManageAssignment,
    setCanManageAssignment,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(
    () => {
      let cancelled =
        false;

      async function load() {
        setLoading(true);
        setError(null);

        try {
          const [
            assigneesResponse,
            leadResponse,
          ] =
            await Promise.all([
              fetch(
                "/api/leads/assignees/eligible",
                {
                  method: "GET",
                  headers: {
                    Accept:
                      "application/json",
                  },
                  cache: "no-store",
                },
              ),
              fetch(
                `/api/leads/${encodeURIComponent(leadId)}`,
                {
                  method: "GET",
                  headers: {
                    Accept:
                      "application/json",
                  },
                  cache: "no-store",
                },
              ),
            ]);

          if (
            assigneesResponse.status
              === 401
            || leadResponse.status
              === 401
          ) {
            router.replace(
              `/login?next=${encodeURIComponent(`/leads/${leadId}`)}`,
            );
            return;
          }

          if (
            assigneesResponse.status
              === 403
          ) {
            if (!cancelled) {
              setCanManageAssignment(
                false,
              );
              setLoading(false);
            }

            return;
          }

          const assigneesPayload =
            await assigneesResponse.json() as
              ApiResponse<
                EligibleAssignee[]
              >;

          const leadPayload =
            await leadResponse.json() as
              ApiResponse<
                LeadAssignmentState
              >;

          if (
            !assigneesResponse.ok
          ) {
            throw new Error(
              assigneesPayload.message
              ?? "Unable to load eligible assignees.",
            );
          }

          if (!leadResponse.ok) {
            throw new Error(
              leadPayload.message
              ?? "Unable to load lead assignment.",
            );
          }

          if (
            !Array.isArray(
              assigneesPayload.data,
            )
            || !leadPayload.data
          ) {
            throw new Error(
              "Lead assignment service returned an invalid response.",
            );
          }

          if (cancelled) {
            return;
          }

          setAssignees(
            assigneesPayload.data,
          );

          setLead(
            leadPayload.data,
          );

          setSelectedAssigneeId(
            leadPayload.data
              .assignedToId
            ?? "",
          );
        } catch (loadError) {
          if (cancelled) {
            return;
          }

          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load lead assignment.",
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      void load();

      return () => {
        cancelled = true;
      };
    },
    [
      leadId,
      router,
    ],
  );

  if (!canManageAssignment) {
    return null;
  }

  const currentAssignedToId =
    lead?.assignedToId
    ?? "";

  const hasChanged =
    selectedAssigneeId
    !== currentAssignedToId;

  const currentAssigneeMissing =
    !!lead?.assignedTo
    && !assignees.some(
      (assignee) =>
        assignee.id
        === lead.assignedTo?.id,
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      submitting
      || !lead
      || !hasChanged
    ) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/leads/${encodeURIComponent(leadId)}/assignment`,
          {
            method: "PATCH",
            headers: {
              Accept:
                "application/json",
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                assignedToId:
                  selectedAssigneeId
                    ? selectedAssigneeId
                    : null,
              }),
          },
        );

      const payload =
        await response.json() as
          ApiResponse<
            LeadAssignmentState
          >;

      if (response.status === 401) {
        router.replace(
          `/login?next=${encodeURIComponent(`/leads/${leadId}`)}`,
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          payload.message
          ?? "Unable to update lead assignment.",
        );
      }

      /*
       * Lead detail and activity timeline are independent
       * client workspaces. A full reload guarantees both
       * re-read the canonical assignment and new activity.
       */
      window.location.reload();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to update lead assignment.",
      );
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Lead ownership
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Assignment
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Assign this lead to an active team member who can manage CRM leads.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">
          Loading assignment…
        </p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Current owner
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {lead?.assignedTo
                ? lead.assignedTo.fullName
                : "Unassigned"}
            </p>

            {lead?.assignedTo ? (
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>
                  {formatRole(
                    lead.assignedTo.role,
                  )}
                </span>

                <span>
                  {lead.assignedTo.isActive
                    ? "Active"
                    : "Inactive"}
                </span>

                <span>
                  Assigned{" "}
                  {formatDateTime(
                    lead.assignedAt,
                  )}
                </span>
              </div>
            ) : null}
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-slate-700"
              htmlFor="lead-assignee"
            >
              Assign to
            </label>

            <select
              id="lead-assignee"
              value={
                selectedAssigneeId
              }
              onChange={(event) =>
                setSelectedAssigneeId(
                  event.target.value,
                )
              }
              disabled={
                submitting
                || !lead
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                Unassigned
              </option>

              {currentAssigneeMissing
                && lead?.assignedTo ? (
                  <option
                    value={
                      lead.assignedTo.id
                    }
                    disabled
                  >
                    {lead.assignedTo.fullName}
                    {" — "}
                    {formatRole(
                      lead.assignedTo.role,
                    )}
                    {" (currently unavailable)"}
                  </option>
                ) : null}

              {assignees.map(
                (assignee) => (
                  <option
                    key={assignee.id}
                    value={assignee.id}
                  >
                    {assignee.fullName}
                    {" — "}
                    {formatRole(
                      assignee.role,
                    )}
                  </option>
                ),
              )}
            </select>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={
                submitting
                || loading
                || !lead
                || !hasChanged
              }
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Updating…"
                : selectedAssigneeId
                  ? "Update Assignment"
                  : "Unassign Lead"}
            </button>

            {!hasChanged
              && lead ? (
                <span className="text-xs text-slate-500">
                  No assignment change
                </span>
              ) : null}
          </div>
        </form>
      )}

    </section>
  );
}
