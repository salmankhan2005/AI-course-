import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import Logo from "@/components/Logo";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 ml-64">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-border">
          <Logo size="small" />
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
