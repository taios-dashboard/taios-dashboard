import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";

const contentIdeas = [
  {
    title: "Property Promo Caption",
    description:
      "Generate social media captions for available properties and inspection campaigns.",
  },
  {
    title: "Real Estate Education Post",
    description:
      "Create buyer education content about land, duplexes, apartments, and investment decisions.",
  },
  {
    title: "WhatsApp Broadcast",
    description:
      "Prepare short promotional messages for Tobee's WhatsApp audience.",
  },
];

export default function ContentGeneratorPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Marketing AI"
        title="Content Generator"
        description="Generate real estate captions, educational posts, WhatsApp messages, property descriptions, and sales content."
        actionLabel="Generate Content"
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950">Generate Content</h2>
          <p className="mt-1 text-sm text-gray-500">
            Prototype form. Backend AI connection will come later.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Content Type
              </label>
              <select className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500">
                <option>Property Promo Caption</option>
                <option>Real Estate Education Post</option>
                <option>WhatsApp Broadcast</option>
                <option>Property Description</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Topic / Property
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-500"
                placeholder="Example: 3-bedroom duplex in Calabar"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Tone
              </label>
              <select className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500">
                <option>Professional</option>
                <option>Persuasive</option>
                <option>Luxury</option>
                <option>Friendly</option>
              </select>
            </div>

            <button className="w-full rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700">
              Generate Content
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950">AI Output Preview</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sample generated copy for Tobee marketing.
          </p>

          <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            Own a premium 3-bedroom duplex in Calabar with modern finishing,
            secure access, and excellent investment potential. Perfect for
            families, professionals, and investors looking for long-term value.
            Book an inspection with Tobee Empires today.
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {contentIdeas.map((idea) => (
          <div
            key={idea.title}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="font-bold text-gray-950">{idea.title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {idea.description}
            </p>
          </div>
        ))}
      </section>
    </AppLayout>
  );
}
