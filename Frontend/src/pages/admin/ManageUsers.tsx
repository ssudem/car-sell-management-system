// ===== MANAGE USERS (Admin) =====
// View all users, delete non-admin users, promote users to admin, update passwords.

import { useState, useEffect } from "react";
import { Trash2, ShieldCheck, Users, Search, RefreshCw, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { toast } from "sonner";
import { API_URL, getAuthHeaders } from "@/config/api";

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    role: "user" | "admin";
    created_at: string;
}

const ManageUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [passwordUser, setPasswordUser] = useState<User | null>(null);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const fetchUsers = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await axios.get(`${API_URL}/admin/users`, { headers: getAuthHeaders() });
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to load users", err);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (user: User) => {
        setActionLoading(user.id);
        try {
            await axios.delete(`${API_URL}/admin/users/${user.id}`, { headers: getAuthHeaders() });
            toast.success(`User "${user.name}" deleted successfully`);
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete user");
        } finally {
            setActionLoading(null);
        }
    };

    const handlePromote = async (user: User) => {
        setActionLoading(user.id);
        try {
            await axios.patch(`${API_URL}/admin/users/${user.id}/promote`, {}, { headers: getAuthHeaders() });
            toast.success(`User "${user.name}" promoted to admin`);
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, role: "admin" } : u))
            );
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to promote user");
        } finally {
            setActionLoading(null);
        }
    };

    const openPasswordDialog = (user: User) => {
        setPasswordUser(user);
        setOldPassword("");
        setNewPassword("");
        setShowOld(false);
        setShowNew(false);
    };

    const handleUpdatePassword = async () => {
        if (!passwordUser) return;
        if (!oldPassword || !newPassword) {
            toast.error("Both passwords are required");
            return;
        }
        setPasswordLoading(true);
        try {
            await axios.patch(
                `${API_URL}/admin/users/${passwordUser.id}/password`,
                { oldPassword, newPassword },
                { headers: getAuthHeaders() }
            );
            toast.success(`Password updated for "${passwordUser.name}"`);
            setPasswordUser(null);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="py-20 text-center">Loading users...</div>;
    }

    return (
        <div>
            <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">Manage Users</h1>

            {/* ---- Top Bar ---- */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                    </span>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => fetchUsers(true)} disabled={refreshing}>
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </div>

            {/* ---- Users Table ---- */}
            {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Users className="mb-3 h-12 w-12 text-muted-foreground/40" />
                    <p className="text-muted-foreground">{search ? "No users match your search." : "No users found."}</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">User</th>
                                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Email</th>
                                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Role</th>
                                <th className="px-4 py-3 text-left font-heading font-semibold text-foreground">Joined</th>
                                <th className="px-4 py-3 text-right font-heading font-semibold text-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-t">
                                    {/* Avatar + Name */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="font-medium text-foreground">{user.name}</span>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>

                                    {/* Role Badge */}
                                    <td className="px-4 py-3">
                                        {user.role === "admin" ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                                                <ShieldCheck className="h-3 w-3" /> Admin
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600">
                                                User
                                            </span>
                                        )}
                                    </td>

                                    {/* Joined Date */}
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString("en-GB")}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Password Button — available for all users */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                                onClick={() => openPasswordDialog(user)}
                                                disabled={actionLoading === user.id}
                                            >
                                                <KeyRound className="h-3.5 w-3.5" /> Password
                                            </Button>

                                            {user.role === "user" && (
                                                <>
                                                    {/* Promote Button */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-1 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10"
                                                                disabled={actionLoading === user.id}
                                                            >
                                                                <ShieldCheck className="h-3.5 w-3.5" /> Promote
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Promote to Admin?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will grant <strong>{user.name}</strong> ({user.email}) full admin privileges.
                                                                    This action <strong>cannot be undone</strong> from this panel.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handlePromote(user)}
                                                                    className="bg-indigo-600 hover:bg-indigo-700"
                                                                >
                                                                    Yes, Promote
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    {/* Delete Button */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                                                                disabled={actionLoading === user.id}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete User?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete <strong>{user.name}</strong> ({user.email}) and all their
                                                                    associated data (wishlists, inquiries, etc.). This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(user)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Yes, Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ---- Password Update Dialog ---- */}
            <Dialog open={!!passwordUser} onOpenChange={(open) => !open && setPasswordUser(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Password</DialogTitle>
                        <DialogDescription>
                            Change password for <strong>{passwordUser?.name}</strong> ({passwordUser?.email})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Old Password</label>
                            <div className="relative">
                                <input
                                    type={showOld ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    className="w-full rounded-lg border bg-card py-2 pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOld(!showOld)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full rounded-lg border bg-card py-2 pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordUser(null)}>Cancel</Button>
                        <Button
                            onClick={handleUpdatePassword}
                            disabled={passwordLoading || !oldPassword || !newPassword}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {passwordLoading ? "Updating..." : "Update Password"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageUsers;
