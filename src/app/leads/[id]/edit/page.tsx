import AppLayout from "@/components/AppLayout";
import EditLeadForm from "@/components/EditLeadForm";
import PageHeader from "@/components/PageHeader";

type EditLeadPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditLeadPage({
  params,
}: EditLeadPageProps) {
  const {
    id,
  } =
    await params;

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Lead Management"
        title="Edit Lead"
        description="Update contact information, requirements and lead temperature without changing the controlled sales pipeline."
        actionLabel="Back to Lead"
        actionHref={`/leads/${id}`}
      />

      <EditLeadForm
        leadId={id}
      />
    </AppLayout>
  );
}
