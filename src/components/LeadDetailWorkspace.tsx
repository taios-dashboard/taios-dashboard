"use client";

import Link from "next/link";
import {
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
};

type AssignedLeadUser =
  LeadUser & {
    isActive: boolean;
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
  assignedTo: AssignedLeadUser | null;
  assignedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type LeadResponse = {
  success?: boolean;
  message?: string;
  data?: Lead;
};

type LeadDetailWorkspaceProps = {
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

function statusClass(
  status: LeadStatus,
) {
  switch (status) {
    case "NEW":
      return "bg-blue-50 text-blue-700";
    case "CONTACTED":
      return "bg-violet-50 text-violet-700";
    case "QUALIFIED":
      return "bg-amber-50 text-amber-700";
    case "INSPECTION_BOOKED":
      return "bg-cyan-50 text-cyan-700";
    case "WON":
      return "bg-green-50 text-green-700";
    case "LOST":
      return "bg-gray-100 text-gray-600";
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
      return "bg-blue-50 text-blue-700";
  }
}

function formatDateTime(
  value: string | null,
) {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
}) {
  const displayValue =
    value === null
    || value === undefined
    || value === ""
      ? "Not provided"
      : String(value);

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-gray-900">
        {displayValue}
      </p>
    </div>
  );
}

export default function LeadDetailWorkspace({
  leadId,
}: LeadDetailWorkspaceProps) {
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
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    isNotFound,
    setIsNotFound,
  ] =
    useState(false);

  useEffect(
    () => {
      const controller =
        new AbortController();

      async function loadLead() {
        setIsLoading(true);
        setError("");
        setIsNotFound(false);

        try {
          const response =
            await fetch(
              `/api/leads/${encodeURIComponent(leadId)}`,
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
            | LeadResponse
            | null = null;

          try {
            payload =
              await response.json();
          } catch {
            payload = null;
          }

          if (
            response.status
            === 404
          ) {
            setIsNotFound(true);

            return;
          }

          if (
            !response.ok
            || !payload?.success
            || !payload.data
          ) {
            throw new Error(
              payload?.message
              ?? "Unable to retrieve lead.",
            );
          }

          setLead(
            payload.data,
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
              : "Unable to retrieve lead.",
          );
        } finally {
          setIsLoading(false);
        }
      }

      void loadLead();

      return () => {
        controller.abort();
      };
    },
    [
      leadId,
      router,
    ],
  );

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-5 w-40 rounded bg-gray-100" />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from(
              {
                length: 6,
              },
            ).map(
              (
                _,
                index,
              ) => (
                <div
                  key={index}
                  className="h-24 rounded-2xl bg-gray-100"
                />
              ),
            )}
          </div>
        </div>
      </section>
    );
  }

  if (isNotFound) {
    return (
      <section className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
          Lead not found
        </p>

        <h2 className="mt-3 text-2xl font-bold text-gray-950">
          This CRM lead could not be found.
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
          The record may have been removed or the lead link may be invalid.
        </p>

        <Link
          href="/leads"
          className="mt-6 inline-flex rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
        >
          Return to Leads
        </Link>
      </section>
    );
  }

  if (
    error
    || !lead
  ) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <p className="font-bold text-red-700">
          Lead details could not be loaded
        </p>

        <p className="mt-2 text-sm text-red-600">
          {error
            || "Unable to retrieve lead."}
        </p>

        <Link
          href="/leads"
          className="mt-5 inline-flex rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-700"
        >
          Back to Leads
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                  lead.status,
                )}`}
              >
                {formatLabel(
                  lead.status,
                )}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${temperatureClass(
                  lead.temperature,
                )}`}
              >
                {formatLabel(
                  lead.temperature,
                )}
              </span>
            </div>

            <h2 className="mt-4 break-words text-2xl font-bold text-gray-950 md:text-3xl">
              {lead.fullName}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              CRM Lead ID:{" "}
              <span className="break-all font-mono">
                {lead.id}
              </span>
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              AI Lead Score
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-950">
              {lead.aiScore
                === null
                ? "Not scored"
                : `${lead.aiScore}%`}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-950">
            Contact & requirement
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Prospect contact details and current property requirement.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DetailItem
            label="Email"
            value={
              lead.email
            }
          />

          <DetailItem
            label="Phone"
            value={
              lead.phone
            }
          />

          <DetailItem
            label="Source"
            value={
              lead.source
            }
          />

          <DetailItem
            label="Property interest"
            value={
              lead.interest
            }
          />

          <DetailItem
            label="Budget"
            value={
              lead.budget
            }
          />

          <DetailItem
            label="Preferred location"
            value={
              lead.location
            }
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
          <h3 className="text-lg font-bold text-gray-950">
            Ownership
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Created by"
              value={
                lead.createdBy
                  ?.fullName
                ?? "System / unavailable"
              }
            />

            <DetailItem
              label="Creator role"
              value={
                lead.createdBy
                  ?.role
                ?? null
              }
            />

            <DetailItem
              label="Assigned to"
              value={
                lead.assignedTo
                  ?.fullName
                ?? "Unassigned"
              }
            />

            <DetailItem
              label="Assigned at"
              value={
                lead.assignedAt
                  ? formatDateTime(
                      lead.assignedAt,
                    )
                  : "Not assigned"
              }
            />
          </div>

          {lead.assignedTo ? (
            <p className="mt-4 text-xs text-gray-500">
              Assignee account:{" "}
              {lead.assignedTo
                .isActive
                ? "Active"
                : "Inactive"}
              {" · "}
              {lead.assignedTo.role}
            </p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
          <h3 className="text-lg font-bold text-gray-950">
            Record lifecycle
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Created"
              value={
                formatDateTime(
                  lead.createdAt,
                )
              }
            />

            <DetailItem
              label="Last updated"
              value={
                formatDateTime(
                  lead.updatedAt,
                )
              }
            />

            <DetailItem
              label="Closed"
              value={
                lead.closedAt
                  ? formatDateTime(
                      lead.closedAt,
                    )
                  : "Open"
              }
            />

            <DetailItem
              label="Loss reason"
              value={
                lead.lossReason
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
        <h3 className="text-lg font-bold text-gray-950">
          Notes
        </h3>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
          {lead.notes
            || "No notes have been added to this lead."}
        </p>
      </section>
    </div>
  );
}
