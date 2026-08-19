import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";

const adChannels = [
  {
    channel: "Facebook Ads",
    output: "Primary text, headline, description, CTA",
  },
  {
    channel: "Instagram Ads",
    output: "Caption, hook, hashtags, CTA",
  },
  {
    channel: "Google Ads",
    output: "Search headline, description, keywords",
  },
  {
    channel: "WhatsApp Campaign",
    output: "Broadcast message and follow-up copy",
  },
];

export default function AdsGeneratorPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Campaign AI"
        title="Ads Generator"
        description="Generate advertising copy for property campaigns across Facebook, Instagram, Google, WhatsApp, and retargeting channels."
        actionLabel="Generate Ads"
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950">
            Create Ad Campaign
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Prototype form. Backend AI generation will be connected later.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Platform
              </label>
              <select className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500">
                <option>Facebook</option>
                <option>Instagram</option>
                <option>Google</option>
                <option>WhatsApp</option>
                <option>Retargeting Campaign</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Property / Offer
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-500"
                placeholder="Example: Land investment plots in Abuja"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Target Audience
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-500"
                placeholder="Example: Investors, young families, diaspora buyers"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Campaign Goal
              </label>
              <select className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500">
                <option>Book Inspection</option>
                <option>Generate Leads</option>
                <option>Promote Property</option>
                <option>Drive WhatsApp Enquiries</option>
              </select>
            </div>

            <button className="w-full rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700">
              Generate Ads
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950">
            AI Ad Output Preview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Sample campaign copy generated for Tobee Empires.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                Primary Text
              </p>
              <p className="mt-3 text-sm leading-7 text-gray-700">
                Secure your future with verified land investment opportunities
                in Abuja. Tobee Empires helps you access strategic locations
                with strong growth potential and professional guidance from
                enquiry to inspection.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                Headline
              </p>
              <p className="mt-3 text-sm font-semibold text-gray-950">
                Invest in Abuja Land with Confidence
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                Call To Action
              </p>
              <p className="mt-3 text-sm text-gray-700">
                Send a message today to book an inspection.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {adChannels.map((item) => (
          <div
            key={item.channel}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="font-bold text-gray-950">{item.channel}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {item.output}
            </p>
          </div>
        ))}
      </section>
    </AppLayout>
  );
}
