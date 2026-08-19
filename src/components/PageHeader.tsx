type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
}: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950 md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">{description}</p>
      </div>

      {actionLabel ? (
        <button className="w-fit self-start rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 md:self-auto">
          {actionLabel}
        </button>
      ) : null}
    </header>
  );
}
