import React, { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Key, Shield, UserX, UserCheck, Calendar } from "lucide-react";
import { User } from "../types";
import { api } from "../utils/api";

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create User form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [adding, setAdding] = useState(false);

  // Password Reset form state
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<User[]>("/users");
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newUsername.trim() || !newPassword.trim() || !newRole) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal harus 6 karakter.");
      return;
    }

    setAdding(true);
    try {
      await api.post("/users", {
        username: newUsername.trim(),
        password: newPassword,
        role: newRole,
      });

      setSuccess(`User '${newUsername}' berhasil dibuat.`);
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Gagal membuat user.");
    } finally {
      setAdding(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!resetUserId || !resetPassword.trim()) return;

    if (resetPassword.length < 6) {
      setError("Password baru minimal harus 6 karakter.");
      return;
    }

    setResetting(true);
    try {
      await api.put(`/users/${resetUserId}`, {
        password: resetPassword,
      });

      const resetUser = users.find((u) => u.id === resetUserId);
      setSuccess(`Password untuk user '${resetUser?.username}' berhasil di-reset.`);
      setResetPassword("");
      setResetUserId(null);
    } catch (err: any) {
      setError(err.message || "Gagal mereset password.");
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setError("");
    setSuccess("");

    const loggedInUser = JSON.parse(localStorage.getItem("cm_user") || "{}");
    if (user.id === loggedInUser.id) {
      setError("Anda tidak dapat menghapus akun Anda sendiri.");
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus user '${user.username}' beserta seluruh catatan pribadinya?`)) {
      return;
    }

    try {
      await api.delete(`/users/${user.id}`);
      setSuccess(`User '${user.username}' berhasil dihapus.`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Gagal menghapus user.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <Users className="text-emerald-500" />
          <span>Kelola Akun Pengguna</span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium">
          Daftar seluruh staff maintenance, tambah akun baru, ubah wewenang, atau reset sandi password.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold leading-relaxed">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold leading-relaxed">
          {success}
        </div>
      )}

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Create / Reset Pass Forms */}
        <div className="lg:col-span-4 space-y-6">
          {/* Form Create User */}
          <div className="bg-white dark:bg-[#111113] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="text-emerald-500" size={18} />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Tambah Akun Baru
              </h3>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  id="input-new-username"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Contoh: user_baru"
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-xs text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Password Baru
                </label>
                <input
                  id="input-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 karakter"
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-xs text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Role Wewenang
                </label>
                <select
                  id="select-new-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "admin" | "user")}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-xs text-gray-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="user">User Biasa (Staff)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <button
                id="btn-submit-create-user"
                type="submit"
                disabled={adding}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {adding ? "Menambahkan..." : "Daftarkan Staff"}
              </button>
            </form>
          </div>

          {/* Form Reset Password for User (If Selected) */}
          {resetUserId && (
            <div className="bg-amber-500/10 p-6 rounded-2xl shadow-sm border border-amber-500/20 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center gap-2 mb-3">
                <Key className="text-amber-500" size={18} />
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                  Reset Sandi User
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mb-4 font-medium">
                Mengubah paksa password milik:{" "}
                <span className="font-bold text-gray-800 dark:text-white">
                  {users.find((u) => u.id === resetUserId)?.username}
                </span>
              </p>

              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <input
                    id="input-reset-password"
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Sandi baru (min 6 karakter)"
                    className="w-full px-3.5 py-2 bg-white dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-xs text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    id="btn-cancel-reset"
                    type="button"
                    onClick={() => {
                      setResetUserId(null);
                      setResetPassword("");
                    }}
                    className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-submit-reset"
                    type="submit"
                    disabled={resetting}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {resetting ? "Memproses..." : "Reset Sandi"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Users List */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-[#111113] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Staff Terdaftar ({users.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                Tidak ada user staff terdaftar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-black text-gray-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-white/5">
                      <th className="py-3 px-5">Staff Username</th>
                      <th className="py-3 px-5">Wewenang Role</th>
                      <th className="py-3 px-5 hidden sm:table-cell">Dibuat Tanggal</th>
                      <th className="py-3 px-5 text-right">Aksi Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {users.map((user) => {
                      const isSelf = user.username === JSON.parse(localStorage.getItem("cm_user") || "{}").username;
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-white/5 text-xs text-gray-700 dark:text-slate-300 transition-colors"
                        >
                          {/* Username */}
                          <td className="py-4 px-5 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <div className="w-7 h-7 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center font-bold text-[11px] border border-emerald-500/20">
                              {user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <span>
                              {user.username} {isSelf && <span className="text-[10px] text-emerald-500 font-semibold">(Anda)</span>}
                            </span>
                          </td>

                          {/* Role Badge */}
                          <td className="py-4 px-5">
                            {user.role === "admin" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <Shield size={10} />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Staff
                              </span>
                            )}
                          </td>

                          {/* Created date */}
                          <td className="py-4 px-5 text-gray-500 dark:text-slate-400 hidden sm:table-cell">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex justify-end gap-1.5">
                              {/* Reset Pass button */}
                              <button
                                id={`btn-trigger-reset-${user.id}`}
                                onClick={() => {
                                  setResetUserId(user.id);
                                  setResetPassword("");
                                }}
                                className="p-1.5 rounded text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                                title="Reset Password"
                              >
                                <Key size={14} />
                              </button>

                              {/* Delete button (except self) */}
                              {!isSelf ? (
                                <button
                                  id={`btn-delete-user-${user.id}`}
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-1.5 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Hapus Pengguna"
                                >
                                  <Trash2 size={14} />
                                </button>
                              ) : (
                                <span className="p-1.5 text-gray-300 dark:text-slate-700" title="Akun Anda">
                                  <UserCheck size={14} />
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
