import {
  LayoutDashboard,
  Globe,
  FileText,
  Tag,
  Users,
  User as UserIcon,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Cpu
} from "lucide-react";
import { ActiveTab, User } from "../types";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  darkMode,
  setDarkMode,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const isAdmin = currentUser?.role === "admin";

  const menuItems = [
    { id: "dashboard" as ActiveTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "global" as ActiveTab, label: "Global Notes", icon: Globe },
    { id: "my-notes" as ActiveTab, label: "My Notes", icon: FileText },
    { id: "categories" as ActiveTab, label: "Kategori", icon: Tag },
    ...(isAdmin ? [{ id: "users" as ActiveTab, label: "Kelola User", icon: Users }] : []),
    { id: "profile" as ActiveTab, label: "Profil & Password", icon: UserIcon },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setMobileOpen(false); // Close drawer on mobile
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 dark:bg-[#0c0c0e] border-r border-slate-200 dark:border-white/10 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 rounded-lg p-2 text-slate-950 flex items-center justify-center">
            <Cpu size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">CM Notes</h1>
            <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest">
              Central Maintenance
            </p>
          </div>
        </div>
        
        {/* Close Drawer Button for Mobile only */}
        <button
          id="btn-close-sidebar"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* User Session Profile Badge */}
      <div className="p-4 mx-4 my-4 bg-slate-100 dark:bg-[#111113] rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/10">
          {currentUser?.username.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white truncate">{currentUser?.username}</h3>
          <div className="flex items-center mt-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                isAdmin
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {currentUser?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav id="sidebar-nav" className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`sidebar-link-${item.id}`}
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings (Light/Dark Mode) & Logout Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2 bg-slate-50/50 dark:bg-[#0c0c0e]">
        {/* Dark/Light mode selector */}
        <button
          id="btn-toggle-theme"
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>Tema: {darkMode ? "Terang (Light)" : "Gelap (Dark)"}</span>
          </div>
          <span className="text-[10px] bg-slate-200 dark:bg-[#111113] text-slate-700 dark:text-slate-300 py-0.5 px-2 rounded border border-slate-300 dark:border-white/5">
            {darkMode ? "Dark" : "Light"}
          </span>
        </button>

        {/* Logout */}
        <button
          id="btn-logout-sidebar"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden h-16 bg-slate-900 dark:bg-[#0c0c0e] text-white flex items-center justify-between px-4 sticky top-0 z-40 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 rounded-lg p-1.5 text-slate-950 flex items-center justify-center">
            <Cpu size={16} className="stroke-[2.5]" />
          </div>
          <span className="font-bold text-sm tracking-tight">CM Notes</span>
        </div>
        <button
          id="btn-hamburger-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Desktop Sidebar (Fixed left side) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 overflow-y-auto shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-200"
        ></div>
      )}

      {/* Mobile Drawer (Pulls in from left) */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
