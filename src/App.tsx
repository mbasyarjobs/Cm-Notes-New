import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotesView from "./pages/NotesView";
import UsersView from "./pages/UsersView";
import Profile from "./pages/Profile";
import NoteModal from "./components/NoteModal";
import { User, Note, ActiveTab } from "./types";
import { api } from "./utils/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(true); // Dark mode as default
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Note Modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load user session and theme on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("cm_user");
    const savedToken = localStorage.getItem("cm_token");
    const savedTheme = localStorage.getItem("cm_theme");

    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem("cm_user");
        localStorage.removeItem("cm_token");
      }
    }

    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(true); // Default is dark
    }
  }, []);

  // Sync Dark/Light mode class on HTML document
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.style.backgroundColor = "#09090b"; // Sophisticated Dark background
      localStorage.setItem("cm_theme", "dark");
    } else {
      root.classList.remove("dark");
      root.style.backgroundColor = "#f8fafc"; // Slate 50-like background
      localStorage.setItem("cm_theme", "light");
    }
  }, [darkMode]);

  // Handle unauthorized logouts from API requests
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(null);
      setToken(null);
      setActiveTab("dashboard");
    };

    window.addEventListener("auth_change", handleAuthChange);
    return () => window.removeEventListener("auth_change", handleAuthChange);
  }, []);

  const handleLoginSuccess = (user: User, userToken: string) => {
    localStorage.setItem("cm_user", JSON.stringify(user));
    localStorage.setItem("cm_token", userToken);
    setCurrentUser(user);
    setToken(userToken);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      localStorage.removeItem("cm_user");
      localStorage.removeItem("cm_token");
      setCurrentUser(null);
      setToken(null);
      setActiveTab("dashboard");
    }
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Note creation and modification handlers
  const handleOpenCreateNote = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const handleOpenEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (noteData: {
    title: string;
    command: string;
    notes: string;
    category: string;
    isGlobal: boolean;
  }) => {
    try {
      if (editingNote) {
        // Update Note
        await api.put(`/notes/${editingNote.id}`, noteData);
      } else {
        // Create Note
        await api.post("/notes", noteData);
      }
      triggerRefresh();
    } catch (error) {
      throw error;
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-gray-800 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {activeTab === "dashboard" && (
            <Dashboard
              currentUser={currentUser}
              setActiveTab={setActiveTab}
              onOpenCreateNote={handleOpenCreateNote}
            />
          )}

          {(activeTab === "global" || activeTab === "my-notes" || activeTab === "categories") && (
            <NotesView
              activeTab={activeTab}
              currentUser={currentUser}
              onOpenCreateNote={handleOpenCreateNote}
              onOpenEditNote={handleOpenEditNote}
              refreshTrigger={refreshTrigger}
              triggerRefresh={triggerRefresh}
            />
          )}

          {activeTab === "users" && currentUser.role === "admin" && (
            <UsersView />
          )}

          {activeTab === "profile" && (
            <Profile currentUser={currentUser} />
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Note modal popover */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
        currentUser={currentUser}
      />
    </div>
  );
}
