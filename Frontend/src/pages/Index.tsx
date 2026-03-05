// ===== HOME PAGE =====
// The landing page with a Hero section and Featured Cars grid.
//
// API ENDPOINTS:
// 1. GET /api/cars?status=Available&limit=4  → Featured cars for home page
//    No auth required (public page)
//
// Search bar redirects to /browse?q=searchQuery (no API call on this page)

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, ShieldCheck, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import CarCard from "@/components/CarCard";
import heroBg from "@/assets/hero-bg.jpg";
import { API_URL } from "@/config/api";
import axios from "axios";
import type { Car } from "@/types/car";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${API_URL}/cars?status=Available&limit=4`);
        setFeaturedCars(res.data);
      } catch (e) {
        console.error("Failed to load featured cars");
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* ========== HERO SECTION ========== */}
      <section className="relative flex min-h-[520px] items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="Luxury car" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40 dark:from-background/90 dark:via-background/70 dark:to-background/40" />
        </div>

        {/* Hero content */}
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-xl">
            <h1 className="font-heading text-4xl font-bold leading-tight text-primary-foreground dark:text-white md:text-5xl">
              Find Your Perfect
              <span className="block text-accent">Dream Car</span>
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 dark:text-white">
              Browse thousands of verified used cars. Trusted sellers, transparent pricing, hassle-free buying.
            </p>

            {/* Search bar */}
            <div className="mt-8 flex overflow-hidden rounded-lg bg-card shadow-lg">
              <div className="flex flex-1 items-center gap-2 px-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by brand, model, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
              <Link to={`/browse?q=${searchQuery}`}>
                <Button className="h-full rounded-none bg-accent px-6 text-accent-foreground hover:bg-accent/90">
                  Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TRUST BADGES ========== */}
      <section className="border-b bg-card">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, label: "Verified Sellers", desc: "Every car is inspected" },
            { icon: CreditCard, label: "Secure Payments", desc: "Safe & transparent" },
            { icon: Truck, label: "Home Delivery", desc: "Doorstep delivery available" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <item.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== FEATURED CARS ========== */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
              Featured Cars
            </h2>
            <p className="mt-1 text-muted-foreground">
              Hand-picked deals just for you
            </p>
          </div>
          <Link
            to="/browse"
            className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline sm:flex"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCars.map((car, index) => (
            <div key={car.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CarCard car={car} />
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link to="/browse">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Browse All Cars <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
