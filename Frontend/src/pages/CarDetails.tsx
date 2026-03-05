// ===== CAR DETAILS PAGE =====
// Shows full details for a single car: image gallery, specs table, wishlist, and inquiry form.


import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Fuel, Calendar, Gauge, Settings, Send, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_URL, getAuthHeaders } from "@/config/api";
import axios from "axios";
import type { Car } from "@/types/car";

const CarDetails = () => {
  const { id } = useParams();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  // Pre-fill from logged-in user
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);
  const [inquiryName, setInquiryName] = useState(loggedInUser?.name || "");
  const [inquiryEmail, setInquiryEmail] = useState(loggedInUser?.email || "");
  const [inquiryMessage, setInquiryMessage] = useState("");

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Buy Now modal state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [purchasing, setPurchasing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"confirm" | "processing" | "success">("confirm");

  useEffect(() => {
    const fetchCarAndWishlist = async () => {
      setLoading(true);
      try {
        const carRes = await axios.get(`${API_URL}/cars/${id}`);
        setCar(carRes.data);

        // Also check wishlist status if user is logged in
        if (localStorage.getItem("token")) {
          try {
            const wishlistRes = await axios.get(`${API_URL}/wishlist/check/${id}`, { headers: getAuthHeaders() });
            setSaved(wishlistRes.data.inWishlist);
          } catch (err) {
            console.error("Wishlist check failed", err);
          }
        }
      } catch (err) {
        console.error("Failed to load car", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCarAndWishlist();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  // If car not found
  if (!car) {
    return (
      <div className="container mx-auto flex flex-col items-center py-20 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">Car Not Found</h1>
        <Link to="/browse" className="mt-4 text-accent hover:underline">
          ← Back to Browse
        </Link>
      </div>
    );
  }

  // Gallery images — use the images[] array from mock data
  // In Phase 2, these come from Cloudinary URLs stored in the database
  const galleryImages = car.image
    ? [car.image, ...(car.images || []).filter((img) => img !== car.image)]
    : car.images && car.images.length > 0 ? car.images : [];

  const handleSave = async () => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to save cars to your wishlist");
      return;
    }
    try {
      if (saved) {
        await axios.delete(`${API_URL}/wishlist/${car.id}`, { headers: getAuthHeaders() });
        toast.success("Removed from wishlist");
      } else {
        await axios.post(`${API_URL}/wishlist`, { carId: car.id }, { headers: getAuthHeaders() });
        toast.success("Added to wishlist!");
      }
      setSaved(!saved);
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await axios.post(`${API_URL}/inquiries`, {
        carId: car.id,
        name: inquiryName,
        email: inquiryEmail,
        message: inquiryMessage,
      }, { headers });
      toast.success("Inquiry sent! The seller will contact you soon.");
      setInquiryMessage("");
    } catch (err) {
      toast.error("Failed to send inquiry");
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    setPaymentStep("processing");

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      await axios.post(`${API_URL}/payments`, {
        carId: car.id,
        amount: car.price,
      }, { headers: getAuthHeaders() });

      // Show success animation
      setPaymentStep("success");

      // Wait for success animation, then redirect
      setTimeout(() => {
        setShowBuyModal(false);
        setPaymentStep("confirm");
        setPurchasing(false);
        setCar({ ...car, status: "Sold" });
        toast.success("Purchase successful! 🎉");
        navigate("/dashboard");
      }, 2200);
    } catch (err: any) {
      setPaymentStep("confirm");
      setPurchasing(false);
      toast.error(err.response?.data?.message || "Purchase failed");
    }
  };

  const specs = [
    { label: "Brand", value: car.brand, icon: Settings },
    { label: "Year", value: car.year, icon: Calendar },
    { label: "Mileage", value: `${car.mileage.toLocaleString()} km`, icon: Gauge },
    { label: "Fuel Type", value: car.fuelType, icon: Fuel },
    { label: "Transmission", value: car.transmission, icon: Settings },
    { label: "Status", value: car.status, icon: Settings },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link to="/browse" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ---- Image Gallery Section (3 cols) ---- */}
        <div className="lg:col-span-3">
          {/* Main large image */}
          <div className="mx-auto overflow-hidden rounded-lg border">
            <img
              src={galleryImages[selectedImageIndex]}
              alt={`${car.title} - Image ${selectedImageIndex + 1}`}
              className="mx-auto h-auto max-h-[480px] w-full rounded-lg border object-contain transition-all duration-300"
            />
          </div>

          {/* Thumbnail strip — click to select */}
          {galleryImages.length > 1 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2 pb-2 lg:justify-start">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${selectedImageIndex === index
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-border opacity-70 hover:opacity-100"
                    }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- Info Section (2 cols) ---- */}
        <div className="lg:col-span-2">
          <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">{car.title}</h1>
          <p className="mt-2 text-2xl font-bold text-accent">${car.price.toLocaleString()}</p>
          <p className="mt-3 text-sm text-muted-foreground">{car.description}</p>

          <Button
            variant="outline"
            onClick={handleSave}
            className="mt-4 gap-2"
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-destructive text-destructive" : ""}`} />
            {saved ? "Saved" : "Save to Wishlist"}
          </Button>

          {/* Buy Now button — only for Available cars */}
          {car.status === "Available" && (
            <Button
              className="mt-4 ml-2 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => {
                if (!localStorage.getItem("token")) {
                  toast.error("Please login to purchase a car");
                  return;
                }
                setShowBuyModal(true);
              }}
            >
              <ShoppingCart className="h-4 w-4" /> Buy Now
            </Button>
          )}

          {car.status === "Sold" && (
            <span className="mt-4 inline-block rounded-full bg-status-sold/10 px-4 py-2 text-sm font-semibold text-status-sold">
              This car has been sold
            </span>
          )}

          {/* Specs Table */}
          <div className="mt-6 overflow-hidden rounded-lg border">
            <h2 className="bg-secondary px-4 py-3 font-heading text-sm font-semibold text-foreground">
              Specifications
            </h2>
            <table className="w-full text-sm">
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.label} className="border-t">
                    <td className="flex items-center gap-2 px-4 py-3 text-muted-foreground">
                      <spec.icon className="h-4 w-4" />
                      {spec.label}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---- Inquiry Form ---- */}
      {car.status === "Sold" ? (
        <div className="mx-auto mt-12 max-w-2xl rounded-lg border bg-card p-6 text-center">
          <p className="text-muted-foreground">This car has been sold. Inquiries are no longer accepted.</p>
        </div>
      ) : !loggedInUser ? (
        <div className="mx-auto mt-12 max-w-2xl rounded-lg border bg-card p-6 text-center">
          <p className="text-muted-foreground">Please <a href="/login" className="font-semibold text-accent hover:underline">login</a> to send an inquiry.</p>
        </div>
      ) : (
        <div className="mx-auto mt-12 max-w-2xl rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
            Send an Inquiry
          </h2>
          <form onSubmit={handleInquiry} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={inquiryName}
                disabled
                className="rounded-lg border bg-secondary px-4 py-3 text-sm text-muted-foreground outline-none cursor-not-allowed"
              />
              <input
                type="email"
                placeholder="Your Email"
                required
                value={inquiryEmail}
                disabled
                className="rounded-lg border bg-secondary px-4 py-3 text-sm text-muted-foreground outline-none cursor-not-allowed"
              />
            </div>
            <textarea
              placeholder="I'm interested in this car. Please provide more details..."
              required
              rows={4}
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
            />
            <Button type="submit" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Send className="h-4 w-4" /> Send Inquiry
            </Button>
          </form>
        </div>
      )}

      {/* ---- Buy Now / Payment Modal ---- */}
      {showBuyModal && car && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={!purchasing ? () => setShowBuyModal(false) : undefined} />
          <div className="relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">

            {/* ===== STEP 1: CONFIRM ===== */}
            {paymentStep === "confirm" && (
              <>
                <button onClick={() => setShowBuyModal(false)} className="absolute right-4 top-4">
                  <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>

                <h2 className="font-heading text-xl font-bold text-foreground">Confirm Purchase</h2>
                <p className="mt-1 text-sm text-muted-foreground">You're about to purchase this car</p>

                <div className="mt-4 flex gap-4 rounded-lg border bg-secondary/50 p-4">
                  <img src={car.image} alt={car.title} className="h-16 w-24 rounded-md object-cover" />
                  <div>
                    <p className="font-heading font-semibold text-foreground">{car.title}</p>
                    <p className="text-xl font-bold text-accent">${car.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-foreground">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option>Card</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowBuyModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={handlePurchase}
                  >
                    <ShoppingCart className="h-4 w-4" /> Confirm Purchase
                  </Button>
                </div>
              </>
            )}

            {/* ===== STEP 2: PROCESSING ===== */}
            {paymentStep === "processing" && (
              <div className="flex flex-col items-center py-10">
                <div className="relative mb-6 h-20 w-20">
                  <div
                    className="absolute inset-0 rounded-full border-4 border-secondary"
                  />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">Processing Payment</h3>
                <p className="mt-2 text-sm text-muted-foreground">Please wait while we process your transaction...</p>
                <div className="mt-4 flex items-center gap-3 rounded-lg border bg-secondary/50 px-4 py-3">
                  <span className="text-sm text-muted-foreground">{car.title}</span>
                  <span className="font-bold text-accent">${car.price.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* ===== STEP 3: SUCCESS ===== */}
            {paymentStep === "success" && (
              <div className="flex flex-col items-center py-10">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10" style={{ animation: "scaleIn 0.4s ease-out" }}>
                  <svg className="h-10 w-10 text-green-500" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 24,
                        strokeDashoffset: 24,
                        animation: "drawCheck 0.5s ease-out 0.3s forwards",
                      }}
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-lg font-bold text-green-500">Payment Successful!</h3>
                <p className="mt-2 text-sm text-muted-foreground">Your purchase has been completed</p>
                <p className="mt-1 text-xl font-bold text-foreground">${car.price.toLocaleString()}</p>
                <p className="mt-3 text-xs text-muted-foreground">Redirecting to your dashboard...</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CSS animations for payment modal */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default CarDetails;
