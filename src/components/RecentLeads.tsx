type Lead = {
  name: string;
  interest: string;
  budget: string;
  location: string;
  status: string;
  score: number;
};

type RecentLeadsProps = {
  leads: Lead[];
};

export default function RecentLeads({ leads }: RecentLeadsProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Recent Leads</h2>
          <p className="text-sm text-gray-500">
            AI-qualified prospects from Tobee channels.
          </p>
        </div>

        <button className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {leads.map((lead) => (
          <div
            key={lead.name}
            className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-950">{lead.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{lead.interest}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {lead.budget} • {lead.location}
                </p>
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

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-medium text-gray-500">
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
        ))}
      </div>
    </section>
  );
}
