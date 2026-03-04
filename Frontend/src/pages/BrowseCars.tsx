// ===== BROWSE CARS PAGE =====
// Left sidebar with filters + main grid of CarCards.
// Users select filters first, then click "Search" button to apply them.

import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CarCard from "@/components/CarCard";
import axios from "axios";
import type { Car } from "@/types/car";
import { API_URL } from "@/config/api";

const ALL_BRANDS = ["Toyota", "Honda", "BMW", "Mercedes", "Lamborghini", "Ford", "Chevrolet", "Audi", "Hyundai", "Nissan", "Kia"];
const FUEL_TYPES = ["Petrol", "Diesel", "Electric"];

const BrowseCars = () => {
  // ----- Filter State (pending — not yet applied) -----
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ----- Applied Filter State (used for actual filtering) -----
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedBrands, setAppliedBrands] = useState<string[]>([]);
  const [appliedFuels, setAppliedFuels] = useState<string[]>([]);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(100000);

  // ----- Toggle helpers -----
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleFuel = (fuel: string) => {
    setSelectedFuels((prev) =>
      prev.includes(fuel) ? prev.filter((f) => f !== fuel) : [...prev, fuel]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedFuels([]);
    setMaxPrice(100000);
    setSearchQuery("");
    // Also clear applied filters
    setAppliedSearch("");
    setAppliedBrands([]);
    setAppliedFuels([]);
    setAppliedMaxPrice(100000);
    setCurrentPage(1);
  };

  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const CARS_PER_PAGE = 6;

  // ----- Apply Filters (called on Search button click) -----
  const applyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedBrands([...selectedBrands]);
    setAppliedFuels([...selectedFuels]);
    setAppliedMaxPrice(maxPrice);
  };

  // ----- Filtered Cars (based on APPLIED filters via API) -----
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (appliedSearch) params.append("search", appliedSearch);
        appliedBrands.forEach(b => params.append("brand", b));
        appliedFuels.forEach(f => params.append("fuelType", f));
        if (appliedMaxPrice < 100000) params.append("maxPrice", appliedMaxPrice.toString());

        params.append("status", "Available");
        params.append("page", currentPage.toString());
        params.append("limit", CARS_PER_PAGE.toString());

        const response = await axios.get(`${API_URL}/cars?${params}`);
        setFilteredCars(response.data.cars);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [appliedSearch, appliedBrands, appliedFuels, appliedMaxPrice, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, appliedBrands, appliedFuels, appliedMaxPrice]);

  // The active filter count (for badge display)
  const activeFilterCount =
    selectedBrands.length + selectedFuels.length + (maxPrice < 100000 ? 1 : 0);

  // ----- Reusable Filter Panel -----
  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Brand Filter */}
      <div>
        <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">Brand</h3>
        <div className="space-y-2">
          {ALL_BRANDS.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="h-4 w-4 rounded border-border text-accent accent-accent"
              />
              <span className="text-foreground">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">
          Max Price: <span className="text-accent">${maxPrice.toLocaleString()}</span>
        </h3>
        <input
          type="range"
          min={5000}
          max={100000}
          step={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>$5,000</span>
          <span>$100,000</span>
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">Fuel Type</h3>
        <div className="space-y-2">
          {FUEL_TYPES.map((fuel) => (
            <label key={fuel} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedFuels.includes(fuel)}
                onChange={() => toggleFuel(fuel)}
                className="h-4 w-4 rounded border-border text-accent accent-accent"
              />
              <span className="text-foreground">{fuel}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Search Button */}
      <Button
        onClick={applyFilters}
        className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Search className="h-4 w-4" /> Search Cars
      </Button>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ---- Page Header ---- */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
            Browse Cars
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredCars.length} car{filteredCars.length !== 1 && "s"} found
          </p>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border bg-card px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyFilters(); }}
              className="w-full bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          {/* Desktop search button */}
          <Button
            onClick={applyFilters}
            size="sm"
            className="hidden md:flex gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Search className="h-4 w-4" /> Search
          </Button>
          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="icon"
            className="relative md:hidden"
            onClick={() => setShowMobileFilters(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* ---- Main Layout: Sidebar + Grid ---- */}
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="sticky top-24 rounded-lg border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-semibold text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-accent" />
              Filters
            </h2>
            <FilterPanel />
          </div>
        </aside>

        {/* Car Grid */}
        <main className="flex-1">
          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCars.map((car, i) => (
                <div key={car.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <CarCard car={car} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="font-heading text-lg font-semibold text-foreground">No cars found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters and clicking Search</p>
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}

          {/* ---- Pagination ---- */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? "bg-accent text-accent-foreground" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* ---- Mobile Filter Drawer ---- */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-auto rounded-t-2xl bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-foreground">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <FilterPanel />
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() => setShowMobileFilters(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseCars;
