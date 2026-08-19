import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-100 text-gray-950">
      <MobileHeader />

      <div className="flex min-w-0">
        <Sidebar />

        <section className="min-h-screen min-w-0 flex-1 overflow-x-hidden px-5 py-6 lg:px-8">
          {children}
        </section>
      </div>
    </main>
  );
}
