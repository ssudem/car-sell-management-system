// ===== ADMIN INQUIRIES VIEW =====
// Table listing all user inquiries about cars.

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeaders } from "@/config/api";

interface Inquiry {
  id: number;
  carTitle: string;
  name: string;
  email: string;
  message: string;
  status: string;
  date: string;
}

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await axios.get(`${API_URL}/inquiries`, { headers: getAuthHeaders() });
        setInquiries(res.data);
      } catch (err) {
        console.error("Failed to load inquiries", err);
        toast.error("Failed to load inquiries");
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  const handleReply = async (id: number) => {
    try {
      await axios.put(`${API_URL}/inquiries/${id}`, { status: "Replied" }, { headers: getAuthHeaders() });
      setInquiries((prev) => prev.map((inq) => inq.id === id ? { ...inq, status: "Replied" } : inq));
      toast.success("Inquiry marked as replied");
    } catch (err) {
      toast.error("Failed to update inquiry");
    }
  };

  if (loading) {
    return <div className="py-20 text-center">Loading inquiries...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">User Inquiries</h1>

      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">No inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className="rounded-lg border bg-card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{inq.carTitle}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{inq.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    From: {inq.name} ({inq.email}) · Sent on {inq.date} ·{" "}
                    <span
                      className={`font-semibold ${inq.status === "Replied" ? "text-status-available" : "text-status-pending"
                        }`}
                    >
                      {inq.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(inq.email)}&su=${encodeURIComponent(`Re: Inquiry about ${inq.carTitle}`)}&body=${encodeURIComponent(`Hi ${inq.name},\n\nThank you for your inquiry about ${inq.carTitle}.\n\n`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-1">
                      <ExternalLink className="h-3.5 w-3.5" /> Email
                    </Button>
                  </a>
                  {inq.status !== "Replied" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleReply(inq.id)}
                    >
                      <Mail className="h-3.5 w-3.5" /> Mark Replied
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
