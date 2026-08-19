import AppLayout from "@/components/AppLayout";
import { recentLeads } from "@/data/mockData";

export default function LeadsPage() {
  return (
    <AppLayout>
      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
            Lead Management
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950 md:text-4xl">
            Leads
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            View AI-qualified prospects, buyer interests, budgets, locations,
            and recommended follow-up priority.
          </p>
        </div>

        <button className="w-fit self-start rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 md:self-auto">
          Add Lead
        </button>
      </header>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-950">
              Recent Qualified Leads
            </h2>
            <p className="text-sm text-gray-500">
              Prototype data showing how TAIOS will organize prospects.
            </p>
          </div>

          <div className="w-fit rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
            {recentLeads.length} leads
          </div>
        </div>

        <div className="space-y-4 md:hidden">
          {recentLeads.map((lead) => (
            <article
              key={lead.name}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-950">{lead.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{lead.interest}</p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    lead.status === "Hot"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {lead.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Budget
                  </p>
                  <p className="mt-1 font-bold text-gray-950">{lead.budget}</p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Location
                  </p>
                  <p className="mt-1 font-bold text-gray-950">
                    {lead.location}
                  </p>
                </div>

                <div className="col-span-2 rounded-xl bg-white p-3">
                  <div className="mb-2 flex justify-between text-xs font-semibold text-gray-500">
                    <span>AI Lead Score</span>
                    <span>{lead.score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-red-600"
                      style={{ width: `${lead.score}%` }}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 md:block">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4">Interest</th>
                <th className="px-4 py-4">Budget</th>
                <th className="px-4 py-4">Location</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">AI Score</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {recentLeads.map((lead) => (
                <tr key={lead.name} className="bg-white">
                  <td className="px-4 py-4 font-semibold text-gray-950">
                    {lead.name}
                  </td>
                  <td className="px-4 py-4 text-gray-600">{lead.interest}</td>
                  <td className="px-4 py-4 text-gray-600">{lead.budget}</td>
                  <td className="px-4 py-4 text-gray-600">{lead.location}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        lead.status === "Hot"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-gray-950">
                    {lead.score}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}
