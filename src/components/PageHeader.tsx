import Link from "next/link";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

const actionClassName =
  "w-fit self-start rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 md:self-auto";

export default function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
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

        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          {description}
        </p>
      </div>

      {actionLabel ? (
        actionHref ? (
          <Link
            href={actionHref}
            className={actionClassName}
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            className={actionClassName}
          >
            {actionLabel}
          </button>
        )
      ) : null}
    </header>
  );
}
