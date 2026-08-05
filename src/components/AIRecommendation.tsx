type AIRecommendationProps = {
  recommendation: string;
  followUpMessage: string;
};

export default function AIRecommendation({
  recommendation,
  followUpMessage,
}: AIRecommendationProps) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          AI Recommendation
        </p>
        <h2 className="mt-3 text-lg font-bold text-gray-950">
          Next best action
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {recommendation}
        </p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Follow-up Message
        </p>
        <h2 className="mt-3 text-lg font-bold text-gray-950">
          AI-generated sales message
        </h2>
        <p className="mt-3 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
          {followUpMessage}
        </p>
      </div>
    </section>
  );
}
