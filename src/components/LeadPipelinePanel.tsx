"use client";

import {
  useEffect,
  useMemo,
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

type Lead = {
  id: string;
  fullName: string;
  status: LeadStatus;
  closedAt?: string | null;
  lossReason?: string | null;
};

type Inspection = {
  id: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED";
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

type InspectionListResponse = {
  success: boolean;
  message?: string;
  data?: Inspection[];
};

type LeadPipelinePanelProps = {
  leadId: string;
};

const forwardStages = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "INSPECTION_BOOKED",
  "WON",
] as const;

function formatStatus(
  status: LeadStatus,
) {
  return status
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase()
        + part.slice(1),
    )
    .join(" ");
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

async function readJson<T>(
  response: Response,
): Promise<T | null> {
  try {
    return await response.json() as T;
  } catch {
    return null;
  }
}

function nextForwardStatus(
  status: LeadStatus,
): LeadStatus | null {
  switch (status) {
    case "NEW":
      return "CONTACTED";

    case "CONTACTED":
      return "QUALIFIED";

    case "INSPECTION_BOOKED":
      return "WON";

    case "QUALIFIED":
    case "WON":
    case "LOST":
    default:
      return null;
  }
}

export default function LeadPipelinePanel({
  leadId,
}: LeadPipelinePanelProps) {
  const router =
    useRouter();

  const [
    lead,
    setLead,
  ] =
    useState<Lead | null>(
      null,
    );

  const [
    canManage,
    setCanManage,
  ] =
    useState(false);

  const [
    hasCompletedInspection,
    setHasCompletedInspection,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    pending,
    setPending,
  ] =
    useState(false);

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
    showLossForm,
    setShowLossForm,
  ] =
    useState(false);

  const [
    lossReason,
    setLossReason,
  ] =
    useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    async function load() {
      try {
        const [
          leadResponse,
          manageResponse,
          completedInspectionResponse,
        ] =
          await Promise.all([
            fetch(
              `/api/leads/${encodeURIComponent(leadId)}`,
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
            fetch(
              `/api/inspections?leadId=${encodeURIComponent(leadId)}&status=COMPLETED&page=1&limit=1&sort=scheduled_desc`,
              {
                cache: "no-store",
                signal:
                  controller.signal,
              },
            ),
          ]);

        if (
          leadResponse.status === 401
        ) {
          router.replace(
            `/login?next=/leads/${encodeURIComponent(leadId)}`,
          );

          return;
        }

        const leadPayload =
          await readJson<
            ApiResponse<Lead>
          >(
            leadResponse,
          );

        if (
          !leadResponse.ok
          || !leadPayload?.success
          || !leadPayload.data
        ) {
          throw new Error(
            leadPayload?.message
            ?? "Unable to load lead pipeline.",
          );
        }

        setLead(
          leadPayload.data,
        );

        setCanManage(
          manageResponse.status
            === 200,
        );

        if (
          completedInspectionResponse.ok
        ) {
          const inspectionPayload =
            await readJson<
              InspectionListResponse
            >(
              completedInspectionResponse,
            );

          setHasCompletedInspection(
            inspectionPayload?.success
              === true
            && Array.isArray(
              inspectionPayload.data,
            )
            && inspectionPayload.data.length
              > 0,
          );
        }

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
            : "Unable to load lead pipeline.",
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

  const forwardStatus =
    lead
      ? nextForwardStatus(
          lead.status,
        )
      : null;

  const isClosed =
    lead?.status === "WON"
    || lead?.status === "LOST";

  const activeStageIndex =
    useMemo(() => {
      if (!lead) {
        return -1;
      }

      return forwardStages.indexOf(
        lead.status as
          typeof forwardStages[number],
      );
    }, [
      lead,
    ]);

  async function mutatePipeline(
    status: LeadStatus,
    reason?: string,
  ) {
    setPending(true);
    setMutationError("");

    try {
      const body:
        Record<string, unknown> = {
          status,
      };

      if (
        status === "LOST"
      ) {
        body.lossReason =
          reason;
      }

      const response =
        await fetch(
          `/api/leads/${encodeURIComponent(leadId)}/pipeline`,
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
          ApiResponse<Lead>
        >(
          response,
        );

      if (
        !response.ok
        || !payload?.success
      ) {
        throw new Error(
          payload?.message
          ?? "Unable to update lead pipeline.",
        );
      }

      window.location.reload();
    } catch (mutationFailure) {
      setMutationError(
        mutationFailure
          instanceof Error
          ? mutationFailure.message
          : "Unable to update lead pipeline.",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleLost() {
    const reason =
      lossReason.trim();

    if (
      reason.length < 2
      || reason.length > 500
    ) {
      setMutationError(
        "Loss reason must be between 2 and 500 characters.",
      );

      return;
    }

    await mutatePipeline(
      "LOST",
      reason,
    );
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Loading pipeline...
        </p>
      </section>
    );
  }

  if (error || !lead) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">
          {error
            || "Unable to load pipeline."}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
            CRM Conversion
          </p>

          <h2 className="mt-2 text-xl font-bold text-gray-950">
            Lead Pipeline
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Advance this lead through the controlled sales journey and preserve each conversion decision in the CRM history.
          </p>
        </div>

        <span className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${
          lead.status === "WON"
            ? "bg-green-100 text-green-700"
            : lead.status === "LOST"
              ? "bg-gray-200 text-gray-700"
              : "bg-red-50 text-red-700"
        }`}>
          {formatStatus(
            lead.status,
          )}
        </span>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-5">
        {forwardStages.map(
          (
            stage,
            index,
          ) => {
            const current =
              lead.status === stage;

            const passed =
              lead.status !== "LOST"
              && activeStageIndex >= 0
              && index < activeStageIndex;

            return (
              <div
                key={stage}
                className={`rounded-2xl border px-3 py-3 text-center text-xs font-bold ${
                  current
                    ? "border-red-300 bg-red-50 text-red-700"
                    : passed
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-gray-200 bg-gray-50 text-gray-400"
                }`}
              >
                {formatStatus(
                  stage,
                )}
              </div>
            );
          },
        )}
      </div>

      {lead.status === "LOST" ? (
        <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm font-bold text-gray-900">
            Lead closed as lost
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {lead.lossReason
              || "No loss reason available."}
          </p>

          {lead.closedAt ? (
            <p className="mt-2 text-xs text-gray-400">
              Closed{" "}
              {formatDate(
                lead.closedAt,
              )}
            </p>
          ) : null}
        </div>
      ) : null}

      {lead.status === "WON" ? (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
          <p className="font-bold text-green-800">
            Lead converted successfully
          </p>

          <p className="mt-1 text-sm text-green-700">
            This lead is now closed as won.
          </p>

          {lead.closedAt ? (
            <p className="mt-2 text-xs text-green-700">
              Closed{" "}
              {formatDate(
                lead.closedAt,
              )}
            </p>
          ) : null}
        </div>
      ) : null}

      {!isClosed
        && lead.status
          === "QUALIFIED" ? (
        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Schedule the first inspection below. The inspection workflow will automatically move this lead to Inspection Booked.
        </div>
      ) : null}

      {!isClosed
        && lead.status
          === "INSPECTION_BOOKED"
        && !hasCompletedInspection ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          A completed inspection is required before this lead can be marked as won.
        </div>
      ) : null}

      {mutationError ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {mutationError}
        </div>
      ) : null}

      {canManage
        && !isClosed ? (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex flex-wrap gap-3">
            {forwardStatus ? (
              <button
                type="button"
                disabled={
                  pending
                  || (
                    forwardStatus
                      === "WON"
                    && !hasCompletedInspection
                  )
                }
                onClick={() => {
                  void mutatePipeline(
                    forwardStatus,
                  );
                }}
                className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending
                  ? "Updating..."
                  : forwardStatus
                      === "WON"
                    ? "Mark as Won"
                    : `Move to ${formatStatus(
                        forwardStatus,
                      )}`}
              </button>
            ) : null}

            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setShowLossForm(
                  (current) =>
                    !current,
                );

                setMutationError("");
              }}
              className="rounded-full border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {showLossForm
                ? "Cancel Loss"
                : "Mark as Lost"}
            </button>
          </div>

          {showLossForm ? (
            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-gray-800">
                  Loss reason
                </span>

                <textarea
                  rows={4}
                  maxLength={500}
                  value={lossReason}
                  onChange={(
                    event,
                  ) => {
                    setLossReason(
                      event.target.value,
                    );
                  }}
                  placeholder="Why was this opportunity lost?"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <div className="mt-2 flex justify-between gap-4 text-xs text-gray-400">
                <span>
                  Required, 2–500 characters
                </span>

                <span>
                  {lossReason.trim().length}/500
                </span>
              </div>

              <button
                type="button"
                disabled={
                  pending
                  || lossReason.trim()
                    .length < 2
                }
                onClick={() => {
                  void handleLost();
                }}
                className="mt-4 rounded-full bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending
                  ? "Closing Lead..."
                  : "Confirm Lost"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!canManage ? (
        <p className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-400">
          You have read-only access to the lead pipeline.
        </p>
      ) : null}
    </section>
  );
}
