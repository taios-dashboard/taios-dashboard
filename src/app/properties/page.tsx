import AppLayout from "@/components/AppLayout";
import LiveProperties from "@/components/LiveProperties";
import PageHeader from "@/components/PageHeader";

export default function PropertiesPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Property Intelligence"
        title="Properties"
        description="Browse and manage the live TAIOS property catalogue for matching, inspections, recommendations, and marketing."
        actionLabel="Add Property"
      />

      <LiveProperties />
    </AppLayout>
  );
}
