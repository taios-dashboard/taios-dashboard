import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";

const settingsSections = [
  {
    title: "Company Profile",
    status: "Business workspace",
    description:
      "Tobee Empires business identity, operating information, branding, and locations used across the TAIOS workspace.",
  },
  {
    title: "User Roles",
    status: "Access controlled",
    description:
      "Structured access for Super Admin, Admin, Sales, Marketing, and Management responsibilities.",
  },
  {
    title: "AI Configuration",
    status: "Provider controlled",
    description:
      "AI tone, approved business knowledge, content rules, and recommendation behaviour can be managed when AI provider access is enabled.",
  },
  {
    title: "Security",
    status: "Protected",
    description:
      "TAIOS uses authenticated sessions and protected backend API access for CRM operations.",
  },
];

export default function SettingsPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="System Configuration"
        title="Settings"
        description="Review the core business, access, AI, and security controls that support the TAIOS operating environment."
      />

      <section className="grid gap-5 md:grid-cols-2">
        {settingsSections.map(
          (section) => (
            <article
              key={section.title}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-950">
                  {section.title}
                </h2>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                  {section.status}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {section.description}
              </p>
            </article>
          ),
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            Platform Security
          </p>

          <h2 className="mt-2 text-xl font-bold text-gray-950">
            Secure CRM access is active
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            User credentials are verified by the TAIOS backend.
            Browser sessions use an HTTP-only authentication cookie,
            while protected CRM requests are routed through the
            application&apos;s server-side API layer.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="font-bold text-gray-900">
              Authenticated access
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Protected staff login for the operating workspace.
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="font-bold text-gray-900">
              HTTP-only session
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Authentication tokens are not exposed to browser storage.
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="font-bold text-gray-900">
              Protected API routes
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              CRM operations pass through authenticated server routes.
            </p>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
