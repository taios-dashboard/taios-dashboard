import AppLayout from "@/components/AppLayout";
import CreateLeadForm from "@/components/CreateLeadForm";
import PageHeader from "@/components/PageHeader";

export default function NewLeadPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Lead Management"
        title="Add Lead"
        description="Create a new CRM prospect and capture the information needed for qualification, follow-up, property matching, and conversion."
        actionLabel="Back to Leads"
        actionHref="/leads"
      />

      <CreateLeadForm />
    </AppLayout>
  );
}
