import AppLayout from "@/components/AppLayout";
import CreatePropertyForm from "@/components/CreatePropertyForm";
import PageHeader from "@/components/PageHeader";

export default function NewPropertyPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Property Intelligence"
        title="Add Property"
        description="Add a property to the TAIOS catalogue for lead matching, inspections, recommendations, and marketing."
        actionLabel="Back to Properties"
        actionHref="/properties"
      />

      <CreatePropertyForm />
    </AppLayout>
  );
}
