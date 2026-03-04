// ===== ADMIN TRANSACTIONS PAGE =====
// Shows purchase/transaction history.

import { useState, useEffect } from "react";
import { Receipt } from "lucide-react";
import axios from "axios";
import { API_URL, getAuthHeaders } from "@/config/api";

interface Transaction {
  id: number;
  car_title: string;
  buyer_name: string;
  amount: number;
  created_at: string;
  payment_status: string;
  [key: string]: any;
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API_URL}/payments`, { headers: getAuthHeaders() });
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return <div className="py-20 text-center">Loading transactions...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">Transactions</h1>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Receipt className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">No transactions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">ID</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Car</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Buyer</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Amount</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Date</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 text-muted-foreground">#{p.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.car_title || p.carTitle}</td>
                  <td className="px-4 py-3 text-foreground">{p.buyer_name || p.buyerName || "—"}</td>
                  <td className="px-4 py-3 font-bold text-accent">${(p.amount || p.price)?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : p.date}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-status-available/10 px-2.5 py-1 text-xs font-semibold text-status-available">
                      {p.payment_status || p.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
