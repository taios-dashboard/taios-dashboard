import Image from "next/image";

const navItems = [
  "Dashboard",
  "Leads",
  "Properties",
  "Inspections",
  "Content Generator",
  "Ads Generator",
  "Reports",
  "Settings",
];

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 flex-col bg-black px-6 py-6 text-white lg:flex">
      <div className="mb-8 rounded-2xl bg-white p-3">
        <Image
          src="/images/tobee-logo.jpg"
          alt="Tobee Empires logo"
          width={150}
          height={60}
          className="mx-auto h-24 w-auto object-contain"
          priority
        />
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
          TAIOS
        </p>
        <h1 className="mt-2 text-2xl font-bold">Tobee AI OS</h1>
        <p className="mt-2 text-sm text-gray-400">
          AI-powered real estate operating system.
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item}
            className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
              item === "Dashboard"
                ? "bg-red-600 text-white"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold">AI Status</p>
        <p className="mt-1 text-xs text-gray-400">
          Lead scoring, content support, and reporting are active in prototype
          mode.
        </p>
      </div>
    </aside>
  );
}
