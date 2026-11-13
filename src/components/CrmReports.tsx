"use client";

import { useEffect, useState } from "react";
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

type FollowUpStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";

type InspectionStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

type DashboardReport = {
  totalLeads: number;
  openLeads: number;
  closedLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  pipeline: Record<
    LeadStatus,
    number
  >;
  inspections: {
    total: number;
    PENDING: number;
    CONFIRMED: number;
    COMPLETED: number;
    CANCELLED: number;
  };
};

type CrmReportData = {
  generatedAt: string;
  dashboard: DashboardReport;
  temperatures: Record<
    LeadTemperature,
    number
  >;
  followUps: {
    total: number;
    byStatus: Record<
      FollowUpStatus,
      number
    >;
  };
  properties: {
    total: number;
    byStatus: Record<
      string,
      number
    >;
    interestLinks: number;
  };
  aiActivity: {
    total: number;
    byFeature: Record<
      string,
      number
    >;
  };
  salesOpportunities: {
    hotLeads: number;
    qualifiedLeads: number;
    inspectionBookedLeads: number;
    activeOpportunities: number;
  };
};

type CrmReportResponse = {
  success: boolean;
  message?: string;
  data?: CrmReportData;
};

const pipelineOrder:
  LeadStatus[] = [
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "INSPECTION_BOOKED",
    "WON",
    "LOST",
  ];

const temperatureOrder:
  LeadTemperature[] = [
    "HOT",
    "WARM",
    "COLD",
  ];

const followUpOrder:
  FollowUpStatus[] = [
    "PENDING",
    "COMPLETED",
    "CANCELLED",
  ];

const inspectionOrder:
  InspectionStatus[] = [
    "PENDING",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
  ];

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

function percentage(
  count: number,
  total: number,
) {
  if (total <= 0) {
    return 0;
  }

  return Math.round(
    (count / total) * 100,
  );
}

