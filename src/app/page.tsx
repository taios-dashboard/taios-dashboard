import Link from "next/link";
import Image from "next/image";

const features = [
  {
    title: "AI Lead Management",
    description:
      "Capture, organize, and qualify real estate leads with AI-assisted scoring and follow-up recommendations.",
  },
  {
    title: "Property Intelligence",
    description:
      "Match prospects with suitable properties based on budget, location, interest, and investment intent.",
  },
  {
    title: "Ads Generator",
    description:
      "Create campaign copy for Facebook, Instagram, Google, WhatsApp, and retargeting campaigns.",
  },
  {
    title: "Content Generator",
    description:
      "Generate property captions, educational content, WhatsApp broadcasts, and sales messages.",
  },
  {
    title: "Inspection Management",
    description:
      "Track inspection bookings, client schedules, and next-step reminders for the sales team.",
  },
  {
    title: "Executive Reports",
    description:
      "View AI-assisted business summaries, lead performance, inspection pipeline, and marketing activity.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-950">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/images/tobee-logo.jpg"
              alt="Tobee Empires logo"
              width={120}
              height={50}
              className="h-12 w-auto object-contain"
              priority
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">
                TAIOS
              </p>
              <p className="text-sm font-semibold text-gray-700">
                Tobee AI Operating System
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-gray-600 md:flex">
            <a href="#features" className="hover:text-red-600">
              Features
            </a>
            <a href="#security" className="hover:text-red-600">
              Security
            </a>
            <Link href="/login" className="hover:text-red-600">
              Login
            </Link>
          </nav>

          <Link
            href="/login"
            className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            Sign In
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            AI-powered real estate operations
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-gray-950 md:text-6xl">
            Manage leads, properties, inspections, ads, content, and reports in
            one AI system.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600">
            TAIOS helps Tobee Empires and future real estate businesses improve
            sales follow-up, property recommendations, campaign creation, and
            executive reporting through a structured AI-powered dashboard.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-red-600 px-6 py-4 text-center text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
            >
              Sign In
            </Link>

            <Link
              href="/dashboard"
              className="rounded-full border border-gray-200 px-6 py-4 text-center text-sm font-bold text-gray-800 transition hover:bg-gray-50"
            >
              View Prototype Dashboard
            </Link>
          </div>

          <p className="mt-5 text-xs leading-5 text-gray-500">
            Prototype access is open for now. When backend authentication is
            added, dashboard pages will be protected.
          </p>
        </div>

        <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-5 shadow-sm">
          <div className="rounded-[1.5rem] bg-black p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              Today&apos;s AI Summary
            </p>
            <h2 className="mt-4 text-2xl font-bold">
              34 hot leads need priority follow-up.
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              TAIOS has identified strong buyer interest around duplexes, land
              investments, and luxury apartments. Recommended action: send
              inspection booking messages to hot leads within 24 hours.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Hot Leads</p>
              <p className="mt-2 text-3xl font-black text-gray-950">34</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Inspections</p>
              <p className="mt-2 text-3xl font-black text-gray-950">12</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">AI Reports</p>
              <p className="mt-2 text-3xl font-black text-gray-950">7</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Campaigns</p>
              <p className="mt-2 text-3xl font-black text-gray-950">23</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-gray-100 px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
              Core Modules
            </p>
            <h2 className="mt-3 text-3xl font-black text-gray-950 md:text-4xl">
              Built for real estate sales, marketing, and management.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-gray-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
              Security-aware foundation
            </p>
            <h2 className="mt-3 text-3xl font-black text-gray-950">
              Designed to connect to a protected backend.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Authentication-ready login",
              "Role-based access planning",
              "No secret keys in frontend",
              "Backend-owned AI calls",
              "Swagger/OpenAPI planned",
              "Audit logs and API protection planned",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-5 py-8 text-center text-sm text-gray-500">
        TAIOS — Tobee AI Operating System. Prototype frontend for Tobee Empires.
      </footer>
    </main>
  );
}
