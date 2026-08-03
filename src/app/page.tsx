import Image from "next/image";

const leads = [
  {
    name: "Chika Nwosu",
    budget: "₦35m",
    location: "Kubwa",
    interest: "3 Bedroom Duplex",
    score: 82,
    status: "Hot Lead",
  },
  {
    name: "Daniel Musa",
    budget: "₦18m",
    location: "Kurudu",
    interest: "Land / Investment",
    score: 64,
    status: "Warm Lead",
  },
  {
    name: "Amaka Obi",
    budget: "₦55m",
    location: "Lokogoma",
    interest: "Family Home",
    score: 91,
    status: "Hot Lead",
  },
];

const stats = [
  {
    title: "Total Leads",
    value: "128",
    detail: "+18 this week",
  },
  {
    title: "Hot Leads",
    value: "34",
    detail: "Need fast follow-up",
  },
  {
    title: "Inspections",
    value: "12",
    detail: "Pending confirmation",
  },
  {
    title: "AI Reports",
    value: "7",
    detail: "Generated this month",
  },
];

const navItems = [
  "Dashboard",
  "Leads",
  "Properties",
  "Inspections",
  "Content Generator",
  "Reports",
  "Settings",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-zinc-200 bg-black p-6 text-white lg:block">
          <div className="mb-8 rounded-2xl bg-white p-3">
            <Image
              src="/images/tobee-logo.jpg"
              alt="Tobee Empires logo"
              width={130}
              height={50}
              className="mx-auto h-20 w-auto object-contain"
              priority
            />
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
              TAIOS
            </p>
            <h1 className="mt-2 text-2xl font-bold">Tobee AI OS</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Real estate intelligence dashboard
            </p>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => (
              <div
                key={item}
                className={`rounded-xl px-4 py-3 transition ${
                  item === "Dashboard"
                    ? "bg-red-600 font-semibold text-white shadow-lg shadow-red-900/30"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm font-semibold text-white">MVP Focus</p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Lead capture, AI qualification, property recommendation, follow-up
              messages, content generation, and reports.
            </p>
          </div>
        </aside>

        <section className="flex-1 p-6 lg:p-10">
          <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold text-red-600">
                Tobee Empires AI Operating System
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-black lg:text-4xl">
                Executive Dashboard
              </h2>
              <p className="mt-2 max-w-2xl text-zinc-600">
                Capture leads, qualify buyers, recommend properties, generate
                follow-up messages, and monitor sales opportunities.
              </p>
            </div>

            <button className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-700">
              Add New Lead
            </button>
          </header>

          <section className="mb-8 rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold text-red-600">
                  Today&apos;s AI Summary
                </p>
                <h3 className="mt-2 text-2xl font-bold text-black">
                  34 leads need sales attention
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
                  The AI has identified strong buyer interest around Kubwa,
                  Lokogoma, and Kurudu. Hot leads should be contacted within 24
                  hours, while warm leads should receive a follow-up message and
                  suitable property options.
                </p>
              </div>

              <div className="rounded-2xl bg-black p-5 text-white">
                <p className="text-sm font-semibold text-red-500">
                  Recommended Priority
                </p>
                <h4 className="mt-2 text-xl font-bold">Book inspections</h4>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Focus on leads with ₦30m–₦60m budget range and short purchase
                  timeline.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <DashboardCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                detail={stat.detail}
              />
            ))}
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-black">Recent Leads</h3>
                  <p className="text-sm text-zinc-500">
                    AI-qualified buyer enquiries
                  </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  Live Preview
                </span>
              </div>

              <div className="space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead.name}
                    className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <h4 className="font-semibold text-black">
                          {lead.name}
                        </h4>
                        <p className="mt-1 text-sm text-zinc-500">
                          {lead.interest} • {lead.location} • {lead.budget}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            lead.status === "Hot Lead"
                              ? "bg-red-600 text-white"
                              : "bg-amber-300 text-black"
                          }`}
                        >
                          {lead.status}
                        </span>
                        <span className="text-sm font-medium text-zinc-700">
                          Score: {lead.score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-black">
                AI Recommendation
              </h3>
              <p className="mt-2 text-sm text-zinc-500">
                Sample output from the Property Recommendation Agent.
              </p>

              <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-5">
                <p className="text-sm font-semibold text-red-700">
                  Recommended Action
                </p>
                <h4 className="mt-2 text-lg font-bold text-black">
                  Prioritize Chika Nwosu
                </h4>
                <p className="mt-3 text-sm leading-6 text-zinc-700">
                  Chika has a strong budget fit, clear location preference, and
                  short purchase timeline. Recommend Kubwa or Lokogoma options
                  and schedule inspection within 24 hours.
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-semibold text-red-700">
                  Follow-up Message
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-700">
                  Hello Chika, thank you for your interest in Tobee Empires.
                  Based on your ₦35m budget and interest in a 3 Bedroom Duplex,
                  we have suitable options around Kubwa and Lokogoma. Would you
                  be available for an inspection this week?
                </p>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <h3 className="mt-3 text-3xl font-bold text-black">{value}</h3>
      <p className="mt-2 text-sm font-semibold text-red-600">{detail}</p>
    </div>
  );
}
