// ===== ADMIN TRANSACTIONS PAGE =====
// Shows purchase/transaction history.

import { useState, useEffect } from "react";
import { Receipt, Loader2 } from "lucide-react";
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
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-accent" />
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
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
        <div className="rounded-lg border">
          <table className="block w-full text-sm md:table">
            <thead className="hidden bg-secondary md:table-header-group">
              <tr>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">ID</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Car</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Buyer</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Amount</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Date</th>
                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {transactions.map((p) => (
                <tr key={p.id} className="flex flex-col border-t p-4 md:table-row md:p-0">
                  <td className="flex justify-between px-4 py-2 text-muted-foreground md:table-cell md:py-3"><span className="font-bold text-foreground md:hidden">ID</span> <span>#{p.id}</span></td>
                  <td className="flex justify-between px-4 py-2 font-medium text-foreground md:table-cell md:py-3"><span className="font-bold text-foreground md:hidden pr-4">Car</span> <span className="text-right md:text-left">{p.car_title || p.carTitle}</span></td>
                  <td className="flex justify-between px-4 py-2 text-foreground md:table-cell md:py-3"><span className="font-bold text-foreground md:hidden">Buyer</span> <span className="truncate max-w-[200px] sm:max-w-none">{p.buyer_name || p.buyerName || "—"}</span></td>
                  <td className="flex justify-between px-4 py-2 font-bold text-accent md:table-cell md:py-3"><span className="font-bold text-foreground md:hidden">Amount</span> <span>${(p.amount || p.price)?.toLocaleString()}</span></td>
                  <td className="flex justify-between px-4 py-2 text-muted-foreground md:table-cell md:py-3"><span className="font-bold text-foreground md:hidden">Date</span> <span>{p.created_at ? new Date(p.created_at).toLocaleDateString("en-GB") : p.date}</span></td>
                  <td className="flex justify-between px-4 py-2 md:table-cell md:py-3"><span className="font-bold text-foreground md:hidden">Status</span>
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
