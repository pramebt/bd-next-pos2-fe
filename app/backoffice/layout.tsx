import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function BackOfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <aside className="w-64  hidden lg:flex">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
