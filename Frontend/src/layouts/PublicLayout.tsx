// ===== PUBLIC LAYOUT =====
// Wraps all public pages with the Navbar and a footer.

import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Car } from "lucide-react";

const PublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Simple Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-6 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-accent" />
            <span className="font-heading font-semibold text-foreground">VisionCars</span>
          </div>
          <p>© 2026 VisionCars. Car Sell Management System
            - Developed by Sudem , Abhinav and Utsav
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
