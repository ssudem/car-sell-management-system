// ===== USER PROFILE PAGE =====
// Displays the logged-in user's profile information.

// API ENDPOINTS:
//   1. GET  /api/users/me          → Fetch user profile (JWT required)
//   2. PUT  /api/users/me          → Update profile (JWT required)
//   3. POST /api/upload             → Upload avatar (JWT required, multipart/form-data)

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_URL, getAuthHeaders, getMultipartHeaders } from "@/config/api";
import axios from "axios";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/users/me`, { headers: getAuthHeaders() })
        .then(res => {
          setUser(res.data);
          setEditName(res.data.name || "");
          setEditPhone(res.data.phone || "");
          setEditAddress(res.data.address || "");
        })
        .catch(err => {
          console.error("Failed to load profile", err);
          toast.error("Failed to load profile data");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div className="py-20 text-center">Loading Profile...</div>;
  }

  if (!token || !user) {
    return (
      <div className="container mx-auto flex flex-col items-center py-20 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">Please Login</h1>
        <p className="mt-2 text-muted-foreground">You need to be logged in to view your profile.</p>
        <Link to="/login" className="mt-4 text-accent hover:underline">Go to Login →</Link>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const res = await axios.put(`${API_URL}/users/me`, {
        name: editName,
        phone: editPhone,
        address: editAddress
      }, { headers: getAuthHeaders() });

      setUser(res.data.user);
      setIsEditing(false);
      const currentLocUser = JSON.parse(localStorage.getItem("user") || "{}");
      currentLocUser.name = res.data.user.name;
      localStorage.setItem("user", JSON.stringify(currentLocUser));

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.put(`${API_URL}/users/me/avatar`, formData, {
        headers: getMultipartHeaders(),
      });

      setUser({ ...user, avatar: res.data.avatarUrl });
      // Update localStorage too
      const currentLocUser = JSON.parse(localStorage.getItem("user") || "{}");
      currentLocUser.avatar = res.data.avatarUrl;
      localStorage.setItem("user", JSON.stringify(currentLocUser));

      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Clickable Avatar */}
            <label className="group relative cursor-pointer">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-24 w-24 rounded-full border-4 border-accent/20 object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-accent/20 bg-secondary">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
                {uploadingAvatar ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-heading text-2xl font-bold text-foreground">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Member since {user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", { year: "numeric", month: "long" }) : "N/A"}
              </p>
              <span className="mt-2 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent capitalize">{user.role}</span>
            </div>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => { if (isEditing) handleSave(); else setIsEditing(true); }}>
              {isEditing ? <><Save className="h-3.5 w-3.5" /> Save</> : <><Edit2 className="h-3.5 w-3.5" /> Edit Profile</>}
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Personal Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-5 w-5 text-accent" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Full Name</p>
                {isEditing ? (
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent" />
                ) : (
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-accent" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Email Address</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-accent" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Phone Number</p>
                {isEditing ? (
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent" />
                ) : (
                  <p className="text-sm font-medium text-foreground">{user.phone || "Not set"}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-accent" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Address</p>
                {isEditing ? (
                  <input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent" />
                ) : (
                  <p className="text-sm font-medium text-foreground">{user.address || "Not set"}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-accent" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium text-foreground">{user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB") : "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
