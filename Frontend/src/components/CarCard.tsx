// ===== CAR CARD COMPONENT =====
// A reusable card that displays a single car's thumbnail, price, title, and status.
// Used in: Index.tsx (Featured Cars grid), BrowseCars.tsx (Browse page grid)

import { Link } from "react-router-dom";
import { Fuel, Calendar, Gauge } from "lucide-react";
import type { Car } from "@/types/car";

// Helper: returns Tailwind classes based on car status
const getStatusClasses = (status: Car["status"]) => {
  switch (status) {
    case "Available":
      return "bg-status-available/10 text-status-available";
    case "Pending":
      return "bg-status-pending/10 text-status-pending";
    case "Sold":
      return "bg-status-sold/10 text-status-sold";
  }
};

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  return (
    <Link
      to={`/car/${car.id}`}
      className="group block overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
    >
      {/* ---- Thumbnail ---- */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={car.image}
          alt={car.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Status Badge */}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
            car.status
          )}`}
        >
          {car.status}
        </span>
      </div>

      {/* ---- Card Body ---- */}
      <div className="p-4">
        <h3 className="font-heading text-base font-semibold text-foreground line-clamp-1">
          {car.title}
        </h3>

        <p className="mt-1 text-lg font-bold text-accent">
          ${car.price.toLocaleString()}
        </p>

        {/* Quick specs row */}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {car.year}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            {car.mileage.toLocaleString()} km
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" />
            {car.fuelType}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
