import React, { useState } from "react";
import { Cpu, Lock, User as UserIcon, AlertCircle, ArrowRight } from "lucide-react";
import { api } from "../utils/api";
import { User } from "../types";

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<{ token: string; user: User }>("/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });

      onLoginSuccess(response.user, response.token);
    } catch (err: any) {
      setError(err.message || "Gagal masuk. Periksa kembali username dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-[#111113] rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-8 flex flex-col gap-6 animate-in fade-in-50 slide-in-from-bottom-8 duration-200">
        {/* Header / Logo */}
        <div className="text-center">
          <div className="inline-flex bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 mb-3 border border-emerald-500/20">
            <Cpu size={32} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Central Maintenance Notes</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Silakan masuk ke portal manajemen CM Notes
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2.5 text-xs font-semibold leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <UserIcon size={16} />
              </span>
              <input
                id="input-login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-4 py-2.5 bg-black text-white placeholder-slate-500 border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                id="input-login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-4 py-2.5 bg-black text-white placeholder-slate-500 border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-submit-login"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Memproses..." : "Masuk Sekarang"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Demo Account Instructions */}
        <div className="p-4 bg-black rounded-xl border border-white/5 space-y-2 text-xs">
          <div className="font-bold text-slate-300">Akun Demo Cepat (Onboarding):</div>
          <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px]">
            <div className="p-2 bg-[#111113] rounded border border-white/10">
              <div className="text-rose-400 font-bold mb-0.5">Admin:</div>
              <div>User: <span className="text-white select-all">admin</span></div>
              <div>Pass: <span className="text-white select-all">admin123</span></div>
            </div>
            <div className="p-2 bg-[#111113] rounded border border-white/10">
              <div className="text-emerald-400 font-bold mb-0.5">Normal User:</div>
              <div>User: <span className="text-white select-all">user</span></div>
              <div>Pass: <span className="text-white select-all">user123</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
