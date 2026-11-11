import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import LeadActivityTimeline from "@/components/LeadActivityTimeline";
import LeadDetailWorkspace from "@/components/LeadDetailWorkspace";
import LeadAssignmentPanel from "@/components/LeadAssignmentPanel";
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
        description="Review the live CRM record, contact information, ownership, pipeline state, and recorded activity for this prospect."
        actionLabel="Back to Leads"
        actionHref="/leads"
      />

      <div className="space-y-6">
        <div className="flex justify-end">
          <Link
            href={`/leads/${id}/edit`}
            className="inline-flex rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            Edit Lead Details
          </Link>
        </div>

        <LeadDetailWorkspace
          leadId={id}
        />

      <LeadAssignmentPanel leadId={id} />

        <LeadActivityTimeline
          leadId={id}
        />
      </div>
    </AppLayout>
  );
}
