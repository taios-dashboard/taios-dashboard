type DashboardCardProps = {
  title: string;
  value: string;
  change: string;
};

export default function DashboardCard({
  title,
  value,
  change,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-3 flex items-end justify-between">
        <h3 className="text-3xl font-bold text-gray-950">{value}</h3>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
          {change}
        </span>
      </div>
    </div>
  );
}
