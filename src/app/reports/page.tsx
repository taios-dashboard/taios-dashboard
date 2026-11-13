import AppLayout from "@/components/AppLayout";
import CrmReports from "@/components/CrmReports";
import PageHeader from "@/components/PageHeader";

export default function ReportsPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Executive Intelligence"
        title="Reports"
        description="Live CRM management analytics covering lead quality, conversion, follow-ups, inspections, property interest, and AI activity."
      />

      <CrmReports />
    </AppLayout>
  );
}
