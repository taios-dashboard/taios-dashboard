type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionCard({
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section
      className={`rounded-3xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}
