// ===== NAVBAR COMPONENT =====
// The top navigation bar visible on all public pages.
// Contains: Logo, nav links, and Login/Register buttons (or user avatar if logged in).

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Car, Menu, X, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Read auth state from localStorage
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "null") : null;
  const loggedIn = !!token && !!user;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* ---- Logo ---- */}
        <Link to="/" className="flex items-center gap-2">
          <Car className="h-7 w-7 text-accent" />
          <span className="text-xl font-heading font-bold text-foreground">
            VisionCars
          </span>
        </Link>

        {/* ---- Desktop Links ---- */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${isActive("/")
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-secondary"
              }`}
          >
            Home
          </Link>
          <Link
            to="/browse"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${isActive("/browse")
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-secondary"
              }`}
          >
            Browse Cars
          </Link>
        </div>

        {/* ---- Theme Toggle + Auth / User Section (Desktop) ---- */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {loggedIn && user ? (
            // --- LOGGED IN: Show avatar dropdown ---
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 rounded-full border bg-card p-1 pr-3 transition-colors hover:bg-secondary"
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-accent/10">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-accent" />
                  )}
                </div>
                <span className="text-sm font-medium text-foreground">{user.name?.split(" ")[0]}</span>
                {user.role === "admin" && (
                  <Shield className="h-3.5 w-3.5 text-accent" />
                )}
              </button>

              {/* Dropdown menu */}
              {profileDropdown && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border bg-card py-2 shadow-lg">
                  <div className="px-4 py-2 text-xs text-muted-foreground border-b mb-1">
                    Signed in as <span className="font-semibold text-foreground">{user.role}</span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary"
                  >
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary"
                  >
                    <Car className="h-4 w-4" /> Dashboard
                  </Link>
                  {/* Show Admin Panel link only for admin users */}
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-accent hover:bg-secondary"
                    >
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <hr className="my-1 border-border" />
                  <button
                    onClick={() => {
                      setProfileDropdown(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-secondary"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // --- NOT LOGGED IN: Show Login/Register ---
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* ---- Mobile Menu Toggle ---- */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-2 text-foreground md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* ---- Mobile Menu Dropdown ---- */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 md:hidden">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileOpen(false)}
            className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Browse Cars
          </Link>

          {loggedIn && user ? (
            <>
              <div className="my-2 border-t pt-2 text-xs text-muted-foreground px-3">
                Signed in as <span className="font-semibold text-foreground">{user.name}</span> ({user.role})
              </div>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                My Profile
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Dashboard
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-accent hover:bg-secondary"
                >
                  🔑 Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-secondary"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="mt-3 flex gap-2">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
