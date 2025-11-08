import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardHeader } from './Header';
import { DashboardSidebar } from './Sidebar';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Sticky at top */}
      <DashboardHeader onMenuClick={handleToggleSidebar} />

      <div className="flex">
        {/* Sidebar - Fixed on desktop, overlay on mobile */}
        <DashboardSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

        {/* Main Content Area */}
        <main className="flex-1 w-full lg:pl-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}