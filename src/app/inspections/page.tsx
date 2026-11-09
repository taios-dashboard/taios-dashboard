import AppLayout from "@/components/AppLayout";
import LiveInspections from "@/components/LiveInspections";
import PageHeader from "@/components/PageHeader";

export default function InspectionsPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Inspection Management"
        title="Inspections"
        description="Track live property inspection bookings, client schedules, property details, and inspection status."
        actionLabel="Book Inspection"
      />

      <LiveInspections />
    </AppLayout>
  );
}
