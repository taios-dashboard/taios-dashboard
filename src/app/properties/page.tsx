import AppLayout from "@/components/AppLayout";

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
      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
            Property Intelligence
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950 md:text-4xl">
            Properties
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Manage property listings and prepare them for AI matching,
            recommendations, inspections, and marketing.
          </p>
        </div>

        <button className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700">
          Add Property
        </button>
      </header>

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
