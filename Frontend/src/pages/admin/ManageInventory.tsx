// ===== MANAGE INVENTORY PAGE =====
// Data table of all cars with Status badges and Edit/Delete action buttons.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import type { Car } from "@/types/car";
import { API_URL, getAuthHeaders } from "@/config/api";

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

const ManageInventory = () => {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    // API logic to fetch cars
    const fetchCars = async () => {
      try {
        const response = await axios.get(`${API_URL}/cars`, { headers: getAuthHeaders() });
        setCars(response.data);
      } catch (error) {
        console.error("Error fetching cars line 31", error);
        toast.error("Failed to fetch cars");
      }
    };
    fetchCars();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/cars/${id}`, { headers: getAuthHeaders() });
      setCars((prev) => prev.filter((c) => c.id !== id));
      toast.success("Car deleted successfully");
    } catch (error) {
      console.error("Error delete line 42");
      toast.error("Failed to delete car");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Manage Inventory</h1>
        <Link to="/admin/add-car">
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" /> Add Car
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Car</th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Price</th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Year</th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-right font-heading font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} className="border-t">
                <td className="flex items-center gap-3 px-4 py-3">
                  <img
                    src={car.image}
                    alt={car.title}
                    className="h-10 w-14 rounded object-cover"
                  />
                  <span className="font-medium text-foreground">{car.title}</span>
                </td>
                <td className="px-4 py-3 font-bold text-accent">${car.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{car.year}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(car.status)}`}>
                    {car.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/admin/add-car?edit=${car.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(car.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageInventory;
