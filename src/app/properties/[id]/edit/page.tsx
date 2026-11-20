import AppLayout from "@/components/AppLayout";
import EditPropertyForm from "@/components/EditPropertyForm";
import PageHeader from "@/components/PageHeader";

type EditPropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
  const {
    id,
  } =
    await params;

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Property Management"
        title="Edit Property"
        description="Maintain property pricing, availability, specifications, marketing priority, and catalogue information."
        actionLabel="Back to Properties"
        actionHref="/properties"
      />

      <EditPropertyForm
        propertyId={id}
      />
    </AppLayout>
  );
}
