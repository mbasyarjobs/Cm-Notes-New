import React, { useState, useEffect } from "react";
import { X, Save, Terminal as TerminalIcon } from "lucide-react";
import { Note, User } from "../types";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: {
    title: string;
    command: string;
    notes: string;
    category: string;
    isGlobal: boolean;
  }) => Promise<void>;
  note: Note | null; // If null, we are creating a new note
  currentUser: User | null;
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

export default function NoteModal({ isOpen, onClose, onSave, note, currentUser }: NoteModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Linux");
  const [command, setCommand] = useState("");
  const [notes, setNotes] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setCategory(note.category);
      setCommand(note.command);
      setNotes(note.notes);
      setIsGlobal(note.isGlobal);
    } else {
      setTitle("");
      setCategory("Linux");
      setCommand("");
      setNotes("");
      setIsGlobal(false);
    }
    setError("");
  }, [note, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Judul catatan wajib diisi.");
      return;
    }
    if (!command.trim()) {
      setError("Isi command terminal wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        category,
        command: command.trim(),
        notes: notes.trim(),
        isGlobal: isAdmin ? isGlobal : false, // Normal users cannot set global
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan catatan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300">
      <div
        id="note-modal-container"
        className="bg-white dark:bg-[#111113] w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in-50 zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon className="text-emerald-500" size={20} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              {note ? "Edit Catatan Maintenance" : "Buat Catatan Maintenance Baru"}
            </h2>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Judul Catatan
            </label>
            <input
              id="input-note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Restart Apache, Setup Postgres User"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Kategori
              </label>
              <select
                id="select-note-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Global note (Admins only) */}
            {isAdmin && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Jenis Catatan
                </label>
                <div className="flex items-center h-11 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl px-4">
                  <label className="flex items-center gap-2.5 cursor-pointer w-full text-sm text-gray-700 dark:text-slate-300 select-none">
                    <input
                      id="checkbox-note-global"
                      type="checkbox"
                      checked={isGlobal}
                      onChange={(e) => setIsGlobal(e.target.checked)}
                      className="w-4.5 h-4.5 text-emerald-500 rounded border-gray-300 dark:border-slate-800 focus:ring-emerald-500 bg-white dark:bg-slate-900 focus:ring-2 cursor-pointer"
                    />
                    <span>Atur sebagai Catatan Global</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Command Terminal Textarea */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Isi Command (Terminal Commands)
            </label>
            <div className="relative rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
              <div className="bg-slate-100 dark:bg-black px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">terminal</span>
              </div>
              <textarea
                id="textarea-note-command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                rows={5}
                placeholder="sudo systemctl stop apache2&#10;sudo systemctl start apache2"
                className="w-full p-4 bg-black text-emerald-400 font-mono text-sm leading-relaxed focus:outline-none"
                style={{ resize: "vertical" }}
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              Gunakan baris baru (enter) untuk memisahkan perintah multi-line.
            </p>
          </div>

          {/* Explanation Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Catatan Penjelasan (Notes)
            </label>
            <textarea
              id="textarea-note-explanation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Contoh: Jalankan perintah ini hanya jika terjadi kegagalan sinkronisasi database..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
            <button
              id="btn-cancel-note"
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              disabled={submitting}
            >
              Batal
            </button>
            <button
              id="btn-save-note"
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm shadow-md shadow-emerald-500/10 flex items-center gap-2 transition-all cursor-pointer"
              disabled={submitting}
            >
              <Save size={16} />
              {submitting ? "Menyimpan..." : "Simpan Catatan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
