type AISummaryProps = {
  summary: string;
};

export default function AISummary({ summary }: AISummaryProps) {
  return (
    <section className="rounded-3xl bg-black p-6 text-white shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            Today&apos;s AI Summary
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            Executive intelligence overview
          </h2>
        </div>

        <span className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold">
          Live Prototype
        </span>
      </div>

      <p className="mt-5 max-w-3xl text-sm leading-6 text-gray-300">
        {summary}
      </p>
    </section>
  );
}
