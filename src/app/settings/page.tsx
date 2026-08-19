import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";

const settingsSections = [
  {
    title: "Company Profile",
    description:
      "Manage Tobee Empires business information, branding, contact details, and operating locations.",
  },
  {
    title: "User Roles",
    description:
      "Prepare access levels for Super Admin, Admin, Sales, Marketing, and Management users.",
  },
  {
    title: "AI Configuration",
    description:
      "Control AI tone, content rules, property recommendation behavior, and approved business knowledge.",
  },
  {
    title: "Security Settings",
    description:
      "Prepare login protection, role permissions, audit logs, and API access controls for backend integration.",
  },
];

export default function SettingsPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="System Configuration"
        title="Settings"
        description="Configure company profile, user roles, AI behavior, security settings, and backend-ready system preferences."
      />

      <section className="grid gap-5 md:grid-cols-2">
        {settingsSections.map((section) => (
          <div
            key={section.title}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-950">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {section.description}
            </p>

            <button className="mt-5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              Configure
            </button>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-950">
          Backend Security Readiness
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          This frontend is being prepared to connect to a secure backend with
          authentication, role-based access control, validated API requests,
          Swagger documentation, audit logs, and protected AI processing.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-700">
            Auth-ready UI
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-700">
            Role-based structure
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-700">
            Secure API planning
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
