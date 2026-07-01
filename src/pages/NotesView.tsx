import { useState, useEffect } from "react";
import { Search, Tag, FileText, PlusCircle, Globe, Terminal as TerminalIcon, Filter, Info } from "lucide-react";
import { Note, User, ActiveTab } from "../types";
import { api } from "../utils/api";
import TerminalCard from "../components/TerminalCard";

interface NotesViewProps {
  activeTab: ActiveTab;
  currentUser: User | null;
  onOpenCreateNote: () => void;
  onOpenEditNote: (note: Note) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const CATEGORIES = [
  "Fedora",
  "Linux",
  "Database",
  "Network",
  "Parking System",
  "Hardware",
  "Troubleshooting",
  "Bash Script",
  "Service",
  "Lainnya",
];

export default function NotesView({
  activeTab,
  currentUser,
  onOpenCreateNote,
  onOpenEditNote,
  refreshTrigger,
  triggerRefresh,
}: NotesViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const isAdmin = currentUser?.role === "admin";

  // Fetch notes on mount, tab changes, or modification triggers
  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      setError("");
      try {
        const fetchedNotes = await api.get<Note[]>("/notes");
        setNotes(fetchedNotes);
      } catch (err: any) {
        setError("Gagal memuat catatan.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [refreshTrigger, activeTab]);

  // Handle Note Deletion
  const handleDeleteNote = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus catatan maintenance ini?")) {
      return;
    }

    try {
      await api.delete(`/notes/${id}`);
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus catatan.");
    }
  };

  // Determine which notes match the tab criteria before search/category filtering
  const getTabFilteredNotes = () => {
    if (activeTab === "global") {
      return notes.filter((n) => n.isGlobal);
    }
    if (activeTab === "my-notes") {
      return notes.filter((n) => n.createdBy === currentUser?.id);
    }
    // For 'categories' tab, we show all notes available under selectedCategory or general
    if (activeTab === "categories") {
      return notes;
    }
    return notes;
  };

  const tabNotes = getTabFilteredNotes();

  // Apply real-time search and category filter on top of the tab filter
  const getFinalNotes = () => {
    return tabNotes.filter((note) => {
      // 1. Category filter
      if (selectedCategory && note.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 2. Search filter (checks title, command code, and category name)
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesCommand = note.command.toLowerCase().includes(q);
        const matchesCategory = note.category.toLowerCase().includes(q);
        
        return matchesTitle || matchesCommand || matchesCategory;
      }

      return true;
    });
  };

  const finalNotes = getFinalNotes();

  // Count items per category for the 'categories' dashboard view
  const getCategoryCounts = () => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      counts[cat] = notes.filter((n) => n.category.toLowerCase() === cat.toLowerCase()).length;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  const getPageHeader = () => {
    switch (activeTab) {
      case "global":
        return {
          title: "Catatan Global Pusat",
          subtitle: "Daftar panduan server dan command yang dapat diakses oleh semua staff maintenance.",
          showCreateBtn: isAdmin, // Only admins can add global notes from this screen
        };
      case "my-notes":
        return {
          title: "Catatan Pribadi Saya",
          subtitle: "Tempat menyimpan instruksi khusus atau backup internal yang aman dan privat.",
          showCreateBtn: true, // Anyone can create personal notes
        };
      case "categories":
        return {
          title: "Eksplorasi Kategori",
          subtitle: "Kelompokkan panduan commands berdasarkan modul server dan jenis troubleshoot.",
          showCreateBtn: true,
        };
      default:
        return {
          title: "Catatan Maintenance",
          subtitle: "Kelola panduan terminal command secara terpusat.",
          showCreateBtn: true,
        };
    }
  };

  const headerInfo = getPageHeader();

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {headerInfo.title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
            {headerInfo.subtitle}
          </p>
        </div>

        {headerInfo.showCreateBtn && (
          <button
            id="btn-add-note"
            onClick={onOpenCreateNote}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-md shadow-emerald-500/10 transition-all shrink-0 cursor-pointer animate-none"
          >
            <PlusCircle size={16} />
            <span>Tambah Catatan</span>
          </button>
        )}
      </div>

      {/* Info notice for normal users on Global tab */}
      {activeTab === "global" && !isAdmin && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <Info size={16} className="shrink-0" />
          <span>Sebagai User biasa, Anda hanya dapat melihat dan menyalin catatan global. Pengeditan ditutup.</span>
        </div>
      )}

      {/* Categories Grid (Only shown when active tab is 'categories') */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                id={`cat-card-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-md shadow-emerald-500/10"
                    : "bg-white dark:bg-[#111113] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${isSelected ? "bg-slate-950/20 text-slate-950" : "bg-emerald-500/10 text-emerald-400"}`}>
                    <Tag size={16} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-slate-950/20 text-slate-950" : "bg-gray-100 dark:bg-[#0c0c0e] text-gray-500 dark:text-slate-300 border dark:border-white/5"}`}>
                    {count}
                  </span>
                </div>
                <div>
                  <h3 className={`text-xs font-bold leading-tight ${isSelected ? "text-slate-950" : "text-gray-800 dark:text-slate-200"}`}>
                    {cat}
                  </h3>
                  <p className={`text-[10px] mt-0.5 ${isSelected ? "text-emerald-950" : "text-gray-400"}`}>
                    Notes
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Controls Bar (Search + Filter Options) */}
      <div className="bg-white dark:bg-[#111113] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center gap-3.5">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 dark:text-slate-500">
            <Search size={16} />
          </span>
          <input
            id="input-search-notes"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul, isi command, atau kategori..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-xs text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Dropdown Category Filter (Only shown when not on 'categories' tab) */}
        {activeTab !== "categories" && (
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <Filter size={14} className="text-gray-400" />
            <select
              id="select-filter-category"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full md:w-48 px-3 py-2 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-xs text-gray-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Reset Filters button if any filter is active */}
        {(selectedCategory || searchQuery) && (
          <button
            id="btn-reset-filters"
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery("");
            }}
            className="text-xs text-gray-400 hover:text-emerald-500 font-semibold cursor-pointer shrink-0"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl font-medium">
          {error}
        </div>
      ) : finalNotes.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-[#111113] rounded-xl shadow-sm border border-slate-200 dark:border-white/5 p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400">
            <TerminalIcon size={40} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              Tidak ada Catatan Maintenance ditemukan
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mt-1 mx-auto leading-relaxed">
              {(searchQuery || selectedCategory)
                ? "Cobalah mengubah kata kunci pencarian atau memilih kategori filter yang berbeda."
                : "Belum ada catatan di daftar ini. Mulailah dengan membuat catatan baru."}
            </p>
          </div>
          {!(searchQuery || selectedCategory) && (
            <button
              id="btn-add-note-empty"
              onClick={onOpenCreateNote}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Tambah Catatan Baru</span>
            </button>
          )}
        </div>
      ) : (
        /* Notes Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {finalNotes.map((note) => (
            <TerminalCard
              key={note.id}
              note={note}
              currentUser={currentUser}
              onEdit={onOpenEditNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
