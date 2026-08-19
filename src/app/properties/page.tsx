import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";

const properties = [
  {
    title: "3-Bedroom Terrace Duplex",
    location: "Calabar",
    price: "₦85m",
    type: "Duplex",
    status: "Available",
  },
  {
    title: "Land Investment Plot",
    location: "Abuja",
    price: "₦25m",
    type: "Land",
    status: "Available",
  },
  {
    title: "Luxury Apartment",
    location: "Lagos",
    price: "₦120m",
    type: "Apartment",
    status: "Featured",
  },
];

export default function PropertiesPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Property Intelligence"
        title="Properties"
        description="Manage property listings and prepare them for AI matching, recommendations, inspections, and marketing."
        actionLabel="Add Property"
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <div
            key={property.title}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  {property.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {property.location}
                </p>
              </div>

              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                {property.status}
              </span>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Price</p>
              <p className="mt-1 text-2xl font-bold text-gray-950">
                {property.price}
              </p>
            </div>

            <p className="mt-4 text-sm font-medium text-gray-600">
              Type: {property.type}
            </p>
          </div>
        ))}
      </section>
    </AppLayout>
  );
}
