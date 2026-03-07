// ===== MAIN APP ROUTER =====
// Defines all routes for the application.
//
// --- PHASE 2 BACKEND INTEGRATION ---
// 1. Wrap protected routes (dashboard, profile, admin) with an AuthGuard component
//    that checks for a valid JWT token in localStorage before allowing access.
// 2. Admin routes should additionally verify the user's role is "admin".
//
// Example AuthGuard:
//   const token = localStorage.getItem("token");
//   if (!token) return <Navigate to="/login" />;
//   // Optionally decode JWT to check role
//   return <Outlet />;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import Index from "./pages/Index";
import BrowseCars from "./pages/BrowseCars";
import CarDetails from "./pages/CarDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageInventory from "./pages/admin/ManageInventory";
import AddCarForm from "./pages/admin/AddCarForm";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminTransactions from "./pages/admin/AdminTransactions";
import ManageUsers from "./pages/admin/ManageUsers";

const queryClient = new QueryClient();

// Auth Guards
const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const AdminRoute = () => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  let user = null;

  if (userString) {
    try { user = JSON.parse(userString); } catch (e) { }
  }

  if (!token) return <Navigate to="/login" replace />;
  if (!user || user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ===== Public Routes ===== */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<BrowseCars />} />
              <Route path="/car/:id" element={<CarDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* ===== Admin Routes ===== */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="inventory" element={<ManageInventory />} />
                <Route path="add-car" element={<AddCarForm />} />
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="users" element={<ManageUsers />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
