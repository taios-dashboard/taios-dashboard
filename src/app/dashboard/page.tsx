import AppLayout from "@/components/AppLayout";
import AISummary from "@/components/AISummary";
import RecentLeads from "@/components/RecentLeads";
import AIRecommendation from "@/components/AIRecommendation";
import PageHeader from "@/components/PageHeader";
import CrmDashboardSummary from "@/components/CrmDashboardSummary";
import {
  aiFollowUpMessage,
  aiRecommendation,
  aiSummary,
  recentLeads,
} from "@/data/mockData";

export default function DashboardPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Executive Dashboard"
        title="Welcome to TAIOS"
        description="Tobee's AI-powered real estate operating system for leads, property intelligence, inspections, marketing, and reporting."
        actionLabel="Add New Lead"
      />

      <AISummary summary={aiSummary} />

      <CrmDashboardSummary />

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
