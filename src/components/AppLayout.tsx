import Sidebar from "@/components/Sidebar";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-950">
      <div className="flex">
        <Sidebar />

        <section className="min-h-screen flex-1 px-5 py-6 lg:px-8">
          {children}
        </section>
      </div>
    </main>
  );
}
