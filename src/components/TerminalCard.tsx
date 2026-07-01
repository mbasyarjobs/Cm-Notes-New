import { useState } from "react";
import { Terminal, Copy, Check, Edit2, Trash2, Globe, Lock, User as UserIcon } from "lucide-react";
import { Note, User } from "../types";

interface TerminalCardProps {
  key?: any;
  note: any;
  currentUser: any;
  onEdit: any;
  onDelete: any;
}

export default function TerminalCard({ note, currentUser, onEdit, onDelete }: TerminalCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin perintah", err);
    }
  };

  // Determine permissions
  const isAdmin = currentUser?.role === "admin";
  const isOwner = currentUser?.id === note.createdBy;
  const canEdit = isAdmin || isOwner;
  const canDelete = isAdmin || isOwner;

  // Indonesian Category color map
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "fedora":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "linux":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "database":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "network":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "parking system":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "hardware":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "troubleshooting":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "bash script":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "service":
        return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      id={`note-card-${note.id}`}
      className="bg-white dark:bg-[#111113] rounded-2xl shadow-md border border-slate-200 dark:border-white/10 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-200 flex flex-col h-full overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-5 flex-1 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Category & Status Badges */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getCategoryColor(note.category)}`}>
                {note.category}
              </span>
              
              {note.isGlobal ? (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Globe size={10} />
                  Global
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Lock size={10} />
                  Pribadi
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {canEdit && (
                <button
                  id={`btn-edit-note-${note.id}`}
                  onClick={() => onEdit(note)}
                  className="p-1.5 rounded text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                  title="Edit Catatan"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {canDelete && (
                <button
                  id={`btn-delete-note-${note.id}`}
                  onClick={() => onDelete(note.id)}
                  className="p-1.5 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Hapus Catatan"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Note Title */}
          <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 tracking-tight mb-2 line-clamp-2">
            {note.title}
          </h3>

          {/* Date & Author */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-slate-400 mb-4">
            <span>{formatDate(note.createdAt)}</span>
            {note.creatorUsername && (
              <span className="flex items-center gap-1 border-l border-gray-200 dark:border-white/5 pl-3">
                <UserIcon size={12} className="text-gray-400" />
                <span>{note.creatorUsername}</span>
              </span>
            )}
          </div>

          {/* Terminal Container */}
          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/5 mb-4 bg-black">
            {/* Terminal Titlebar */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <Terminal size={12} />
                <span>bash</span>
              </div>
            </div>
            
            {/* Terminal Command Output */}
            <div className="relative p-4 overflow-x-auto font-mono text-sm leading-relaxed max-h-48 overflow-y-auto whitespace-pre whitespace-pre-wrap select-all bg-black">
              {note.command.split("\n").map((line, i) => (
                <div key={i} className="flex">
                  <span className="text-gray-500 mr-2 select-none">$</span>
                  <span className="text-emerald-400">{line}</span>
                </div>
              ))}
            </div>

            {/* Copy Bar */}
            <div className="bg-slate-50 dark:bg-black/40 border-t border-slate-200 dark:border-white/5 py-1.5 px-3 flex justify-end">
              <button
                id={`btn-copy-command-${note.id}`}
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-white/5"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notes (Small Info box under Terminal) */}
        {note.notes && (
          <div className="mt-2 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border-l-2 border-amber-500 border-y border-r border-slate-200 dark:border-white/5">
            <span className="text-[10px] uppercase font-bold text-amber-500 block mb-1">Notes:</span>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic font-sans">
              {note.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
