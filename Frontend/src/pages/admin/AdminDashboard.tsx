// ===== ADMIN DASHBOARD =====
// Stats cards at the top + recent activity table.

import { useState, useEffect } from "react";
import { Car, DollarSign, CheckCircle, ShoppingCart, MessageSquare, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_URL, getAuthHeaders } from "@/config/api";

interface AdminStats {
  totalCars: number;
  carsSold: number;
  carsAvailable: number;
  revenue: number;
  totalInquiries: number;
  totalUsers: number;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({ totalCars: 0, carsSold: 0, carsAvailable: 0, revenue: 0, totalInquiries: 0, totalUsers: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/admin/activity`, { headers: getAuthHeaders() }),
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data);
    } catch (err) {
      console.error("Failed to load admin dashboard", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const statCards = [
    { label: "Total Cars", value: stats.totalCars, icon: Car, color: "text-accent", bg: "bg-accent/10" },
    { label: "Cars Sold", value: stats.carsSold, icon: CheckCircle, color: "text-status-available", bg: "bg-status-available/10" },
    { label: "Available", value: stats.carsAvailable, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Inquiries", value: stats.totalInquiries, icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Users", value: stats.totalUsers, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const getTypeBadge = (type: string) => {
    //for marking the recent activites
    switch (type) {
      case "Sale": return "bg-green-500/10 text-green-600";
      case "Inquiry": return "bg-blue-500/10 text-blue-600";
      case "New Listing": return "bg-accent/10 text-accent";
      case "New User": return "bg-purple-500/10 text-purple-600";
      case "Restock": return "bg-teal-500/10 text-teal-600";
      case "Car Deleted": return "bg-red-500/10 text-red-600";
      case "Car Updated": return "bg-amber-500/10 text-amber-600";
      case "Inquiry Replied": return "bg-cyan-500/10 text-cyan-600";
      default: return "bg-accent/10 text-accent";
    }
  };

  if (loading) {
    return <div className="py-20 text-center">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">Dashboard</h1>

      {/* ---- Stats Cards ---- */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Overview</h2>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => fetchDashboard(true)} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Recent Activity ---- */}
      <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Recent Activity</h2>
      {activities.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No recent activity.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Type</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Details</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, idx) => (
                <tr key={`${activity.type}-${activity.id}-${idx}`} className="border-t">
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getTypeBadge(activity.type)}`}>
                      {activity.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{activity.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(activity.created_at).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
