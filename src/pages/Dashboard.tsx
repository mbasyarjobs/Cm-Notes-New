import { useEffect, useState } from "react";
import { Globe, Lock, Users, Terminal as TerminalIcon, ArrowRight, PlusCircle, UserCheck } from "lucide-react";
import { Note, User, ActiveTab } from "../types";
import { api } from "../utils/api";

interface DashboardProps {
  currentUser: User | null;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateNote: () => void;
}

export default function Dashboard({ currentUser, setActiveTab, onOpenCreateNote }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError("");
      try {
        const fetchedNotes = await api.get<Note[]>("/notes");
        setNotes(fetchedNotes);

        if (isAdmin) {
          const fetchedUsers = await api.get<User[]>("/users");
          setUsersCount(fetchedUsers.length);
        }
      } catch (err: any) {
        setError("Gagal memuat data dashboard.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [isAdmin]);

  // Calculate stats locally from available notes
  const globalNotes = notes.filter((n) => n.isGlobal);
  const privateNotes = notes.filter((n) => !n.isGlobal);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 11) return "Selamat Pagi";
    if (hours < 15) return "Selamat Siang";
    if (hours < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#111113] to-[#0c0c0e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-1 px-3 rounded">
            Sistem Aktif
          </span>
          <h2 className="text-xl md:text-3xl font-extrabold mt-3 tracking-tight text-slate-800 dark:text-white">
            {getGreeting()}, {currentUser?.username}!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl font-medium">
            {isAdmin
               ? "Anda masuk sebagai Administrator. Anda memiliki wewenang penuh untuk mengelola Catatan Global dan akun pengguna."
               : "Anda masuk sebagai Tim Maintenance. Anda dapat mengelola catatan pribadi Anda dan mengakses catatan global pusat."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:self-end">
          <button
            id="dash-btn-create"
            onClick={onOpenCreateNote}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-emerald-400 shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Catatan Baru</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl font-medium">
          {error}
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Metric: Global Notes */}
            <div
              id="metric-global"
              className="bg-white dark:bg-[#111113] p-6 rounded-xl shadow-md border border-slate-200 dark:border-white/5 flex items-center justify-between hover:shadow-lg transition-all"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest block">
                  Catatan Global
                </span>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white block">
                  {globalNotes.length}
                </span>
                <button
                  id="metric-link-global"
                  onClick={() => setActiveTab("global")}
                  className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                >
                  <span>Lihat semua</span>
                  <ArrowRight size={12} />
                </button>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 p-4 rounded-xl">
                <Globe size={24} />
              </div>
            </div>

            {/* Metric: Private Notes */}
            <div
              id="metric-private"
              className="bg-white dark:bg-[#111113] p-6 rounded-xl shadow-md border border-slate-200 dark:border-white/5 flex items-center justify-between hover:shadow-lg transition-all"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest block">
                  Catatan Pribadi
                </span>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white block">
                  {privateNotes.length}
                </span>
                <button
                  id="metric-link-my"
                  onClick={() => setActiveTab("my-notes")}
                  className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                >
                  <span>Lihat catatan saya</span>
                  <ArrowRight size={12} />
                </button>
              </div>
              <div className="bg-blue-100 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 p-4 rounded-xl">
                <Lock size={24} />
              </div>
            </div>

            {/* Metric: Users Count (Admin) or Help Banner (User) */}
            {isAdmin ? (
              <div
                id="metric-users"
                className="bg-white dark:bg-[#111113] p-6 rounded-xl shadow-md border border-slate-200 dark:border-white/5 flex items-center justify-between hover:shadow-lg transition-all"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest block">
                    Jumlah User Terdaftar
                  </span>
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white block">
                    {usersCount !== null ? usersCount : "-"}
                  </span>
                  <button
                    id="metric-link-users"
                    onClick={() => setActiveTab("users")}
                    className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Kelola akun user</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
                <div className="bg-rose-100 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 p-4 rounded-xl">
                  <Users size={24} />
                </div>
              </div>
            ) : (
              <div
                id="metric-badge-user"
                className="bg-white dark:bg-[#111113] p-6 rounded-xl shadow-md border border-slate-200 dark:border-white/5 flex items-center justify-between hover:shadow-lg transition-all"
              >
                <div className="space-y-1 pr-2">
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest block">
                    Status Akun
                  </span>
                  <span className="text-base font-bold text-emerald-500 dark:text-emerald-400 block flex items-center gap-1.5">
                    <UserCheck size={18} />
                    Maintenance Staff
                  </span>
                  <p className="text-[11px] text-gray-400 dark:text-slate-400 leading-snug pt-1">
                    Catatan pribadi Anda terlindung aman & hanya terlihat oleh Anda dan Admin.
                  </p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 p-4 rounded-xl shrink-0">
                  <UserCheck size={24} />
                </div>
              </div>
            )}
          </div>

          {/* Recent Commands Module */}
          <div className="bg-white dark:bg-[#111113] rounded-xl shadow-md border border-slate-200 dark:border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TerminalIcon className="text-emerald-500" size={18} />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Catatan Terbaru Diperbarui
                </h3>
              </div>
              <button
                id="dash-btn-view-notes"
                onClick={() => setActiveTab("global")}
                className="text-xs font-bold text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
              >
                <span>Lihat Semua Catatan</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400">
                Belum ada catatan yang tersimpan.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {notes.slice(0, 3).map((note) => (
                  <div key={note.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#0c0c0e] text-[10px] font-bold text-gray-500 dark:text-slate-300 border dark:border-white/5">
                          {note.category}
                        </span>
                        <span>{note.creatorUsername}</span>
                        <span>&bull;</span>
                        <span>
                          {new Date(note.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        note.isGlobal 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {note.isGlobal ? "Global" : "Pribadi"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
