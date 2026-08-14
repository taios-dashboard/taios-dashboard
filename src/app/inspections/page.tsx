import Sidebar from "@/components/Sidebar";

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
    <main className="min-h-screen bg-gray-100 text-gray-950">
      <div className="flex">
        <Sidebar />

        <section className="min-h-screen flex-1 px-5 py-6 lg:px-8">
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
                Inspection Management
              </p>
              <h1 className="mt-2 text-3xl font-bold text-gray-950 md:text-4xl">
                Inspections
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Track property inspection bookings, client schedules, and AI
                follow-up reminders.
              </p>
            </div>

            <button className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700">
              Book Inspection
            </button>
          </header>

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
                    <h3 className="font-bold text-gray-950">
                      {inspection.client}
                    </h3>
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
        </section>
      </div>
    </main>
  );
}
