// ===== ADMIN LAYOUT =====
// Sidebar layout for all admin pages. Contains navigation links.

import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  MessageSquare,
  Receipt,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/inventory", label: "Manage Inventory", icon: Car },
  { to: "/admin/add-car", label: "Add New Car", icon: PlusCircle },
  { to: "/admin/inquiries", label: "View Inquiries", icon: MessageSquare },
  { to: "/admin/transactions", label: "Transactions", icon: Receipt },
];

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Admin header */}
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
        <Car className="h-6 w-6 text-sidebar-primary" />
        <span className="font-heading text-lg font-bold text-sidebar-foreground">Admin Panel</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(link.to)
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Back to site */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <span className="font-heading font-semibold text-foreground">Admin Panel</span>
        </header>

        <main className="flex-1 bg-background p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
