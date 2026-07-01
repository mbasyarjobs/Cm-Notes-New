import React, { useState } from "react";
import { UserCheck, Shield, Key, AlertCircle, CheckCircle2, Lock, Calendar } from "lucide-react";
import { User } from "../types";
import { api } from "../utils/api";

interface ProfileProps {
  currentUser: User | null;
}

export default function Profile({ currentUser }: ProfileProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Semua kolom password wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal harus 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setUpdating(true);
    try {
      await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      setSuccess("Sandi berhasil diperbarui. Silakan gunakan password baru ini di login berikutnya.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui password. Pastikan sandi lama Anda benar.");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <UserCheck className="text-emerald-500" />
          <span>Profil & Pengaturan Sandi</span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium">
          Kelola informasi profil pribadi dan amankan akun Anda dengan mengganti kata sandi.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs font-semibold leading-relaxed">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-xs font-semibold leading-relaxed">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Profile Details Card */}
        <div className="md:col-span-2 bg-white dark:bg-[#111113] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex flex-col items-center text-center py-4 border-b border-slate-200 dark:border-white/5">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center font-bold text-xl mb-3 border border-emerald-500/20">
                {currentUser?.username.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {currentUser?.username}
              </h3>
              <div className="mt-1.5">
                {currentUser?.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Shield size={10} />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Staff
                  </span>
                )}
              </div>
            </div>

            {/* Account Metadata items */}
            <div className="space-y-4 text-xs font-medium">
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-white/5">
                <span className="text-gray-400">User ID</span>
                <span className="font-mono text-gray-900 dark:text-slate-300">{currentUser?.id}</span>
              </div>
              
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-white/5">
                <span className="text-gray-400">Terdaftar Sejak</span>
                <span className="text-gray-900 dark:text-slate-300 flex items-center gap-1">
                  <Calendar size={13} className="text-gray-400" />
                  {formatDate(currentUser?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-[11px] text-gray-400 leading-normal">
            Gunakan portal ini untuk mengamankan data Anda. Selalu gunakan password yang unik dan kuat untuk akun operasional maintenance.
          </div>
        </div>

        {/* Password Changing Form */}
        <div className="md:col-span-3 bg-white dark:bg-[#111113] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="text-emerald-500" size={18} />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Ganti Kata Sandi (Password)
            </h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Old Password */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Password Lama
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Key size={14} />
                </span>
                <input
                  id="input-old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-xs text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Password Baru
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock size={14} />
                </span>
                <input
                  id="input-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru (min 6 karakter)"
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-xs text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock size={14} />
                </span>
                <input
                  id="input-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-xs text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              id="btn-submit-change-password"
              type="submit"
              disabled={updating}
              className="w-full mt-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all cursor-pointer disabled:opacity-50"
            >
              {updating ? "Memproses..." : "Perbarui Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
