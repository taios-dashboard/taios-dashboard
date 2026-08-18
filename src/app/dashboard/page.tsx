import AppLayout from "@/components/AppLayout";
import DashboardCard from "@/components/DashboardCard";
import AISummary from "@/components/AISummary";
import RecentLeads from "@/components/RecentLeads";
import AIRecommendation from "@/components/AIRecommendation";
import {
  aiFollowUpMessage,
  aiRecommendation,
  aiSummary,
  dashboardStats,
  recentLeads,
} from "@/data/mockData";

export default function DashboardPage() {
  return (
    <AppLayout>
      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
            Executive Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950 md:text-4xl">
            Welcome to TAIOS
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Tobee&apos;s AI-powered real estate operating system for leads,
            property intelligence, inspections, marketing, and reporting.
          </p>
        </div>

        <button className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700">
          Add New Lead
        </button>
      </header>

      <AISummary summary={aiSummary} />

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <DashboardCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <RecentLeads leads={recentLeads} />

        <AIRecommendation
          recommendation={aiRecommendation}
          followUpMessage={aiFollowUpMessage}
        />
      </section>
    </AppLayout>
  );
}
