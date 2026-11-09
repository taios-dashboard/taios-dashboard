import AppLayout from "@/components/AppLayout";
import LiveLeads from "@/components/LiveLeads";
import PageHeader from "@/components/PageHeader";

export default function LeadsPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Lead Management"
        title="Leads"
        description="View live CRM prospects, buyer interests, pipeline stages, assignments, budgets, locations, and AI lead scores."
        actionLabel="Add Lead"
      />

      <LiveLeads />
    </AppLayout>
  );
}
