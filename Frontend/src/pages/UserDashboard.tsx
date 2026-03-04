// ===== USER DASHBOARD PAGE =====
// Tabbed layout: My Wishlist, My Inquiries, My Purchases.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, ShoppingBag, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeaders } from "@/config/api";

// The three tabs
const TABS = [
  { key: "wishlist", label: "My Wishlist", icon: Heart },
  { key: "inquiries", label: "My Inquiries", icon: MessageSquare },
  { key: "purchases", label: "My Purchases", icon: ShoppingBag },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("wishlist");

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [wishRes, inqRes, purRes] = await Promise.all([
          axios.get(`${API_URL}/wishlist`, { headers: getAuthHeaders() }),
          axios.get(`${API_URL}/inquiries/my`, { headers: getAuthHeaders() }),
          axios.get(`${API_URL}/payments/my`, { headers: getAuthHeaders() }),
        ]);
        setWishlist(wishRes.data);
        setInquiries(inqRes.data);
        setPurchases(purRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRemoveWishlist = async (carId: number) => {
    try {
      await axios.delete(`${API_URL}/wishlist/${carId}`, { headers: getAuthHeaders() });
      setWishlist((prev) => prev.filter((c) => c.id !== carId));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove from wishlist");
    }
  };

  if (loading) {
    return <div className="py-20 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 font-heading text-2xl font-bold text-foreground md:text-3xl">
        My Dashboard
      </h1>

      {/* ---- Tab Buttons ---- */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border bg-secondary/50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---- Tab Content ---- */}

      {/* Wishlist Tab */}
      {activeTab === "wishlist" && (
        <div className="space-y-4">
          {wishlist.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">Your wishlist is empty.</p>
          ) : (
            wishlist.map((car) => (
              <div
                key={car.id}
                className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center"
              >
                <img
                  src={car.image}
                  alt={car.title}
                  className="h-24 w-36 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-foreground">{car.title}</h3>
                  <p className="text-lg font-bold text-accent">${car.price?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {car.year} · {car.mileage?.toLocaleString()} km · {car.fuelType}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/car/${car.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveWishlist(car.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Inquiries Tab */}
      {activeTab === "inquiries" && (
        inquiries.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No inquiries yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Car</th>
                  <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Message</th>
                  <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-foreground">{inq.car_title || inq.carTitle}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">{inq.message}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inq.created_at ? new Date(inq.created_at).toLocaleDateString() : inq.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${(inq.status === "Replied")
                          ? "bg-status-available/10 text-status-available"
                          : "bg-status-pending/10 text-status-pending"
                          }`}
                      >
                        {inq.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}


      {/* Purchases Tab */}
      {activeTab === "purchases" && (
        purchases.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No purchases yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Car</th>
                  <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Payment</th>
                  <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-foreground">{p.car_title || p.carTitle}</td>
                    <td className="px-4 py-3 font-bold text-accent">${(p.amount || p.price)?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : p.date}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-status-available/10 px-2.5 py-1 text-xs font-semibold text-status-available">
                        {p.payment_status || p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/car/${p.car_id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default UserDashboard;
