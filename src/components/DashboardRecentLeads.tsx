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

type DashboardLead = {
  id: string;
  fullName: string;
  interest: string | null;
  budget: string | null;
  location: string | null;
  source: string | null;
  status: LeadStatus;
  temperature: LeadTemperature;
};

type LeadsResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
  leads?: unknown;
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object"
    && value !== null
    && !Array.isArray(value)
  );
}

function isLeadStatus(
  value: unknown,
): value is LeadStatus {
  return (
    value === "NEW"
    || value === "CONTACTED"
    || value === "QUALIFIED"
    || value === "INSPECTION_BOOKED"
    || value === "WON"
    || value === "LOST"
  );
}

function isLeadTemperature(
  value: unknown,
): value is LeadTemperature {
  return (
    value === "HOT"
    || value === "WARM"
    || value === "COLD"
  );
}

function nullableString(
  value: unknown,
) {
  return typeof value === "string"
    ? value
    : null;
}

function toDashboardLead(
  value: unknown,
): DashboardLead | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string"
    || typeof value.fullName !== "string"
    || !isLeadStatus(value.status)
    || !isLeadTemperature(
      value.temperature,
    )
  ) {
    return null;
  }

  return {
    id: value.id,
    fullName: value.fullName,
    interest:
      nullableString(
        value.interest,
      ),
    budget:
      nullableString(
        value.budget,
      ),
    location:
      nullableString(
        value.location,
      ),
    source:
      nullableString(
        value.source,
      ),
    status: value.status,
    temperature:
      value.temperature,
  };
}

function getLeadCandidates(
  payload: LeadsResponse,
): unknown[] {
  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (
    isRecord(payload.data)
    && Array.isArray(
      payload.data.leads,
    )
  ) {
    return payload.data.leads;
  }

  if (Array.isArray(payload.leads)) {
    return payload.leads;
  }

  return [];
}

function formatStatus(
  status: LeadStatus,
) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function temperatureClass(
  temperature: LeadTemperature,
) {
  if (temperature === "HOT") {
    return "bg-red-100 text-red-700";
  }

  if (temperature === "WARM") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-sky-100 text-sky-700";
}

export default function DashboardRecentLeads() {
  const router = useRouter();

  const [leads, setLeads] =
    useState<DashboardLead[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadLeads() {
      try {
        const response =
          await fetch(
            "/api/leads?limit=5&sort=newest",
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

        if (response.status === 401) {
          router.replace(
            "/login?next=/dashboard",
          );

          return;
        }

        if (
          !response.ok
          || !payload?.success
        ) {
          throw new Error(
            payload?.message
              ?? "Unable to load recent leads.",
          );
        }

        const parsed =
          getLeadCandidates(
            payload,
          )
            .map(toDashboardLead)
            .filter(
              (
                lead,
              ): lead is DashboardLead =>
                lead !== null,
            )
            .slice(0, 5);

        setLeads(parsed);
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
            : "Unable to load recent leads.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadLeads();

    return () => {
      controller.abort();
    };
  }, [router]);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            Live CRM
          </p>

          <h2 className="mt-2 text-lg font-bold text-gray-950">
            Recent Leads
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Latest prospects recorded in the TAIOS lead pipeline.
          </p>
        </div>

        <Link
          href="/leads"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          View all leads
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl bg-gray-100"
              />
            ),
          )}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="font-semibold text-red-700">
            Recent leads unavailable
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : null}

      {!loading
        && !error
        && leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <p className="font-semibold text-gray-900">
              No leads recorded yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              New CRM leads will appear here automatically.
            </p>

            <Link
              href="/leads/new"
              className="mt-4 inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Add first lead
            </Link>
          </div>
        ) : null}

      {!loading
        && !error
        && leads.length > 0 ? (
          <div className="space-y-3">
            {leads.map(
              (lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${encodeURIComponent(lead.id)}`}
                  className="block rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-gray-200 hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-950">
                        {lead.fullName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {lead.interest
                          ?? "General property enquiry"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {lead.location
                          ?? "Location not specified"}

                        {lead.budget
                          ? ` • ${lead.budget}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${temperatureClass(
                          lead.temperature,
                        )}`}
                      >
                        {lead.temperature}
                      </span>

                      <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-700">
                        {formatStatus(
                          lead.status,
                        )}
                      </span>
                    </div>
                  </div>

                  {lead.source ? (
                    <p className="mt-3 text-xs font-medium text-gray-400">
                      Source: {lead.source}
                    </p>
                  ) : null}
                </Link>
              ),
            )}
          </div>
        ) : null}
    </section>
  );
}
