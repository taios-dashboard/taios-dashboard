"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/DashboardCard";

type LeadPipeline = {
  NEW: number;
  CONTACTED: number;
  QUALIFIED: number;
  INSPECTION_BOOKED: number;
  WON: number;
  LOST: number;
};

type InspectionSummary = {
  total: number;
  PENDING: number;
  CONFIRMED: number;
  COMPLETED: number;
  CANCELLED: number;
};

type CrmDashboardData = {
  totalLeads: number;
  openLeads: number;
  closedLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  pipeline: LeadPipeline;
  inspections: InspectionSummary;
};

type CrmDashboardResponse = {
  success: boolean;
  message?: string;
  data?: CrmDashboardData;
};

export default function CrmDashboardSummary() {
  const router = useRouter();

  const [summary, setSummary] =
    useState<CrmDashboardData | null>(
      null,
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadSummary() {
      try {
        const response =
          await fetch(
            "/api/dashboard/crm-summary",
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        let payload:
          | CrmDashboardResponse
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
            "/login?next=/dashboard",
          );

          return;
        }

        if (
          !response.ok ||
          !payload?.success ||
          !payload.data
        ) {
          throw new Error(
            payload?.message ??
              "Unable to load CRM summary.",
          );
        }

        setSummary(
          payload.data,
        );
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
            : "Unable to load CRM summary.",
        );
      }
    }

    void loadSummary();

    return () => {
      controller.abort();
    };
  }, [router]);

  if (error) {
    return (
      <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-semibold text-red-700">
          CRM summary unavailable
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      </section>
    );
  }

  if (!summary) {
    return (
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Leads"
          value="—"
          change="Loading"
        />

        <DashboardCard
          title="Won Leads"
          value="—"
          change="Loading"
        />

        <DashboardCard
          title="Closed Leads"
          value="—"
          change="Loading"
        />

        <DashboardCard
          title="Inspections"
          value="—"
          change="Loading"
        />
      </section>
    );
  }

  const cards = [
    {
      title: "Total Leads",
      value:
        String(
          summary.totalLeads,
        ),
      change:
        `${summary.openLeads} open`,
    },
    {
      title: "Won Leads",
      value:
        String(
          summary.wonLeads,
        ),
      change:
        `${summary.conversionRate}% conversion`,
    },
    {
      title: "Closed Leads",
      value:
        String(
          summary.closedLeads,
        ),
      change:
        `${summary.lostLeads} lost`,
    },
    {
      title: "Inspections",
      value:
        String(
          summary.inspections.total,
        ),
      change:
        `${summary.inspections.PENDING} pending`,
    },
  ];

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <DashboardCard
          key={card.title}
          title={card.title}
          value={card.value}
          change={card.change}
        />
      ))}
    </section>
  );
}
