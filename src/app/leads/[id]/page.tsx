import AppLayout from "@/components/AppLayout";
import LeadDetailWorkspace from "@/components/LeadDetailWorkspace";
import PageHeader from "@/components/PageHeader";

type LeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LeadDetailPage({
  params,
}: LeadDetailPageProps) {
  const {
    id,
  } =
    await params;

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Lead Management"
        title="Lead Workspace"
        description="Review the live CRM record, contact information, ownership, pipeline state, and record history metadata for this prospect."
        actionLabel="Back to Leads"
        actionHref="/leads"
      />

      <LeadDetailWorkspace
        leadId={id}
      />
    </AppLayout>
  );
}