function MetricRow({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const share =
    percentage(
      count,
      total,
    );

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-gray-700">
          {label}
        </span>

        <span className="text-gray-500">
          {count} · {share}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gray-900"
          style={{
            width:
              `${share}%`,
          }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-gray-950">
        {value}
      </p>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        {description}
      </p>
    </div>
  );
}

function ReportPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-950">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-6 text-gray-500">
        {description}
      </p>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

export default function CrmReports() {
  const router =
    useRouter();

  const [report, setReport] =
    useState<
      CrmReportData | null
    >(null);

  const [error, setError] =
    useState("");

  const [forbidden, setForbidden] =
    useState(false);

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadReport() {
      try {
        const response =
          await fetch(
            "/api/reports/crm-summary",
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        let payload:
          | CrmReportResponse
          | null = null;

        try {
          payload =
            await response.json();
        } catch {
          payload = null;
        }

        if (
          response.status ===
          401
        ) {
          router.replace(
            "/login?next=/reports",
          );

          return;
        }

        if (
          response.status ===
          403
        ) {
          setForbidden(true);
          setError(
            payload?.message
            ?? "You do not have permission to view reports.",
          );

          return;
        }

        if (
          !response.ok
          || !payload?.success
          || !payload.data
        ) {
          throw new Error(
            payload?.message
            ?? "Unable to load CRM reports.",
          );
        }

        setReport(
          payload.data,
        );
      } catch (loadError) {
        if (
          loadError instanceof
            DOMException
          && loadError.name ===
            "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load CRM reports.",
        );
      }
    }

    void loadReport();

    return () => {
      controller.abort();
    };
  }, [router]);

  if (forbidden) {
    return (
      <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-bold text-amber-950">
          Reports access restricted
        </h2>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          {error}
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-red-900">
          Reports unavailable
        </h2>

        <p className="mt-2 text-sm leading-6 text-red-700">
          {error}
        </p>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          "Conversion Rate",
          "Active Opportunities",
          "Hot Leads",
          "Property Interests",
        ].map(
          (title) => (
            <MetricCard
              key={title}
              title={title}
              value="—"
              description="Loading live CRM data…"
            />
          ),
        )}
      </section>
    );
  }

  const {
    dashboard,
    temperatures,
    followUps,
    properties,
    aiActivity,
    salesOpportunities,
  } = report;

  const propertyEntries =
    Object.entries(
      properties.byStatus,
    ).sort(
      (left, right) =>
        right[1] - left[1],
    );

  const aiEntries =
    Object.entries(
      aiActivity.byFeature,
    ).sort(
      (left, right) =>
        right[1] - left[1],
    );

  const generatedAt =
    new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    ).format(
      new Date(
        report.generatedAt,
      ),
    );

  return (
    <div className="mt-6 space-y-6">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Conversion Rate"
          value={`${dashboard.conversionRate}%`}
          description={`${dashboard.wonLeads} won from ${dashboard.totalLeads} total leads.`}
        />

        <MetricCard
          title="Active Opportunities"
          value={String(
            salesOpportunities.activeOpportunities,
          )}
          description="Qualified leads plus leads already at inspection stage."
        />

        <MetricCard
          title="Hot Leads"
          value={String(
            salesOpportunities.hotLeads,
          )}
          description="Priority prospects currently marked as hot."
        />

        <MetricCard
          title="Property Interests"
          value={String(
            properties.interestLinks,
          )}
          description="Lead-to-property interest relationships currently recorded."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ReportPanel
          title="Lead Pipeline"
          description="Distribution of leads across the complete CRM conversion journey."
        >
          <div className="space-y-5">
            {pipelineOrder.map(
              (status) => (
                <MetricRow
                  key={status}
                  label={formatLabel(
                    status,
                  )}
                  count={
                    dashboard.pipeline[
                      status
                    ]
                  }
                  total={
                    dashboard.totalLeads
                  }
                />
              ),
            )}
          </div>
        </ReportPanel>

        <ReportPanel
          title="Lead Quality"
          description="Current lead temperature distribution for sales prioritisation."
        >
          <div className="space-y-5">
            {temperatureOrder.map(
              (temperature) => (
                <MetricRow
                  key={temperature}
                  label={formatLabel(
                    temperature,
                  )}
                  count={
                    temperatures[
                      temperature
                    ]
                  }
                  total={
                    dashboard.totalLeads
                  }
                />
              ),
            )}
          </div>
        </ReportPanel>

        <ReportPanel
          title="Follow-up Execution"
          description={`${followUps.total} total follow-up records across the CRM.`}
        >
          <div className="space-y-5">
            {followUpOrder.map(
              (status) => (
                <MetricRow
                  key={status}
                  label={formatLabel(
                    status,
                  )}
                  count={
                    followUps.byStatus[
                      status
                    ]
                  }
                  total={
                    followUps.total
                  }
                />
              ),
            )}
          </div>
        </ReportPanel>

        <ReportPanel
          title="Inspection Funnel"
          description={`${dashboard.inspections.total} inspections recorded across all leads.`}
        >
          <div className="space-y-5">
            {inspectionOrder.map(
              (status) => (
                <MetricRow
                  key={status}
                  label={formatLabel(
                    status,
                  )}
                  count={
                    dashboard.inspections[
                      status
                    ]
                  }
                  total={
                    dashboard.inspections
                      .total
                  }
                />
              ),
            )}
          </div>
        </ReportPanel>

        <ReportPanel
          title="Property Portfolio"
          description={`${properties.total} properties with ${properties.interestLinks} recorded lead interests.`}
        >
          {propertyEntries.length > 0 ? (
            <div className="space-y-5">
              {propertyEntries.map(
                ([
                  status,
                  count,
                ]) => (
                  <MetricRow
                    key={status}
                    label={formatLabel(
                      status,
                    )}
                    count={count}
                    total={
                      properties.total
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <p className="text-sm leading-6 text-gray-500">
              No property inventory has been recorded yet.
            </p>
          )}
        </ReportPanel>

        <ReportPanel
          title="AI Activity"
          description={`${aiActivity.total} AI requests recorded by TAIOS.`}
        >
          {aiEntries.length > 0 ? (
            <div className="space-y-5">
              {aiEntries.map(
                ([
                  feature,
                  count,
                ]) => (
                  <MetricRow
                    key={feature}
                    label={formatLabel(
                      feature,
                    )}
                    count={count}
                    total={
                      aiActivity.total
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <p className="text-sm leading-6 text-gray-500">
              No AI activity has been recorded yet.
            </p>
          )}
        </ReportPanel>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-950">
              Operational Snapshot
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Live management indicators derived from current CRM records.
            </p>
          </div>

          <p className="text-xs font-medium text-gray-400">
            Generated {generatedAt}
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-gray-50 p-5">
            <p className="text-sm text-gray-500">
              Open leads
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-950">
              {dashboard.openLeads}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-5">
            <p className="text-sm text-gray-500">
              Pending follow-ups
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-950">
              {followUps.byStatus.PENDING}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-5">
            <p className="text-sm text-gray-500">
              Completed inspections
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-950">
              {dashboard.inspections.COMPLETED}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-5">
            <p className="text-sm text-gray-500">
              Lost leads
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-950">
              {dashboard.lostLeads}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
