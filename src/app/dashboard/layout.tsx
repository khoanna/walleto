// app/(dashboard)/layout.tsx
import Sidebar from "@/components/dashboard/Sidebar";
import RequireAuth from "@/components/RequireAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr] bg-foreground text-text">
      <Sidebar />
      <main className="h-screen overflow-auto">
        <RequireAuth>
          {children}
        </RequireAuth>
      </main>
    </div>
  );
}
