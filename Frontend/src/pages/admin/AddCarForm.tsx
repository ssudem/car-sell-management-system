// ===== ADD / EDIT CAR FORM =====
// Structured form with car details + image upload zone.

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Upload, Save, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeaders, getMultipartHeaders } from "@/config/api";

const AddCarForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [form, setForm] = useState({
    title: "",
    brand: "",
    price: "",
    year: "",
    mileage: "",
    fuelType: "Petrol",
    transmission: "Automatic",
    status: "Available",
    description: "",
  });

  const [dragActive, setDragActive] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // If editing, fetch existing car data
  useEffect(() => {
    if (editId) {
      axios.get(`${API_URL}/cars/${editId}`)
        .then((res) => {
          const car = res.data;
          setForm({
            title: car.title || "",
            brand: car.brand || "",
            price: String(car.price || ""),
            year: String(car.year || ""),
            mileage: String(car.mileage || ""),
            fuelType: car.fuelType || "Petrol",
            transmission: car.transmission || "Automatic",
            status: car.status || "Available",
            description: car.description || "",
          });
          // Show existing images as previews and track their URLs
          const existingImages = car.images && car.images.length > 0
            ? [car.image, ...car.images.filter((img: string) => img !== car.image)].filter(Boolean)
            : car.image ? [car.image] : [];
          setPreviewImages(existingImages);
          setExistingImageUrls(existingImages);
        })
        .catch(() => toast.error("Failed to load car for editing"));
    }
  }, [editId]);

  // Handle text input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file drop / select
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviewImages((prev) => [...prev, ...urls]);
    setImageFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrls: string[] = [];

      // Upload new images if any
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));

        const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
          headers: getMultipartHeaders(),
        });
        imageUrls = uploadRes.data.urls || [];
      }

      // Merge: keep remaining existing images + newly uploaded ones
      const remainingExisting = existingImageUrls.filter((url) => previewImages.includes(url));
      const allImages = [...remainingExisting, ...imageUrls];

      const carData = {
        title: form.title,
        brand: form.brand,
        price: Number(form.price),
        year: Number(form.year),
        mileage: Number(form.mileage),
        fuelType: form.fuelType,
        transmission: form.transmission,
        status: form.status,
        description: form.description,
        image: allImages[0] || "",
        images: allImages,
      };

      if (editId) {
        await axios.put(`${API_URL}/cars/${editId}`, carData, { headers: getAuthHeaders() });
        toast.success("Car updated successfully!");
      } else {
        await axios.post(`${API_URL}/cars`, carData, { headers: getAuthHeaders() });
        toast.success("Car added successfully!");
      }

      navigate("/admin/inventory");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save car");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">
        {editId ? "Edit Car" : "Add New Car"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ---- Basic Details ---- */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-heading text-base font-semibold text-foreground">Car Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Title</label>
              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. 2024 Honda Civic"
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Brand</label>
              <select
                name="brand"
                required
                value={form.brand}
                onChange={handleChange}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Brand</option>
                {["Toyota", "Honda", "BMW", "Mercedes", "Lamborghini", "Ford", "Chevrolet", "Audi", "Hyundai", "Nissan", "Kia"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Price ($)</label>
              <input
                name="price"
                type="number"
                required
                value={form.price}
                onChange={handleChange}
                placeholder="25000"
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Year</label>
              <input
                name="year"
                type="number"
                required
                value={form.year}
                onChange={handleChange}
                placeholder="2024"
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Mileage (km)</label>
              <input
                name="mileage"
                type="number"
                required
                value={form.mileage}
                onChange={handleChange}
                placeholder="15000"
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Fuel Type</label>
              <select
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
              >
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Electric</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Transmission</label>
              <select
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
              >
                <option>Automatic</option>
                <option>Manual</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
              >
                <option>Available</option>
                <option>Pending</option>
                <option>Sold</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the car..."
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* ---- Image Upload Zone ---- */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-heading text-base font-semibold text-foreground">Car Images</h2>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${dragActive ? "border-accent bg-accent/5" : "border-border"
              }`}
          >
            <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Drag & drop images here, or{" "}
              <label className="cursor-pointer text-accent hover:underline">
                browse
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG up to 5MB. Images will be uploaded to Cloudinary.
            </p>
          </div>

          {/* Image previews */}
          {previewImages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {previewImages.map((url, i) => (
                <div key={i} className="group relative h-20 w-28 overflow-hidden rounded-md border">
                  <img src={url} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImages((prev) => prev.filter((_, idx) => idx !== i));
                      // Only remove from imageFiles if it's a new file (not an existing URL)
                      const existingCount = existingImageUrls.filter((u) => previewImages.includes(u)).length;
                      if (i >= existingCount) {
                        setImageFiles((prev) => prev.filter((_, idx) => idx !== (i - existingCount)));
                      }
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" disabled={submitting} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="h-4 w-4" /> {submitting ? "Saving..." : "Save Car"}
        </Button>
      </form>
    </div>
  );
};

export default AddCarForm;
