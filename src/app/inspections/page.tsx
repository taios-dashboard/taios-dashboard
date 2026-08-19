import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";

const inspections = [
  {
    client: "Chika Nwosu",
    property: "3-Bedroom Terrace Duplex",
    date: "Today",
    time: "2:00 PM",
    status: "Confirmed",
  },
  {
    client: "Daniel Musa",
    property: "Land Investment Plot",
    date: "Tomorrow",
    time: "11:00 AM",
    status: "Pending",
  },
  {
    client: "Amaka Obi",
    property: "Luxury Apartment",
    date: "Friday",
    time: "4:30 PM",
    status: "Confirmed",
  },
];

export default function InspectionsPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Inspection Management"
        title="Inspections"
        description="Track property inspection bookings, client schedules, and AI follow-up reminders."
        actionLabel="Book Inspection"
      />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-950">
            Upcoming Inspections
          </h2>
          <p className="text-sm text-gray-500">
            Prototype schedule for sales and inspection coordination.
          </p>
        </div>

        <div className="space-y-4">
          {inspections.map((inspection) => (
            <div
              key={`${inspection.client}-${inspection.time}`}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 md:flex-row md:items-center"
            >
              <div>
                <h3 className="font-bold text-gray-950">{inspection.client}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {inspection.property}
                </p>
              </div>

              <div className="text-sm text-gray-600">
                {inspection.date} • {inspection.time}
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                  inspection.status === "Confirmed"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {inspection.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
