import AppLayout from "@/components/AppLayout";

const reportCards = [
  {
    title: "Lead Performance",
    value: "128",
    description: "Total captured leads across Tobee sales channels.",
  },
  {
    title: "Hot Lead Conversion",
    value: "34",
    description: "AI-qualified prospects ready for priority follow-up.",
  },
  {
    title: "Inspection Pipeline",
    value: "12",
    description: "Upcoming and pending property inspections.",
  },
  {
    title: "Marketing Outputs",
    value: "23",
    description: "Generated captions, ads, and campaign messages.",
  },
];

const insights = [
  "Duplex enquiries are currently stronger than apartment enquiries.",
  "Calabar and Abuja leads show the highest inspection intent.",
  "WhatsApp follow-up is recommended within 24 hours for hot leads.",
];

export default function ReportsPage() {
  return (
    <AppLayout>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
          Executive Intelligence
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950 md:text-4xl">
          Reports
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          View AI-assisted business reports covering leads, inspections,
          property interest, marketing activity, and sales opportunities.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-gray-500">{card.title}</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-950">
              {card.value}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {card.description}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950">
            AI Business Summary
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Prototype executive report generated from dashboard activity.
          </p>

          <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            TAIOS identifies strong buyer interest in duplexes, land
            investments, and luxury apartments. Hot leads should be prioritized
            for immediate sales follow-up, while warm leads should receive
            educational content and property comparison messages. Inspection
            booking activity is healthy and should be supported with WhatsApp
            reminders.
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950">
            Recommended Actions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Suggested next steps from the AI assistant.
          </p>

          <div className="mt-6 space-y-4">
            {insights.map((insight) => (
              <div
                key={insight}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm leading-6 text-gray-700"
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
