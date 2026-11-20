import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import CrmDashboardSummary from "@/components/CrmDashboardSummary";
import DashboardRecentLeads from "@/components/DashboardRecentLeads";

const workspaceLinks = [
  {
    title: "Lead Pipeline",
    description:
      "Track enquiries from first contact through qualification, inspection and closing.",
    href: "/leads",
  },
  {
    title: "Property Catalogue",
    description:
      "Manage Tobee's available property inventory and buyer interests.",
    href: "/properties",
  },
  {
    title: "Inspection Schedule",
    description:
      "Review upcoming, confirmed and completed property inspections.",
    href: "/inspections",
  },
  {
    title: "CRM Reports",
    description:
      "Review conversion, pipeline, property and operating performance.",
    href: "/reports",
  },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Executive Dashboard"
        title="Welcome to TAIOS"
        description="Tobee's real estate operating system for leads, property intelligence, inspections, marketing workflows, and management reporting."
        actionLabel="Add New Lead"
        actionHref="/leads/new"
      />

      <CrmDashboardSummary />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <DashboardRecentLeads />

        <aside className="rounded-3xl bg-black p-6 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
            Operating Workspace
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Move from enquiry to close in one system
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-300">
            TAIOS connects lead management, property matching,
            inspection activity and reporting so management can
            follow the full customer journey.
          </p>

          <div className="mt-6 space-y-3">
            {workspaceLinks.map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <p className="font-bold text-white">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    {item.description}
                  </p>
                </Link>
              ),
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">
              AI Capability
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-300">
              AI-assisted content and campaign workflows are
              included in the TAIOS product direction. Live AI
              provider generation is not enabled in this demo
              environment.
            </p>
          </div>
        </aside>
      </section>
    </AppLayout>
  );
}
